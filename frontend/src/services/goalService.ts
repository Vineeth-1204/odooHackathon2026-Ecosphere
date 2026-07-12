import { api } from "./api";

export const goalService = {
  getGoals: async (departmentId?: string, status?: string) => {
    let query = "";
    const params = new URLSearchParams();
    if (departmentId) params.append("departmentId", departmentId);
    if (status) params.append("status", status);
    
    const queryString = params.toString();
    if (queryString) query = `?${queryString}`;
    
    return api.get(`/goals${query}`);
  },

  getGoalById: async (id: string) => {
    return api.get(`/goals/${id}`);
  },

  createGoal: async (data: any) => {
    return api.post("/goals", data);
  },

  updateGoal: async (id: string, data: any) => {
    return api.put(`/goals/${id}`, data);
  },

  deleteGoal: async (id: string) => {
    return api.delete(`/goals/${id}`);
  }
};

export default goalService;
