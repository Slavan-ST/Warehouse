import axios, { AxiosError } from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5130/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- DTO ---
export interface ResourceDto {
    id: number;
    name: string;
    status: number; // EntityStatus
}

export interface UnitOfMeasureDto {
    id: number;
    name: string;
    status: number;
}

export interface ClientDto {
    id: number;
    name: string;
    address: string;
    status: number;
}

export interface BalanceDto {
    id: number;
    resourceId: number;
    resourceName: string;
    unitOfMeasureId: number;
    unitName: string;
    quantity: number;
}

export interface ReceiptResourceDto {
    id: number;
    receiptDocumentId: number;
    resourceId: number;
    resourceName: string;
    unitOfMeasureId: number;
    unitName: string;
    quantity: number;
}

export interface ReceiptDocumentDto {
    id: number;
    number: string;
    date: string; // ISO
    receiptResources: ReceiptResourceDto[];
}

export interface ShipmentResourceDto {
    id: number;
    shipmentDocumentId: number;
    resourceId: number;
    resourceName: string;
    unitOfMeasureId: number;
    unitName: string;
    quantity: number;
}

export interface ShipmentDocumentDto {
    id: number;
    number: string;
    date: string;
    status: number; // ShipmentDocumentStatus
    client: ClientDto;
    shipmentResources: ShipmentResourceDto[];
}




export interface CreateResourceRequest {
    name: string;
}

export interface CreateUnitOfMeasureRequest {
    name: string;
}

export interface CreateClientRequest {
    name: string;
    address: string;
}

export interface CreateReceiptDocumentRequest {
    number: string;
    date: string;
    resources: {
        resourceId: number;
        unitOfMeasureId: number;
        quantity: number;
    }[];
}

export interface CreateShipmentDocumentRequest {
    number: string;
    date: string;
    clientId: number;
    resources: {
        resourceId: number;
        unitOfMeasureId: number;
        quantity: number;
    }[];
}




export interface ReceiptItem {
    documentId: number;
    documentNumber: string;
    date: string;
    resourceId: number;
    unitId: number;
    resourceName: string;
    unitName: string;
    quantity: number;
}

export interface ShipmentItem {
    documentId: number;
    documentNumber: string;
    date: string;
    clientName: string;
    status: 'draft' | 'signed' | 'revoked';
    resourceId: number;
    unitId: number;
    resourceName: string;
    unitName: string;
    quantity: number;
}




export const getResources = async (): Promise<ResourceDto[]> => {
    try {
        const response = await api.get<ResourceDto[]>('/resources');
        return response.data;
    } catch (error) {
        console.error('Error fetching resources:', error);
        throw new Error('Не удалось загрузить ресурсы');
    }
};



export const getUnits = async (): Promise<UnitOfMeasureDto[]> => {
    try {
        const response = await api.get<UnitOfMeasureDto[]>('/units');
        return response.data;
    } catch (error) {
        console.error('Error fetching units:', error);
        throw new Error('Не удалось загрузить единицы измерения');
    }
};




export const getClients = async (): Promise<ClientDto[]> => {
    try {
        const response = await api.get<ClientDto[]>('/clients');
        return response.data;
    } catch (error) {
        console.error('Error fetching clients:', error);
        throw new Error('Не удалось загрузить клиентов');
    }
};

