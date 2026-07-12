import React, { useEffect, useState } from "react";
import governanceService from "../../services/governanceService";
import departmentService from "../../services/departmentService";
import { Plus, Calendar, ExternalLink, Globe } from "lucide-react";

export const PolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [departmentScope, setDepartmentScope] = useState("");

  const fetchData = async () => {
    try {
      const [policiesRes, deptsRes] = await Promise.all([
        governanceService.getPolicies(),
        departmentService.getDepartments()
      ]);
      setPolicies(policiesRes.policies || []);
      setDepartments(deptsRes.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !effectiveDate) {
      alert("Title and Effective Date are required!");
      return;
    }
    try {
      await governanceService.createPolicy({
        title,
        description,
        documentUrl: documentUrl || undefined,
        effectiveDate,
        departmentScope: departmentScope || undefined
      });
      setShowPublishModal(false);
      // Reset form
      setTitle("");
      setDescription("");
      setDocumentUrl("");
      setEffectiveDate("");
      setDepartmentScope("");
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to publish policy");
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
          <h1 className="text-3xl font-bold text-[#24333E]">Governance Policies</h1>
          <p className="text-[#90998C] text-sm mt-1">Publish, manage, and audit corporate compliance policies.</p>
        </div>
        <button
          onClick={() => setShowPublishModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1F4032] text-white text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> Publish New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((pol) => (
          <div key={pol.id} className="bg-white p-6 rounded-2xl border border-[#E4E6DF] text-left flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-[#F3F5EF] text-[#24333E] text-[10px] font-bold uppercase rounded-md tracking-wider">
                  Scope: {pol.departmentScope || "All Org"}
                </span>
                <span className="text-[10px] text-[#90998C] font-semibold flex items-center gap-1">
                  <Calendar size={12} /> {new Date(pol.effectiveDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#24333E] line-clamp-1">{pol.title}</h3>
                <p className="text-xs text-[#90998C] line-clamp-2 mt-1 leading-relaxed">
                  {pol.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4E6DF] flex items-center justify-between">
              {pol.documentUrl ? (
                <a
                  href={pol.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline text-xs font-bold"
                >
                  Document <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-xs text-[#90998C]">No attachment</span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-500 rounded-full text-[10px] font-bold">
                <Globe size={10} /> Published
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handlePublish} className="bg-white rounded-2xl border border-[#E4E6DF] w-full max-w-lg p-6 space-y-6 text-left">
            <h3 className="text-lg font-bold text-[#24333E]">Publish New ESG Policy</h3>

            <div className="grid grid-cols-1 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Policy Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Environmental Sustainability Guideline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2.5 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Brief summary of policy contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2.5 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Effective Date</label>
                  <input
                    type="date"
                    required
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Department Scope</label>
                  <select
                    value={departmentScope}
                    onChange={(e) => setDepartmentScope(e.target.value)}
                    className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Document Link URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/policy.pdf"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 border border-[#E4E6DF] text-[#24333E] text-xs font-bold rounded-lg hover:bg-[#F3F5EF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1F4032] text-white text-xs font-bold rounded-lg hover:brightness-110"
              >
                Publish Policy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PolicyList;
