import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical", "MBA", "Other"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNumber: "", department: "Computer Science", year: "1st Year", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "student" ? "/student/dashboard" : "/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0",
    borderRadius: 10, fontSize: 14, outline: "none",
  };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5, letterSpacing: 0.3 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a1a2e,#0f3460)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#4f8ef7", letterSpacing: 3, textTransform: "uppercase" }}>ISSASP</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 8 }}>Create Account</div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          {error && <div style={{ background: "#fef0ef", color: "#e74c3c", padding: "11px 14px", borderRadius: 9, fontSize: 13, marginBottom: 18 }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="John Doe" required />
            </div>
            <div>
              <label style={labelStyle}>Roll Number</label>
              <input style={inputStyle} value={form.rollNumber} onChange={set("rollNumber")} placeholder="21CS1001" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" style={inputStyle} value={form.email} onChange={set("email")} placeholder="you@university.edu" required />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" style={inputStyle} value={form.password} onChange={set("password")} placeholder="Min 6 characters" required minLength={6} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Department</label>
              <select style={inputStyle} value={form.department} onChange={set("department")}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <select style={inputStyle} value={form.year} onChange={set("year")}>
                {["1st Year","2nd Year","3rd Year","4th Year"].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", marginTop: 6,
            background: loading ? "#ccc" : "linear-gradient(135deg,#1a1a2e,#2d2d5e)",
            color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
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
