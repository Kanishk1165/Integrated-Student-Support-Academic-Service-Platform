import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical", "MBA", "Other"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("student"); // student or faculty
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    rollNumber: "", 
    department: "Computer Science", 
    year: "1st Year", 
    phone: "",
    role: "student" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setForm(f => ({ ...f, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate faculty must have department
    if (selectedRole === 'faculty' && !form.department) {
      setError("Department is required for faculty registration");
      return;
    }

    setLoading(true);
    try {
      const response = await register(form);
      
      // If faculty, show success message instead of redirecting
      if (selectedRole === 'faculty' && response.isPending) {
        setRegistrationSuccess(true);
        setLoading(false);
        return;
      }

      // Student registration - redirect to dashboard
      navigate(response.role === "student" ? "/student/dashboard" : "/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed.");
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0",
    borderRadius: 10, fontSize: 14, outline: "none",
    transition: "border-color 0.2s"
  };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5, letterSpacing: 0.3 };

  // Success screen for faculty registration
  if (registrationSuccess) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a1a2e,#0f3460)", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 40, boxShadow: "0 24px 80px rgba(0,0,0,0.4)", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#333", marginBottom: 12 }}>Registration Submitted!</h2>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.6 }}>
              Your faculty account is pending admin approval.<br />
              You will receive an email once your account is activated.
            </p>
            <Link to="/login" style={{
              display: "inline-block",
              padding: "13px 32px",
              background: "linear-gradient(135deg,#1a1a2e,#2d2d5e)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              cursor: "pointer"
            }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a1a2e,#0f3460)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#4f8ef7", letterSpacing: 3, textTransform: "uppercase" }}>ISSASP</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 8 }}>Create Account</div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          {error && <div style={{ background: "#fef0ef", color: "#e74c3c", padding: "11px 14px", borderRadius: 9, fontSize: 13, marginBottom: 18 }}>{error}</div>}

          {/* Role Selection Toggle */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...labelStyle, marginBottom: 10 }}>I am a</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                type="button"
                onClick={() => handleRoleSelect("student")}
                style={{
                  padding: "14px",
                  background: selectedRole === "student" ? "linear-gradient(135deg,#1a1a2e,#2d2d5e)" : "#f5f5f5",
                  color: selectedRole === "student" ? "#fff" : "#555",
                  border: selectedRole === "student" ? "2px solid #4f8ef7" : "2px solid #e0e0e0",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("faculty")}
                style={{
                  padding: "14px",
                  background: selectedRole === "faculty" ? "linear-gradient(135deg,#1a1a2e,#2d2d5e)" : "#f5f5f5",
                  color: selectedRole === "faculty" ? "#fff" : "#555",
                  border: selectedRole === "faculty" ? "2px solid #4f8ef7" : "2px solid #e0e0e0",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                👨‍🏫 Faculty
              </button>
            </div>
          </div>

          {/* Faculty Pending Message */}
          {selectedRole === "faculty" && (
            <div style={{ background: "#e3f2fd", color: "#1976d2", padding: "10px 14px", borderRadius: 9, fontSize: 12, marginBottom: 18 }}>
              ℹ️ Your account will be reviewed by an admin before activation
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="John Doe" required />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" style={inputStyle} value={form.email} onChange={set("email")} placeholder="you@university.edu" required />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" style={inputStyle} value={form.password} onChange={set("password")} placeholder="Min 6 characters" required minLength={6} />
          </div>

          {/* Student-specific fields */}
          {selectedRole === "student" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Roll Number (Optional)</label>
                <input style={inputStyle} value={form.rollNumber} onChange={set("rollNumber")} placeholder="21CS1001" />
              </div>
              <div>
                <label style={labelStyle}>Year (Optional)</label>
                <select style={inputStyle} value={form.year} onChange={set("year")}>
                  {["1st Year","2nd Year","3rd Year","4th Year"].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Department {selectedRole === "faculty" && <span style={{ color: "#e74c3c" }}>*</span>}
            </label>
            <select style={inputStyle} value={form.department} onChange={set("department")} required={selectedRole === "faculty"}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Faculty-specific fields */}
          {selectedRole === "faculty" && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Phone Number (Optional)</label>
              <input type="tel" style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", marginTop: 6,
            background: loading ? "#ccc" : "linear-gradient(135deg,#1a1a2e,#2d2d5e)",
            color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}>
            {loading ? "Creating account..." : "Register →"}
          </button>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#888" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#4f8ef7", fontWeight: 700 }}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
