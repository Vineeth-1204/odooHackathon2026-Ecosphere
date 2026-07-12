import { api } from "./api";

export const authService = {
  login: async (credentials: any) => {
    const data = await api.post("/auth/login", credentials);
    if (data.token) {
      localStorage.setItem("ecosphere_token", data.token);
      localStorage.setItem("ecosphere_user", JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData: any) => {
    const data = await api.post("/auth/register", userData);
    if (data.token) {
      localStorage.setItem("ecosphere_token", data.token);
      localStorage.setItem("ecosphere_user", JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem("ecosphere_token");
    localStorage.removeItem("ecosphere_user");
  },

  getCurrentUser: async () => {
    const data = await api.get("/auth/me");
    if (data.user) {
      localStorage.setItem("ecosphere_user", JSON.stringify(data.user));
    }
    return data.user;
  },

  forgotPassword: async (email: string) => {
    return api.post("/auth/forgot-password", { email });
  },

  getCachedUser: () => {
    const userStr = localStorage.getItem("ecosphere_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("ecosphere_token");
  }
};
export default authService;
