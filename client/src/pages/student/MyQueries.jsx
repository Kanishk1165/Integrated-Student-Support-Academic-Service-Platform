import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import RaiseQueryModal from "../../components/dashboard/RaiseQueryModal";
import QueryDetailModal from "../../components/dashboard/QueryDetailModal";
import { queryAPI } from "../../services/api";

const STATUS_CONFIG = {
  open:          { label: "Open",        color: "#e74c3c", bg: "#fef0ef" },
  "in-progress": { label: "In Progress", color: "#f5a623", bg: "#fff8ec" },
  resolved:      { label: "Resolved",    color: "#27ae60", bg: "#edfaf3" },
  closed:        { label: "Closed",      color: "#888",    bg: "#f4f4f4" },
};
const PRIORITY_DOT = { high: "#e74c3c", medium: "#f5a623", low: "#27ae60" };

function Badge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return <span style={{ background: c.bg, color: c.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{c.label}</span>;
}

export default function MyQueries() {
  const [queries, setQueries]   = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [showRaise, setShowRaise] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== "all") params.status = filter;
      const r = await queryAPI.getAll(params);
      setQueries(r.data.data);
      setTotal(r.data.pagination.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { loadQueries(); }, [filter, page]);

  return (
    <Layout onRaiseQuery={() => setShowRaise(true)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>My Queries</h1>
          <p style={{ color: "#aaa", fontSize: 14, marginTop: 2 }}>{total} total queries</p>
        </div>
        <button onClick={() => setShowRaise(true)} style={{ padding: "10px 20px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ New Query</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all","open","in-progress","resolved","closed"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "8px 16px", borderRadius: 8, border: "1.5px solid",
            borderColor: filter === s ? "#1a1a2e" : "#e0e0e0",
            background: filter === s ? "#1a1a2e" : "#fff",
            color: filter === s ? "#fff" : "#888",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            textTransform: "capitalize",
          }}>
            {s === "all" ? "All" : s.replace("-"," ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 120px 90px 80px 110px", gap: 0, padding: "12px 20px", background: "#f8f9fb", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 0.6, textTransform: "uppercase" }}>
          <span>ID</span><span>Title</span><span>Category</span><span>Priority</span><span>Date</span><span>Status</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Loading...</div>
        ) : queries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ color: "#aaa", fontSize: 14 }}>No queries found.</div>
          </div>
        ) : queries.map((q, i) => (
          <div key={q._id} onClick={() => setSelected(q)} style={{
            display: "grid", gridTemplateColumns: "90px 1fr 120px 90px 80px 110px",
            gap: 0, padding: "15px 20px", cursor: "pointer",
            borderTop: i > 0 ? "1px solid #f5f5f5" : "none",
            transition: "background 0.12s",
            alignItems: "center",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#4f8ef7" }}>{q.queryId}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{q.title}</div>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{q.department?.name || "—"}</div>
            </div>
            <span style={{ fontSize: 13, color: "#666" }}>{q.category}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_DOT[q.priority] }} />
              <span style={{ fontSize: 12, color: "#555", textTransform: "capitalize" }}>{q.priority}</span>
            </div>
            <span style={{ fontSize: 12, color: "#aaa" }}>{new Date(q.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span>
            <Badge status={q.status} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {[...Array(Math.ceil(total / 10))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 36, height: 36, borderRadius: 8, border: "1.5px solid",
              borderColor: page === i + 1 ? "#1a1a2e" : "#e0e0e0",
              background: page === i + 1 ? "#1a1a2e" : "#fff",
              color: page === i + 1 ? "#fff" : "#666",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>{i + 1}</button>
          ))}
        </div>
      )}

      {showRaise && <RaiseQueryModal onClose={() => setShowRaise(false)} onSuccess={() => { setShowRaise(false); loadQueries(); }} />}
      {selected && <QueryDetailModal query={selected} onClose={() => setSelected(null)} onUpdate={loadQueries} />}
    </Layout>
  );
}
