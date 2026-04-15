import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import PageTransition from '../components/PageTransition';

export default function Vitals() {
    const [vitals, setVitals] = useState({ data: [] });
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const load = (url = '/vitals') => api.get(url).then(r => setVitals(r.data));
    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg('');
        // Filter out empty values before sending
        const payload = {};
        Object.entries(form).forEach(([k, v]) => {
            if (v !== undefined && v !== '' && v !== null) {
                const num = Number(v);
                if (!isNaN(num)) payload[k] = num;
            }
        });
        if (Object.keys(payload).length === 0) { setMsg('Ingresa al menos un valor'); setSaving(false); return; }
        console.log('Enviando payload:', payload);
        try { await api.post('/vitals', payload); setMsg('Registrado'); setForm({}); load(); }
        catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setMsg(Object.values(errors).flat().join(', '));
            } else {
                setMsg(err.response?.data?.message || 'Error al guardar');
            }
        }
        finally { setSaving(false); }
    };

    const set = (key) => (e) => {
        const val = e.target.value;
        if (val === '') {
            const next = {...form};
            delete next[key];
            setForm(next);
        } else {
            setForm({...form, [key]: val});
        }
    };

    return (
        <PageTransition>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Signos Vitales</h2>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Nuevo Registro</h3>
                {msg && <div className={`text-sm p-2 rounded-lg mb-3 ${msg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <input type="number" placeholder="BPM" value={form.heart_rate || ''} onChange={set('heart_rate')}
                        className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                    <input type="number" placeholder="SpO2 %" value={form.oxygen_saturation || ''} onChange={set('oxygen_saturation')}
                        className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                    <input type="number" step="0.1" placeholder="Temp C" value={form.temperature || ''} onChange={set('temperature')}
                        className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                    <input type="number" placeholder="Sistolica" value={form.blood_pressure_systolic || ''} onChange={set('blood_pressure_systolic')}
                        className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                    <input type="number" placeholder="Diastolica" value={form.blood_pressure_diastolic || ''} onChange={set('blood_pressure_diastolic')}
                        className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
                    <button type="submit" disabled={saving}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                        {saving ? '...' : 'Guardar'}
                    </button>
                </form>
            </motion.div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Fecha</th>
                                <th className="px-4 py-3">BPM</th>
                                <th className="px-4 py-3">SpO2</th>
                                <th className="px-4 py-3">Temp</th>
                                <th className="px-4 py-3">Presion</th>
                                <th className="px-4 py-3">Pasos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vitals.data?.map(v => (
                                <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                    <td className="px-4 py-2.5 text-gray-600">{new Date(v.recorded_at).toLocaleString('es')}</td>
                                    <td className="px-4 py-2.5 text-center font-medium">{v.heart_rate ?? '-'}</td>
                                    <td className="px-4 py-2.5 text-center">{v.oxygen_saturation ? `${v.oxygen_saturation}%` : '-'}</td>
                                    <td className="px-4 py-2.5 text-center">{v.temperature ? `${v.temperature} C` : '-'}</td>
                                    <td className="px-4 py-2.5 text-center">{v.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '-'}</td>
                                    <td className="px-4 py-2.5 text-center">{(v.steps || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                            {vitals.data?.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-400">Sin registros aun</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {vitals.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
                        {Array.from({ length: vitals.last_page }, (_, i) => (
                            <button key={i} onClick={() => load(`/vitals?page=${i + 1}`)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${vitals.current_page === i + 1 ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
