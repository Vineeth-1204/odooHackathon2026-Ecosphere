import { api } from "./api";

export const productService = {
  getProducts: async (search?: string, esgGrade?: string) => {
    let query = "";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (esgGrade) params.append("esgGrade", esgGrade);
    
    const queryString = params.toString();
    if (queryString) query = `?${queryString}`;
    
    return api.get(`/products${query}`);
  },

  getProductById: async (id: string) => {
    return api.get(`/products/${id}`);
  },

  createProduct: async (data: any) => {
    return api.post("/products", data);
  },

  updateProduct: async (id: string, data: any) => {
    return api.put(`/products/${id}`, data);
  },

  deleteProduct: async (id: string) => {
    return api.delete(`/products/${id}`);
  }
};

export default productService;
