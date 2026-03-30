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
  { path: "/admin/faculty-approvals", icon: "✓", label: "Faculty Approvals" },
  { path: "/admin/analytics",  icon: "📊", label: "Analytics" },
];
const FACULTY_NAV = [
  { path: "/faculty/dashboard", icon: "🏠", label: "Dashboard" },
  { path: "/faculty/queries",   icon: "📋", label: "Assigned Queries" },
  { path: "/faculty/analytics", icon: "📊", label: "Analytics" },
];

export default function Layout({ children, onRaiseQuery }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = user?.role === "student" ? STUDENT_NAV : (user?.role === "faculty" ? FACULTY_NAV : ADMIN_NAV);
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  
  const portalName = user?.role === "student" ? "Student Portal" : (user?.role === "faculty" ? "Faculty Portal" : "Admin Portal");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{
          width: 260, background: "#1a1a2e", color: "#fff",
          display: "flex", flexDirection: "column", padding: "32px 0",
          position: "sticky", top: 0, height: "100vh", flexShrink: 0,
          boxShadow: "4px 0 24px rgba(0,0,0,0.08)",
        }}>
          {/* Logo */}
          <div style={{ padding: "0 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#4f8ef7", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 6 }}>ISSASP</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>
              {portalName}
            </div>
          </div>

          {/* User info */}
          <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0, boxShadow: "0 4px 12px rgba(79,142,247,0.3)" }}>{initials}</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "capitalize" }}>{user?.rollNumber || user?.role}</div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: "24px 16px", overflowY: "auto" }}>
            {navItems.map(item => {
              const active = pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: active ? "rgba(79,142,247,0.15)" : "transparent",
                  color: active ? "#4f8ef7" : "rgba(255,255,255,0.65)",
                  fontSize: 14, fontWeight: active ? 700 : 500, marginBottom: 6, textAlign: "left",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f8ef7" }} />}
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div style={{ padding: "0 16px 16px" }}>
            {user?.role === "student" && onRaiseQuery && (
              <button onClick={onRaiseQuery} style={{
                width: "100%", padding: "14px", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)",
                border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: "pointer", marginBottom: 10, boxShadow: "0 4px 12px rgba(79,142,247,0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(79,142,247,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,142,247,0.3)"; }}
              >+ Raise a Query</button>
            )}
            <button onClick={() => { logout(); navigate("/login"); }} style={{
              width: "100%", padding: "12px", background: "rgba(255,255,255,0.08)",
              border: "none", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontSize: 13,
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            >🚪 Logout</button>
          </div>
        </aside>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Topbar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 36px", background: "#fff", borderBottom: "1px solid #e8eaf0",
          position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{ 
            background: "none", border: "none", cursor: "pointer", fontSize: 22, 
            color: "#666", lineHeight: 1, padding: 8, borderRadius: 8,
            transition: "background 0.2s ease",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f7fa"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{user?.name}</div>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", boxShadow: "0 2px 8px rgba(79,142,247,0.3)" }}>{initials}</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "36px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
