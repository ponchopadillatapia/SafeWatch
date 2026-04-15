import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import api from '../api';
import PageTransition from '../components/PageTransition';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function DoctorPatientDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/doctor/patients/${id}`).then(r => setData(r.data)).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div></div>;
    if (!data) return <div className="text-center py-20 text-gray-400">Paciente no encontrado</div>;

    const p = data.patient;
    const v = data.latestVitals;
    const vitals = data.vitals || [];
    const mp = p.medical_profile;

    const mkChart = (field, color, label) => ({
        labels: vitals.map(v => new Date(v.recorded_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })),
        datasets: [{ label, data: vitals.map(v => v[field]), borderColor: color, backgroundColor: color + '14', fill: true, tension: 0.4, pointRadius: 2 }],
    });

    const bpChart = {
        labels: vitals.map(v => new Date(v.recorded_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })),
        datasets: [
            { label: 'Sistolica', data: vitals.map(v => v.blood_pressure_systolic), borderColor: '#059669', fill: false, tension: 0.4, pointRadius: 2 },
            { label: 'Diastolica', data: vitals.map(v => v.blood_pressure_diastolic), borderColor: '#d97706', fill: false, tension: 0.4, pointRadius: 2 },
        ],
    };

    const opts = (min, max, legend = false) => ({
        responsive: true,
        plugins: { legend: { display: legend, labels: { boxWidth: 12, font: { size: 11 } } }, tooltip: { mode: 'index' } },
        scales: {
            x: { ticks: { color: '#94a3b8', font: { size: 9 }, maxTicksLimit: 12 }, grid: { color: '#f1f5f9' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#f1f5f9' }, suggestedMin: min, suggestedMax: max },
        },
    });

    return (
        <PageTransition>
            <Link to="/doctor/patients" className="text-cyan-600 hover:underline text-sm mb-4 inline-block">Volver a pacientes</Link>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{p.name}</h2>
                        <p className="text-gray-500 text-sm">{p.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {mp?.blood_type && <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full font-medium">Sangre: {mp.blood_type}</span>}
                        {mp?.gender && <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium capitalize">{mp.gender}</span>}
                        {mp?.birth_date && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{new Date(mp.birth_date).toLocaleDateString('es')}</span>}
                        {mp?.height && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">{mp.height} cm</span>}
                        {mp?.weight && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">{mp.weight} kg</span>}
                    </div>
                </div>
                {(mp?.allergies || mp?.chronic_conditions || mp?.medications) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid sm:grid-cols-3 gap-3 text-sm">
                        {mp?.allergies && <div><span className="text-gray-400 text-xs block">Alergias</span><span className="text-gray-700">{mp.allergies}</span></div>}
                        {mp?.chronic_conditions && <div><span className="text-gray-400 text-xs block">Condiciones</span><span className="text-gray-700">{mp.chronic_conditions}</span></div>}
                        {mp?.medications && <div><span className="text-gray-400 text-xs block">Medicamentos</span><span className="text-gray-700">{mp.medications}</span></div>}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {[
                    { label: 'BPM', value: v?.heart_rate ?? '--', color: 'text-red-600', bg: 'bg-red-50', tag: 'FC' },
                    { label: 'SpO2', value: v?.oxygen_saturation ? `${v.oxygen_saturation}%` : '--', color: 'text-cyan-600', bg: 'bg-cyan-50', tag: 'O2' },
                    { label: 'Temp', value: v?.temperature ? `${v.temperature} C` : '--', color: 'text-amber-600', bg: 'bg-amber-50', tag: 'T' },
                    { label: 'Presion', value: v?.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '--', color: 'text-emerald-600', bg: 'bg-emerald-50', tag: 'PA' },
                    { label: 'Pasos', value: (data.todaySteps || 0).toLocaleString(), color: 'text-indigo-600', bg: 'bg-indigo-50', tag: 'P' },
                ].map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                        <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center text-xs font-bold ${item.color} mx-auto mb-1`}>{item.tag}</div>
                        <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-gray-400 uppercase">{item.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Ritmo Cardiaco</h3>
                    {vitals.length > 0 ? <Line data={mkChart('heart_rate', '#dc2626', 'BPM')} options={opts(50, 130)} /> : <p className="text-gray-400 text-center py-8">Sin datos</p>}
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Oxigenacion</h3>
                    {vitals.length > 0 ? <Line data={mkChart('oxygen_saturation', '#0891b2', 'SpO2')} options={opts(85, 100)} /> : <p className="text-gray-400 text-center py-8">Sin datos</p>}
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Presion Arterial</h3>
                {vitals.length > 0 ? <Line data={bpChart} options={opts(50, 160, true)} /> : <p className="text-gray-400 text-center py-8">Sin datos</p>}
            </motion.div>

            {data.activeAlerts?.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 mb-6">
                    <h3 className="text-sm font-semibold text-red-700 mb-3">Alertas Activas</h3>
                    {data.activeAlerts.map(a => (
                        <div key={a.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold text-white ${
                                a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}>{a.severity.toUpperCase()}</span>
                            <span className="text-sm text-gray-700">{a.message}</span>
                            <span className="text-xs text-gray-400 ml-auto">{new Date(a.created_at).toLocaleString('es')}</span>
                        </div>
                    ))}
                </motion.div>
            )}
        </PageTransition>
    );
}
