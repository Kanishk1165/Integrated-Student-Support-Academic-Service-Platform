import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import ManageQueries from "./pages/admin/ManageQueries";
import ManageUsers from "./pages/admin/ManageUsers";
import Analytics from "./pages/admin/Analytics";
import MyQueries from "./pages/student/MyQueries";
import Profile from "./pages/student/Profile";
import FacultyApprovals from "./pages/admin/FacultyApprovals";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"sans-serif" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "faculty") return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/queries" element={<ProtectedRoute allowedRoles={["student"]}><MyQueries /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><Profile /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/dashboard"  element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/queries"    element={<ProtectedRoute allowedRoles={["admin"]}><ManageQueries /></ProtectedRoute>} />
          <Route path="/admin/users"      element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/analytics"  element={<ProtectedRoute allowedRoles={["admin"]}><Analytics /></ProtectedRoute>} />
          <Route path="/admin/faculty-approvals" element={<ProtectedRoute allowedRoles={["admin"]}><FacultyApprovals /></ProtectedRoute>} />

          {/* Faculty routes */}
          <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty/queries"   element={<ProtectedRoute allowedRoles={["faculty"]}><ManageQueries /></ProtectedRoute>} />
          <Route path="/faculty/analytics" element={<ProtectedRoute allowedRoles={["faculty"]}><Analytics /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
