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
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e" }}>{greeting}, {user?.name?.split(" ")[0]} 👋</h1>
        <p style={{ color: "#aaa", fontSize: 14, marginTop: 4 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Queries */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Recent Queries</h2>
          <button onClick={() => setShowRaise(true)} style={{ padding: "8px 16px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ New Query</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Loading...</div>
        ) : queries.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ color: "#aaa", fontSize: 14 }}>No queries yet. Raise your first one!</div>
          </div>
        ) : (
          queries.map(q => (
            <div key={q._id} onClick={() => setSelected(q)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 12px", borderRadius: 10, marginBottom: 4,
              cursor: "pointer", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_DOT[q.priority], flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{q.queryId} · {new Date(q.createdAt).toLocaleDateString("en-IN")}</div>
                </div>
              </div>
              <StatusBadge status={q.status} />
            </div>
          ))
        )}
      </div>

      {/* Student Info Card */}
      <div style={{ marginTop: 20, background: "linear-gradient(135deg,#1a1a2e,#2d2d5e)", borderRadius: 14, padding: 24, color: "#fff" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>Your Profile</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>{initials}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{user?.rollNumber} · {user?.department} · {user?.year}</div>
          </div>
        </div>
      </div>

      {showRaise && <RaiseQueryModal onClose={() => setShowRaise(false)} onSuccess={() => { setShowRaise(false); loadData(); }} />}
      {selected  && <QueryDetailModal query={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}
