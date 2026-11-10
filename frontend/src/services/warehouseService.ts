import { apiClient } from './apiClient';

export interface Warehouse {
  id: string;
  cooperative_id?: string;
  warehouse_code: string;
  name: string;
  location?: string | null;
  manager_id?: string | null;
  manager?: {
    id: string;
    full_name: string;
    username: string;
  } | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
  updated_at?: string;
}

export interface CreateWarehousePayload {
  warehouse_code: string;
  name: string;
  location?: string;
  manager_id?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateWarehousePayload {
  warehouse_code?: string;
  name?: string;
  location?: string;
  manager_id?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const warehouseService = {
  async getWarehouses(): Promise<Warehouse[]> {
    const res: any = await apiClient.get('/warehouses');
    const list = res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  },

  async getWarehouseById(id: string): Promise<Warehouse> {
    const res: any = await apiClient.get(`/warehouses/${id}`);
    return res.data?.data || res.data;
  },

  async createWarehouse(payload: CreateWarehousePayload): Promise<Warehouse> {
    const res: any = await apiClient.post('/warehouses', payload);
    return res.data?.data || res.data;
  },

  async updateWarehouse(id: string, payload: UpdateWarehousePayload): Promise<Warehouse> {
    const res: any = await apiClient.patch(`/warehouses/${id}`, payload);
    return res.data?.data || res.data;
  },

  async deleteWarehouse(id: string): Promise<boolean> {
    await apiClient.delete(`/warehouses/${id}`);
    return true;
  },
};
