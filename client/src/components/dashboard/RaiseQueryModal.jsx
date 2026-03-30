import { useState, useEffect } from "react";
import { queryAPI, departmentAPI, facultyAPI } from "../../services/api";

export default function RaiseQueryModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ 
    title: "", 
    category: "Scholarship", 
    priority: "medium", 
    description: "", 
    department: "", 
    assignedFaculty: []  // Array of faculty IDs
  });
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [facultySearch, setFacultySearch] = useState("");
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    departmentAPI.getAll().then(r => setDepartments(r.data.data)).catch(() => {});
    facultyAPI.getAll().then(r => setFaculties(r.data.data || [])).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleFacultySelection = (facultyId) => {
    setForm(f => ({
      ...f,
      assignedFaculty: f.assignedFaculty.includes(facultyId)
        ? f.assignedFaculty.filter(id => id !== facultyId)
        : [...f.assignedFaculty, facultyId]
    }));
  };

  const removeFaculty = (facultyId) => {
    setForm(f => ({
      ...f,
      assignedFaculty: f.assignedFaculty.filter(id => id !== facultyId)
    }));
  };

  const filteredFaculties = faculties.filter(f => 
    f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
    (f.department && f.department.toLowerCase().includes(facultySearch.toLowerCase()))
  );

  const selectedFacultiesDetails = faculties.filter(f => form.assignedFaculty.includes(f.id));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    if (form.assignedFaculty.length === 0) {
      setError("Please select at least one faculty member.");
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

  const inputStyle = { 
    width: "100%", 
    padding: "11px 14px", 
    border: "1.5px solid #e0e0e0", 
    borderRadius: 9, 
    fontSize: 14, 
    outline: "none", 
    boxSizing: "border-box" 
  };

  return (
    <div 
      style={{ 
        position: "fixed", 
        inset: 0, 
        background: "rgba(0,0,0,0.45)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 1000 
      }} 
      onClick={onClose}
    >
      <div 
        style={{ 
          background: "#fff", 
          borderRadius: 18, 
          padding: 32, 
          width: 560, 
          maxWidth: "94vw", 
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)", 
          maxHeight: "90vh", 
          overflowY: "auto" 
        }} 
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 52 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 14 }}>Query Submitted!</div>
            <div style={{ color: "#888", marginTop: 8, fontSize: 14 }}>
              Assigned to {selectedFacultiesDetails.length} faculty member{selectedFacultiesDetails.length > 1 ? 's' : ''}.<br />
              You'll receive email updates on status changes.
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Raise a Query</div>
              <button 
                onClick={onClose} 
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: 22, 
                  cursor: "pointer", 
                  color: "#999", 
                  lineHeight: 1 
                }}
              >×</button>
            </div>

            {error && (
              <div style={{ 
                background: "#fef0ef", 
                color: "#e74c3c", 
                padding: "10px 14px", 
                borderRadius: 9, 
                fontSize: 13, 
                marginBottom: 16 
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>
                Title <span style={{ color: "#e74c3c" }}>*</span>
              </label>
              <input 
                style={inputStyle} 
                value={form.title} 
                onChange={set("title")} 
                placeholder="Briefly describe your issue" 
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>Category</label>
                <select style={inputStyle} value={form.category} onChange={set("category")}>
                  {["Scholarship","Attendance","Exam","Internship","Mentoring","Administrative","Other"].map(c => 
                    <option key={c}>{c}</option>
                  )}
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
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>
                  Department (Optional)
                </label>
                <select style={inputStyle} value={form.department} onChange={set("department")}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            )}

            {/* Faculty Selection */}
            <div style={{ marginBottom: 16, position: "relative" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>
                Assign to Faculty <span style={{ color: "#e74c3c" }}>*</span>
              </label>
              
              {/* Selected Faculties */}
              {selectedFacultiesDetails.length > 0 && (
                <div style={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: 8, 
                  marginBottom: 8, 
                  padding: "8px", 
                  background: "#f5f5f5", 
                  borderRadius: 8 
                }}>
                  {selectedFacultiesDetails.map(faculty => (
                    <div 
                      key={faculty.id} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 6, 
                        background: "#1a1a2e", 
                        color: "#fff", 
                        padding: "5px 10px", 
                        borderRadius: 6, 
                        fontSize: 12, 
                        fontWeight: 600 
                      }}
                    >
                      <span>{faculty.name}</span>
                      {faculty.department && (
                        <span style={{ opacity: 0.7, fontSize: 11 }}>({faculty.department})</span>
                      )}
                      <button 
                        onClick={() => removeFaculty(faculty.id)}
                        style={{ 
                          background: "none", 
                          border: "none", 
                          color: "#fff", 
                          cursor: "pointer", 
                          fontSize: 16, 
                          lineHeight: 1, 
                          padding: 0 
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <input
                type="text"
                style={inputStyle}
                placeholder="Search faculty by name or department..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                onFocus={() => setShowFacultyDropdown(true)}
                onBlur={() => setTimeout(() => setShowFacultyDropdown(false), 200)}
              />

              {/* Dropdown */}
              {showFacultyDropdown && filteredFaculties.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 9,
                  marginTop: 4,
                  maxHeight: 200,
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 10
                }}>
                  {filteredFaculties.map(faculty => (
                    <div
                      key={faculty.id}
                      onClick={() => toggleFacultySelection(faculty.id)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        background: form.assignedFaculty.includes(faculty.id) ? "#e3f2fd" : "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                      onMouseEnter={(e) => {
                        if (!form.assignedFaculty.includes(faculty.id)) {
                          e.currentTarget.style.background = "#f5f5f5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!form.assignedFaculty.includes(faculty.id)) {
                          e.currentTarget.style.background = "#fff";
                        }
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                          {faculty.name}
                        </div>
                        {faculty.department && (
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                            {faculty.department}
                          </div>
                        )}
                      </div>
                      {form.assignedFaculty.includes(faculty.id) && (
                        <span style={{ color: "#1976d2", fontSize: 16 }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 }}>
                Description <span style={{ color: "#e74c3c" }}>*</span>
              </label>
              <textarea 
                rows={4} 
                style={{ ...inputStyle, resize: "vertical" }} 
                value={form.description} 
                onChange={set("description")} 
                placeholder="Provide full details about your query..." 
              />
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={submitting} 
              style={{
                width: "100%", 
                padding: "13px", 
                background: submitting ? "#ccc" : "#1a1a2e",
                color: "#fff", 
                border: "none", 
                borderRadius: 10, 
                fontSize: 15, 
                fontWeight: 700, 
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Query →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
