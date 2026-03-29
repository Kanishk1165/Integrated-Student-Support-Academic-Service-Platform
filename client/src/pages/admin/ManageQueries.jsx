import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import QueryDetailModal from "../../components/dashboard/QueryDetailModal";
import { queryAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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

export default function ManageQueries() {
  const [queries, setQueries]   = useState([]);
  const [filter, setFilter]     = useState("all");
  const [category, setCategory] = useState("all");
  const [assignment, setAssignment] = useState("all"); // For faculty: 'all', 'me', 'unassigned'
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);
  
  const { user } = useAuth(); // Import useAuth from context and use it

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter   !== "all") params.status   = filter;
      if (category !== "all") params.category = category;
      if (user?.role === "faculty" && assignment !== "all") params.assigned = assignment;
      
      const r = await queryAPI.getAll(params);
      setQueries(r.data.data);
      setTotal(r.data.pagination.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [filter, category, assignment]);
  useEffect(() => { load(); }, [filter, category, assignment, page]);

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Manage Queries</h1>
          <p style={{ color: "#aaa", fontSize: 14, marginTop: 2 }}>{total} queries total</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all","open","in-progress","resolved","closed"].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "7px 14px", borderRadius: 8, border: "1.5px solid",
              borderColor: filter === s ? "#1a1a2e" : "#e0e0e0",
              background: filter === s ? "#1a1a2e" : "#fff",
              color: filter === s ? "#fff" : "#888",
              fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
            }}>
              {s === "all" ? "All Status" : s.replace("-"," ")}
            </button>
          ))}
        </div>
        
        {user?.role === "faculty" && (
          <div style={{ display: "flex", gap: 6, marginLeft: 10, paddingLeft: 10, borderLeft: "1px solid #ddd" }}>
            {[{v: "all", l: "All Queries"}, {v: "me", l: "Assigned To Me"}, {v: "unassigned", l: "Unassigned"}].map(a => (
              <button key={a.v} onClick={() => setAssignment(a.v)} style={{
                padding: "7px 14px", borderRadius: 8, border: "1.5px solid",
                borderColor: assignment === a.v ? "#4f8ef7" : "#e0e0e0",
                background: assignment === a.v ? "#eef3ff" : "#fff",
                color: assignment === a.v ? "#4f8ef7" : "#888",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
                {a.l}
              </button>
            ))}
          </div>
        )}

        <select value={category} onChange={e => setCategory(e.target.value)} style={{
          padding: "8px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", marginLeft: user?.role === "faculty" ? 10 : 0
        }}>
          <option value="all">All Categories</option>
          {["Scholarship","Attendance","Exam","Internship","Mentoring","Administrative","Other"].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 120px 100px 80px 90px 110px", padding: "12px 20px", background: "#f8f9fb", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 0.6, textTransform: "uppercase" }}>
          <span>ID</span><span>Title</span><span>Student</span><span>Category</span><span>Priority</span><span>Date</span><span>Status</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Loading...</div>
        ) : queries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ color: "#aaa", fontSize: 14 }}>No queries match the filter.</div>
          </div>
        ) : queries.map((q, i) => (
          <div key={q._id} onClick={() => setSelected(q)} style={{
            display: "grid", gridTemplateColumns: "90px 1fr 120px 100px 80px 90px 110px",
            padding: "15px 20px", cursor: "pointer",
            borderTop: i > 0 ? "1px solid #f5f5f5" : "none",
            transition: "background 0.12s", alignItems: "center",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#4f8ef7" }}>{q.queryId}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{q.title}</div>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>{q.responses?.length || 0} responses</div>
            </div>
            <span style={{ fontSize: 12, color: "#666" }}>{q.raisedBy?.name || "—"}</span>
            <span style={{ fontSize: 12, color: "#666" }}>{q.category}</span>
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
      {total > 15 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {[...Array(Math.ceil(total / 15))].map((_, i) => (
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

      {selected && <QueryDetailModal query={selected} onClose={() => { setSelected(null); load(); }} onUpdate={load} />}
    </Layout>
  );
}
