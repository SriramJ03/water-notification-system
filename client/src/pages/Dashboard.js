import React, { useState, useEffect } from "react";
import {
  MdWaterDrop,
  MdWarning,
  MdHome,
  MdPeople,
  MdNotifications,
  MdAccessTime,
} from "react-icons/md";
import { toast } from "react-toastify";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotif } from "../context/NotificationContext";

const avatarColors = [
  ["#E1F5EE", "#0F6E56"],
  ["#E6F1FB", "#185FA5"],
  ["#FAEEDA", "#BA7517"],
  ["#FCE8F8", "#8B21A5"],
  ["#FCEBEB", "#A32D2D"],
];
const colorFor = (id) => avatarColors[id % avatarColors.length];

function WaterButton({ status, onToggle, loading }) {
  const isOn = status?.status === "available";
  return (
    <div>
      <div style={{ textAlign: "center", padding: "1.25rem 0 1rem" }}>
        <div
          style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}
        >
          Current supply
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: isOn ? "var(--teal-600)" : "var(--red-400)",
            marginBottom: 6,
          }}
        >
          {isOn ? "💧 Water available" : "🚫 Supply stopped"}
        </div>
        {status?.updated_by_name && (
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Since{" "}
            {status?.updated_at
              ? new Date(status.updated_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}{" "}
            · {status.updated_by_name} (House {status.updated_by_house})
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => onToggle("available")}
          disabled={loading || isOn}
          style={{ opacity: isOn ? 0.5 : 1, gap: 10, fontSize: 15 }}
        >
          <MdWaterDrop style={{ fontSize: 22 }} /> Water has started
        </button>
        <button
          className="btn btn-lg"
          onClick={() => onToggle("unavailable")}
          disabled={loading || !isOn}
          style={{
            background: !isOn ? "#ccc" : "#6b7280",
            color: "#fff",
            opacity: !isOn ? 0.5 : 1,
            gap: 10,
            fontSize: 15,
          }}
        >
          <MdWaterDrop style={{ fontSize: 22 }} /> Water supply stopped
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { waterStatus, setWaterStatus, notifications } = useNotif();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emergLoading, setEmergLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get("/water/stats");
      setStats(data.stats);
    } catch {}
  };

  const handleWaterToggle = async (status) => {
    setLoading(true);
    try {
      const { data } = await API.post("/water/status", { status });
      setWaterStatus(data.status);
      toast.success(
        status === "available"
          ? "💧 Water alert sent to all neighbors!"
          : "🚫 Supply stopped alert sent!",
      );
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergency = async () => {
    if (!window.confirm("Send emergency alert to all neighbors?")) return;
    setEmergLoading(true);
    try {
      await API.post("/emergency");
      toast.error("🚨 Emergency alert sent to all neighbors!", {
        autoClose: false,
      });
    } catch {
      toast.error("Failed to send emergency alert.");
    } finally {
      setEmergLoading(false);
    }
  };

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 17
        ? "Good afternoon"
        : "Good evening";

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxMin = Math.max(
    ...(stats?.weekly_history?.map((h) => h.duration_minutes || 0) || [1]),
    1,
  );

  const recentNotifs = notifications.slice(0, 5);
  const notifIcon = (type) => {
    if (type === "water_start")
      return { icon: <MdWaterDrop />, cls: "icon-teal" };
    if (type === "water_stop")
      return { icon: <MdWaterDrop />, cls: "icon-amber" };
    if (type === "emergency") return { icon: <MdWarning />, cls: "icon-red" };
    return { icon: <MdNotifications />, cls: "icon-blue" };
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </div>
        <div className="page-subtitle">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · House {user?.house_number}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: "1.25rem" }}>
        <div className="card card-sm">
          <div className="stat-label">Water status</div>
          <div style={{ marginTop: 8 }}>
            <span
              className={`status-pill ${waterStatus?.status === "available" ? "pill-on" : "pill-off"}`}
            >
              <span
                className={`status-dot ${waterStatus?.status === "available" ? "dot-on" : "dot-off"}`}
              />
              {waterStatus?.status === "available"
                ? "Available"
                : "Not available"}
            </span>
          </div>
          <div className="stat-sub" style={{ marginTop: 6 }}>
            {waterStatus?.updated_by_name
              ? `By ${waterStatus.updated_by_name}`
              : "No update yet"}
          </div>
        </div>

        <div className="card card-sm">
          <div className="stat-label">Registered houses</div>
          <div className="stat-value">{stats?.total_houses ?? "—"}</div>
          <div className="stat-sub">In neighborhood</div>
        </div>

        <div className="card card-sm">
          <div className="stat-label">Active users</div>
          <div className="stat-value">{stats?.total_users ?? "—"}</div>
          <div className="stat-sub">Online neighbors</div>
        </div>

        <div className="card card-sm">
          <div className="stat-label">Alerts today</div>
          <div className="stat-value">{stats?.today_alerts ?? "—"}</div>
          <div className="stat-sub">Notifications sent</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left: Water controls */}
        <div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <WaterButton
              status={waterStatus}
              onToggle={handleWaterToggle}
              loading={loading}
            />
            <div className="divider" />
            <button
              className="btn btn-danger btn-lg"
              onClick={handleEmergency}
              disabled={emergLoading}
              style={{ gap: 10, fontSize: 15 }}
            >
              <MdWarning style={{ fontSize: 22 }} />
              {emergLoading ? "Sending…" : "🚨 Emergency alert"}
            </button>
          </div>

          {/* Countdown card */}
          <div className="card card-sm" style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "var(--text-muted)",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <MdAccessTime /> Last water status change
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--teal-600)",
              }}
            >
              {waterStatus?.updated_at
                ? new Date(waterStatus.updated_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No update"}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}
            >
              {waterStatus?.updated_at
                ? new Date(waterStatus.updated_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : ""}
            </div>
          </div>
        </div>

        {/* Right: Notifications + Chart */}
        <div>
          <div className="section-header">
            <div className="section-title">Recent notifications</div>
          </div>

          {recentNotifs.length === 0 ? (
            <div
              className="card card-sm"
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              No notifications yet
            </div>
          ) : (
            recentNotifs.map((n) => {
              const { icon, cls } = notifIcon(n.type);
              return (
                <div
                  key={n.id}
                  className={`notif-item${!n.is_read ? " unread" : ""}`}
                >
                  <div className={`notif-icon-wrap ${cls}`}>{icon}</div>
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-meta">
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {n.sender_name ? ` · ${n.sender_name}` : ""}
                      {n.sender_house ? `, House ${n.sender_house}` : ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Bar chart */}
          {stats?.weekly_history?.length > 0 && (
            <>
              <div className="section-header" style={{ marginTop: "1.25rem" }}>
                <div className="section-title">Weekly availability</div>
              </div>
              <div className="card card-sm">
                <div className="bar-chart">
                  {stats.weekly_history.map((h, i) => {
                    const pct = Math.round(
                      ((h.duration_minutes || 0) / maxMin) * 100,
                    );
                    const hrs = Math.floor((h.duration_minutes || 0) / 60);
                    const mins = (h.duration_minutes || 0) % 60;
                    const label = h.duration_minutes ? `${hrs}h ${mins}m` : "—";
                    return (
                      <div key={i} className="bar-row">
                        <div className="bar-day">
                          {weekDays[new Date(h.date).getDay()] ||
                            h.day?.slice(0, 1)}
                        </div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="bar-val">{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
