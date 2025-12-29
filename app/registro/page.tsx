"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, Loader2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        telefono: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al registrarse");
            }

            setSuccess(true);
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                router.push("/login?registered=true");
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0 bg-[url('/fondo-barberia-texture.png')] bg-cover bg-center opacity-20 pointer-events-none" />

            <div className="z-10 w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#D4AF37] mb-6 transition-colors font-bold text-sm uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                    </Link>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Únete a la <span className="text-[#D4AF37]">Élite</span>
                    </h1>
                    <p className="text-zinc-400">Crea tu cuenta para gestionar tus citas.</p>
                </div>

                {/* Card */}
                <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta Creada!</h2>
                            <p className="text-zinc-400">Redirigiendo al inicio de sesión...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nombre */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="Juan Pérez"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="tu@correo.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Teléfono (Opcional)</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        type="tel"
                                        className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="999 999 9999"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#D4AF37] transition-colors"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-200 text-sm text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#D4AF37] text-black font-bold py-4 rounded-xl hover:bg-[#b08d55] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 mt-6 uppercase tracking-wide"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Crear Cuenta"}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-6 text-center">
                            <p className="text-zinc-500 text-sm">
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="text-[#D4AF37] hover:underline font-bold">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
