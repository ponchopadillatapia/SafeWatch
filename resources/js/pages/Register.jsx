import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'paciente' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.password_confirmation, form.role);
            navigate('/dashboard');
        } catch (err) {
            setErrors(err.response?.data?.errors || { general: ['Error al registrar.'] });
        } finally {
            setLoading(false);
        }
    };

    const set = (key) => (e) => setForm({...form, [key]: e.target.value});

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
            >
                <div className="text-center mb-6">
                    <img src="/images/logo.png" alt="ShieldTech" className="w-24 h-24 mx-auto mb-3 object-contain" />
                    <h1 className="text-2xl font-bold text-gray-800">Crear Cuenta</h1>
                    <p className="text-gray-500 text-sm">Comienza a monitorear tu salud</p>
                </div>

                {errors.general && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{errors.general[0]}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                        <input type="text" required value={form.name} onChange={set('name')}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                        <input type="email" required value={form.email} onChange={set('email')}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select value={form.role} onChange={set('role')}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none">
                            <option value="paciente">Paciente</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input type="password" required value={form.password} onChange={set('password')}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                        <input type="password" required value={form.password_confirmation} onChange={set('password_confirmation')}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none" />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition disabled:opacity-50">
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-cyan-600 hover:underline">Inicia sesión</Link>
                </p>
            </motion.div>
        </div>
    );
}
