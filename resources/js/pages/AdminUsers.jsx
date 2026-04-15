import React, { useEffect, useState } from 'react';
import api from '../api';
import PageTransition from '../components/PageTransition';

const roleBadge = { paciente: 'bg-cyan-100 text-cyan-700', doctor: 'bg-emerald-100 text-emerald-700', admin: 'bg-purple-100 text-purple-700' };

export default function AdminUsers() {
    const [users, setUsers] = useState({ data: [] });
    const load = (url = '/admin/users') => api.get(url).then(r => setUsers(r.data));
    useEffect(() => { load(); }, []);

    const changeRole = async (userId, role) => {
        await api.patch(`/admin/users/${userId}/role`, { role });
        load();
    };

    return (
        <PageTransition>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Administracion de Usuarios</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Usuario</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3">Rol</th>
                                <th className="px-4 py-3">Alertas</th>
                                <th className="px-4 py-3">Vitales</th>
                                <th className="px-4 py-3">Cambiar Rol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data?.map(u => (
                                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadge[u.role]}`}>{u.role}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">{u.alerts_count}</td>
                                    <td className="px-4 py-3 text-center">{u.vital_signs_count}</td>
                                    <td className="px-4 py-3 text-center">
                                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-cyan-500 outline-none">
                                            <option value="paciente">Paciente</option>
                                            <option value="doctor">Doctor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
}
