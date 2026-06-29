import React from "react";
import {
  MdWaterDrop,
  MdWarning,
  MdNotifications,
  MdCampaign,
  MdDoneAll,
} from "react-icons/md";
import { useNotif } from "../context/NotificationContext";

const iconMap = {
  water_start: { icon: <MdWaterDrop />, cls: "icon-teal" },
  water_stop: { icon: <MdWaterDrop />, cls: "icon-amber" },
  emergency: { icon: <MdWarning />, cls: "icon-red" },
  announcement: { icon: <MdCampaign />, cls: "icon-blue" },
  chat_mention: { icon: <MdNotifications />, cls: "icon-blue" },
};

export default function Alerts() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotif();

  const unread = notifications.filter((n) => !n.is_read);
  const read = notifications.filter((n) => n.is_read);

  const NotifCard = ({ n }) => {
    const { icon, cls } = iconMap[n.type] || {
      icon: <MdNotifications />,
      cls: "icon-blue",
    };
    return (
      <div
        className={`notif-item${!n.is_read ? " unread" : ""}`}
        style={{ cursor: !n.is_read ? "pointer" : "default" }}
        onClick={() => !n.is_read && markRead(n.id)}
      >
        <div className={`notif-icon-wrap ${cls}`}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div className="notif-title">{n.title}</div>
          {n.message && (
            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                margin: "2px 0",
              }}
            >
              {n.message}
            </div>
          )}
          <div className="notif-meta">
            {new Date(n.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {n.sender_name ? ` · ${n.sender_name}` : ""}
            {n.sender_house ? `, House ${n.sender_house}` : ""}
          </div>
        </div>
        {!n.is_read && (
          <div
            style={{
              width: 8,
              height: 8,
              background: "var(--teal-400)",
              borderRadius: "50%",
              flexShrink: 0,
              marginTop: 4,
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className="page-title">Notifications</div>
          <div className="page-subtitle">
            Stay updated with neighborhood alerts
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-outline"
            onClick={markAllRead}
            style={{ gap: 6 }}
          >
            <MdDoneAll /> Mark all read
          </button>
        )}
      </div>

      {unread.length > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">Unread · {unread.length}</div>
          </div>
          {unread.map((n) => (
            <NotifCard key={n.id} n={n} />
          ))}
        </>
      )}

      {read.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: "1.25rem" }}>
            <div className="section-title">Earlier</div>
          </div>
          {read.map((n) => (
            <NotifCard key={n.id} n={n} />
          ))}
        </>
      )}

      {notifications.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
          }}
        >
          <MdNotifications
            style={{ fontSize: 40, marginBottom: 8, opacity: 0.4 }}
          />
          <div style={{ fontSize: 14 }}>No notifications yet</div>
        </div>
      )}
    </div>
  );
}
