import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { analyticsAPI, queryAPI } from "../../services/api";
import QueryDetailModal from "../../components/dashboard/QueryDetailModal";

export default function FacultyDashboard() {
  const [overview, setOverview] = useState({});
  const [assignedQueries, setAssignedQueries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      analyticsAPI.getOverview(), // We will update backend so this works per-faculty
      queryAPI.getAll({ limit: 10, assigned: "me" }), // Get queries assigned to this faculty
    ]).then(([oRes, qRes]) => {
      setOverview(oRes.data.data);
      setAssignedQueries(qRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const STATS = [
    { label: "Assigned Queries", value: overview.total || 0,        icon: "📋", color: "#4f8ef7", bg: "#eef3ff" },
    { label: "Open",             value: overview.open || 0,         icon: "🔴", color: "#e74c3c", bg: "#fef0ef" },
    { label: "In Progress",      value: overview.inProgress || 0,   icon: "⏳", color: "#f5a623", bg: "#fff8ec" },
    { label: "Resolved",         value: overview.resolved || 0,     icon: "✅", color: "#27ae60", bg: "#edfaf3" },
  ];

  const STATUS_COLOR = { open: "#e74c3c", "in-progress": "#f5a623", resolved: "#27ae60", closed: "#888" };
  const PRIORITY_DOT = { high: "#e74c3c", medium: "#f5a623", low: "#27ae60" };

  return (
    <Layout>
      {/* Page Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>Faculty Dashboard</h1>
        <p style={{ color: "#888", fontSize: 15, lineHeight: 1.6 }}>Overview of queries assigned to you and your department</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 36 }}>
        {STATS.map(s => (
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
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, color: "#1a1a2e", marginBottom: 6 }}>
                {loading ? "—" : (s.value ?? 0)}
              </div>
              <div style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned Queries Section */}
      <div style={{ 
        background: "#fff", borderRadius: 16, padding: "28px", 
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        border: "1px solid #f0f0f0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>Queries Needing Your Attention</h2>
            <p style={{ fontSize: 13, color: "#999" }}>Review and respond to student queries</p>
          </div>
          <div style={{ 
            background: "#f5f7fa", padding: "8px 16px", borderRadius: 12, 
            fontSize: 13, fontWeight: 600, color: "#666" 
          }}>
            {assignedQueries.length} {assignedQueries.length === 1 ? 'query' : 'queries'}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#aaa" }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>⏳</div>
            <div>Loading queries...</div>
          </div>
        ) : assignedQueries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>All caught up!</div>
            <div style={{ color: "#999", fontSize: 14 }}>No queries currently assigned to you.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assignedQueries.map((q) => (
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
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <div style={{ 
                    width: 10, height: 10, borderRadius: "50%", 
                    background: PRIORITY_DOT[q.priority], flexShrink: 0,
                    boxShadow: `0 0 0 3px ${PRIORITY_DOT[q.priority]}20`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 6 }}>{q.title}</div>
                    <div style={{ fontSize: 12, color: "#999", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "#666" }}>{q.queryId}</span>
                      <span>•</span>
                      <span>{q.raisedBy?.name}</span>
                      <span>•</span>
                      <span style={{ 
                        background: "#f5f7fa", padding: "2px 8px", 
                        borderRadius: 6, fontWeight: 500 
                      }}>{q.category}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>
                    {new Date(q.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                  </span>
                  <span style={{ 
                    background: STATUS_COLOR[q.status] ? STATUS_COLOR[q.status]+"15" : "#eee", 
                    color: STATUS_COLOR[q.status], borderRadius: 8, 
                    padding: "6px 12px", fontSize: 11, fontWeight: 700, 
                    textTransform: "capitalize", whiteSpace: "nowrap" 
                  }}>
                    {q.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <QueryDetailModal query={selected} onClose={() => { setSelected(null); loadData(); }} onUpdate={loadData} />}
    </Layout>
  );
}