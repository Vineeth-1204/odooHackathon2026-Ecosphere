import { api } from "./api";

export const categoryService = {
  getCategories: async () => {
    return api.get("/categories");
  },

  getCategoryById: async (id: string) => {
    return api.get(`/categories/${id}`);
  },

  createCategory: async (catData: any) => {
    return api.post("/categories", catData);
  },

  updateCategory: async (id: string, catData: any) => {
    return api.put(`/categories/${id}`, catData);
  },

  deleteCategory: async (id: string) => {
    return api.delete(`/categories/${id}`);
  }
};
export default categoryService;
