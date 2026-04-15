import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import api from '../api';
import PageTransition from '../components/PageTransition';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const card = (i) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 } });

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
    }, []);

    const sendSOS = async () => {
        if (!confirm('Enviar alerta SOS?')) return;
        let lat = null, lng = null;
        if (navigator.geolocation) {
            try {
                const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            } catch {}
        }
        await api.post('/alerts/sos', { latitude: lat, longitude: lng });
        api.get('/dashboard').then(r => setData(r.data));
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div></div>;

    const v = data?.latestVitals;
    const hr = data?.heartRateHistory || [];

    const chartData = {
        labels: hr.map(h => new Date(h.recorded_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })),
        datasets: [{
            data: hr.map(h => h.heart_rate),
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220,38,38,0.08)',
            fill: true, tension: 0.4, pointRadius: 3,
        }],
    };

    return (
        <PageTransition>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Hola, {data?.user?.name}</h2>
                    <p className="text-gray-500 text-sm">Tu resumen de salud en tiempo real</p>
                </div>
                <button onClick={sendSOS}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm btn-sos-pulse shadow-lg transition">
                    SOS
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'BPM', value: v?.heart_rate ?? '--', color: 'text-red-600', bg: 'bg-red-50', tag: 'FC' },
                    { label: 'SpO2', value: v?.oxygen_saturation ? `${v.oxygen_saturation}%` : '--', color: 'text-cyan-600', bg: 'bg-cyan-50', tag: 'O2' },
                    { label: 'Temp', value: v?.temperature ? `${v.temperature} C` : '--', color: 'text-amber-600', bg: 'bg-amber-50', tag: 'T' },
                    { label: 'Presion', value: v?.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '--', color: 'text-emerald-600', bg: 'bg-emerald-50', tag: 'PA' },
                ].map((item, i) => (
                    <motion.div key={item.label} {...card(i)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center text-xs font-bold ${item.color}`}>{item.tag}</div>
                            <div>
                                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <motion.div {...card(4)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                    <div className="text-xs text-gray-400 uppercase mb-1">Pasos</div>
                    <div className="text-3xl font-bold text-cyan-600">{(data?.todaySteps || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Hoy</div>
                </motion.div>

                <motion.div {...card(5)} className="md:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Ritmo Cardiaco</h3>
                    {hr.length > 0 ? (
                        <Line data={chartData} options={{
                            responsive: true,
                            plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
                            scales: {
                                x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#f1f5f9' } },
                                y: { ticks: { color: '#94a3b8' }, grid: { color: '#f1f5f9' }, suggestedMin: 50, suggestedMax: 130 },
                            },
                        }} />
                    ) : <p className="text-gray-400 text-center py-8">Sin datos aun</p>}
                </motion.div>
            </div>

            <motion.div {...card(6)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Alertas Activas</h3>
                {data?.activeAlerts?.length > 0 ? data.activeAlerts.map(a => (
                    <div key={a.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold text-white ${
                                a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}>{a.severity.toUpperCase()}</span>
                            <span className="text-sm text-gray-700">{a.message}</span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString('es')}</span>
                    </div>
                )) : <p className="text-gray-400 text-center py-4">Sin alertas activas</p>}
            </motion.div>
        </PageTransition>
    );
}
