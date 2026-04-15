import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconGrid, IconHeart, IconBell, IconUser } from './Icons';

const navItems = [
    { to: '/dashboard', icon: <IconGrid />, label: 'Dashboard' },
    { to: '/vitals', icon: <IconHeart />, label: 'Vitales' },
    { to: '/alerts', icon: <IconBell />, label: 'Alertas' },
    { to: '/profile', icon: <IconUser />, label: 'Perfil' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`;

    return (
        <div className="min-h-screen bg-sky-50">
            <nav className="bg-gradient-to-r from-cyan-600 to-cyan-700 sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
                    <NavLink to="/dashboard" className="flex items-center gap-2">
                        <img src="/images/logo.png" alt="ShieldTech" className="w-8 h-8 object-contain" />
                        <span className="text-white font-bold text-lg">ShieldTech</span>
                    </NavLink>

                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map(item => (
                            <NavLink key={item.to} to={item.to} className={linkClass}>
                                {item.icon} {item.label}
                            </NavLink>
                        ))}
                        {user?.role === 'doctor' && (
                            <NavLink to="/doctor/patients" className={linkClass}>Pacientes</NavLink>
                        )}
                        {user?.role === 'admin' && (
                            <>
                                <NavLink to="/admin/users" className={linkClass}>Usuarios</NavLink>
                                <NavLink to="/admin/backups" className={linkClass}>Respaldos</NavLink>
                            </>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-white/70 text-sm">{user?.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white capitalize">{user?.role}</span>
                        <button onClick={handleLogout} className="text-white/70 hover:text-white text-sm">Salir</button>
                    </div>

                    <button className="md:hidden text-white text-xl" onClick={() => setMenuOpen(!menuOpen)}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden bg-cyan-700 px-4 pb-3 space-y-1">
                        <div className="text-white/70 text-sm py-2 border-b border-white/10">{user?.name} ({user?.role})</div>
                        {navItems.map(item => (
                            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded text-sm ${isActive ? 'bg-white/20 text-white' : 'text-white/70'}`}>
                                {item.icon} {item.label}
                            </NavLink>
                        ))}
                        {user?.role === 'doctor' && (
                            <NavLink to="/doctor/patients" onClick={() => setMenuOpen(false)}
                                className="block px-3 py-2 rounded text-sm text-white/70">Pacientes</NavLink>
                        )}
                        {user?.role === 'admin' && (
                            <>
                                <NavLink to="/admin/users" onClick={() => setMenuOpen(false)}
                                    className="block px-3 py-2 rounded text-sm text-white/70">Usuarios</NavLink>
                                <NavLink to="/admin/backups" onClick={() => setMenuOpen(false)}
                                    className="block px-3 py-2 rounded text-sm text-white/70">Respaldos</NavLink>
                            </>
                        )}
                        <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-300">Cerrar sesion</button>
                    </div>
                )}
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
                <Outlet />
            </main>

            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 flex shadow-lg">
                {navItems.map(item => (
                    <NavLink key={item.to} to={item.to}
                        className={({ isActive }) => `flex-1 flex flex-col items-center py-2 text-xs ${isActive ? 'text-cyan-600' : 'text-gray-400'}`}>
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
