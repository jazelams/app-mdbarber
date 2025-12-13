"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Clock, Scissors, CheckCircle, AlertCircle } from "lucide-react";

interface Service {
    id: string;
    nombre: string;
    precio: number;
    duracion: number;
}


export default function BookingForm() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        serviceId: "",
        date: "",
        time: "",
        nombreCliente: "",
        telefonoCliente: "",
    });

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    useEffect(() => {
        if (formData.date && formData.serviceId) {
            setAvailableSlots([]); // Reset hours when date changes
            fetch(`/api/availability?date=${formData.date}&serviceId=${formData.serviceId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setAvailableSlots(data);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [formData.date, formData.serviceId]);

    // Fetch services on mount (simulated for now if API not ready, but we have DB)
    // We'll fetch from a server action or API. Let's use API for simplicity now.
    useEffect(() => {
        async function fetchServices() {
            try {
                const res = await fetch('/api/services');
                if (res.ok) {
                    const data = await res.json();
                    setServices(data);
                }
            } catch (error) {
                console.error('Failed to fetch services', error);
            }
        }
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Find the real ID from DB if we were fetching, but for now we need real IDs 
            // if we want foreign key constraints to work.
            // Since I haven't made the GET endpoint, submitting might fail on FK.
            // I should update this to fetch real services first.

            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al reservar");
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        const selectedService = services.find(s => s.id === formData.serviceId);

        return (
            <div className="bg-zinc-900 border border-[#cca35e] rounded-2xl p-8 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-[#cca35e]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#cca35e]">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Reserva Exitosa!</h2>
                <p className="text-zinc-400 mb-6">Tu cita ha sido agendada correctamente.</p>

                {/* Summary Card */}
                <div className="bg-black/40 rounded-xl p-4 mb-6 text-left border border-zinc-800">
                    <h3 className="text-[#D4AF37] font-bold text-sm uppercase mb-3 border-b border-zinc-800 pb-2">Resumen de Cita</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Cliente:</span>
                            <span className="text-white font-medium">{formData.nombreCliente}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Servicio:</span>
                            <span className="text-white font-medium">{selectedService?.nombre || 'Servicio'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Fecha:</span>
                            <span className="text-white font-medium">{formData.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Hora:</span>
                            <span className="text-white font-medium">{formData.time}</span>
                        </div>
                    </div>
                </div>

                <a
                    href={`https://wa.me/529993931893?text=${encodeURIComponent(`Hola, quisiera confirmar mi cita:\n\n👤 *Nombre:* ${formData.nombreCliente}\n📱 *Teléfono:* ${formData.telefonoCliente}\n📅 *Cita:* ${formData.date} a las *${formData.time}*`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 px-6 rounded-full hover:bg-[#20bd5a] transition-colors mb-4 w-full shadow-[0_0_20px_rgba(37,211,102,0.4)]"
                >
                    <span className="text-xl">💬</span> Confirmar por WhatsApp
                </a>

                <button
                    onClick={() => router.push('/')}
                    className="bg-[#cca35e] text-black font-bold py-3 px-6 rounded-full hover:bg-[#b08d55] transition-colors w-full"
                >
                    OK, Entendido
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header Steps */}
            <div className="bg-black p-6 md:p-8 border-b border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-white uppercase italic">
                        {step === 1 && "1. Elige tu Servicio"}
                        {step === 2 && "2. ¿Cuando vienes?"}
                        {step === 3 && "3. Tus Datos"}
                    </h2>
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-black border border-[#D4AF37]">
                        {step}
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#D4AF37] transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <div className="p-6 md:p-8">
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="grid gap-4">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setFormData({ ...formData, serviceId: service.id })}
                                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group
                                    ${formData.serviceId === service.id
                                            ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                                            : "border-zinc-900 hover:border-zinc-700 bg-zinc-900/50"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.serviceId === service.id ? 'bg-[#D4AF37] text-black' : 'bg-black text-zinc-500'}`}>
                                            <Scissors className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{service.nombre}</h3>
                                            <p className="text-sm text-zinc-400">{service.duracion} min</p>
                                        </div>
                                    </div>
                                    <span className="text-[#D4AF37] font-bold text-xl">${service.precio} MXN</span>
                                </div>
                            ))}
                            <button
                                type="button"
                                disabled={!formData.serviceId}
                                onClick={() => setStep(2)}
                                className="mt-6 w-full py-4 bg-[#D4AF37] text-black font-bold text-lg rounded-xl hover:bg-[#FCC200] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                            >
                                CONTINUAR
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-[#D4AF37] mb-3 uppercase tracking-wide">Selecciona Fecha</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white z-10 pointer-events-none" />
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl pl-12 p-5 text-white text-lg font-medium focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer appearance-none" // appearance-none helps but custom arrow might be needed or standard is fine if contrasted
                                        style={{ colorScheme: 'dark' }} // Forces dark calendar picker in supported browsers
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        value={formData.date}
                                    />
                                    {/* Visual helper text if picker is subtle */}
                                    <p className="text-xs text-zinc-500 mt-2">Haz clic para abrir el calendario</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#D4AF37] mb-3 uppercase tracking-wide">Selecciona Hora</label>
                                {availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {availableSlots.map(h => (
                                            <button
                                                key={h}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, time: h })}
                                                className={`py-3 px-2 rounded-lg text-sm font-bold transition-all border-2
                                                    ${formData.time === h
                                                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] scale-105 shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                                                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                                                    }`}
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-red-400 text-sm p-4 bg-red-900/10 rounded-xl border border-red-900/20 text-center">
                                        {formData.date ? "No hay horarios disponibles para esta fecha." : "Primero selecciona una fecha."}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 py-4 border-2 border-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-900 hover:text-white transition-colors"
                                >
                                    ATRÁS
                                </button>
                                <button
                                    type="button"
                                    disabled={!formData.date || !formData.time}
                                    onClick={() => setStep(3)}
                                    className="w-2/3 py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#FCC200] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                >
                                    SIGUIENTE
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-5 rounded-xl flex items-start gap-4">
                                <Clock className="w-6 h-6 text-[#D4AF37] shrink-0" />
                                <div>
                                    <h4 className="text-[#D4AF37] font-bold mb-1">Tolerancia de 10 minutos</h4>
                                    <p className="text-sm text-zinc-400">
                                        Por respeto a todos los clientes, si llegas tarde tu cita podría ser cancelada automáticamente.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase">Tu Nombre</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Juan Pérez"
                                        className="w-full bg-zinc-900 border-2 border-zinc-900 rounded-xl pl-12 p-4 text-white font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-black transition-all placeholder:text-zinc-700"
                                        onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                                        value={formData.nombreCliente}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-500 mb-2 uppercase">Teléfono</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        required
                                        placeholder="9999-99-99-99"
                                        maxLength={13} // 10 nums + 3 dashes
                                        className="w-full bg-zinc-900 border-2 border-zinc-900 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-black transition-all placeholder:text-zinc-700 text-center tracking-widest text-lg"
                                        onChange={(e) => {
                                            // Strip everything but numbers
                                            const raw = e.target.value.replace(/\D/g, '').slice(0, 10);

                                            // Format as XXXX-XX-XX-XX
                                            let formatted = raw;
                                            if (raw.length > 4) {
                                                formatted = raw.slice(0, 4) + '-' + raw.slice(4);
                                            }
                                            if (raw.length > 6) {
                                                formatted = formatted.slice(0, 7) + '-' + raw.slice(6);
                                            }
                                            if (raw.length > 8) {
                                                formatted = formatted.slice(0, 10) + '-' + raw.slice(8);
                                            }

                                            setFormData({ ...formData, telefonoCliente: formatted });
                                        }}
                                        value={formData.telefonoCliente}
                                    />
                                </div>
                                <p className="text-xs text-zinc-600 mt-2 text-center uppercase font-bold">Formato automático: 10 dígitos</p>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-1/3 py-4 border-2 border-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-900 hover:text-white transition-colors"
                                >
                                    ATRÁS
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.nombreCliente || !formData.telefonoCliente}
                                    className="w-2/3 py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#FCC200] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
                                >
                                    {loading ? 'CONFIRMANDO...' : 'CONFIRMAR RESERVA'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
