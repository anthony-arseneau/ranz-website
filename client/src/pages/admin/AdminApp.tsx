import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';
import ProjectEditor from './ProjectEditor';
import '../../styles/admin.css';

function Gate() {
  const { authed, loading } = useAuth();
  if (loading) {
    return (
      <div className="admin center-screen" style={{ minHeight: '100vh' }}>
        <div className="loader" />
      </div>
    );
  }
  if (!authed) return <Login />;
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="projects/:id" element={<ProjectEditor />} />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
