import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import PageTransition from '../components/PageTransition';

const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const genders = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
];

function Input({ label, ...props }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <input {...props} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
        </div>
    );
}

function Section({ title, children, subtitle }) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {title} {subtitle && <span className="text-gray-400 font-normal">{subtitle}</span>}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
        </div>
    );
}

export default function Profile() {
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { api.get('/profile').then(r => setForm(r.data || {})); }, []);

    const set = (key) => (e) => setForm({...form, [key]: e.target.value});
    const setCheck = (key) => (e) => setForm({...form, [key]: e.target.checked});

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setMsg('');
        try { await api.put('/profile', form); setMsg('Perfil actualizado'); }
        catch { setMsg('Error al guardar'); }
        finally { setSaving(false); }
    };

    const getGPS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => setForm({...form, home_latitude: pos.coords.latitude.toFixed(7), home_longitude: pos.coords.longitude.toFixed(7)}),
                () => alert('No se pudo obtener ubicacion')
            );
        }
    };

    return (
        <PageTransition>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Perfil Medico</h2>
            {msg && <div className={`text-sm p-3 rounded-xl mb-4 ${msg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg}</div>}

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <Section title="Informacion Personal">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Sangre</label>
                        <select value={form.blood_type || ''} onChange={set('blood_type')}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                            <option value="">Seleccionar</option>
                            {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Genero</label>
                        <select value={form.gender || ''} onChange={set('gender')}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
                            <option value="">Seleccionar</option>
                            {genders.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                    </div>
                    <Input label="Fecha de Nacimiento" type="date" value={form.birth_date || ''} onChange={set('birth_date')} />
                    <Input label="CURP" value={form.curp || ''} onChange={set('curp')} maxLength={18} style={{textTransform:'uppercase'}} />
                    <Input label="Altura (cm)" type="number" value={form.height || ''} onChange={set('height')} />
                    <Input label="Peso (kg)" type="number" value={form.weight || ''} onChange={set('weight')} />
                </Section>

                <Section title="Seguro Medico">
                    <Input label="Aseguradora" value={form.insurance_provider || ''} onChange={set('insurance_provider')} placeholder="IMSS, ISSSTE..." />
                    <Input label="No. Poliza" value={form.insurance_number || ''} onChange={set('insurance_number')} />
                    <div className="sm:col-span-2">
                        <Input label="Direccion del Hogar" value={form.home_address || ''} onChange={set('home_address')} placeholder="Calle, colonia, ciudad..." />
                    </div>
                    <Input label="Latitud" type="number" step="0.0000001" value={form.home_latitude || ''} onChange={set('home_latitude')} />
                    <div className="flex gap-2">
                        <div className="flex-1"><Input label="Longitud" type="number" step="0.0000001" value={form.home_longitude || ''} onChange={set('home_longitude')} /></div>
                        <button type="button" onClick={getGPS} className="self-end px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm transition" title="Obtener GPS">GPS</button>
                    </div>
                </Section>

                <Section title="Contacto de Emergencia 1">
                    <Input label="Nombre" value={form.emergency_contact_name || ''} onChange={set('emergency_contact_name')} />
                    <Input label="Telefono" type="tel" value={form.emergency_contact_phone || ''} onChange={set('emergency_contact_phone')} />
                    <Input label="Relacion" value={form.emergency_contact_relation || ''} onChange={set('emergency_contact_relation')} />
                </Section>

                <Section title="Contacto de Emergencia 2">
                    <Input label="Nombre" value={form.emergency_contact2_name || ''} onChange={set('emergency_contact2_name')} />
                    <Input label="Telefono" type="tel" value={form.emergency_contact2_phone || ''} onChange={set('emergency_contact2_phone')} />
                    <Input label="Relacion" value={form.emergency_contact2_relation || ''} onChange={set('emergency_contact2_relation')} />
                </Section>

                <Section title="Doctor Familiar" subtitle="(opcional)">
                    <Input label="Nombre" value={form.doctor_name || ''} onChange={set('doctor_name')} placeholder="Dr. ..." />
                    <Input label="Telefono" type="tel" value={form.doctor_phone || ''} onChange={set('doctor_phone')} />
                    <Input label="Especialidad" value={form.doctor_specialty || ''} onChange={set('doctor_specialty')} />
                    <Input label="Hospital / Clinica" value={form.doctor_hospital || ''} onChange={set('doctor_hospital')} />
                </Section>

                <Section title="Informacion Medica">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Alergias</label>
                        <textarea value={form.allergies || ''} onChange={set('allergies')} rows={2}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Penicilina, mariscos..." />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Condiciones Cronicas</label>
                        <textarea value={form.chronic_conditions || ''} onChange={set('chronic_conditions')} rows={2}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Diabetes, hipertension..." />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Medicamentos</label>
                        <textarea value={form.medications || ''} onChange={set('medications')} rows={2}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Metformina 500mg..." />
                    </div>
                </Section>

                <div className="md:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Privacidad y Consentimiento</h3>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={!!form.privacy_accepted} onChange={setCheck('privacy_accepted')}
                            className="mt-1 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                        <span className="text-sm text-gray-600">
                            Acepto el <Link to="/privacidad" target="_blank" className="text-cyan-600 hover:underline">Aviso de Privacidad</Link> y
                            autorizo el tratamiento de mis datos medicos para fines de monitoreo de salud y emergencias.
                        </span>
                    </label>
                    {form.privacy_accepted_at && (
                        <p className="text-xs text-gray-400 mt-2">Aceptado el {new Date(form.privacy_accepted_at).toLocaleString('es')}</p>
                    )}
                </div>

                <div className="md:col-span-2 text-right pb-4">
                    <button type="submit" disabled={saving}
                        className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition disabled:opacity-50">
                        {saving ? 'Guardando...' : 'Guardar Perfil'}
                    </button>
                </div>
            </form>
        </PageTransition>
    );
}
