import React, { useEffect, useState } from "react";
import governanceService from "../../services/governanceService";
import userService from "../../services/userService";
import { AlertCircle, Plus, ShieldCheck, User, RefreshCw } from "lucide-react";

export const ComplianceIssueList: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form State
  const [auditId, setAuditId] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchData = async () => {
    try {
      const [issuesRes, usersRes, auditsRes] = await Promise.all([
        governanceService.getComplianceIssues({
          severity: severityFilter || undefined,
          status: statusFilter || undefined
        }),
        userService.getUsers({ limit: 100 }),
        governanceService.getAudits()
      ]);
      setIssues(issuesRes.issues || []);
      setUsers(usersRes.users || []);
      setAudits(auditsRes.audits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [severityFilter, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !ownerId || !dueDate) {
      alert("Description, Owner, and Due Date are required!");
      return;
    }
    try {
      await governanceService.createComplianceIssue({
        auditId: auditId || null,
        severity,
        description,
        ownerId,
        dueDate
      });
      setShowModal(false);
      // Reset form
      setAuditId("");
      setSeverity("MEDIUM");
      setDescription("");
      setOwnerId("");
      setDueDate("");
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to log compliance issue");
    }
  };

  const handleResolve = async (id: string) => {
    if (!window.confirm("Mark this compliance issue as resolved?")) {
      return;
    }
    try {
      await governanceService.resolveComplianceIssue(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to resolve compliance issue");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1F4032]" />
      </div>
    );
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-100 text-red-700 border border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "MEDIUM":
        return "bg-amber-100 text-[#E3A73E] border border-amber-200";
      default:
        return "bg-blue-100 text-blue-700 border border-blue-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative text-left">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">Compliance & Issues</h1>
          <p className="text-[#90998C] text-sm mt-1">Track regulatory compliance gaps, assign ownership, and monitor deadlines.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1F4032] text-white text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> Log Compliance Issue
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E4E6DF] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-xs text-[#24333E] outline-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-xs text-[#24333E] outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1 px-3 py-1.5 hover:bg-[#F3F5EF] text-[#90998C] rounded-lg text-xs font-semibold"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-2xl border border-[#E4E6DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F3F5EF] border-b border-[#E4E6DF] text-xs font-semibold text-[#90998C] uppercase tracking-wider">
                <th className="px-6 py-4">Issue Description</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E6DF] text-sm text-[#24333E]">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#90998C]">
                    No compliance issues logged matching filters.
                  </td>
                </tr>
              ) : (
                issues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-[#F3F5EF]/20">
                    <td className="px-6 py-4 max-w-xs truncate font-medium" title={iss.description}>
                      {iss.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getSeverityBadge(iss.severity)}`}>
                        {iss.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs">
                        <User size={14} className="text-[#90998C]" />
                        {iss.owner ? `${iss.owner.firstName} ${iss.owner.lastName}` : "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      {new Date(iss.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold">
                      {iss.status === "RESOLVED" ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <ShieldCheck size={14} /> Resolved
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} /> Open
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {iss.status === "OPEN" && (
                        <button
                          onClick={() => handleResolve(iss.id)}
                          className="px-3 py-1 bg-[#1F4032] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E4E6DF] w-full max-w-md p-6 space-y-6 text-left">
            <h3 className="text-lg font-bold text-[#24333E]">Log Compliance Issue</h3>

            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Linked Audit (Optional)</label>
                <select
                  value={auditId}
                  onChange={(e) => setAuditId(e.target.value)}
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                >
                  <option value="">No Audit Link</option>
                  {audits.map((a) => (
                    <option key={a.id} value={a.id}>{a.scope} ({new Date(a.date).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Issue Description</label>
                <textarea
                  required
                  placeholder="Detail the compliance gap discovered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2.5 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Assignee / Owner</label>
                  <select
                    required
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                  >
                    <option value="">Select Assignee</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-[#E4E6DF] text-[#24333E] text-xs font-bold rounded-lg hover:bg-[#F3F5EF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1F4032] text-white text-xs font-bold rounded-lg hover:brightness-110"
              >
                Log Issue
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ComplianceIssueList;
