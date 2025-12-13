"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Save, Eye, EyeOff } from "lucide-react";

export default function ConfigPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Completa todos los campos' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al cambiar contraseña' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/admin/dashboard" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Configuración</h1>
                </header>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-[#D4AF37]/10 rounded-full text-[#D4AF37]">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Cambiar Contraseña</h2>
                            <p className="text-sm text-zinc-400">Actualiza tu contraseña de acceso</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                                : 'bg-red-500/10 border border-red-500/50 text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Contraseña Actual</label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pr-10 text-white focus:border-[#D4AF37] outline-none"
                                    placeholder="••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Nueva Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pr-10 text-white focus:border-[#D4AF37] outline-none"
                                    placeholder="••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-zinc-600 mt-1">Mínimo 6 caracteres</p>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Confirmar Nueva Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 pr-10 text-white focus:border-[#D4AF37] outline-none"
                                    placeholder="••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
