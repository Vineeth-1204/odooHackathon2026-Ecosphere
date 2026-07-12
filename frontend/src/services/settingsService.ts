import { api } from "./api";

export const settingsService = {
  getSettings: async () => {
    return api.get("/settings");
  },

  updateSettings: async (settings: { key: string; value: string }[]) => {
    return api.put("/settings", { settings });
  }
};
export default settingsService;
