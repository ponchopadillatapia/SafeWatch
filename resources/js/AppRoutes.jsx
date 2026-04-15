import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vitals from './pages/Vitals';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminBackups from './pages/AdminBackups';
import DoctorPatients from './pages/DoctorPatients';
import DoctorPatientDetail from './pages/DoctorPatientDetail';
import Privacy from './pages/Privacy';

function PrivateRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
    return children;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/dashboard" />;
    return children;
}

export default function AppRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                <Route path="/privacidad" element={<Privacy />} />

                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="vitals" element={<Vitals />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
                    <Route path="admin/backups" element={<PrivateRoute roles={['admin']}><AdminBackups /></PrivateRoute>} />
                    <Route path="doctor/patients" element={<PrivateRoute roles={['doctor']}><DoctorPatients /></PrivateRoute>} />
                    <Route path="doctor/patient/:id" element={<PrivateRoute roles={['doctor']}><DoctorPatientDetail /></PrivateRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </AnimatePresence>
    );
}
