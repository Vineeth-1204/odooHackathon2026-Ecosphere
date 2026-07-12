import React, { useEffect, useState } from "react";
import socialService from "../../services/socialService";
import categoryService from "../../services/categoryService";
import { Trophy, Calendar, CheckCircle, Clock, XCircle, Upload } from "lucide-react";

export const EmployeeChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [myParticipations, setMyParticipations] = useState<Record<number, any>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProgressModal, setShowProgressModal] = useState<number | null>(null);
  const [progressVal, setProgressVal] = useState(0);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Challenge states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newXpValue, setNewXpValue] = useState("50");
  const [newDifficulty, setNewDifficulty] = useState("MEDIUM");
  const [newEvidenceRequired, setNewEvidenceRequired] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");

  const fetchChallengesData = async () => {
    try {
      const [challengesRes, myRes, catRes] = await Promise.all([
        socialService.getChallenges({ categoryId: selectedCategory, difficulty: selectedDifficulty, search: searchQuery }),
        socialService.getMyChallengeParticipations(),
        categoryService.getCategories()
      ]);

      setChallenges(challengesRes || []);
      setCategories(catRes.categories || []);

      const pMap: Record<number, any> = {};
      if (Array.isArray(myRes)) {
        myRes.forEach((p) => {
          pMap[p.challengeId] = p;
        });
      }
      setMyParticipations(pMap);
    } catch (err) {
      console.error("Error loading challenge data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengesData();
  }, [selectedCategory, selectedDifficulty]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChallengesData();
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCategoryId) {
      alert("Title and Category are required");
      return;
    }
    try {
      await socialService.createChallenge({
        title: newTitle,
        description: newDescription,
        categoryId: newCategoryId,
        xpValue: Number(newXpValue),
        difficulty: newDifficulty,
        evidenceRequired: newEvidenceRequired,
        deadline: newDeadline ? newDeadline : undefined
      });
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewCategoryId("");
      setNewXpValue("50");
      setNewDifficulty("MEDIUM");
      setNewEvidenceRequired(false);
      setNewDeadline("");
      await fetchChallengesData();
    } catch (err: any) {
      alert(err.message || "Failed to create challenge");
    }
  };

  const handleJoin = async (id: number) => {
    try {
      await socialService.joinChallenge(id);
      await fetchChallengesData();
    } catch (err: any) {
      alert(err.message || "Failed to join challenge");
    }
  };

  const openLogProgress = (id: number, currentProgress: number) => {
    setShowProgressModal(id);
    setProgressVal(currentProgress);
    setProofFile(null);
  };

  const handleSaveProgress = async () => {
    if (showProgressModal === null) return;
    try {
      // Fetch the participation ID
      const part = myParticipations[showProgressModal];
      if (!part) return;

      await socialService.updateChallengeProgress(part.id, progressVal, proofFile || undefined);
      setShowProgressModal(null);
      await fetchChallengesData();
    } catch (err: any) {
      alert(err.message || "Failed to save progress");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E3A73E]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">ESG Challenges</h1>
          <p className="text-[#90998C] text-sm mt-1">Accept corporate challenges, update your progress daily, and unlock XP and Badges.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-[#E3A73E] text-white font-bold text-xs px-4 py-2.5 rounded-lg hover:brightness-110 shadow-sm self-start sm:self-center"
        >
          Add Challenge
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E4E6DF] flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-80">
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#E3A73E]"
          />
          <button type="submit" className="px-4 py-2 bg-[#E3A73E] text-white rounded-lg text-sm font-semibold hover:brightness-110">
            Search
          </button>
        </form>

        <div className="flex gap-4">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg px-4 py-2 text-sm text-[#24333E] outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((ch) => {
          const part = myParticipations[ch.id];
          const isJoined = !!part;
          const status = part?.status;
          const currentProgress = part?.progress || 0;

          return (
            <div key={ch.id} className="bg-white rounded-2xl border border-[#E4E6DF] overflow-hidden flex flex-col justify-between">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-50 text-[#E3A73E] text-[10px] font-bold uppercase rounded-md tracking-wider">
                    {ch.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-[#E3A73E] font-bold text-sm">
                    <Trophy size={16} />
                    <span>{ch.xpValue} XP</span>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-base font-bold text-[#24333E] line-clamp-1">{ch.title}</h3>
                  <p className="text-xs text-[#90998C] line-clamp-2">{ch.description}</p>
                </div>

                <div className="pt-2 border-t border-[#E4E6DF] flex items-center justify-between text-xs text-[#90998C]">
                  <span className="font-semibold text-[#24333E]">{ch.category?.name}</span>
                  {ch.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{new Date(ch.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {isJoined && (
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-xs font-semibold text-[#24333E]">
                      <span>Progress</span>
                      <span>{currentProgress}%</span>
                    </div>
                    <div className="w-full bg-[#F3F5EF] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#E3A73E] h-full" style={{ width: `${currentProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#F3F5EF]/50 p-4 border-t border-[#E4E6DF]">
                {!isJoined ? (
                  <button
                    onClick={() => handleJoin(ch.id)}
                    className="w-full py-2 bg-[#E3A73E] text-white text-sm font-semibold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    Accept Challenge
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#90998C] font-medium">Status:</span>
                      {status === "APPROVED" && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle size={14} /> Complete
                        </span>
                      )}
                      {status === "REJECTED" && (
                        <span className="flex items-center gap-1 text-red-600 font-bold" title={part.rejectionNote}>
                          <XCircle size={14} /> Rejected
                        </span>
                      )}
                      {status === "PENDING" && (
                        <span className="flex items-center gap-1 text-[#E3A73E] font-bold">
                          <Clock size={14} /> Under Review
                        </span>
                      )}
                      {status === "JOINED" && (
                        <span className="flex items-center gap-1 text-blue-500 font-bold">
                          <Clock size={14} /> In Progress
                        </span>
                      )}
                    </div>

                    {status !== "APPROVED" && (
                      <button
                        onClick={() => openLogProgress(ch.id, currentProgress)}
                        className="w-full py-1.5 border border-[#E3A73E] text-[#E3A73E] text-xs font-bold rounded-lg hover:bg-amber-50/50 transition-colors"
                      >
                        Log Progress
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Logging Modal */}
      {showProgressModal !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E6DF] w-full max-w-md p-6 space-y-6">
            <h3 className="text-lg font-bold text-[#24333E]">Log Challenge Progress</h3>

            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Progress Percentage</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="flex-1 accent-[#E3A73E]"
                />
                <span className="text-sm font-bold text-[#24333E] w-10 text-right">{progressVal}%</span>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">Proof of Work (Optional)</label>
              <label className="w-full flex flex-col items-center justify-center gap-1 py-4 border border-dashed border-[#E4E6DF] rounded-lg cursor-pointer hover:bg-[#F3F5EF]/50 transition-colors">
                <Upload size={20} className="text-[#90998C]" />
                <span className="text-xs text-[#24333E] font-medium">
                  {proofFile ? proofFile.name : "Select proof file"}
                </span>
                <input type="file" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowProgressModal(null)}
                className="px-4 py-2 border border-[#E4E6DF] text-[#24333E] text-xs font-bold rounded-lg hover:bg-[#F3F5EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                className="px-4 py-2 bg-[#E3A73E] text-white text-xs font-bold rounded-lg hover:brightness-110"
              >
                Submit Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#24333E]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E6DF] max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E4E6DF] pb-3">
              <h2 className="text-lg font-bold text-[#24333E]">Create ESG Challenge</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#90998C] hover:text-[#24333E] text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="glass-input text-sm px-4 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                  placeholder="e.g. Carpool to work"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="glass-input text-sm px-4 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] h-20 resize-none bg-[#F3F5EF]/30"
                  placeholder="Describe the green challenge details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Category *</label>
                  <select
                    required
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="glass-input text-sm px-3 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(newDifficultyVal) => setNewDifficulty(newDifficultyVal.target.value)}
                    className="glass-input text-sm px-3 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">XP Points</label>
                  <input
                    type="number"
                    value={newXpValue}
                    onChange={(e) => setNewXpValue(e.target.value)}
                    className="glass-input text-sm px-4 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                    placeholder="50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="glass-input text-sm px-3 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="evidenceRequired"
                  checked={newEvidenceRequired}
                  onChange={(e) => setNewEvidenceRequired(e.target.checked)}
                  className="accent-[#E3A73E] h-4 w-4 rounded border-[#E4E6DF]"
                />
                <label htmlFor="evidenceRequired" className="text-xs font-bold text-[#90998C] cursor-pointer">
                  Require upload evidence for completion
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#E4E6DF]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold border border-[#E4E6DF] rounded-lg text-[#90998C] hover:text-[#24333E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-[#E3A73E] text-white rounded-lg hover:brightness-110"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeChallenges;
