// src/api/warehouseApi.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5130/api/Warehouse'
});

// »нтерфейсы должны быть объ€влены перед их использованием
export interface BalanceItem {
    resourceId: number;
    resourceName: string;
    unitId: number;
    unitName: string;
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

export const getBalances = async (resourceIds?: number[], unitIds?: number[]): Promise<BalanceItem[]> => {
    const params = new URLSearchParams();

    if (resourceIds) {
        resourceIds.forEach(id => params.append('resourceIds', id.toString()));
    }

    if (unitIds) {
        unitIds.forEach(id => params.append('unitIds', id.toString()));
    }

    const response = await api.get('/balances', { params });
    return response.data;
};

export const getResources = async (): Promise<Resource[]> => {
    const response = await api.get('/resources');
    return response.data;
};

export const getUnits = async (): Promise<Unit[]> => {
    const response = await api.get('/units');
    return response.data;
};