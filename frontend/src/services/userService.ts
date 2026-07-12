import { api } from "./api";

export const userService = {
  getUsers: async (params: { page?: number; limit?: number; search?: string; departmentId?: string; roleId?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.departmentId) query.append("departmentId", params.departmentId);
    if (params.roleId) query.append("roleId", params.roleId);

    const qStr = query.toString();
    return api.get(`/users${qStr ? `?${qStr}` : ""}`);
  },

  getUserById: async (id: string) => {
    return api.get(`/users/${id}`);
  },

  createUser: async (userData: any) => {
    return api.post("/users", userData);
  },

  updateUser: async (id: string, userData: any) => {
    return api.put(`/users/${id}`, userData);
  },

  deleteUser: async (id: string) => {
    return api.delete(`/users/${id}`);
  },

  getRoles: async () => {
    return api.get("/users/roles");
  }
};
export default userService;
