import { useState, useEffect } from "react";
import { facultyAPI } from "../../services/api";

export default function FacultyApprovals() {
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPendingFaculty();
  }, []);

  const loadPendingFaculty = async () => {
    try {
      setLoading(true);
      const res = await facultyAPI.getPending();
      setPendingFaculty(res.data.data || []);
    } catch (err) {
      setError("Failed to load pending faculty");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (faculty) => {
    if (!window.confirm(`Approve ${faculty.name}'s faculty account?`)) return;

    setActionLoading(true);
    setError("");
    try {
      await facultyAPI.approve(faculty.id);
      setSuccess(`${faculty.name} approved successfully!`);
      setPendingFaculty(prev => prev.filter(f => f.id !== faculty.id));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve faculty");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (faculty) => {
    setSelectedFaculty(faculty);
    setShowRejectModal(true);
    setRejectionReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      await facultyAPI.reject(selectedFaculty.id, rejectionReason);
      setSuccess(`${selectedFaculty.name} rejected successfully.`);
      setPendingFaculty(prev => prev.filter(f => f.id !== selectedFaculty.id));
      setShowRejectModal(false);
      setSelectedFaculty(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject faculty");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 16, color: "#888" }}>Loading pending faculty...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Faculty Approvals</h1>
        <p style={{ color: "#888", fontSize: 14 }}>Review and approve faculty registration requests</p>
      </div>

      {success && (
        <div style={{
          background: "#d4edda",
          color: "#155724",
          padding: "12px 16px",
          borderRadius: 10,
          marginBottom: 20,
          border: "1px solid #c3e6cb"
        }}>
          ✓ {success}
        </div>
      )}

      {error && (
        <div style={{
          background: "#f8d7da",
          color: "#721c24",
          padding: "12px 16px",
          borderRadius: 10,
          marginBottom: 20,
          border: "1px solid #f5c6cb"
        }}>
          ✗ {error}
        </div>
      )}

      {pendingFaculty.length === 0 ? (
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: 48,
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 8 }}>
            All caught up!
          </div>
          <div style={{ color: "#888", fontSize: 14 }}>
            No pending faculty approvals at the moment.
          </div>
        </div>
      ) : (
        <div style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                {["Name", "Email", "Department", "Phone", "Registered", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: 0.5
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingFaculty.map((faculty, idx) => (
                <tr
                  key={faculty.id}
                  style={{
                    borderBottom: idx < pendingFaculty.length - 1 ? "1px solid #f0f0f0" : "none",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                >
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 600, color: "#333" }}>{faculty.name}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ color: "#666", fontSize: 14 }}>{faculty.email}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ color: "#666", fontSize: 14 }}>
                      {faculty.department || "Not specified"}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ color: "#666", fontSize: 14 }}>
                      {faculty.phone || "N/A"}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ color: "#888", fontSize: 13 }}>
                      {new Date(faculty.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleApprove(faculty)}
                        disabled={actionLoading}
                        style={{
                          padding: "6px 14px",
                          background: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          opacity: actionLoading ? 0.6 : 1
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(faculty)}
                        disabled={actionLoading}
                        style={{
                          padding: "6px 14px",
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          opacity: actionLoading ? 0.6 : 1
                        }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedFaculty && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => !actionLoading && setShowRejectModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              width: 480,
              maxWidth: "90vw",
              boxShadow: "0 24px 80px rgba(0,0,0,0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              Reject Faculty Application
            </h3>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>
              Please provide a reason for rejecting <strong>{selectedFaculty.name}</strong>'s application.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "1.5px solid #e0e0e0",
                borderRadius: 10,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                marginBottom: 16,
                boxSizing: "border-box"
              }}
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                style={{
                  padding: "10px 20px",
                  background: "#f0f0f0",
                  color: "#333",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: actionLoading ? "not-allowed" : "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectionReason.trim()}
                style={{
                  padding: "10px 20px",
                  background: actionLoading || !rejectionReason.trim() ? "#ccc" : "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (actionLoading || !rejectionReason.trim()) ? "not-allowed" : "pointer"
                }}
              >
                {actionLoading ? "Rejecting..." : "Reject Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
