import React, { useState, useEffect } from "react";
import { Sliders, ToggleLeft, Bell, Scale } from "lucide-react";
import { Loading } from "../../components/ui/Loading";
import settingsService from "../../services/settingsService";

import GeneralSettings from "./GeneralSettings";
import FeatureToggle from "./FeatureToggle";
import NotificationSettings from "./NotificationSettings";
import ScoreWeightSettings from "./ScoreWeightSettings";

type TabName = "general" | "features" | "notifications" | "weights";

export const SettingsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>("general");
  const [settingsObject, setSettingsObject] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await settingsService.getSettings();
      setSettingsObject(data.settingsObject || {});
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load global configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSuccess = () => {
    loadSettings();
  };

  const tabs = [
    { name: "general", label: "General Settings", icon: <Sliders size={16} /> },
    { name: "features", label: "Feature Toggles", icon: <ToggleLeft size={16} /> },
    { name: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { name: "weights", label: "ESG Weights", icon: <Scale size={16} /> }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#24333E]">System Configurations</h1>
        <p className="text-[#90998C] text-sm mt-1">Configure site details, manage registration, setup notification digests and ESG engine parameters</p>
      </div>

      {isLoading ? (
        <Loading text="Loading configurations..." />
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Menu */}
          <div className="lg:col-span-1 flex flex-col gap-1 bg-[#F3F5EF] p-2 border border-[#E4E6DF] rounded-xl h-fit">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name as TabName)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all text-left ${
                  activeTab === tab.name
                    ? "bg-brand-500/10 text-[#1F4032] border border-brand-500/20"
                    : "text-[#90998C] hover:text-[#24333E] hover:bg-white/60 border border-transparent"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <div className="lg:col-span-3 glass-panel rounded-xl p-6">
            <h3 className="text-base font-bold text-[#24333E] mb-6 border-b border-[#E4E6DF] pb-3 uppercase tracking-wider text-xs text-[#90998C] flex items-center gap-2">
              {tabs.find((t) => t.name === activeTab)?.icon}
              {tabs.find((t) => t.name === activeTab)?.label}
            </h3>

            {activeTab === "general" && (
              <GeneralSettings settingsObject={settingsObject} onSaveSuccess={handleSaveSuccess} />
            )}
            {activeTab === "features" && (
              <FeatureToggle settingsObject={settingsObject} onSaveSuccess={handleSaveSuccess} />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings settingsObject={settingsObject} onSaveSuccess={handleSaveSuccess} />
            )}
            {activeTab === "weights" && (
              <ScoreWeightSettings settingsObject={settingsObject} onSaveSuccess={handleSaveSuccess} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsDashboard;
