import { api } from "./api";

export const governanceService = {
  // Policies
  getPolicies: async () => {
    return api.get("/policies");
  },
  getPolicyById: async (id: string) => {
    return api.get(`/policies/${id}`);
  },
  createPolicy: async (policyData: {
    title: string;
    description?: string;
    documentUrl?: string;
    effectiveDate: string;
    departmentScope?: string;
  }) => {
    return api.post("/policies", policyData);
  },
  acknowledgePolicy: async (id: string) => {
    return api.post(`/policies/${id}/acknowledge`, {});
  },

  // Audits
  getAudits: async () => {
    return api.get("/audits");
  },
  getAuditById: async (id: string) => {
    return api.get(`/audits/${id}`);
  },
  createAudit: async (auditData: {
    scope: string;
    date: string;
    auditor: string;
    status?: string;
  }) => {
    return api.post("/audits", auditData);
  },
  updateAudit: async (id: string, auditData: any) => {
    return api.put(`/audits/${id}`, auditData);
  },
  deleteAudit: async (id: string) => {
    return api.delete(`/audits/${id}`);
  },

  // Compliance
  getComplianceIssues: async (filters: { severity?: string; status?: string; ownerId?: string; auditId?: string } = {}) => {
    const params = new URLSearchParams(filters as any).toString();
    const query = params ? `?${params}` : "";
    return api.get(`/compliance${query}`);
  },
  getComplianceIssueById: async (id: string) => {
    return api.get(`/compliance/${id}`);
  },
  createComplianceIssue: async (issueData: {
    auditId?: string | null;
    severity: string;
    description: string;
    ownerId: string;
    dueDate: string;
  }) => {
    return api.post("/compliance", issueData);
  },
  updateComplianceIssue: async (id: string, issueData: any) => {
    return api.put(`/compliance/${id}`, issueData);
  },
  resolveComplianceIssue: async (id: string) => {
    return api.post(`/compliance/${id}/resolve`, {});
  },

  // Notifications
  getNotifications: async () => {
    return api.get("/notifications");
  },
  markNotificationRead: async (id: string) => {
    return api.post(`/notifications/${id}/read`, {});
  },
  markAllNotificationsRead: async () => {
    return api.post("/notifications/read-all", {});
  },

  // Dashboard Scores and Analytics
  getDashboardScores: async () => {
    return api.get("/dashboard/scores");
  },
  getDashboardKPIs: async () => {
    return api.get("/dashboard/kpis");
  }
};

export default governanceService;
