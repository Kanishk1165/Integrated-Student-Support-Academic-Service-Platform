import { useState } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { userAPI, authAPI } from "../../services/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", department: user?.department || "", year: user?.year || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 9, fontSize: 14, outline: "none", boxSizing: "border-box" };
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await userAPI.updateProfile(form);
      updateUser(r.data.data);
      setMsg("Profile updated!");
      setEditing(false);
    } catch {
      setMsg("Failed to update profile.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handlePwChange = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg("Passwords do not match.");
      return;
    }
    setSavingPw(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      setPwMsg(e.response?.data?.message || "Failed to change password.");
    } finally {
      setSavingPw(false);
      setTimeout(() => setPwMsg(""), 4000);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>My Profile</h1>

        {/* Profile Card */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cbf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff" }}>{initials}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{user?.name}</div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 3 }}>{user?.email}</div>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{user?.role} · joined {new Date(user?.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
            </div>
          </div>

          {msg && <div style={{ background: msg.includes("success") || msg.includes("updated") ? "#edfaf3" : "#fef0ef", color: msg.includes("success") || msg.includes("updated") ? "#27ae60" : "#e74c3c", padding: "10px 14px", borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{msg}</div>}

          {editing ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Phone", key: "phone" },
                  { label: "Department", key: "department" },
                  { label: "Year", key: "year" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>{label}</label>
                    <input style={inputStyle} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleSave} disabled={saving} style={{ padding: "11px 24px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setEditing(false)} style={{ padding: "11px 18px", background: "#f0f0f0", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#666" }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {[
                ["Roll Number", user?.rollNumber || "—"],
                ["Department", user?.department || "—"],
                ["Year", user?.year || "—"],
                ["Phone", user?.phone || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f8f8f8", fontSize: 14 }}>
                  <span style={{ color: "#888", fontWeight: 600 }}>{k}</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <button onClick={() => setEditing(true)} style={{ marginTop: 20, padding: "11px 22px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Edit Profile</button>
            </>
          )}
        </div>

        {/* Change Password */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Change Password</h2>
          {pwMsg && <div style={{ background: pwMsg.includes("success") ? "#edfaf3" : "#fef0ef", color: pwMsg.includes("success") ? "#27ae60" : "#e74c3c", padding: "10px 14px", borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{pwMsg}</div>}
          {[
            { label: "Current Password", key: "currentPassword" },
            { label: "New Password",     key: "newPassword" },
            { label: "Confirm Password", key: "confirm" },
          ].map(({ label, key }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>{label}</label>
              <input type="password" style={inputStyle} value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <button onClick={handlePwChange} disabled={savingPw} style={{ padding: "11px 22px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {savingPw ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
