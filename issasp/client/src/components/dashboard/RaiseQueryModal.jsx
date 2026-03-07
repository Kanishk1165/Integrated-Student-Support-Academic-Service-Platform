import { useState, useEffect } from "react";
import { queryAPI, departmentAPI } from "../../services/api";

export default function RaiseQueryModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: "", category: "Scholarship", priority: "medium", description: "", department: "" });
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    departmentAPI.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await queryAPI.create(form);
      setSubmitted(true);
      setTimeout(onSuccess, 1800);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit query.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 9, fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 18, padding: 32, width: 500, maxWidth: "94vw", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 52 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 14 }}>Query Submitted!</div>
            <div style={{ color: "#888", marginTop: 8, fontSize: 14 }}>You'll receive email updates on status changes.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Raise a Query</div>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999", lineHeight: 1 }}>×</button>
            </div>

            {error && <div style={{ background: "#fef0ef", color: "#e74c3c", padding: "10px 14px", borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>Title *</label>
              <input style={inputStyle} value={form.title} onChange={set("title")} placeholder="Briefly describe your issue" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>Category</label>
                <select style={inputStyle} value={form.category} onChange={set("category")}>
                  {["Scholarship","Attendance","Exam","Internship","Mentoring","Administrative","Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>Priority</label>
                <select style={inputStyle} value={form.priority} onChange={set("priority")}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {departments.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>Department</label>
                <select style={inputStyle} value={form.department} onChange={set("department")}>
                  <option value="">Auto-assign</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>Description *</label>
              <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.description} onChange={set("description")} placeholder="Provide full details about your query..." />
            </div>

            <button onClick={handleSubmit} disabled={submitting} style={{
              width: "100%", padding: "13px", background: submitting ? "#ccc" : "#1a1a2e",
              color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
            }}>
              {submitting ? "Submitting..." : "Submit Query →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
