import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const STUDENT_NAV = [
  { path: "/student/dashboard", icon: "🏠", label: "Dashboard" },
  { path: "/student/queries",   icon: "📋", label: "My Queries" },
  { path: "/student/profile",   icon: "👤", label: "Profile" },
];
const ADMIN_NAV = [
  { path: "/admin/dashboard",  icon: "🏠", label: "Dashboard" },
  { path: "/admin/queries",    icon: "📋", label: "Queries" },
  { path: "/admin/users",      icon: "👥", label: "Users" },
  { path: "/admin/analytics",  icon: "📊", label: "Analytics" },
];

export default function Layout({ children, onRaiseQuery }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = user?.role === "student" ? STUDENT_NAV : ADMIN_NAV;
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fb" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{
          width: 240, background: "#1a1a2e", color: "#fff",
          display: "flex", flexDirection: "column", padding: "28px 0",
          position: "sticky", top: 0, height: "100vh", flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: "0 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#4f8ef7", letterSpacing: 2, textTransform: "uppercase" }}>ISSASP</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, letterSpacing: 0.5 }}>
              {user?.role === "student" ? "Student Portal" : "Admin Portal"}
            </div>
          </div>

          {/* User info */}
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{user?.rollNumber || user?.role}</div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: "16px 12px" }}>
            {navItems.map(item => {
              const active = pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: active ? "rgba(79,142,247,0.18)" : "transparent",
                  color: active ? "#4f8ef7" : "rgba(255,255,255,0.6)",
                  fontSize: 14, fontWeight: active ? 700 : 500, marginBottom: 4, textAlign: "left",
                  transition: "all 0.15s",
                }}>
                  <span>{item.icon}</span>
                  {item.label}
                  {active && <div style={{ marginLeft: "auto", width: 4, height: 20, borderRadius: 2, background: "#4f8ef7" }} />}
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div style={{ padding: "0 12px" }}>
            {user?.role === "student" && onRaiseQuery && (
              <button onClick={onRaiseQuery} style={{
                width: "100%", padding: "12px", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)",
                border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", marginBottom: 8,
              }}>+ Raise a Query</button>
            )}
            <button onClick={() => { logout(); navigate("/login"); }} style={{
              width: "100%", padding: "11px", background: "rgba(255,255,255,0.06)",
              border: "none", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}>🚪 Logout</button>
          </div>
        </aside>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Topbar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 28px", background: "#fff", borderBottom: "1px solid #eee",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", lineHeight: 1 }}>☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>{initials}</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
