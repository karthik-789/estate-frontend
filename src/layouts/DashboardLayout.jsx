import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const navigation = {
  USER: [["Overview", "/user/dashboard"], ["My profile", "/user/profile"], ["Saved properties", "/user/saved-properties"], ["My enquiries", "/user/enquiries"], ["My bookings", "/user/bookings"], ["Payments", "/user/payments"], ["Notifications", "/user/notifications"], ["Settings", "/user/settings"]],
  AGENT: [["Overview", "/agent/dashboard"], ["My profile", "/agent/profile"], ["My properties", "/agent/properties"], ["Add property", "/agent/properties/add"], ["Interested buyers", "/agent/interested-buyers"], ["Enquiries", "/agent/enquiries"], ["Notifications", "/agent/notifications"], ["Bookings", "/agent/bookings"], ["Analytics", "/agent/analytics"]],
  ADMIN: [["Overview", "/admin/dashboard"], ["Users", "/admin/users"], ["Agents", "/admin/agents"], ["Property verification", "/admin/properties/pending"], ["Enquiries", "/admin/enquiries"], ["Bookings", "/admin/bookings"], ["Payments", "/admin/payments"], ["Reports", "/admin/reports"]]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const links = navigation[user.role] || [];

  useEffect(() => {
    if (!user || !["USER", "AGENT"].includes(user.role)) return undefined;
    let active = true;
    const refreshUnread = () => api.get("/notifications", { params: { size: 2000 } })
      .then(({ data }) => { if (active) setUnreadCount((data.content || []).filter((item) => !item.read).length); })
      .catch(() => {});
    refreshUnread();
    const interval = window.setInterval(refreshUnread, 15000);
    window.addEventListener("focus", refreshUnread);
    window.addEventListener("notifications-updated", refreshUnread);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshUnread);
      window.removeEventListener("notifications-updated", refreshUnread);
    };
  }, [user]);

  return <div className="dashboard-shell">
    <aside className="sidebar"><Link className="brand" to="/"><span>H</span>Havenly</Link>
      <p className="role-label">{user.role} PORTAL</p>
      <nav>{links.map(([label, to]) => <NavLink key={to} to={to}><span>{label}</span>{label === "Notifications" && unreadCount > 0 && <span className="notification-count" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 99 ? "99+" : unreadCount}</span>}</NavLink>)}</nav>
      <button className="text-button sidebar-logout" onClick={logout}>Log out</button>
    </aside>
    <section className="dashboard-main"><header className="dashboard-header"><div><p className="eyebrow">{user.role} WORKSPACE</p><h1>Hello, {user.fullName.split(" ")[0]}</h1></div><Link className="button button-quiet" to="/">Browse properties</Link></header><Outlet /></section>
  </div>;
}

