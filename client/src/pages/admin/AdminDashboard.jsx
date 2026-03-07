import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { analyticsAPI, queryAPI } from "../../services/api";
import QueryDetailModal from "../../components/dashboard/QueryDetailModal";

export default function AdminDashboard() {
  const [overview, setOverview] = useState({});
  const [recentQueries, setRecentQueries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview(),
      queryAPI.getAll({ limit: 8, status: "open" }),
    ]).then(([oRes, qRes]) => {
      setOverview(oRes.data.data);
      setRecentQueries(qRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const STATS = [
    { label: "Total Queries",    value: overview.total,        icon: "📋", color: "#4f8ef7", bg: "#eef3ff" },
    { label: "Open",             value: overview.open,         icon: "🔴", color: "#e74c3c", bg: "#fef0ef" },
    { label: "In Progress",      value: overview.inProgress,   icon: "⏳", color: "#f5a623", bg: "#fff8ec" },
    { label: "Resolved",         value: overview.resolved,     icon: "✅", color: "#27ae60", bg: "#edfaf3" },
    { label: "Total Students",   value: overview.totalStudents, icon: "👥", color: "#7c5cbf", bg: "#f2eeff" },
  ];

  const STATUS_COLOR = { open: "#e74c3c", "in-progress": "#f5a623", resolved: "#27ae60", closed: "#888" };
  const PRIORITY_DOT = { high: "#e74c3c", medium: "#f5a623", low: "#27ae60" };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Admin Dashboard</h1>
        <p style={{ color: "#aaa", fontSize: 14, marginTop: 4 }}>Overview of all queries and system activity</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 13, padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{loading ? "—" : (s.value ?? 0)}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Open Queries */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Open Queries — Needs Attention</h2>
          <span style={{ fontSize: 13, color: "#aaa" }}>{recentQueries.length} queries</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 32, color: "#aaa" }}>Loading...</div>
        ) : recentQueries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <div style={{ color: "#aaa", fontSize: 14 }}>No open queries! All caught up.</div>
          </div>
        ) : recentQueries.map((q, i) => (
          <div key={q._id} onClick={() => setSelected(q)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px", borderRadius: 10, cursor: "pointer",
            borderTop: i > 0 ? "1px solid #f5f5f5" : "none",
            transition: "background 0.12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_DOT[q.priority], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{q.title}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{q.queryId} · {q.raisedBy?.name} · {q.category}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: "#aaa" }}>{new Date(q.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span>
              <span style={{ background: "#fef0ef", color: "#e74c3c", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>Open</span>
            </div>
          </div>
        ))}
      </div>

      {selected && <QueryDetailModal query={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}
