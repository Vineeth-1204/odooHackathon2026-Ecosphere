import { api } from "./api";

export const socialService = {
  // CSR Activities
  getCSRActivities: async (filters: { categoryId?: string; departmentId?: string; status?: string; search?: string } = {}) => {
    const params = new URLSearchParams(filters as any).toString();
    const query = params ? `?${params}` : "";
    const res = await api.get(`/csr${query}`);
    return res.data || res;
  },
  getCSRActivityById: async (id: number) => {
    const res = await api.get(`/csr/${id}`);
    return res.data || res;
  },
  createCSRActivity: async (activityData: any) => {
    return api.post("/csr", activityData);
  },
  updateCSRActivity: async (id: number, activityData: any) => {
    return api.put(`/csr/${id}`, activityData);
  },
  deleteCSRActivity: async (id: number) => {
    return api.delete(`/csr/${id}`);
  },
  joinCSRActivity: async (id: number) => {
    return api.post(`/csr/${id}/join`, {});
  },
  uploadCSRProof: async (id: number, formData: FormData) => {
    // Note: Since FormData requires custom headers/content-type handled by the browser,
    // we bypass our standard JSON headers in api.ts request by writing a fetch call or adding options
    const token = localStorage.getItem("ecosphere_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`http://localhost:5000/api/csr/${id}/proof`, {
      method: "POST",
      headers,
      body: formData
    });
    if (!response.ok) {
      throw new Error("Failed to upload proof file");
    }
    return response.json();
  },
  getMyCSRParticipations: async () => {
    const res = await api.get("/csr/participations/my");
    return res.data || res;
  },
  getCSRActivityParticipations: async (id: number, status?: string) => {
    const query = status ? `?status=${status}` : "";
    const res = await api.get(`/csr/${id}/participations${query}`);
    return res.data || res;
  },
  approveCSRParticipation: async (id: number) => {
    return api.post(`/csr/participations/${id}/approve`, {});
  },
  rejectCSRParticipation: async (id: number, rejectionNote: string) => {
    return api.post(`/csr/participations/${id}/reject`, { rejectionNote });
  },

  // Challenges
  getChallenges: async (filters: { status?: string; difficulty?: string; categoryId?: string; search?: string } = {}) => {
    const params = new URLSearchParams(filters as any).toString();
    const query = params ? `?${params}` : "";
    const res = await api.get(`/challenges${query}`);
    return res.data || res;
  },
  getChallengeById: async (id: number) => {
    const res = await api.get(`/challenges/${id}`);
    return res.data || res;
  },
  createChallenge: async (challengeData: any) => {
    return api.post("/challenges", challengeData);
  },
  updateChallenge: async (id: number, challengeData: any) => {
    return api.put(`/challenges/${id}`, challengeData);
  },
  advanceChallengeStatus: async (id: number, status?: string) => {
    return api.post(`/challenges/${id}/status`, { status });
  },
  archiveChallenge: async (id: number) => {
    return api.delete(`/challenges/${id}`);
  },
  joinChallenge: async (id: number) => {
    return api.post(`/challenges/${id}/join`, {});
  },
  updateChallengeProgress: async (id: number, progress: number, file?: File) => {
    const token = localStorage.getItem("ecosphere_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const formData = new FormData();
    formData.append("progress", String(progress));
    if (file) {
      formData.append("file", file);
    }
    const response = await fetch(`http://localhost:5000/api/challenges/${id}/progress`, {
      method: "POST",
      headers,
      body: formData
    });
    if (!response.ok) {
      throw new Error("Failed to update challenge progress");
    }
    return response.json();
  },
  getMyChallengeParticipations: async () => {
    const res = await api.get("/challenges/participations/my");
    return res.data || res;
  },
  getChallengeSubmissions: async (id: number, status?: string) => {
    const query = status ? `?status=${status}` : "";
    const res = await api.get(`/challenges/${id}/submissions${query}`);
    return res.data || res;
  },
  approveChallengeParticipation: async (id: number) => {
    return api.post(`/challenges/participations/${id}/approve`, {});
  },
  rejectChallengeParticipation: async (id: number, rejectionNote: string) => {
    return api.post(`/challenges/participations/${id}/reject`, { rejectionNote });
  },

  // Badges
  getBadges: async () => {
    const res = await api.get("/badges");
    return res.data || res;
  },
  getMyBadges: async () => {
    const res = await api.get("/badges/my");
    return res.data || res;
  },
  createBadge: async (badgeData: any) => {
    return api.post("/badges", badgeData);
  },
  updateBadge: async (id: number, badgeData: any) => {
    return api.put(`/badges/${id}`, badgeData);
  },
  deleteBadge: async (id: number) => {
    return api.delete(`/badges/${id}`);
  },
  manualAwardBadge: async (userId: string, badgeId: number) => {
    return api.post("/badges/award", { userId, badgeId });
  },

  // Rewards
  getRewards: async () => {
    const res = await api.get("/rewards");
    return res.data || res;
  },
  getRewardById: async (id: number) => {
    const res = await api.get(`/rewards/${id}`);
    return res.data || res;
  },
  createReward: async (rewardData: any) => {
    return api.post("/rewards", rewardData);
  },
  updateReward: async (id: number, rewardData: any) => {
    return api.put(`/rewards/${id}`, rewardData);
  },
  archiveReward: async (id: number) => {
    return api.delete(`/rewards/${id}`);
  },
  redeemReward: async (id: number) => {
    return api.post(`/rewards/${id}/redeem`, {});
  },
  getMyRedemptions: async () => {
    const res = await api.get("/rewards/redemptions/my");
    return res.data || res;
  },
  getAllRedemptions: async () => {
    const res = await api.get("/rewards/redemptions/all");
    return res.data || res;
  },

  // Leaderboard
  getEmployeeLeaderboard: async (departmentId?: string) => {
    const query = departmentId ? `?departmentId=${departmentId}` : "";
    const res = await api.get(`/leaderboard/employees${query}`);
    return res.data || res;
  },
  getDepartmentLeaderboard: async () => {
    const res = await api.get("/leaderboard/departments");
    return res.data || res;
  },
  getMyRank: async () => {
    const res = await api.get("/leaderboard/my-rank");
    return res.data || res;
  }
};

export default socialService;
