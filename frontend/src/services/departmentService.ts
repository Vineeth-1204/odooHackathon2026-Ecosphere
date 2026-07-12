import { api } from "./api";

export const departmentService = {
  getDepartments: async () => {
    return api.get("/departments");
  },

  getDepartmentById: async (id: string) => {
    return api.get(`/departments/${id}`);
  },

  createDepartment: async (deptData: any) => {
    return api.post("/departments", deptData);
  },

  updateDepartment: async (id: string, deptData: any) => {
    return api.put(`/departments/${id}`, deptData);
  },

  deleteDepartment: async (id: string) => {
    return api.delete(`/departments/${id}`);
  }
};
export default departmentService;