export const getClientById = async (id: number): Promise<ClientDto> => {
    if (id <= 0) {
        throw new Error('Некорректный ID клиента');
    }

    try {
        const response = await api.get<ClientDto>(`/clients/${id}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Клиент не найден');
            } else if (error.response?.status === 400) {
                throw new Error('Некорректный запрос: неверный формат ID');
            }
        }
        console.error('Error fetching client by ID:', error);
        throw new Error('Не удалось загрузить данные клиента');
    }
};


export const createResource = async (name: string): Promise<ResourceDto> => {
    try {
        const response = await api.post<ResourceDto>('/resources', { name });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 400) {
            throw new Error(error.response.data.message || 'Некорректные данные');
        }
        throw new Error('Не удалось создать ресурс');
    }
};

export const updateResource = async (id: number, name: string): Promise<void> => {
    try {
        await api.put(`/resources/${id}`, { id, name });
    } catch (error) {
        throw new Error('Не удалось обновить ресурс');
    }
};

export const archiveResource = async (id: number): Promise<void> => {
    try {
        await api.delete(`/resources/${id}`);
    } catch (error) {
        throw new Error('Не удалось архивировать ресурс');
    }
};






export const createUnit = async (name: string): Promise<UnitOfMeasureDto> => {
    try {
        const response = await api.post<UnitOfMeasureDto>('/units', { name });
        return response.data;
    } catch (error) {
        throw new Error('Не удалось создать единицу измерения');
    }
};

export const updateUnit = async (id: number, name: string): Promise<void> => {
    try {
        await api.put(`/units/${id}`, { id, name });
    } catch (error) {
        throw new Error('Не удалось обновить единицу измерения');
    }
};

export const archiveUnit = async (id: number): Promise<void> => {
    try {
        await api.delete(`/units/${id}`);
    } catch (error) {
        throw new Error('Не удалось архивировать единицу измерения');
    }
};







export const createClient = async (name: string, address: string): Promise<ClientDto> => {
    try {
        const response = await api.post<ClientDto>('/clients', { name, address });
        return response.data;
    } catch (error) {
        throw new Error('Не удалось создать клиента');
    }
};

export const updateClient = async (id: number, name: string, address: string): Promise<void> => {
    try {
        await api.put(`/clients/${id}`, { id, name, address });
    } catch (error) {
        throw new Error('Не удалось обновить клиента');
    }
};

export const archiveClient = async (id: number): Promise<void> => {
    try {
        await api.delete(`/clients/${id}`);
    } catch (error) {
        throw new Error('Не удалось архивировать клиента');
    }
};






export const getReceipts = async (
    fromDate?: Date | null,
    toDate?: Date | null,
    documentNumbers?: string[],
    resourceIds?: number[],
    unitIds?: number[]
): Promise<ReceiptItem[]> => {
    try {
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate.toISOString());
        if (toDate) params.append('toDate', toDate.toISOString());
        if (documentNumbers) documentNumbers.forEach(num => params.append('documentNumbers', num));
        if (resourceIds) resourceIds.forEach(id => params.append('resourceIds', id.toString()));
        if (unitIds) unitIds.forEach(id => params.append('unitIds', id.toString()));

        const response = await api.get<ReceiptDocumentDto[]>('/receipts', { params });
        const documents = response.data;


        const items: ReceiptItem[] = [];
        documents.forEach(doc => {
            doc.receiptResources.forEach(rr => {
                items.push({
                    documentId: doc.id,
                    documentNumber: doc.number,
                    date: doc.date,
                    resourceId: rr.resourceId,
                    unitId: rr.unitOfMeasureId,
                    resourceName: rr.resourceName,
                    unitName: rr.unitName,
                    quantity: rr.quantity
                });
            });
        });

        return items;
    } catch (error) {
        console.error('Error fetching receipts:', error);
        throw new Error('Не удалось загрузить данные поступлений');
    }
};

export const createReceipt = async (request: CreateReceiptDocumentRequest): Promise<ReceiptDocumentDto> => {
    try {
        const response = await api.post<ReceiptDocumentDto>('/receipts', request);
        return response.data;
    } catch (error) {
        throw new Error('Не удалось создать документ поступления');
    }
};


export const getReceiptById = async (id: number): Promise<ReceiptDocumentDto> => {
    if (id <= 0) {
        throw new Error('Некорректный ID документа поступления');
    }

    try {
        const response = await api.get<ReceiptDocumentDto>(`/receipts/${id}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Документ поступления не найден');
            }
        }
        console.error('Error fetching receipt by ID:', error);
        throw new Error('Не удалось загрузить документ поступления');
    }
};

export const deleteReceipt = async (id: number): Promise<void> => {
    try {
        await api.delete(`/receipts/${id}`);
    } catch (error) {
        throw new Error('Не удалось удалить документ поступления');
    }
};







