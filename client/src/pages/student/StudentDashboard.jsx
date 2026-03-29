import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { queryAPI, analyticsAPI } from "../../services/api";
import RaiseQueryModal from "../../components/dashboard/RaiseQueryModal";
import QueryDetailModal from "../../components/dashboard/QueryDetailModal";

const STATUS_CONFIG = {
  open:          { label: "Open",        color: "#e74c3c", bg: "#fef0ef" },
  "in-progress": { label: "In Progress", color: "#f5a623", bg: "#fff8ec" },
  resolved:      { label: "Resolved",    color: "#27ae60", bg: "#edfaf3" },
  closed:        { label: "Closed",      color: "#888",    bg: "#f4f4f4" },
};
const PRIORITY_DOT = { high: "#e74c3c", medium: "#f5a623", low: "#27ae60" };

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
      {cfg.label}
    </span>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [queries, setQueries]       = useState([]);
  const [stats, setStats]           = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading]       = useState(true);
  const [showRaise, setShowRaise]   = useState(false);
  const [selected, setSelected]     = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes] = await Promise.all([
        queryAPI.getAll({ limit: 10 }),
      ]);
      const q = qRes.data.data;
      setQueries(q);
      setStats({
        total:      q.length,
        open:       q.filter(x => x.status === "open").length,
        inProgress: q.filter(x => x.status === "in-progress").length,
        resolved:   q.filter(x => x.status === "resolved").length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const STAT_CARDS = [
    { label: "Total Queries", value: stats.total,      icon: "📋", color: "#4f8ef7", bg: "#eef3ff" },
    { label: "Open",          value: stats.open,       icon: "🔴", color: "#e74c3c", bg: "#fef0ef" },
    { label: "In Progress",   value: stats.inProgress, icon: "⏳", color: "#f5a623", bg: "#fff8ec" },
    { label: "Resolved",      value: stats.resolved,   icon: "✅", color: "#27ae60", bg: "#edfaf3" },
  ];

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Layout onRaiseQuery={() => setShowRaise(true)}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#888", fontSize: 15, lineHeight: 1.6 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 36 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ 
            background: "#fff", borderRadius: 16, padding: "24px", 
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)", 
            border: "1px solid #f0f0f0",
            display: "flex", alignItems: "center", gap: 16,
            transition: "all 0.3s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ 
              width: 56, height: 56, borderRadius: 14, 
              background: s.bg, display: "flex", alignItems: "center", 
              justifyContent: "center", fontSize: 24, flexShrink: 0 
            }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, color: "#1a1a2e", marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Queries */}
      <div style={{ 
        background: "#fff", borderRadius: 16, padding: "28px", 
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        border: "1px solid #f0f0f0",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>Recent Queries</h2>
            <p style={{ fontSize: 13, color: "#999" }}>Track your submitted queries and their status</p>
          </div>
          <button onClick={() => setShowRaise(true)} style={{ 
            padding: "12px 24px", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", 
            color: "#fff", border: "none", borderRadius: 12, fontSize: 14, 
            fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(79,142,247,0.3)",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(79,142,247,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,142,247,0.3)"; }}
          >+ New Query</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#aaa" }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>⏳</div>
            <div>Loading queries...</div>
          </div>
        ) : queries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>No queries yet</div>
            <div style={{ color: "#999", fontSize: 14, marginBottom: 24 }}>Raise your first query to get started!</div>
            <button onClick={() => setShowRaise(true)} style={{ 
              padding: "12px 24px", background: "#1a1a2e", 
              color: "#fff", border: "none", borderRadius: 12, fontSize: 14, 
              fontWeight: 700, cursor: "pointer",
            }}>Raise a Query</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {queries.map(q => (
              <div key={q._id} onClick={() => setSelected(q)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 20px", borderRadius: 12, cursor: "pointer",
                border: "1px solid #f0f0f0",
                transition: "all 0.2s ease",
                background: "#fff",
              }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = "#f8f9fb"; 
                  e.currentTarget.style.borderColor = "#e0e0e0";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = "#fff"; 
                  e.currentTarget.style.borderColor = "#f0f0f0";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    width: 10, height: 10, borderRadius: "50%", 
                    background: PRIORITY_DOT[q.priority], flexShrink: 0,
                    boxShadow: `0 0 0 3px ${PRIORITY_DOT[q.priority]}20`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>{q.title}</div>
                    <div style={{ fontSize: 12, color: "#999", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "#666" }}>{q.queryId}</span>
                      <span>•</span>
                      <span>{new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={q.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Info Card */}
      <div style={{ 
        marginTop: 24, background: "linear-gradient(135deg,#1a1a2e,#2d2d5e)", 
        borderRadius: 16, padding: "28px", color: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 1.5, marginBottom: 20, textTransform: "uppercase" }}>Your Profile</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ 
            width: 64, height: 64, borderRadius: "50%", 
            background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: 22, fontWeight: 800, flexShrink: 0,
            boxShadow: "0 4px 16px rgba(79,142,247,0.4)",
          }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{user?.name}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600 }}>{user?.rollNumber}</span>
              <span>•</span>
              <span>{user?.department}</span>
              <span>•</span>
              <span>{user?.year}</span>
            </div>
          </div>
        </div>
      </div>

      {showRaise && <RaiseQueryModal onClose={() => setShowRaise(false)} onSuccess={() => { setShowRaise(false); loadData(); }} />}
      {selected  && <QueryDetailModal query={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}
