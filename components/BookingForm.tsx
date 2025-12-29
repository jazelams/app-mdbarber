"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, User, Clock, Scissors, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import ServiceCalendar from "./ServiceCalendarComponent";
import Modal from "./Modal";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Definición de la interfaz Servicio
interface Service {
    id: string;        // ID único del servicio
    nombre: string;    // Nombre del servicio (ej: "Corte de Cabello")
    precio: number;    // Precio en MXN
    duracion: number;  // Duración en minutos
    imagenUrl?: string;   // URL de la imagen (Opcional)
}

// Interfaz para las reglas de calendario (días cerrados y bloqueos)
interface ScheduleRules {
    closedDays: number[]; // Días de la semana cerrados (0-6)
    bloqueos: { start: string; end: string; motivo?: string }[]; // Fechas bloqueadas
}

export default function BookingForm() {
    const router = useRouter(); // Hook para navegación

    // Estados principales
    const [services, setServices] = useState<Service[]>([]); // Lista de servicios disponibles
    const [scheduleRules, setScheduleRules] = useState<ScheduleRules>({ closedDays: [], bloqueos: [] }); // Reglas de horario

    // Estado de control del flujo del formulario (Pasos 1, 2, 3, 4)
    const [step, setStep] = useState(1);

    // Estados de UI (Carga, Error, Éxito)
    const [loading, setLoading] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false); // Estado de carga para horarios
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    // Stripe State
    const [clientSecret, setClientSecret] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'local'>('card'); // 'card' or 'local'

    // Estado del formulario con todos los datos de la reserva
    const [formData, setFormData] = useState({
        serviceId: "",       // ID del servicio seleccionado
        date: "",            // Fecha seleccionada (YYYY-MM-DD)
        time: "",            // Hora seleccionada (HH:mm)
        nombreCliente: "",   // Nombre del cliente
        telefonoCliente: "", // Teléfono del cliente
        stripePaymentId: "", // ID de pago (se llena al pagar)
    });
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Horarios disponibles para la fecha seleccionada
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    // Cargar Usuario si existe sesión
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setCurrentUserId(data.user.id);
                    setFormData(prev => ({
                        ...prev,
                        nombreCliente: data.user.nombre,
                        telefonoCliente: data.user.telefono || ""
                    }));
                }
            })
            .catch(() => { }); // Ignorar error si no hay sesión
    }, []);

    // Efecto secundario: Buscar horarios disponibles cuando cambian fecha o servicio
    useEffect(() => {
        if (formData.date && formData.serviceId) {
            setAvailableSlots([]); // Limpiar horarios anteriores
            setLoadingSlots(true); // Iniciar carga

            // Llamada al API para obtener slots disponibles
            fetch(`/api/availability?date=${formData.date}&serviceId=${formData.serviceId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setAvailableSlots(data); // Guardar horarios si la respuesta es un array
                    } else {
                        setAvailableSlots([]); // Array vacío si hay error o no hay disponibilidad
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingSlots(false)); // Finalizar carga
        }
    }, [formData.date, formData.serviceId]);

    // Efecto de carga inicial: Obtener servicios y reglas del negocio (días cerrados)
    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Obtener Servicios
                const resServices = await fetch('/api/services');
                if (resServices.ok) {
                    const data = await resServices.json();
                    setServices(data);
                }

                // 2. Obtener Reglas de Horario (Días bloqueados en backend)
                const resRules = await fetch('/api/settings/schedule-rules');
                if (resRules.ok) {
                    const data = await resRules.json();
                    setScheduleRules(data);
                }
            } catch (error) {
                console.error('Error cargando datos iniciales', error);
            }
        }
        fetchData();
    }, []);

    // Paso intermedio: Crear Intento de Pago O Guardar Directo si es Local
    const handleGoToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const selectedService = services.find(s => s.id === formData.serviceId);
            if (!selectedService) throw new Error("Servicio no encontrado");

            if (paymentMethod === 'local') {
                // Si es pago local, guardamos directo SIN Stripe
                // Simulamos que paymentId es "PENDIENTE_EN_LOCAL" para que el backend sepa (o null)
                // Pero tu backend espera opcional stripePaymentId, así que lo dejamos vacío o ponemos una nota.
                // Reutilizamos la función de éxito pasándole un string vacío o especial.
                await handlePaymentSuccess("PAGO_EN_LOCAL");
                return; // Salimos, handlePaymentSuccess se encarga del resto
            }

            // Si es TARJETA, vamos a Stripe
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: selectedService.precio }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error iniciando pago");
            }

            const data = await res.json();
            setClientSecret(data.clientSecret);
            setStep(4); // Mover al paso de pago
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Manejador FINAL: Guardar Cita después del pago exitoso
    const handlePaymentSuccess = async (paymentId: string) => {
        setLoading(true);

        // Actualizamos el formData con el paymentId, pero como setState es asíncrono,
        // creamos el objeto final aquí para enviarlo
        const finalData = {
            ...formData,
            stripePaymentId: paymentId,
            clienteId: currentUserId // Vincular al usuario logueado
        };

        try {
            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData),
            });

            const data = await response.json();

            if (!response.ok) {
                // OJO: Si falla aquí, el cliente YA PAGÓ pero la cita falló.
                // En producción deberías tener un mecanismo para reembolsar o avisar a soporte.
                throw new Error(data.error || "Error al guardar reserva (Pago recibido)");
            }

            // IMPORTANTE: Actualizamos el estado local para que la UI final lo refleje
            setFormData(finalData);
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
                <p className="text-zinc-400 mb-6">
                    {formData.stripePaymentId === 'PAGO_EN_LOCAL'
                        ? "Tu cita ha sido agendada. Recuerda pagar en el local."
                        : "Tu pago fue procesado y tu cita agendada."}
                </p>

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
                        <div className="flex justify-between pt-2 border-t border-zinc-800 mt-2">
                            <span className="text-zinc-500">Estado:</span>
                            {formData.stripePaymentId !== 'PAGO_EN_LOCAL' ? (
                                <span className="text-[#25D366] font-bold">PAGADO (${selectedService?.precio} MXN)</span>
                            ) : (
                                <span className="text-[#D4AF37] font-bold">PAGO PENDIENTE EN LOCAL</span>
                            )}
                        </div>
                    </div>
                </div>

                <a
                    href={`https://wa.me/529993931893?text=${encodeURIComponent(`Hola, quisiera confirmar mi cita:\n\nCliente: ${formData.nombreCliente}\nTelefono: ${formData.telefonoCliente}\nFecha: ${formData.date}\nHora: ${formData.time}\n\nESTADO: ${formData.stripePaymentId !== 'PAGO_EN_LOCAL' ? `PAGADO ($${selectedService?.precio} MXN)` : 'PAGO PENDIENTE EN LOCAL'}`)}`}
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
                        {step === 4 && "4. Pago Seguro"}
                    </h2>
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-black border border-[#D4AF37]">
                        {step}
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#D4AF37] transition-all duration-500 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
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

                {/* No form tag wrapping everything to avoid nested forms issue with Stripe */}
                <div>
                    {step === 1 && (
                        <div className="grid gap-4">
                            {services.length === 0 && (
                                <p className="text-center text-zinc-500">Cargando servicios...</p>
                            )}
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setFormData({ ...formData, serviceId: service.id })}
                                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between group
                                    ${formData.serviceId === service.id
                                            ? "border-[#D4AF37] bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                            : "border-zinc-900 bg-zinc-900/50 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 overflow-hidden relative border border-zinc-800
                                            ${formData.serviceId === service.id
                                                ? 'bg-black text-[#D4AF37]'
                                                : 'bg-black text-zinc-500 group-hover:bg-black group-hover:text-[#D4AF37]'
                                            }`}>
                                            {service.imagenUrl ? (
                                                <img
                                                    src={service.imagenUrl}
                                                    alt={service.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Scissors className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg transition-colors duration-300
                                                ${formData.serviceId === service.id
                                                    ? 'text-black'
                                                    : 'text-white group-hover:text-black'
                                                }`}>
                                                {service.nombre}
                                            </h3>
                                            <p className={`text-sm transition-colors duration-300
                                                ${formData.serviceId === service.id
                                                    ? 'text-black/80'
                                                    : 'text-zinc-400 group-hover:text-black/80'
                                                }`}>
                                                {service.duracion} min
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-xl transition-colors duration-300
                                        ${formData.serviceId === service.id
                                            ? 'text-black'
                                            : 'text-[#D4AF37] group-hover:text-black'
                                        }`}>
                                        ${service.precio} MXN
                                    </span>
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
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Calendar Column */}
                                <div>
                                    <label className="block text-sm font-bold text-[#D4AF37] mb-3 uppercase tracking-wide">Selecciona Fecha</label>

                                    <button
                                        type="button"
                                        onClick={() => setShowCalendar(true)}
                                        className={`w-full py-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300
                                            ${formData.date
                                                ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                                            }`}
                                    >
                                        <CalendarIcon className="w-8 h-8" />
                                        <span className="font-bold text-lg">
                                            {formData.date
                                                ? formData.date
                                                : "Elegir Fecha"
                                            }
                                        </span>
                                        {formData.date && <span className="text-xs font-bold uppercase tracking-wider opacity-60">Cambiar</span>}
                                    </button>

                                    <Modal
                                        isOpen={showCalendar}
                                        onClose={() => setShowCalendar(false)}
                                        title="Selecciona una Fecha"
                                    >
                                        <ServiceCalendar
                                            selectedDate={formData.date}
                                            onDateSelect={(date) => {
                                                setFormData({ ...formData, date, time: '' });
                                                setShowCalendar(false);
                                            }}
                                            closedDays={scheduleRules.closedDays}
                                            bloqueos={scheduleRules.bloqueos}
                                        />
                                    </Modal>
                                </div>

                                {/* Time Column */}
                                <div>
                                    <label className="block text-sm font-bold text-[#D4AF37] mb-3 uppercase tracking-wide">Selecciona Hora</label>

                                    {!formData.date ? (
                                        <div className="h-40 flex flex-col items-center justify-center bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-800 text-zinc-600">
                                            <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-sm">Primero elige una fecha</p>
                                        </div>
                                    ) : loadingSlots ? (
                                        <div className="h-40 flex flex-col items-center justify-center text-zinc-500 animate-pulse">
                                            <Clock className="w-6 h-6 mb-2 animate-spin" />
                                            <p className="text-sm">Buscando horarios...</p>
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                                        <div className="text-red-400 text-sm p-4 bg-red-900/10 rounded-xl border border-red-900/20 text-center flex flex-col items-center gap-2">
                                            <AlertCircle className="w-6 h-6" />
                                            <p className="font-bold">Sin Disponibilidad</p>
                                            <p className="text-xs opacity-70">No hay horarios disponibles para esta fecha. Intenta otro día.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-zinc-900">
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
                        <form onSubmit={handleGoToPayment} className="space-y-6">
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
                                            const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            let formatted = raw;
                                            if (raw.length > 4) formatted = raw.slice(0, 4) + '-' + raw.slice(4);
                                            if (raw.length > 6) formatted = formatted.slice(0, 7) + '-' + raw.slice(6);
                                            if (raw.length > 8) formatted = formatted.slice(0, 10) + '-' + raw.slice(8);
                                            setFormData({ ...formData, telefonoCliente: formatted });
                                        }}
                                        value={formData.telefonoCliente}
                                    />
                                </div>
                                <p className="text-xs text-zinc-600 mt-2 text-center uppercase font-bold">Formato automático: 10 dígitos</p>
                            </div>

                            {/* Selección de Método de Pago */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-500 mb-4 uppercase">Método de Pago</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')} // Necesitamos crear este estado
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                                            ${paymentMethod === 'card'
                                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                    >
                                        <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-[#D4AF37]' : 'text-zinc-600'}`} />
                                        <span className="font-bold text-sm">Pago Online</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('local')}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                                            ${paymentMethod === 'local'
                                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black ${paymentMethod === 'local' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-zinc-600 text-zinc-600'}`}>$</div>
                                        <span className="font-bold text-sm">Efectivo en Local</span>
                                    </button>
                                </div>
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
                                    {loading ? 'PROCESANDO...' : (paymentMethod === 'card' ? 'IR A PAGAR' : 'CONFIRMAR RESERVA')}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 4 && clientSecret && (
                        <div className="space-y-6">
                            <div className="mb-4 text-center">
                                <p className="text-zinc-400 text-sm">Resumen de Cargo:</p>
                                <p className="text-[#D4AF37] font-bold text-3xl">
                                    ${services.find(s => s.id === formData.serviceId)?.precio} MXN
                                </p>
                            </div>

                            <Elements options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#D4AF37' } } }} stripe={stripePromise}>
                                <CheckoutForm
                                    amount={services.find(s => s.id === formData.serviceId)?.precio || 0}
                                    onSuccess={handlePaymentSuccess}
                                />
                            </Elements>

                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="w-full mt-4 py-3 text-zinc-500 hover:text-white text-sm font-bold underline transition-colors"
                            >
                                Cancelar y Volver
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