export const getBalances = async (
    resourceIds?: number[],
    unitIds?: number[]
): Promise<BalanceDto[]> => {
    try {
        const params = new URLSearchParams();
        if (resourceIds) resourceIds.forEach(id => params.append('resourceIds', id.toString()));
        if (unitIds) unitIds.forEach(id => params.append('unitIds', id.toString()));

        const response = await api.get<BalanceDto[]>('/balance', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching balances:', error);
        throw new Error('Не удалось загрузить остатки');
    }
};

export const getAvailableQuantity = async (resourceId: number, unitId: number): Promise<number> => {
    try {
        const response = await api.get<{ resourceId: number; unitId: number; availableQuantity: number }>(
            `/balance/available`,
            { params: { resourceId, unitId } }
        );
        return response.data.availableQuantity;
    } catch (error) {
        console.error('Error fetching available quantity:', error);
        return 0;
    }
};





export const getShipments = async (
    fromDate?: Date | null,
    toDate?: Date | null,
    documentNumbers?: string[],
    resourceIds?: number[],
    unitIds?: number[]
): Promise<ShipmentItem[]> => {
    try {
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate.toISOString());
        if (toDate) params.append('toDate', toDate.toISOString());
        if (documentNumbers) documentNumbers.forEach(num => params.append('documentNumbers', num));
        if (resourceIds) resourceIds.forEach(id => params.append('resourceIds', id.toString()));
        if (unitIds) unitIds.forEach(id => params.append('unitIds', id.toString()));

        const response = await api.get<ShipmentDocumentDto[]>('/shipments', { params });
        const documents = response.data;



        const items: ShipmentItem[] = [];
        documents.forEach(doc => {
            const statusMap: Record<number, ShipmentItem['status']> = {
                0: 'draft',
                1: 'signed',
                2: 'revoked'
            };
            const status = statusMap[doc.status] || 'draft';

            doc.shipmentResources.forEach(sr => {
                items.push({
                    documentId: doc.id,
                    documentNumber: doc.number,
                    date: doc.date,
                    clientName: doc.client.name,
                    status,
                    resourceId: sr.resourceId,
                    unitId: sr.unitOfMeasureId,
                    resourceName: sr.resourceName,
                    unitName: sr.unitName,
                    quantity: sr.quantity
                });
            });
        });

        return items;
    } catch (error) {
        console.error('Error fetching shipments:', error);
        throw new Error('Не удалось загрузить данные отгрузок');
    }
};

export const createShipment = async (request: CreateShipmentDocumentRequest): Promise<ShipmentDocumentDto> => {
    try {
        const response = await api.post<ShipmentDocumentDto>('/shipments', request);
        return response.data;
    } catch (error) {
        throw new Error('Не удалось создать документ отгрузки');
    }
};

export const signShipment = async (id: number): Promise<void> => {
    try {
        await api.post(`/shipments/${id}/sign`);
    } catch (error) {
        throw new Error('Не удалось подписать документ отгрузки');
    }
};

export const revokeShipment = async (id: number): Promise<void> => {
    try {
        await api.post(`/shipments/${id}/revoke`);
    } catch (error) {
        throw new Error('Не удалось отозвать документ отгрузки');
    }
};

export const deleteShipment = async (id: number): Promise<void> => {
    try {
        await api.delete(`/shipments/${id}`);
    } catch (error) {
        throw new Error('Не удалось удалить документ отгрузки');
    }
};



export const getResourceById = async (id: number): Promise<ResourceDto> => {
    if (id <= 0) {
        throw new Error('Некорректный ID ресурса');
    }

    try {
        const response = await api.get<ResourceDto>(`/resources/${id}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Ресурс не найден');
            } else if (error.response?.status === 400) {
                throw new Error('Некорректный запрос: неверный формат ID');
            }
        }
        console.error('Error fetching resource by ID:', error);
        throw new Error('Не удалось загрузить данные ресурса');
    }
};


export const getUnitById = async (id: number): Promise<UnitOfMeasureDto> => {
    if (id <= 0) {
        throw new Error('Некорректный ID единицы измерения');
    }

    try {
        const response = await api.get<UnitOfMeasureDto>(`/units/${id}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Единица измерения не найдена');
            } else if (error.response?.status === 400) {
                throw new Error('Некорректный запрос: неверный формат ID');
            }
        }
        console.error('Error fetching unit by ID:', error);
        throw new Error('Не удалось загрузить данные единицы измерения');
    }
};


