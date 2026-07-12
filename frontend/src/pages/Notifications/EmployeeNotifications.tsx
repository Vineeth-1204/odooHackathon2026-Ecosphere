import React, { useEffect, useState } from "react";
import governanceService from "../../services/governanceService";
import { Bell, CheckSquare, ShieldCheck, Calendar, Eye, EyeOff } from "lucide-react";

export const EmployeeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await governanceService.getNotifications();
      // Handle the notifications array
      setNotifications(res.notifications || res || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await governanceService.markNotificationRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await governanceService.markAllNotificationsRead();
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "POLICY_REMINDER":
        return <ShieldCheck className="text-blue-500" size={18} />;
      case "COMPLIANCE_OVERDUE":
        return <CheckSquare className="text-red-500" size={18} />;
      default:
        return <Bell className="text-[#E3A73E]" size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1F4032]" />
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#24333E]">Notifications Feed</h1>
          <p className="text-[#90998C] text-sm mt-1">Stay updated with policy updates, goal progress, and challenge reviews.</p>
        </div>

        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#E4E6DF] text-xs font-bold text-[#24333E] rounded-xl bg-white hover:bg-[#F3F5EF] transition-all"
          >
            <EyeOff size={14} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E4E6DF] overflow-hidden text-left">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-[#90998C] space-y-2">
            <Bell size={40} className="mx-auto text-[#E4E6DF]" />
            <p className="text-xs font-medium">You do not have any notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E6DF]">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  notif.isRead ? "bg-white" : "bg-[#F3F5EF]/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${notif.isRead ? "bg-[#F3F5EF]" : "bg-white border border-[#E4E6DF]"}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${notif.isRead ? "font-semibold text-[#90998C]" : "font-bold text-[#24333E]"}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && <span className="w-1.5 h-1.5 bg-[#C1503A] rounded-full" />}
                    </div>
                    <p className={`text-xs ${notif.isRead ? "text-[#90998C]" : "text-[#24333E]"} leading-relaxed`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#90998C] pt-1">
                      <Calendar size={10} />
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    title="Mark as Read"
                    className="p-1.5 hover:bg-[#F3F5EF] text-[#90998C] hover:text-[#24333E] rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications;
