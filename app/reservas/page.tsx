import BookingForm from '@/components/BookingForm';

export default function ReservasPage() {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Reserva tu Cita</h1>
                <p className="text-zinc-400">Selecciona el servicio y horario que prefieras.</p>
            </div>

            <BookingForm />

            <div className="mt-8 text-zinc-500 text-sm">
                <a href="/" className="hover:text-[#cca35e] transition-colors">← Volver al Inicio</a>
            </div>
        </div>
    );
}
