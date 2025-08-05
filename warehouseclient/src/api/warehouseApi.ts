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
    resourceName?: string; // Будем добавлять на клиенте
    unitName?: string;     // Будем добавлять на клиенте
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
    status: number; // 0 = черновик, 1 = подтверждён, 2 = подписан
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


// Interface for UnitOfMeasure
export interface UnitOfMeasure {
    id: number;
    name: string;
    status?: number;
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
        // Получаем документы поступлений
        const documentsResponse = await api.get<ApiResponse<ReceiptDocument>>('/Receipts', { params });
        const documents = documentsResponse.data.$values;

        // Получаем справочники для доп. информации
        const [resources, units] = await Promise.all([
            getResources(),
            getUnits()
        ]);

        // Преобразуем структуру данных в плоскую таблицу
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
                    resourceName: resources.find(r => r.id === resource.resourceId)?.name || 'Неизвестно',
                    unitName: units.find(u => u.id === resource.unitOfMeasureId)?.name || 'Неизвестно'
                });
            });
        });

        return receiptItems;
    } catch (error) {
        console.error('Error fetching receipts:', error);
        throw new Error('Не удалось загрузить данные поступлений');
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
    return response.data.$values; // Возвращаем только массив значений
};

export const getResources = async (): Promise<Resource[]> => {
    const response = await api.get<ApiResponse<Resource>>('/Warehouse/resources');
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

        // Получаем справочники
        const [resources, units, clients] = await Promise.all([
            getResources(),
            getUnits(),
            getClients(), // Добавим этот метод ниже
        ]);

        const shipmentItems: ShipmentItem[] = [];

        documents.forEach(doc => {
            // Раскрываем $ref, если client — это ссылка
            let client: Client | undefined;
            if ('client' in doc && doc.client && '$ref' in doc.client) {
                const clientId = doc.clientId;
                client = clients.find(c => c.id === clientId);
            } else {
                client = doc.client as Client;
            }

            const clientName = client?.name || 'Неизвестный клиент';

            // Статус
            const statusMap = {
                0: 'draft',
                1: 'confirmed',
                2: 'signed'
            };
            const status: ShipmentItem['status'] = statusMap[doc.status as 0 | 1 | 2] || 'draft';

            // Ресурсы в документе
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
                    resourceName: resources.find(r => r.id === resource.resourceId)?.name || 'Неизвестно',
                    unitName: units.find(u => u.id === resource.unitOfMeasureId)?.name || 'Неизвестно'
                });
            });
        });

        return shipmentItems;
    } catch (error) {
        console.error('Error fetching shipments:', error);
        throw new Error('Не удалось загрузить данные отгрузок');
    }
};


// Method to get all active clients
export const getClients = async (): Promise<Client[]> => {
    const response = await api.get<ApiResponse<Client>>('/Clients');
    return response.data.$values;
};

// Method to get a client by ID
export const getClientById = async (id: number): Promise<Client> => {
    const response = await api.get<Client>(`/Clients/${id}`);
    return response.data;
};

// Method to create a new client
export const createClient = async (name: string, address: string): Promise<Client> => {
    const response = await api.post<Client>('/Clients', { name, address });
    return response.data;
};

// Method to update a client
export const updateClient = async (id: number, name: string, address: string): Promise<void> => {
    await api.put(`/Clients/${id}`, { name, address });
};

// Method to archive a client
export const archiveClient = async (id: number): Promise<void> => {
    await api.delete(`/Clients/${id}`);
};

// src/api/warehouseApi.ts

// Function to create a new resource
export const createResource = async (name: string): Promise<void> => {
    try {
        await api.post('/Resources', { name });
    } catch (error) {
        throw new Error('Не удалось создать ресурс');
    }
};

// Function to get a resource by ID
export const getResourceById = async (id: number): Promise<Resource> => {
    try {
        const response = await api.get<Resource>(`/Resources/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('Не удалось получить ресурс');
    }
};

// Function to update a resource
export const updateResource = async (id: number, name: string): Promise<void> => {
    try {
        await api.put(`/Resources/${id}`, { name });
    } catch (error) {
        throw new Error('Не удалось обновить ресурс');
    }
};

// Function to archive a resource
export const archiveResource = async (id: number): Promise<void> => {
    try {
        await api.delete(`/Resources/${id}`);
    } catch (error) {
        throw new Error('Не удалось архивировать ресурс');
    }
};

// Method to get all units
export const getUnits = async (): Promise<UnitOfMeasure[]> => {
    const response = await api.get<ApiResponse<UnitOfMeasure>>('/UnitsOfMeasure');
    return response.data.$values;
};

// Method to get a unit by ID
export const getUnitById = async (id: number): Promise<UnitOfMeasure> => {
    const response = await api.get<UnitOfMeasure>(`/UnitsOfMeasure/${id}`);
    return response.data;
};

// Method to create a new unit
export const createUnit = async (name: string): Promise<void> => {
    await api.post('/UnitsOfMeasure', { name });
};

// Method to update a unit
export const updateUnit = async (id: number, name: string): Promise<void> => {
    await api.put(`/UnitsOfMeasure/${id}`, { id, name });
};

// Method to archive a unit
export const archiveUnit = async (id: number): Promise<void> => {
    await api.delete(`/UnitsOfMeasure/${id}`);
};

// Method to get a receipt by ID
export const getReceiptById = async (id: number): Promise<ReceiptDocument> => {
    const response = await api.get<ReceiptDocument>(`/Receipts/${id}`);
    return response.data;
};

// Method to update a receipt
export const updateReceipt = async (id: number, receipt: Partial<ReceiptDocument>): Promise<void> => {
    await api.put(`/Receipts/${id}`, receipt);
};

// Method to archive a receipt
export const archiveReceipt = async (id: number): Promise<void> => {
    await api.delete(`/Receipts/${id}`);
};

// Method to get a shipment by ID
export const getShipmentById = async (id: number): Promise<ShipmentDocument> => {
    try {
        const response = await api.get<ShipmentDocument>(`/Shipments/${id}`);
        return response.data;
    } catch (error) {
        throw new Error('Не удалось получить отгрузку');
    }
};

// Method to update a shipment
export const updateShipment = async (id: number, shipment: Partial<ShipmentDocument>): Promise<void> => {
    try {
        await api.put(`/Shipments/${id}`, shipment);
    } catch (error) {
        throw new Error('Не удалось обновить отгрузку');
    }
};

// Method to archive a shipment
export const archiveShipment = async (id: number): Promise<void> => {
    try {
        await api.delete(`/Shipments/${id}`);
    } catch (error) {
        throw new Error('Не удалось архивировать отгрузку');
    }
};