import { api } from "./api";

export const emissionService = {
  getEmissionFactors: async (search?: string, categoryId?: string) => {
    let query = "";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId) params.append("categoryId", categoryId);
    
    const queryString = params.toString();
    if (queryString) query = `?${queryString}`;
    
    return api.get(`/emissions${query}`);
  },

  getEmissionFactorById: async (id: string) => {
    return api.get(`/emissions/${id}`);
  },

  createEmissionFactor: async (data: any) => {
    return api.post("/emissions", data);
  },

  updateEmissionFactor: async (id: string, data: any) => {
    return api.put(`/emissions/${id}`, data);
  },

  deleteEmissionFactor: async (id: string) => {
    return api.delete(`/emissions/${id}`);
  }
};

export default emissionService;