export const getShipmentById = async (id: number): Promise<ShipmentDocumentDto> => {
    if (id <= 0) {
        throw new Error('Некорректный ID документа отгрузки');
    }

    try {
        const response = await api.get<ShipmentDocumentDto>(`/shipments/${id}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Документ отгрузки не найден');
            }
        }
        console.error('Error fetching shipment by ID:', error);
        throw new Error('Не удалось загрузить документ отгрузки');
    }
};

export const archiveReceipt = async (id: number): Promise<void> => {
    if (id <= 0) {
        throw new Error('Некорректный ID документа поступления');
    }

    try {
        await api.delete(`/receipts/${id}`);
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Документ поступления не найден');
            } else if (error.response?.status === 400) {
                throw new Error('Некорректный запрос: невозможно архивировать подписанный документ');
            }
        }
        console.error('Error archiving receipt:', error);
        throw new Error('Не удалось архивировать документ поступления');
    }
};

export const restoreResource = async (id: number): Promise<void> => {
    if (id <= 0) {
        throw new Error('Некорректный ID ресурса');
    }

    try {
        await api.post(`/resources/${id}/restore`);
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Ресурс не найден');
            }
        }
        console.error('Error restoring resource:', error);
        throw new Error('Не удалось восстановить ресурс');
    }
};

export const restoreUnit = async (id: number): Promise<void> => {
    if (id <= 0) {
        throw new Error('Некорректный ID единицы измерения');
    }

    try {
        await api.post(`/units/${id}/restore`);
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Единица измерения не найдена');
            }
        }
        console.error('Error restoring unit:', error);
        throw new Error('Не удалось восстановить единицу измерения');
    }
};


export const updateReceipt = async (
    id: number,
    request: CreateReceiptDocumentRequest
): Promise<void> => {
    if (id <= 0) {
        throw new Error('Некорректный ID документа');
    }

    try {
        await api.put(`/receipts/${id}`, request);
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Документ не найден');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data.message || 'Некорректные данные');
            }
        }
        console.error('Error updating receipt:', error);
        throw new Error('Не удалось обновить документ поступления');
    }
};

export const archiveShipment = async (id: number): Promise<void> => {
    if (id <= 0) {
        throw new Error('Некорректный ID документа отгрузки');
    }

    try {
        await api.delete(`/shipments/${id}`);
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Документ отгрузки не найден');
            } else if (error.response?.status === 400) {
                throw new Error('Невозможно архивировать подписанный документ');
            }
        }
        console.error('Error archiving shipment:', error);
        throw new Error('Не удалось архивировать документ отгрузки');
    }
};

export const updateShipment = async (
    id: number,
    request: CreateShipmentDocumentRequest
): Promise<void> => {
    if (id <= 0) {
        throw new Error('Некорректный ID документа');
    }

    try {
        await api.put(`/shipments/${id}`, request);
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
                throw new Error('Документ не найден');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data.message || 'Некорректные данные');
            }
        }
        console.error('Error updating shipment:', error);
        throw new Error('Не удалось обновить документ отгрузки');
    }
};


// Получить только активные ресурсы
export const getActiveResources = async (): Promise<ResourceDto[]> => {
    try {
        const response = await api.get<ResourceDto[]>('/resources/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active resources:', error);
        throw new Error('Не удалось загрузить активные ресурсы');
    }
};

// Получить только архивированные ресурсы
export const getArchivedResources = async (): Promise<ResourceDto[]> => {
    try {
        const response = await api.get<ResourceDto[]>('/resources/archive');
        return response.data;
    } catch (error) {
        console.error('Error fetching archived resources:', error);
        throw new Error('Не удалось загрузить архивированные ресурсы');
    }
};



// Получить только активные единицы измерения
export const getActiveUnits = async (): Promise<UnitOfMeasureDto[]> => {
    try {
        const response = await api.get<UnitOfMeasureDto[]>('/units/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active units:', error);
        throw new Error('Не удалось загрузить активные единицы измерения');
    }
};

// Получить только архивированные единицы измерения
export const getArchivedUnits = async (): Promise<UnitOfMeasureDto[]> => {
    try {
        const response = await api.get<UnitOfMeasureDto[]>('/units/archive');
        return response.data;
    } catch (error) {
        console.error('Error fetching archived units:', error);
        throw new Error('Не удалось загрузить архивированные единицы измерения');
    }
};


// Получить только активных клиентов
export const getActiveClients = async (): Promise<ClientDto[]> => {
    try {
        const response = await api.get<ClientDto[]>('/clients/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active clients:', error);
        throw new Error('Не удалось загрузить активных клиентов');
    }
};

// Получить только архивированных клиентов
export const getArchivedClients = async (): Promise<ClientDto[]> => {
    try {
        const response = await api.get<ClientDto[]>('/clients/archive');
        return response.data;
    } catch (error) {
        console.error('Error fetching archived clients:', error);
        throw new Error('Не удалось загрузить архивированных клиентов');
    }
};