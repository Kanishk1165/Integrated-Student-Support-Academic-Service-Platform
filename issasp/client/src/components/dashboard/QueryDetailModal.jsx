import { useState, useEffect } from "react";
import { queryAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_CONFIG = {
  open:          { label: "Open",        color: "#e74c3c", bg: "#fef0ef" },
  "in-progress": { label: "In Progress", color: "#f5a623", bg: "#fff8ec" },
  resolved:      { label: "Resolved",    color: "#27ae60", bg: "#edfaf3" },
  closed:        { label: "Closed",      color: "#888",    bg: "#f4f4f4" },
};

export default function QueryDetailModal({ query: initialQuery, onClose, onUpdate }) {
  const { user } = useAuth();
  const [query, setQuery]     = useState(initialQuery);
  const [response, setResponse] = useState("");
  const [status, setStatus]   = useState(initialQuery.status);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    queryAPI.getById(initialQuery._id)
      .then(r => { setQuery(r.data.data); setStatus(r.data.data.status); })
      .catch(() => {});
  }, [initialQuery._id]);

  const handleRespond = async () => {
    if (!response.trim()) return;
    setSending(true);
    try {
      const r = await queryAPI.respond(query._id, { message: response });
      setQuery(r.data.data);
      setResponse("");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to send response.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      const r = await queryAPI.updateStatus(query._id, { status: newStatus });
      setQuery(r.data.data);
      setStatus(newStatus);
      onUpdate?.();
    } catch (e) {
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const cfg = STATUS_CONFIG[query.status] || STATUS_CONFIG.open;
  const isAdmin = user?.role === "admin" || user?.role === "faculty";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, width: 560, maxWidth: "94vw", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>{query.queryId} · {query.category}</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{query.title}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>
            <span style={{ background: "#f0f0f0", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#555" }}>{query.priority} priority</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#bbb" }}>{new Date(query.createdAt).toLocaleDateString("en-IN")}</span>
          </div>

          {/* Admin: status controls */}
          {isAdmin && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {["open","in-progress","resolved","closed"].map(s => (
                <button key={s} onClick={() => handleStatusUpdate(s)} disabled={loading || status === s} style={{
                  padding: "6px 12px", borderRadius: 7, border: "1.5px solid",
                  borderColor: status === s ? "#1a1a2e" : "#e0e0e0",
                  background: status === s ? "#1a1a2e" : "#fff",
                  color: status === s ? "#fff" : "#666",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  textTransform: "capitalize",
                }}>
                  {s.replace("-"," ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ padding: "18px 28px", background: "#f8f9fb", borderBottom: "1px solid #f0f0f0", fontSize: 14, color: "#444", lineHeight: 1.6 }}>
          {query.description}
        </div>

        {/* Responses */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px" }}>
          {(!query.responses || query.responses.length === 0) ? (
            <div style={{ textAlign: "center", color: "#ccc", padding: "20px 0", fontSize: 13 }}>No responses yet.</div>
          ) : (
            query.responses
              .filter(r => !r.isInternal || isAdmin)
              .map((r, i) => {
                const byAdmin = r.respondedBy?.role !== "student";
                return (
                  <div key={i} style={{ marginBottom: 14, display: "flex", gap: 10, justifyContent: byAdmin ? "flex-start" : "flex-end" }}>
                    {byAdmin && (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                        {r.respondedBy?.name?.slice(0,2)?.toUpperCase() || "AD"}
                      </div>
                    )}
                    <div style={{ maxWidth: "80%" }}>
                      <div style={{ background: byAdmin ? "#f8f9fb" : "#eef3ff", borderRadius: byAdmin ? "4px 14px 14px 14px" : "14px 4px 14px 14px", padding: "10px 14px", fontSize: 13, color: "#333", border: `1px solid ${byAdmin ? "#eee" : "#dce8ff"}` }}>
                        {r.message}
                        {r.isInternal && <span style={{ marginLeft: 6, fontSize: 10, color: "#f5a623", fontWeight: 700 }}>[INTERNAL]</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#ccc", marginTop: 4, textAlign: byAdmin ? "left" : "right" }}>
                        {r.respondedBy?.name || "Staff"} · {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Response input — admin/faculty only */}
        {isAdmin && (
          <div style={{ padding: "16px 28px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 10 }}>
            <input
              value={response} onChange={e => setResponse(e.target.value)}
              placeholder="Type a response..."
              onKeyDown={e => e.key === "Enter" && handleRespond()}
              style={{ flex: 1, padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 9, fontSize: 14, outline: "none" }}
            />
            <button onClick={handleRespond} disabled={sending || !response.trim()} style={{
              padding: "11px 18px", background: "#1a1a2e", color: "#fff",
              border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              {sending ? "..." : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
