import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import PageTransition from '../components/PageTransition';

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminBackups() {
    const [backups, setBackups] = useState([]);
    const [stats, setStats] = useState(null);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(null);
    const [msg, setMsg] = useState('');

    const load = () => {
        api.get('/admin/backups').then(r => setBackups(r.data));
        api.get('/admin/stats').then(r => setStats(r.data));
    };
    useEffect(() => { load(); }, []);

    const createBackup = async () => {
        setCreating(true); setMsg('');
        try {
            await api.post('/admin/backups');
            setMsg('Respaldo creado correctamente');
            load();
        } catch { setMsg('Error al crear respaldo'); }
        finally { setCreating(false); }
    };

    const downloadBackup = async (id) => {
        try {
            const res = await api.get(`/admin/backups/${id}/download`);
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shieldtech-backup-${id}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { setMsg('Error al descargar'); }
    };

    const restoreBackup = async (id) => {
        if (!confirm('Esto reemplazara los datos actuales. Continuar?')) return;
        setRestoring(id); setMsg('');
        try {
            const res = await api.post(`/admin/backups/${id}/restore`);
            setMsg(`Restaurado: ${res.data.documents_restored} documentos`);
            load();
        } catch { setMsg('Error al restaurar'); }
        finally { setRestoring(null); }
    };

    const deleteBackup = async (id) => {
        if (!confirm('Eliminar este respaldo?')) return;
        await api.delete(`/admin/backups/${id}`);
        load();
    };

    return (
        <PageTransition>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Respaldos de Base de Datos</h2>
                    <p className="text-gray-500 text-sm">MongoDB Atlas - ShieldTech</p>
                </div>
                <button onClick={createBackup} disabled={creating}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
                    {creating ? 'Creando...' : 'Crear Respaldo'}
                </button>
            </div>

            {msg && <div className={`text-sm p-3 rounded-xl mb-4 ${msg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg}</div>}

            {/* DB Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {[
                        { label: 'Usuarios', value: stats.users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                        { label: 'Perfiles', value: stats.medical_profiles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Signos Vitales', value: stats.vital_signs, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'Alertas', value: stats.alerts, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Respaldos', value: stats.backups, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className={`${s.bg} rounded-2xl p-3 text-center`}>
                            <div className={`text-2xl font-bold ${s.color}`}>{s.value?.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modelo de BD - colapsable */}
            <details className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-2xl">
                    Modelo de la BD NoSQL (MongoDB) — click para ver
                </summary>
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        {[
                            { name: 'users', fields: '_id, name, email, password, role, doctor_id, created_at' },
                            { name: 'medical_profiles', fields: '_id, user_id, blood_type, gender, allergies, medications, emergency_contacts, insurance, home_gps...' },
                            { name: 'vital_signs', fields: '_id, user_id, heart_rate, blood_pressure, temperature, oxygen_saturation, steps, gps, recorded_at' },
                            { name: 'alerts', fields: '_id, user_id, type, severity, message, gps, resolved, resolved_at' },
                        ].map(c => (
                            <div key={c.name} className="bg-gray-50 rounded-xl p-3">
                                <div className="font-semibold text-gray-800 mb-1">{c.name}</div>
                                <div className="text-gray-500 leading-relaxed">{c.fields}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </details>

            {/* Backups list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Historial de Respaldos</h3>
                </div>
                {backups.length > 0 ? backups.map(b => (
                    <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-50 last:border-0 gap-3">
                        <div>
                            <div className="text-sm font-medium text-gray-800">{b.name}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(b.created_at).toLocaleString('es')} ·
                                {b.total_documents} documentos ·
                                {formatBytes(b.size_bytes)} ·
                                Por: {b.created_by}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {b.collections?.map(c => (
                                    <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{c}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button onClick={() => downloadBackup(b.id)}
                                className="text-xs px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition">
                                Descargar
                            </button>
                            <button onClick={() => restoreBackup(b.id)} disabled={restoring === b.id}
                                className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition disabled:opacity-50">
                                {restoring === b.id ? '...' : 'Restaurar'}
                            </button>
                            <button onClick={() => deleteBackup(b.id)}
                                className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                                Eliminar
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>No hay respaldos aun</p>
                        <p className="text-sm mt-1">Crea tu primer respaldo con el boton de arriba</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
