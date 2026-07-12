import React, { useState, useEffect } from "react";
import governanceService from "../../services/governanceService";
import departmentService from "../../services/departmentService";
import { FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";

export const ReportsBuilder: React.FC = () => {
  const [reportType, setReportType] = useState("ESG_SCORECARD");
  const [selectedDept, setSelectedDept] = useState("");
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getDepartments();
        setDepartmentsList(res.departments || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      // Simulate/Retrieve data based on report type
      const scoresRes = await governanceService.getDashboardScores();
      const kpiRes = await governanceService.getDashboardKPIs();

      setTimeout(() => {
        setReportData({
          generatedAt: new Date().toLocaleString(),
          department: selectedDept ? departmentsList.find((d) => d.id === selectedDept)?.name : "All Organization",
          type: reportType,
          scores: scoresRes.organizationScores,
          kpis: kpiRes.kpis,
          departmentScores: scoresRes.departmentScores
        });
        setGenerating(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative text-left">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">Reports Builder</h1>
          <p className="text-[#90998C] text-sm mt-1">Compile ESG performance, carbon balances, and policy sign-offs into auditing reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel (Left) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] space-y-6 h-fit">
          <h3 className="text-base font-bold text-[#24333E] border-b border-[#E4E6DF] pb-3">Report Configuration</h3>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2.5 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
              >
                <option value="ESG_SCORECARD">ESG Summary Scorecard</option>
                <option value="CARBON_AUDIT">Carbon & Scope Emissions Audit</option>
                <option value="GOVERNANCE_SIGN">Governance Policy Acknowledgement Logs</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Target Scope</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2.5 text-sm text-[#24333E] outline-none focus:border-[#1F4032]"
              >
                <option value="">All Organization</option>
                {departmentsList.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  defaultValue="2026-01-01"
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-xs text-[#24333E] outline-none focus:border-[#1F4032]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  defaultValue="2026-12-31"
                  className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-xs text-[#24333E] outline-none focus:border-[#1F4032]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 bg-[#1F4032] text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {generating ? "Compiling..." : "Compile Report"}
            </button>
          </form>
        </div>

        {/* Preview Panel (Right) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E6DF] p-6 space-y-6 flex flex-col justify-between min-h-[450px]">
          {reportData ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Report Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-[#E4E6DF] pb-4">
                  <div>
                    <span className="text-[10px] text-[#90998C] font-bold uppercase tracking-wider">Report Output</span>
                    <h3 className="text-lg font-bold text-[#24333E] mt-0.5">
                      {reportType === "ESG_SCORECARD"
                        ? "EcoSphere ESG Scorecard"
                        : reportType === "CARBON_AUDIT"
                        ? "Carbon Ledger & Scope Audit"
                        : "Compliance Acknowledgement Report"}
                    </h3>
                    <p className="text-xs text-[#90998C] mt-1">Scope: {reportData.department} | Generated: {reportData.generatedAt}</p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E4E6DF] text-xs font-bold text-[#24333E] rounded-lg hover:bg-[#F3F5EF]"
                  >
                    <Download size={14} /> Print / Export PDF
                  </button>
                </div>

                {/* Scorecard Results Preview */}
                {reportType === "ESG_SCORECARD" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border border-[#E4E6DF] p-4 rounded-xl">
                        <span className="text-[10px] text-[#90998C] font-bold uppercase">Environmental Score</span>
                        <h4 className="text-xl font-bold text-[#24333E] mt-1">{reportData.scores?.environmentalScore || 0}%</h4>
                      </div>
                      <div className="border border-[#E4E6DF] p-4 rounded-xl">
                        <span className="text-[10px] text-[#90998C] font-bold uppercase">Social Activity Score</span>
                        <h4 className="text-xl font-bold text-[#24333E] mt-1">{reportData.scores?.socialScore || 0}%</h4>
                      </div>
                      <div className="border border-[#E4E6DF] p-4 rounded-xl">
                        <span className="text-[10px] text-[#90998C] font-bold uppercase">Governance Policy Score</span>
                        <h4 className="text-xl font-bold text-[#24333E] mt-1">{reportData.scores?.governanceScore || 0}%</h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#24333E] uppercase tracking-wider">Department Breakdowns</h4>
                      <div className="border border-[#E4E6DF] rounded-xl overflow-hidden text-xs">
                        <div className="bg-[#F3F5EF] p-2.5 grid grid-cols-4 font-bold text-[#90998C] uppercase">
                          <span>Department</span>
                          <span>Environmental</span>
                          <span>Social</span>
                          <span>Governance</span>
                        </div>
                        <div className="divide-y divide-[#E4E6DF]">
                          {reportData.departmentScores?.map((ds: any) => (
                            <div key={ds.departmentId} className="p-2.5 grid grid-cols-4 text-[#24333E]">
                              <span className="font-semibold">{ds.departmentName}</span>
                              <span>{ds.environmentalScore}%</span>
                              <span>{ds.socialScore}%</span>
                              <span>{ds.governanceScore}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {reportType === "CARBON_AUDIT" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-[#E4E6DF] p-4 rounded-xl">
                        <span className="text-[10px] text-[#90998C] font-bold uppercase">Total Carbon footprint</span>
                        <h4 className="text-xl font-bold text-[#24333E] mt-1">{reportData.kpis?.totalCarbonEmissions || 0} Tons CO2</h4>
                      </div>
                      <div className="border border-[#E4E6DF] p-4 rounded-xl">
                        <span className="text-[10px] text-[#90998C] font-bold uppercase">Reduction Targets Progress</span>
                        <h4 className="text-xl font-bold text-[#24333E] mt-1">{reportData.kpis?.goalsCompletionRate || 0}% met</h4>
                      </div>
                    </div>
                    <p className="text-xs text-[#90998C] leading-relaxed">
                      This Carbon audit aggregates environmental transactions under Scope 1, Scope 2, and Scope 3 greenhouse gas categories, matching ESG regulatory mandates.
                    </p>
                  </div>
                )}

                {reportType === "GOVERNANCE_SIGN" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-[#E4E6DF] p-4 rounded-xl">
                        <span className="text-[10px] text-[#90998C] font-bold uppercase">Policy Acknowledgement rate</span>
                        <h4 className="text-xl font-bold text-[#24333E] mt-1">{reportData.kpis?.policyAcknowledgeRate || 0}%</h4>
                      </div>
                      <div className="border border-[#E4E6DF] p-4 rounded-xl">
                        <span className="text-[10px] text-[#90998C] font-bold uppercase">Resolved Compliance Cases</span>
                        <h4 className="text-xl font-bold text-[#24333E] mt-1">{reportData.kpis?.complianceHealthRate || 0}% resolved</h4>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[#E4E6DF] pt-4 flex justify-between items-center text-[10px] text-[#90998C]">
                <span>Generated by EcoSphere Reports Builder Engine</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle2 size={12} /> Compliance Validated
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#90998C] space-y-3">
              <FileSpreadsheet size={48} className="text-[#E4E6DF]" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#24333E]">No Report Generated</h4>
                <p className="text-xs max-w-xs mx-auto leading-relaxed">Configure the parameters on the left and click Compile to load the compliance scorecard.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsBuilder;
