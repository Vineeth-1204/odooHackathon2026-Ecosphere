import React, { useEffect, useState } from "react";
import socialService from "../../services/socialService";
import categoryService from "../../services/categoryService";
import { Users, Calendar, Award, CheckCircle, Clock, XCircle, Upload, Search } from "lucide-react";

export const CSREmployeeActivities: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [myParticipations, setMyParticipations] = useState<Record<number, any>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Activity states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newMaxParticipants, setNewMaxParticipants] = useState("");
  const [newPointsReward, setNewPointsReward] = useState("25");

  const fetchActivitiesData = async () => {
    try {
      const [activitiesRes, myRes, catRes] = await Promise.all([
        socialService.getCSRActivities({ categoryId: selectedCategory, search: searchQuery }),
        socialService.getMyCSRParticipations(),
        categoryService.getCategories()
      ]);

      setActivities(activitiesRes || []);
      setCategories(catRes.categories || []);

      // Map participations by csrActivityId
      const pMap: Record<number, any> = {};
      if (Array.isArray(myRes)) {
        myRes.forEach((p) => {
          pMap[p.csrActivityId] = p;
        });
      }
      setMyParticipations(pMap);
    } catch (err) {
      console.error("Error loading CSR data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesData();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivitiesData();
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCategoryId || !newDate) {
      alert("Title, Category, and Date are required");
      return;
    }
    try {
      await socialService.createCSRActivity({
        title: newTitle,
        description: newDescription,
        categoryId: newCategoryId,
        date: newDate,
        maxParticipants: newMaxParticipants ? Number(newMaxParticipants) : undefined,
        pointsReward: Number(newPointsReward)
      });
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewCategoryId("");
      setNewDate("");
      setNewMaxParticipants("");
      setNewPointsReward("25");
      await fetchActivitiesData();
    } catch (err: any) {
      alert(err.message || "Failed to create activity");
    }
  };

  const handleJoin = async (id: number) => {
    try {
      await socialService.joinCSRActivity(id);
      await fetchActivitiesData();
    } catch (err: any) {
      alert(err.message || "Failed to join activity");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await socialService.uploadCSRProof(id, formData);
      await fetchActivitiesData();
    } catch (err: any) {
      alert(err.message || "Failed to upload proof");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C1503A]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">CSR Activities</h1>
          <p className="text-[#90998C] text-sm mt-1">Participate in corporate green initiatives, log your work, and earn rewards points.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-[#C1503A] text-white font-bold text-xs px-4 py-2.5 rounded-lg hover:brightness-110 shadow-sm self-start sm:self-center"
        >
          Add CSR Activity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E4E6DF] flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F3F5EF] border border-[#E4E6DF] rounded-lg pl-9 pr-4 py-2 text-sm text-[#24333E] outline-none focus:border-[#C1503A]"
            />
            <Search className="absolute left-3 top-2.5 text-[#90998C]" size={16} />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#C1503A] text-white rounded-lg text-sm font-semibold hover:brightness-110">
            Search
          </button>
        </form>

        <div className="flex gap-2">
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

      {/* CSR Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((act) => {
          const part = myParticipations[act.id];
          const isJoined = !!part;
          const status = part?.status;

          return (
            <div key={act.id} className="bg-white rounded-2xl border border-[#E4E6DF] overflow-hidden flex flex-col justify-between">
              {/* Header card info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-red-50 text-[#C1503A] text-[10px] font-bold uppercase rounded-md tracking-wider">
                    {act.category?.name || "CSR"}
                  </span>
                  <div className="flex items-center gap-1 text-[#E3A73E] font-bold text-sm">
                    <Award size={16} />
                    <span>{act.pointsReward} pts</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#24333E] line-clamp-1">{act.title}</h3>
                  <p className="text-xs text-[#90998C] line-clamp-2">{act.description}</p>
                </div>

                <div className="pt-2 flex flex-col gap-2 border-t border-[#E4E6DF] text-xs text-[#90998C]">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#C1503A]" />
                    <span>{new Date(act.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-blue-500" />
                    <span>
                      {act.maxParticipants ? `${act._count?.participations || 0} / ${act.maxParticipants} joined` : "Unlimited participants"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="bg-[#F3F5EF]/50 p-4 border-t border-[#E4E6DF]">
                {!isJoined ? (
                  <button
                    onClick={() => handleJoin(act.id)}
                    className="w-full py-2 bg-[#C1503A] text-white text-sm font-semibold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    Join Activity
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#90998C] font-medium">Your Status:</span>
                      {status === "APPROVED" && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle size={14} /> Approved
                        </span>
                      )}
                      {status === "REJECTED" && (
                        <span className="flex items-center gap-1 text-red-600 font-bold" title={part.rejectionNote}>
                          <XCircle size={14} /> Rejected
                        </span>
                      )}
                      {status === "PENDING" && (
                        <span className="flex items-center gap-1 text-[#E3A73E] font-bold">
                          <Clock size={14} /> Pending Review
                        </span>
                      )}
                      {status === "JOINED" && (
                        <span className="flex items-center gap-1 text-blue-500 font-bold">
                          <CheckCircle size={14} /> Registered
                        </span>
                      )}
                    </div>

                    {(status === "JOINED" || status === "REJECTED") && (
                      <div className="relative">
                        <label className="w-full flex items-center justify-center gap-2 py-2 border border-[#C1503A] border-dashed text-[#C1503A] text-xs font-bold rounded-lg cursor-pointer hover:bg-red-50/50 transition-colors">
                          <Upload size={14} />
                          {uploadingId === act.id ? "Uploading..." : "Upload Proof of Completion"}
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, act.id)}
                            className="hidden"
                            disabled={uploadingId === act.id}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#24333E]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E6DF] max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E4E6DF] pb-3">
              <h2 className="text-lg font-bold text-[#24333E]">Create CSR Activity</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#90998C] hover:text-[#24333E] text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateActivity} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="glass-input text-sm px-4 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                  placeholder="e.g. Local Park Tree Planting"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="glass-input text-sm px-4 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] h-20 resize-none bg-[#F3F5EF]/30"
                  placeholder="Describe the CSR volunteer activity..."
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
                  <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="glass-input text-sm px-3 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Max Participants</label>
                  <input
                    type="number"
                    value={newMaxParticipants}
                    onChange={(e) => setNewMaxParticipants(e.target.value)}
                    className="glass-input text-sm px-4 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                    placeholder="Unlimited"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#90998C] uppercase tracking-wide">Points Reward</label>
                  <input
                    type="number"
                    value={newPointsReward}
                    onChange={(e) => setNewPointsReward(e.target.value)}
                    className="glass-input text-sm px-4 py-2 border border-[#E4E6DF] rounded-lg text-[#24333E] bg-[#F3F5EF]/30"
                    placeholder="25"
                  />
                </div>
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
                  className="px-4 py-2 text-sm font-semibold bg-[#C1503A] text-white rounded-lg hover:brightness-110 animate-all"
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

export default CSREmployeeActivities;
