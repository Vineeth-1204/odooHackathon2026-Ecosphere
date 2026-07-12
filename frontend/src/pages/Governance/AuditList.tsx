import React, { useEffect, useState } from "react";
import governanceService from "../../services/governanceService";
import { Plus, Calendar, Edit2, Trash2, CheckCircle2, Clock } from "lucide-react";

export const AuditList: React.FC = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [scope, setScope] = useState("");
  const [date, setDate] = useState("");
  const [auditor, setAuditor] = useState("");
  const [status, setStatus] = useState("SCHEDULED");

  const fetchAudits = async () => {
    try {
      const res = await governanceService.getAudits();
      setAudits(res.audits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleOpenCreate = () => {
    setEditingAudit(null);
    setScope("");
    setDate("");
    setAuditor("");
    setStatus("SCHEDULED");
    setShowModal(true);
  };

  const handleOpenEdit = (audit: any) => {
    setEditingAudit(audit);
    setScope(audit.scope);
    setDate(new Date(audit.date).toISOString().split("T")[0]);
    setAuditor(audit.auditor);
    setStatus(audit.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scope || !date || !auditor) {
      alert("All fields are required!");
      return;
    }
    try {
      if (editingAudit) {
        await governanceService.updateAudit(editingAudit.id, { scope, date, auditor, status });
      } else {
        await governanceService.createAudit({ scope, date, auditor, status });
      }
      setShowModal(false);
      await fetchAudits();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this audit schedule?")) {
      return;
    }
    try {
      await governanceService.deleteAudit(id);
      await fetchAudits();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1F4032]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">ESG Compliance Audits</h1>
          <p className="text-[#90998C] text-sm mt-1">Schedule and manage environmental and governance compliance audits.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1F4032] text-white text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> Schedule Audit
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4E6DF] overflow-hidden">
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F3F5EF] border-b border-[#E4E6DF] text-xs font-semibold text-[#90998C] uppercase tracking-wider">
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4">Auditor</th>
                <th className="px-6 py-4">Scheduled Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E6DF] text-sm text-[#24333E]">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#90998C]">
                    No audits scheduled. Click the button to schedule your first audit.
                  </td>
                </tr>
              ) : (
                audits.map((aud) => (
                  <tr key={aud.id} className="hover:bg-[#F3F5EF]/20">
                    <td className="px-6 py-4 font-semibold">{aud.scope}</td>
                    <td className="px-6 py-4 text-xs">{aud.auditor}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#90998C]" />
                        {new Date(aud.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {aud.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FCF8E3] text-[#E3A73E] rounded-full text-xs font-bold">
                          <Clock size={12} /> Scheduled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(aud)}
                        className="p-1.5 hover:bg-[#F3F5EF] text-[#90998C] hover:text-[#24333E] rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(aud.id)}
                        className="p-1.5 hover:bg-red-50 text-[#C1503A] rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E4E6DF] w-full max-w-md p-6 space-y-6 text-left">
            <h3 className="text-lg font-bold text-[#24333E]">{editingAudit ? "Update Audit Info" : "Schedule New Audit"}</h3>

            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Audit Scope</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scope 1 Emissions & Logistics"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2.5 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Lead Auditor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ESG Oversight Committee"
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2.5 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Audit Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
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
                {editingAudit ? "Save Changes" : "Create Schedule"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuditList;
