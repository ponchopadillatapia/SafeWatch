import React, { useEffect, useState } from 'react';
import api from '../api';
import PageTransition from '../components/PageTransition';

const typeLabels = { sos: 'SOS', heart_rate: 'Ritmo cardiaco', oxygen: 'Oxigeno', temperature: 'Temperatura', blood_pressure: 'Presion', fall_detected: 'Caida' };
const sevColors = { critical: 'bg-red-500', high: 'bg-amber-500', medium: 'bg-cyan-500', low: 'bg-emerald-500' };

export default function Alerts() {
    const [alerts, setAlerts] = useState({ data: [] });
    const load = (url = '/alerts') => api.get(url).then(r => setAlerts(r.data));
    useEffect(() => { load(); }, []);

    const resolve = async (id) => { await api.patch(`/alerts/${id}/resolve`); load(); };

    const sendSOS = async () => {
        if (!confirm('Enviar alerta SOS?')) return;
        await api.post('/alerts/sos', {});
        load();
    };

    return (
        <PageTransition>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Alertas</h2>
                <button onClick={sendSOS}
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs btn-sos-pulse shadow-lg">
                    SOS
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {alerts.data?.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${sevColors[a.severity]}`}>
                                {a.type === 'sos' ? '!' : a.type.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold text-white ${sevColors[a.severity]}`}>
                                        {a.severity.toUpperCase()}
                                    </span>
                                    <span className="text-sm text-gray-800">{a.message}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(a.created_at).toLocaleString('es')}
                                    {a.latitude && (
                                        <a href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                                            target="_blank" rel="noopener" className="ml-2 text-cyan-600 hover:underline">
                                            Ver ubicacion
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            {a.resolved ? (
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Resuelta</span>
                            ) : (
                                <button onClick={() => resolve(a.id)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition">
                                    Resolver
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {alerts.data?.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg font-medium">Todo en orden</p>
                        <p className="text-sm mt-1">No hay alertas registradas</p>
                    </div>
                )}
                {alerts.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
                        {Array.from({ length: alerts.last_page }, (_, i) => (
                            <button key={i} onClick={() => load(`/alerts?page=${i + 1}`)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${alerts.current_page === i + 1 ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
