import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import PageTransition from '../components/PageTransition';

export default function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [unassigned, setUnassigned] = useState([]);
    const [showAssign, setShowAssign] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = () => {
        Promise.all([api.get('/doctor/patients'), api.get('/doctor/unassigned')])
            .then(([p, u]) => { setPatients(p.data); setUnassigned(u.data); })
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const assign = async (id) => { await api.post('/doctor/assign', { patient_id: id }); load(); };
    const unassign = async (id) => { if (!confirm('Desasignar este paciente?')) return; await api.delete(`/doctor/patients/${id}/unassign`); load(); };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div></div>;

    return (
        <PageTransition>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Mis Pacientes</h2>
                    <p className="text-gray-500 text-sm">{patients.length} paciente{patients.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setShowAssign(!showAssign)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition">
                    {showAssign ? 'Cerrar' : '+ Agregar'}
                </button>
            </div>

            {showAssign && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Pacientes sin doctor</h3>
                    {unassigned.length > 0 ? unassigned.map(u => (
                        <div key={u.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl mb-2">
                            <div>
                                <span className="text-sm font-medium text-gray-800">{u.name}</span>
                                <span className="text-xs text-gray-400 ml-2">{u.email}</span>
                            </div>
                            <button onClick={() => assign(u.id)}
                                className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">Asignar</button>
                        </div>
                    )) : <p className="text-gray-400 text-sm text-center py-4">No hay pacientes disponibles</p>}
                </motion.div>
            )}

            {patients.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((p, i) => {
                        const v = p.latest_vitals;
                        return (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className={`px-4 py-3 flex items-center justify-between ${p.status === 'alerta' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${p.status === 'alerta' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                        <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                                    </div>
                                    {p.active_alerts_count > 0 && (
                                        <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">{p.active_alerts_count} alerta{p.active_alerts_count > 1 ? 's' : ''}</span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="text-center">
                                            <div className={`text-xl font-bold ${v?.heart_rate && (v.heart_rate < 50 || v.heart_rate > 120) ? 'text-red-600' : 'text-gray-800'}`}>{v?.heart_rate ?? '--'}</div>
                                            <div className="text-xs text-gray-400">BPM</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-xl font-bold ${v?.oxygen_saturation && v.oxygen_saturation < 90 ? 'text-red-600' : 'text-gray-800'}`}>{v?.oxygen_saturation ? `${v.oxygen_saturation}%` : '--'}</div>
                                            <div className="text-xs text-gray-400">SpO2</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-gray-800">{v?.temperature ? `${v.temperature} C` : '--'}</div>
                                            <div className="text-xs text-gray-400">Temp</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-gray-800">{v?.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '--'}</div>
                                            <div className="text-xs text-gray-400">Presion</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 mb-3">
                                        {p.medical_profile?.blood_type && <span className="mr-2">Sangre: {p.medical_profile.blood_type}</span>}
                                        {p.medical_profile?.allergies && <span>Alergias: {p.medical_profile.allergies}</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to={`/doctor/patient/${p.id}`}
                                            className="flex-1 text-center text-xs py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition">Ver Detalle</Link>
                                        <button onClick={() => unassign(p.id)}
                                            className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition">Quitar</button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-lg font-medium">Sin pacientes asignados</p>
                    <p className="text-gray-400 text-sm mt-1">Usa el boton "Agregar" para comenzar.</p>
                </div>
            )}
        </PageTransition>
    );
}
