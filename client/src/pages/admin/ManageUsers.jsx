import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { userAPI, departmentAPI } from "../../services/api";

const ROLE_BADGE = {
  student: { color: "#4f8ef7", bg: "#eef3ff" },
  admin:   { color: "#7c5cbf", bg: "#f2eeff" },
  faculty: { color: "#27ae60", bg: "#edfaf3" },
};

const APPROVAL_STATUS_BADGE = {
  approved: { text: "Approved", color: "#27ae60", bg: "#edfaf3" },
  pending:  { text: "Pending", color: "#f39c12", bg: "#fef9e7" },
  rejected: { text: "Rejected", color: "#e74c3c", bg: "#fef0ef" },
};

export default function ManageUsers() {
  const [users, setUsers]     = useState([]);
  const [role, setRole]       = useState("all");
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);

  // Add User Modal state
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNumber: "",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (role !== "all") params.role = role;
      const r = await userAPI.getAll(params);
      setUsers(r.data.data);
      setTotal(r.data.pagination.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadDepartments = async () => {
    try {
      const r = await departmentAPI.getAll();
      setDepartments(r.data.data || r.data || []);
    } catch (e) { console.error("Failed to load departments:", e); }
  };

  useEffect(() => { setPage(1); }, [role]);
  useEffect(() => { load(); }, [role, page]);
  useEffect(() => { loadDepartments(); }, []);

  const handleToggle = async (id) => {
    try {
      await userAPI.toggleActive(id);
      load();
    } catch { alert("Failed to update user."); }
  };

  const initials = (name) => name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  const openModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
      rollNumber: "",
      department: "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear role-specific fields when role changes
    if (name === "role") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        rollNumber: value === "student" ? prev.rollNumber : "",
        department: value === "faculty" ? prev.department : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error("Name, email, and password are required");
      }
      if (formData.role === "student" && !formData.rollNumber) {
        throw new Error("Roll number is required for students");
      }
      if (formData.role === "faculty" && !formData.department) {
        throw new Error("Department is required for faculty");
      }

      // Build request payload
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      
      if (formData.role === "student") {
        payload.rollNumber = formData.rollNumber;
      }
      if (formData.role === "faculty") {
        payload.department = formData.department;
      }

      await userAPI.create(payload);
      closeModal();
      load(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #e0e0e0",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#666",
    marginBottom: 6,
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Manage Users</h1>
          <p style={{ color: "#aaa", fontSize: 14, marginTop: 2 }}>{total} users registered</p>
        </div>
        <button onClick={openModal} style={{
          padding: "10px 16px", borderRadius: 8, background: "#1a1a2e", color: "#fff",
          fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>+</span> Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all","student","faculty","admin"].map(r => (
          <button key={r} onClick={() => setRole(r)} style={{
            padding: "7px 16px", borderRadius: 8, border: "1.5px solid",
            borderColor: role === r ? "#1a1a2e" : "#e0e0e0",
            background: role === r ? "#1a1a2e" : "#fff",
            color: role === r ? "#fff" : "#888",
            fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
          }}>{r === "all" ? "All Users" : r}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 180px 110px 100px 80px 90px", padding: "12px 20px", background: "#f8f9fb", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 0.6, textTransform: "uppercase" }}>
          <span></span><span>Name</span><span>Email</span><span>Roll / Dept</span><span>Joined</span><span>Role</span><span>Status</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#aaa" }}>No users found.</div>
        ) : users.map((u, i) => {
          const rb = ROLE_BADGE[u.role] || ROLE_BADGE.student;
          return (
            <div key={u._id} style={{
              display: "grid", gridTemplateColumns: "48px 1fr 180px 110px 100px 80px 90px",
              padding: "14px 20px", alignItems: "center",
              borderTop: i > 0 ? "1px solid #f5f5f5" : "none",
            }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {initials(u.name)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</div>
              </div>
              <span style={{ fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
              <span style={{ fontSize: 12, color: "#888" }}>{u.rollNumber || u.department || "—"}</span>
              <span style={{ fontSize: 12, color: "#aaa" }}>{new Date(u.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" })}</span>
              <span style={{ background: rb.bg, color: rb.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{u.role}</span>
              {u.role === 'faculty' ? (
                <span style={{ 
                  background: APPROVAL_STATUS_BADGE[u.approvalStatus]?.bg || "#edfaf3", 
                  color: APPROVAL_STATUS_BADGE[u.approvalStatus]?.color || "#27ae60", 
                  borderRadius: 20, 
                  padding: "3px 10px", 
                  fontSize: 11, 
                  fontWeight: 700 
                }}>
                  {APPROVAL_STATUS_BADGE[u.approvalStatus]?.text || u.approvalStatus}
                </span>
              ) : (
                <button onClick={() => handleToggle(u._id)} style={{
                  padding: "5px 12px", borderRadius: 7, border: "none",
                  background: u.isActive ? "#edfaf3" : "#fef0ef",
                  color: u.isActive ? "#27ae60" : "#e74c3c",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>
                  {u.isActive ? "Active" : "Inactive"}
                </button>
              )}
            </div>
          );
        })}
      </div>

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

      {/* Add User Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={closeModal}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 28,
            width: "100%",
            maxWidth: 440,
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add New User</h2>
              <button onClick={closeModal} style={{
                background: "none",
                border: "none",
                fontSize: 22,
                cursor: "pointer",
                color: "#999",
                lineHeight: 1,
              }}>&times;</button>
            </div>

            {error && (
              <div style={{
                background: "#fef0ef",
                color: "#e74c3c",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Role *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["student", "faculty", "admin"].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleInputChange({ target: { name: "role", value: r } })}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1.5px solid",
                        borderColor: formData.role === r ? "#1a1a2e" : "#e0e0e0",
                        background: formData.role === r ? "#1a1a2e" : "#fff",
                        color: formData.role === r ? "#fff" : "#666",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  style={inputStyle}
                  required
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  style={inputStyle}
                  required
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min 6 characters)"
                  style={inputStyle}
                  minLength={6}
                  required
                />
              </div>

              {/* Roll Number (Students only) */}
              {formData.role === "student" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Roll Number *</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    placeholder="Enter roll number"
                    style={inputStyle}
                    required
                  />
                </div>
              )}

              {/* Department (Faculty only) */}
              {formData.role === "faculty" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map(d => (
                      <option key={d._id || d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Info about faculty approval */}
              {formData.role === "faculty" && (
                <div style={{
                  background: "#f0f7ff",
                  color: "#4f8ef7",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 16,
                }}>
                  Faculty created by admin are automatically approved and can log in immediately.
                </div>
              )}

              {/* Submit Button */}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1.5px solid #e0e0e0",
                    background: "#fff",
                    color: "#666",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: submitting ? "#ccc" : "#1a1a2e",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
