const API_BASE = 'http://localhost:5000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Server error occurred');
  }
  return data as T;
}

export const api = {
  // Health & Summary
  getHealth: () => fetchJson<{ status: string; dbConnected: boolean; appName: string }>('/health'),
  getSummary: () => fetchJson<any>('/dashboard-summary'),

  // Projects & Sites
  getProjects: () => fetchJson<any[]>('/projects'),
  createProject: (data: any) => fetchJson<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: number, data: any) => fetchJson<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: number) => fetchJson<any>(`/projects/${id}`, { method: 'DELETE' }),

  getSites: () => fetchJson<any[]>('/sites'),
  createSite: (data: any) => fetchJson<any>('/sites', { method: 'POST', body: JSON.stringify(data) }),
  updateSite: (id: number, data: any) => fetchJson<any>(`/sites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSite: (id: number) => fetchJson<any>(`/sites/${id}`, { method: 'DELETE' }),

  // Procurement
  getSuppliers: () => fetchJson<any[]>('/suppliers'),
  createSupplier: (data: any) => fetchJson<any>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: number, data: any) => fetchJson<any>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: number) => fetchJson<any>(`/suppliers/${id}`, { method: 'DELETE' }),

  getPurchaseOrders: () => fetchJson<any[]>('/purchase-orders'),
  createPurchaseOrder: (data: any) => fetchJson<any>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  updatePurchaseOrder: (id: number, data: any) => fetchJson<any>(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePurchaseOrder: (id: number) => fetchJson<any>(`/purchase-orders/${id}`, { method: 'DELETE' }),

  getDeliveries: () => fetchJson<any[]>('/deliveries'),
  createDelivery: (data: any) => fetchJson<any>('/deliveries', { method: 'POST', body: JSON.stringify(data) }),
  updateDelivery: (id: number, data: any) => fetchJson<any>(`/deliveries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDelivery: (id: number) => fetchJson<any>(`/deliveries/${id}`, { method: 'DELETE' }),

  getDeliveryItems: () => fetchJson<any[]>('/delivery-items'),
  createDeliveryItem: (data: any) => fetchJson<any>('/delivery-items', { method: 'POST', body: JSON.stringify(data) }),
  updateDeliveryItem: (id: number, data: any) => fetchJson<any>(`/delivery-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDeliveryItem: (id: number) => fetchJson<any>(`/delivery-items/${id}`, { method: 'DELETE' }),

  // Materials & Stock
  getMaterials: () => fetchJson<any[]>('/materials'),
  createMaterial: (data: any) => fetchJson<any>('/materials', { method: 'POST', body: JSON.stringify(data) }),
  updateMaterial: (id: number, data: any) => fetchJson<any>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaterial: (id: number) => fetchJson<any>(`/materials/${id}`, { method: 'DELETE' }),

  getSiteStock: () => fetchJson<any[]>('/site-stock'),
  createSiteStock: (data: any) => fetchJson<any>('/site-stock', { method: 'POST', body: JSON.stringify(data) }),
  updateSiteStock: (id: number, data: any) => fetchJson<any>(`/site-stock/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSiteStock: (id: number) => fetchJson<any>(`/site-stock/${id}`, { method: 'DELETE' }),

  getIssues: () => fetchJson<any[]>('/issues'),
  createIssue: (data: any) => fetchJson<any>('/issues', { method: 'POST', body: JSON.stringify(data) }),
  updateIssue: (id: number, data: any) => fetchJson<any>(`/issues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIssue: (id: number) => fetchJson<any>(`/issues/${id}`, { method: 'DELETE' }),

  // Progress & Work Packages
  getContractors: () => fetchJson<any[]>('/contractors'),
  createContractor: (data: any) => fetchJson<any>('/contractors', { method: 'POST', body: JSON.stringify(data) }),
  updateContractor: (id: number, data: any) => fetchJson<any>(`/contractors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContractor: (id: number) => fetchJson<any>(`/contractors/${id}`, { method: 'DELETE' }),

  getWorkPackages: () => fetchJson<any[]>('/work-packages'),
  createWorkPackage: (data: any) => fetchJson<any>('/work-packages', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkPackage: (id: number, data: any) => fetchJson<any>(`/work-packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkPackage: (id: number) => fetchJson<any>(`/work-packages/${id}`, { method: 'DELETE' }),

  getLabourTeams: () => fetchJson<any[]>('/labour-teams'),
  createLabourTeam: (data: any) => fetchJson<any>('/labour-teams', { method: 'POST', body: JSON.stringify(data) }),
  updateLabourTeam: (id: number, data: any) => fetchJson<any>(`/labour-teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLabourTeam: (id: number) => fetchJson<any>(`/labour-teams/${id}`, { method: 'DELETE' }),

  getProgressEntries: () => fetchJson<any[]>('/progress-entries'),
  createProgressEntry: (data: any) => fetchJson<any>('/progress-entries', { method: 'POST', body: JSON.stringify(data) }),
  updateProgressEntry: (id: number, data: any) => fetchJson<any>(`/progress-entries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProgressEntry: (id: number) => fetchJson<any>(`/progress-entries/${id}`, { method: 'DELETE' }),

  // Billing & Payments
  getBills: () => fetchJson<any[]>('/bills'),
  createBill: (data: any) => fetchJson<any>('/bills', { method: 'POST', body: JSON.stringify(data) }),
  updateBill: (id: number, data: any) => fetchJson<any>(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBill: (id: number) => fetchJson<any>(`/bills/${id}`, { method: 'DELETE' }),

  getPayments: () => fetchJson<any[]>('/payments'),
  createPayment: (data: any) => fetchJson<any>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (id: number, data: any) => fetchJson<any>(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePayment: (id: number) => fetchJson<any>(`/payments/${id}`, { method: 'DELETE' }),

  // Reports
  getMaterialBalanceReport: () => fetchJson<any[]>('/reports/material-balance'),
  getWorkProgressReport: () => fetchJson<any[]>('/reports/work-progress'),
  getSupplierPerformanceReport: () => fetchJson<any[]>('/reports/supplier-performance'),
  getContractorBillsReport: () => fetchJson<any[]>('/reports/contractor-bills'),
  getCostVarianceReport: () => fetchJson<any[]>('/reports/cost-variance'),
  getProjectStatusReport: () => fetchJson<any[]>('/reports/project-status'),
};
