import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "student" ? "/student/dashboard" : "/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#4f8ef7", letterSpacing: 3, textTransform: "uppercase" }}>ISSASP</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 8 }}>Welcome back</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Sign in to your student portal</div>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "#fff", borderRadius: 20, padding: 36,
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}>
          {error && (
            <div style={{ background: "#fef0ef", color: "#e74c3c", padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 20, border: "1px solid #fdd" }}>
              {error}
            </div>
          )}

          {/* Demo credentials helper */}
          <div style={{ background: "#eef3ff", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#4f8ef7" }}>
            <strong>Note:</strong> These accounts must exist in your deployed database. <br />
            <strong>Demo:</strong> kanishk@university.edu / student123 <br />
            <strong>Admin:</strong> admin@university.edu / admin123
          </div>

          {[
            { label: "Email Address", key: "email", type: "email", placeholder: "you@university.edu" },
            { label: "Password", key: "password", type: "password", placeholder: "••••••••" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, letterSpacing: 0.3 }}>{label}</label>
              <input
                type={type} value={form[key]} placeholder={placeholder}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required
                style={{
                  width: "100%", padding: "12px 16px", border: "1.5px solid #e0e0e0",
                  borderRadius: 10, fontSize: 14, outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#4f8ef7"}
                onBlur={e => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px", marginTop: 8,
            background: loading ? "#ccc" : "linear-gradient(135deg, #1a1a2e, #2d2d5e)",
            color: "#fff", border: "none", borderRadius: 10, fontSize: 15,
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
          }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#4f8ef7", fontWeight: 700 }}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
