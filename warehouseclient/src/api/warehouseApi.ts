// src/api/warehouseApi.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5130/api/'
});

export interface ApiResponse<T> {
    $id: string;
    $values: T[];
}

export interface BalanceItem {
    id: number;
    resourceId: number;
    unitOfMeasureId: number;
    quantity: number;
}

export interface Resource {
    id: number;
    name: string;
    status?: number;
    balances?: any;
    receiptResources?: any;
    shipmentResources?: any;
}

export interface Unit {
    id: number;
    name: string;
    status?: number;
    balances?: any;
    receiptResources?: any;
    shipmentResources?: any;
}
export interface ReceiptDocument {
    $id: string;
    id: number;
    number: string;
    date: string;
    receiptResources: ApiResponse<ReceiptResource>;
}

export interface ReceiptResource {
    $id: string;
    id: number;
    receiptDocumentId: number;
    receiptDocument: { $ref: string };
    resourceId: number;
    unitOfMeasureId: number;
    quantity: number;
    resourceName?: string; // ����� ��������� �� �������
    unitName?: string;     // ����� ��������� �� �������
}

export interface ReceiptItem {
    documentId: number;
    documentNumber: string;
    date: string;
    resourceId: number;
    unitId: number;
    quantity: number;
    resourceName: string;
    unitName: string;
}
export interface ShipmentDocument {
    $id: string;
    id: number;
    number: string;
    clientId: number;
    client: Client | { $ref: string };
    date: string; // ISO date
    status: number; // 0 = ��������, 1 = ����������, 2 = ��������
    shipmentResources?: ApiResponse<ShipmentResource>;
}

export interface Client {
    $id: string;
    id: number;
    name: string;
    address: string;
    status: number;
    shipmentDocuments: ApiResponse<ShipmentDocument>;
}

export interface ShipmentResource {
    $id: string;
    id: number;
    shipmentDocumentId: number;
    resourceId: number;
    unitOfMeasureId: number;
    quantity: number;
    resource?: Resource;
    unitOfMeasure?: Unit;
}

export interface ShipmentItem {
    documentId: number;
    documentNumber: string;
    date: string;
    clientName: string;
    status: 'draft' | 'confirmed' | 'signed';
    resourceId: number;
    unitId: number;
    resourceName: string;
    unitName: string;
    quantity: number;
}

export const getReceipts = async (
    fromDate?: Date | null,
    toDate?: Date | null,
    documentNumbers?: string[],
    resourceIds?: number[],
    unitIds?: number[]
): Promise<ReceiptItem[]> => {
    const params = new URLSearchParams();

    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());
    if (documentNumbers) documentNumbers.forEach(num => params.append('documentNumbers', num));
    if (resourceIds) resourceIds.forEach(id => params.append('resourceIds', id.toString()));
    if (unitIds) unitIds.forEach(id => params.append('unitIds', id.toString()));

    try {
        // �������� ��������� �����������
        const documentsResponse = await api.get<ApiResponse<ReceiptDocument>>('/Receipts', { params });
        const documents = documentsResponse.data.$values;

        // �������� ����������� ��� ���. ����������
        const [resources, units] = await Promise.all([
            getResources(),
            getUnits()
        ]);

        // ����������� ��������� ������ � ������� �������
        const receiptItems: ReceiptItem[] = [];

        documents.forEach(document => {
            document.receiptResources.$values.forEach(resource => {
                receiptItems.push({
                    documentId: document.id,
                    documentNumber: document.number,
                    date: document.date,
                    resourceId: resource.resourceId,
                    unitId: resource.unitOfMeasureId,
                    quantity: resource.quantity,
                    resourceName: resources.find(r => r.id === resource.resourceId)?.name || '����������',
                    unitName: units.find(u => u.id === resource.unitOfMeasureId)?.name || '����������'
                });
            });
        });

        return receiptItems;
    } catch (error) {
        console.error('Error fetching receipts:', error);
        throw new Error('�� ������� ��������� ������ �����������');
    }
};

export const getBalances = async (resourceIds?: number[], unitIds?: number[]): Promise<BalanceItem[]> => {
    const params = new URLSearchParams();

    if (resourceIds) {
        resourceIds.forEach(id => params.append('resourceIds', id.toString()));
    }

    if (unitIds) {
        unitIds.forEach(id => params.append('unitIds', id.toString()));
    }

    const response = await api.get<ApiResponse<BalanceItem>>('/Warehouse/balances', { params });
    return response.data.$values; // ���������� ������ ������ ��������
};

export const getResources = async (): Promise<Resource[]> => {
    const response = await api.get<ApiResponse<Resource>>('/Warehouse/resources');
    return response.data.$values;
};

export const getUnits = async (): Promise<Unit[]> => {
    const response = await api.get<ApiResponse<Unit>>('/Receipts/units');
    return response.data.$values;

};

export const getShipments = async (
    fromDate?: Date | null,
    toDate?: Date | null,
    documentNumber?: string,
    clientNameFilter?: string,
    resourceIds?: number[],
    unitIds?: number[]
): Promise<ShipmentItem[]> => {
    const params = new URLSearchParams();

    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());
    if (documentNumber) params.append('documentNumber', documentNumber);
    if (clientNameFilter) params.append('clientName', clientNameFilter);
    if (resourceIds) resourceIds.forEach(id => params.append('resourceIds', id.toString()));
    if (unitIds) unitIds.forEach(id => params.append('unitIds', id.toString()));

    try {
        const response = await api.get<ApiResponse<ShipmentDocument>>('/Shipments', { params });
        const documents = response.data.$values;

        // �������� �����������
        const [resources, units, clients] = await Promise.all([
            getResources(),
            getUnits(),
            getClients(), // ������� ���� ����� ����
        ]);

        const shipmentItems: ShipmentItem[] = [];

        documents.forEach(doc => {
            // ���������� $ref, ���� client � ��� ������
            let client: Client | undefined;
            if ('client' in doc && doc.client && '$ref' in doc.client) {
                const clientId = doc.clientId;
                client = clients.find(c => c.id === clientId);
            } else {
                client = doc.client as Client;
            }

            const clientName = client?.name || '����������� ������';

            // ������
            const statusMap = {
                0: 'draft',
                1: 'confirmed',
                2: 'signed'
            };
            const status: ShipmentItem['status'] = statusMap[doc.status as 0 | 1 | 2] || 'draft';

            // ������� � ���������
            const resourcesInDoc = doc.shipmentResources?.$values || [];

            resourcesInDoc.forEach(resource => {
                shipmentItems.push({
                    documentId: doc.id,
                    documentNumber: doc.number,
                    date: doc.date,
                    clientName,
                    status,
                    resourceId: resource.resourceId,
                    unitId: resource.unitOfMeasureId,
                    quantity: resource.quantity,
                    resourceName: resources.find(r => r.id === resource.resourceId)?.name || '����������',
                    unitName: units.find(u => u.id === resource.unitOfMeasureId)?.name || '����������'
                });
            });
        });

        return shipmentItems;
    } catch (error) {
        console.error('Error fetching shipments:', error);
        throw new Error('�� ������� ��������� ������ ��������');
    }
};

// ������� ��������� ��������
export const getClients = async (): Promise<Client[]> => {
    const response = await api.get<ApiResponse<Client>>('/Shipments/Clients');
    return response.data.$values;
};