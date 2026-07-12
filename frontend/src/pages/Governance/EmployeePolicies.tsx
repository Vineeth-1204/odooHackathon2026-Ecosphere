import React, { useEffect, useState } from "react";
import governanceService from "../../services/governanceService";
import { FileText, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, Calendar } from "lucide-react";

export const EmployeePolicies: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      const res = await governanceService.getPolicies();
      setPolicies(res.policies || []);
    } catch (err) {
      console.error("Error loading policies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await governanceService.acknowledgePolicy(id);
      setSelectedPolicy(null);
      await fetchPolicies();
    } catch (err: any) {
      alert(err.message || "Failed to acknowledge policy");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#24333E]" />
      </div>
    );
  }

  const pendingCount = policies.filter((p) => !p.acknowledged).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">Corporate ESG Policies</h1>
          <p className="text-[#90998C] text-sm mt-1">Review corporate ESG guidelines and submit mandatory acknowledgements.</p>
        </div>
        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-red-50 text-[#C1503A] border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse">
            <AlertCircle size={16} />
            <span>{pendingCount} Policies Pending Action</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policies List (Left) */}
        <div className="lg:col-span-2 space-y-4">
          {policies.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E4E6DF] text-center text-[#90998C]">
              No policies have been published yet.
            </div>
          ) : (
            policies.map((pol) => (
              <div
                key={pol.id}
                onClick={() => setSelectedPolicy(pol)}
                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer text-left flex items-center justify-between ${
                  selectedPolicy?.id === pol.id ? "border-[#24333E] shadow-sm bg-[#F3F5EF]/30" : "border-[#E4E6DF] hover:bg-[#F3F5EF]/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${pol.acknowledged ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-[#C1503A]"}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#24333E]">{pol.title}</h3>
                    <p className="text-[10px] text-[#90998C] mt-0.5 flex items-center gap-2">
                      <span>Effective: {new Date(pol.effectiveDate).toLocaleDateString()}</span>
                      {pol.departmentScope && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-[#24333E]">Scope: {pol.departmentScope}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  {pol.acknowledged ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                      <ShieldCheck size={14} /> Signed
                    </span>
                  ) : (
                    <span className="text-[#C1503A] text-xs font-bold underline">
                      Sign Required
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Policy Detail view (Right) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] space-y-6 text-left h-fit">
          {selectedPolicy ? (
            <div className="space-y-6">
              <div className="space-y-2 border-b border-[#E4E6DF] pb-4">
                <h3 className="text-lg font-bold text-[#24333E]">{selectedPolicy.title}</h3>
                <div className="flex items-center gap-2 text-xs text-[#90998C]">
                  <Calendar size={14} />
                  <span>Effective Date: {new Date(selectedPolicy.effectiveDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Description</h4>
                <p className="text-xs text-[#24333E] leading-relaxed">
                  {selectedPolicy.description || "No description provided for this policy document."}
                </p>
              </div>

              {selectedPolicy.documentUrl && (
                <a
                  href={selectedPolicy.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-blue-500 hover:underline text-xs font-bold"
                >
                  View Policy Document <ExternalLink size={14} />
                </a>
              )}

              <div className="pt-4 border-t border-[#E4E6DF]">
                {selectedPolicy.acknowledged ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold">
                    <CheckCircle2 size={16} /> Acknowledged on {new Date(selectedPolicy.acknowledgedAt).toLocaleDateString()}
                  </div>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(selectedPolicy.id)}
                    className="w-full py-2.5 bg-[#24333E] text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    I Acknowledge & Sign
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#90998C] space-y-2">
              <FileText size={40} className="mx-auto text-[#E4E6DF]" />
              <p className="text-xs font-medium">Select a policy to view details and submit signature.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePolicies;
