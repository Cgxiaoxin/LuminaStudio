export interface RequestWithUser {
  user: {
    id: number;
    tenantId: number;
    storeId?: number;
    role: string;
    type: 'admin' | 'client';
  };
}
