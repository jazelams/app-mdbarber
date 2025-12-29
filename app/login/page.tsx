"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Si viene de registro exitoso, puede que queramos mostrar un mensaje especial (opcional)
    }, [registered]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/client-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al iniciar sesión");
            }

            // Redirigir al inicio o al perfil (cuando exista)
            router.push("/");
            router.refresh(); // Actualizar para que la UI sepa que hay sesión

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="z-10 w-full max-w-md">
            <div className="mb-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#D4AF37] mb-6 transition-colors font-bold text-sm uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                </Link>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                    Bienvenido <span className="text-[#D4AF37]">Socio</span>
                </h1>
                <p className="text-zinc-400">Inicia sesión para ver tus citas.</p>
            </div>

            {registered && (
                <div className="mb-6 bg-green-900/30 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Cuenta creada correctamente. Ya puedes entrar.</p>
                </div>
            )}

            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="password"
                                required
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
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Entrar a mi Cuenta"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-zinc-500 text-sm">
                        ¿No tienes cuenta?{' '}
                        <Link href="/registro" className="text-[#D4AF37] hover:underline font-bold">
                            Regístrate Gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 z-0 bg-[url('/fondo-barberia-texture.png')] bg-cover bg-center opacity-20 pointer-events-none" />
            <Suspense fallback={<div className="text-white text-center">Cargando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
