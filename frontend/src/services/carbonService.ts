import { api } from "./api";

export const carbonService = {
  getTransactions: async (filters?: { departmentId?: string; categoryId?: string; startDate?: string; endDate?: string }) => {
    let query = "";
    if (filters) {
      const params = new URLSearchParams();
      if (filters.departmentId) params.append("departmentId", filters.departmentId);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      const queryString = params.toString();
      if (queryString) query = `?${queryString}`;
    }
    return api.get(`/carbon${query}`);
  },

  getTransactionById: async (id: string) => {
    return api.get(`/carbon/${id}`);
  },

  createTransaction: async (data: any) => {
    return api.post("/carbon", data);
  },

  updateTransaction: async (id: string, data: any) => {
    return api.put(`/carbon/${id}`, data);
  },

  deleteTransaction: async (id: string) => {
    return api.delete(`/carbon/${id}`);
  },

  getDashboardSummary: async () => {
    return api.get("/carbon/dashboard");
  }
};

export default carbonService;
