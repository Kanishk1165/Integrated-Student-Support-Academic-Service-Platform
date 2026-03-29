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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, width: 640, maxWidth: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "28px 32px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ flex: 1, paddingRight: 20 }}>
              <div style={{ fontSize: 12, color: "#999", marginBottom: 8, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "#666" }}>{query.queryId}</span>
                <span>•</span>
                <span style={{ background: "#f5f7fa", padding: "2px 10px", borderRadius: 6 }}>{query.category}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.4 }}>{query.title}</div>
            </div>
            <button onClick={onClose} style={{ background: "#f5f7fa", border: "none", width: 36, height: 36, borderRadius: "50%", fontSize: 20, cursor: "pointer", color: "#666", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e8eaf0"; e.currentTarget.style.transform = "rotate(90deg)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f5f7fa"; e.currentTarget.style.transform = "rotate(0deg)"; }}
            >×</button>
          </div>
          
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>
            <span style={{ background: "#f5f7fa", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#666", textTransform: "capitalize" }}>{query.priority} priority</span>
            {query.assignedTo && (
              <span style={{ background: "#eef3ff", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#4f8ef7" }}>
                Assigned to {query.assignedTo.name}
              </span>
            )}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#999" }}>{new Date(query.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>

          {/* Admin: status controls */}
          {isAdmin && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["open","in-progress","resolved","closed"].map(s => (
                <button key={s} onClick={() => handleStatusUpdate(s)} disabled={loading || status === s} style={{
                  padding: "8px 16px", borderRadius: 10, border: "2px solid",
                  borderColor: status === s ? "#4f8ef7" : "#e8eaf0",
                  background: status === s ? "#4f8ef7" : "#fff",
                  color: status === s ? "#fff" : "#666",
                  fontSize: 12, fontWeight: 700, cursor: status === s ? "default" : "pointer",
                  textTransform: "capitalize", transition: "all 0.2s ease",
                  opacity: loading ? 0.5 : 1,
                }}
                  onMouseEnter={e => status !== s && !loading && (e.currentTarget.style.borderColor = "#4f8ef7")}
                  onMouseLeave={e => status !== s && (e.currentTarget.style.borderColor = "#e8eaf0")}
                >
                  {s.replace("-"," ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ padding: "24px 32px", background: "#f8f9fb", borderBottom: "1px solid #f0f0f0", fontSize: 14, color: "#555", lineHeight: 1.7 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Description</div>
          {query.description}
        </div>

        {/* Responses */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", minHeight: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
            Responses ({query.responses?.filter(r => !r.isInternal || isAdmin).length || 0})
          </div>
          
          {(!query.responses || query.responses.length === 0) ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
              <div style={{ color: "#aaa", fontSize: 14 }}>No responses yet.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {query.responses
                .filter(r => !r.isInternal || isAdmin)
                .map((r, i) => {
                  const byAdmin = r.respondedBy?.role !== "student";
                  const initials = r.respondedBy?.name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?";
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: "50%", 
                        background: byAdmin ? "linear-gradient(135deg,#4f8ef7,#7c5cbf)" : "#e8eaf0", 
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        fontSize: 12, fontWeight: 800, 
                        color: byAdmin ? "#fff" : "#666", 
                        flexShrink: 0,
                        boxShadow: byAdmin ? "0 2px 8px rgba(79,142,247,0.3)" : "none",
                      }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{r.respondedBy?.name || "Staff"}</span>
                          <span style={{ fontSize: 11, color: "#999" }}>
                            {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {r.isInternal && <span style={{ fontSize: 10, color: "#f5a623", fontWeight: 700, background: "#fff8ec", padding: "2px 8px", borderRadius: 6 }}>INTERNAL</span>}
                        </div>
                        <div style={{ 
                          background: "#fff", 
                          borderRadius: 12, 
                          padding: "14px 16px", 
                          fontSize: 14, 
                          color: "#444", 
                          lineHeight: 1.6,
                          border: "1px solid #f0f0f0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        }}>
                          {r.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>

        {/* Response input — admin/faculty only */}
        {isAdmin && (
          <div style={{ padding: "20px 32px", borderTop: "1px solid #f0f0f0", background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Add Response</div>
            <div style={{ display: "flex", gap: 12 }}>
              <input
                value={response} onChange={e => setResponse(e.target.value)}
                placeholder="Type your response..."
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleRespond()}
                style={{ 
                  flex: 1, padding: "14px 16px", border: "2px solid #e8eaf0", 
                  borderRadius: 12, fontSize: 14, outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#4f8ef7"}
                onBlur={e => e.currentTarget.style.borderColor = "#e8eaf0"}
              />
              <button onClick={handleRespond} disabled={sending || !response.trim()} style={{
                padding: "14px 24px", 
                background: sending || !response.trim() ? "#e8eaf0" : "linear-gradient(135deg,#4f8ef7,#7c5cbf)", 
                color: sending || !response.trim() ? "#999" : "#fff",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, 
                cursor: sending || !response.trim() ? "not-allowed" : "pointer",
                boxShadow: sending || !response.trim() ? "none" : "0 4px 12px rgba(79,142,247,0.3)",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => !sending && response.trim() && (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => !sending && (e.currentTarget.style.transform = "translateY(0)")}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>Press Enter to send • Shift+Enter for new line</div>
          </div>
        )}
      </div>
    </div>
  );
}
