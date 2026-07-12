import React, { useEffect, useState } from "react";
import socialService from "../../services/socialService";
import { Gift, Calendar, CheckCircle2, Ticket } from "lucide-react";

export const EmployeeRewards: React.FC = () => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRewardsData = async () => {
    try {
      const [rewardsRes, redemptionsRes, rankRes] = await Promise.all([
        socialService.getRewards(),
        socialService.getMyRedemptions(),
        socialService.getMyRank()
      ]);
      setRewards(rewardsRes || []);
      setRedemptions(redemptionsRes || []);
      setUserPoints(rankRes.data?.rewardPoints || 0);
    } catch (err) {
      console.error("Error loading rewards data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const handleRedeem = async (id: number, cost: number) => {
    if (userPoints < cost) {
      alert("Insufficient reward points balance!");
      return;
    }
    if (!window.confirm("Are you sure you want to redeem this reward?")) {
      return;
    }

    try {
      await socialService.redeemReward(id);
      alert("Reward redeemed successfully! A voucher code has been emailed to you.");
      await fetchRewardsData();
    } catch (err: any) {
      alert(err.message || "Failed to redeem reward");
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
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">Rewards Store</h1>
          <p className="text-[#90998C] text-sm mt-1">Redeem your hard-earned points for carbon offsets, eco-friendly merch, or charity donations.</p>
        </div>

        <div className="bg-[#FCF8E3] border border-[#E3A73E]/20 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-white rounded-lg text-[#E3A73E]">
            <Gift size={20} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-[#90998C] uppercase tracking-wider">Your Balance</span>
            <h3 className="text-lg font-bold text-[#24333E] leading-none mt-0.5">{userPoints} pts</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rewards Store Catalog */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((rew) => {
            const canAfford = userPoints >= rew.pointsCost;
            const isOutOfStock = rew.stock <= 0;

            return (
              <div key={rew.id} className="bg-white rounded-2xl border border-[#E4E6DF] overflow-hidden flex flex-col justify-between text-left">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-[#FCF8E3] text-[#E3A73E] text-[10px] font-bold uppercase rounded-md tracking-wider">
                      Stock: {rew.stock}
                    </span>
                    <div className="flex items-center gap-1 text-[#E3A73E] font-bold text-sm">
                      <Ticket size={16} />
                      <span>{rew.pointsCost} pts</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#24333E]">{rew.name}</h3>
                    <p className="text-xs text-[#90998C] leading-relaxed">{rew.description}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#F3F5EF]/50 border-t border-[#E4E6DF]">
                  <button
                    disabled={!canAfford || isOutOfStock}
                    onClick={() => handleRedeem(rew.id, rew.pointsCost)}
                    className={`w-full py-2 text-xs font-bold rounded-lg transition-all ${
                      isOutOfStock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : canAfford
                        ? "bg-[#E3A73E] text-white hover:brightness-110 active:scale-[0.98]"
                        : "bg-gray-100 text-[#90998C] cursor-not-allowed"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : canAfford ? "Redeem Reward" : "Insufficient Points"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Redemption History */}
        <div className="bg-white p-6 rounded-2xl border border-[#E4E6DF] flex flex-col justify-between text-left h-fit">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#24333E] border-b border-[#E4E6DF] pb-3">Redemption History</h3>

            {redemptions.length === 0 ? (
              <div className="text-center py-8 text-[#90998C] text-xs">
                No rewards redeemed yet. Get active to earn points!
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {redemptions.map((red) => (
                  <div key={red.id} className="flex items-start gap-3 border-b border-[#E4E6DF] pb-3 last:border-b-0 last:pb-0">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#24333E]">{red.reward?.name}</h4>
                      <p className="text-[10px] text-[#90998C] mt-0.5 flex items-center gap-1.5">
                        <Calendar size={10} />
                        <span>{new Date(red.redeemedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#C1503A]">{red.pointsDeducted} pts spent</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRewards;
