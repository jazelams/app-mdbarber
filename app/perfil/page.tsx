import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { Calendar, Clock, Scissors, User, LogOut, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me');

async function getClientSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('client_session');

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token.value, SECRET_KEY);
        return payload;
    } catch (error) {
        return null;
    }
}

export default async function ProfilePage() {
    const session = await getClientSession();

    if (!session) {
        redirect('/login');
    }

    const cliente = await prisma.cliente.findUnique({
        where: { id: session.id as string },
        include: {
            citas: {
                include: { servicio: true },
                orderBy: { fechaInicio: 'desc' }
            }
        }
    });

    if (!cliente) redirect('/login');

    const upcomingAppointments = cliente.citas.filter(c => new Date(c.fechaInicio) >= new Date());
    const pastAppointments = cliente.citas.filter(c => new Date(c.fechaInicio) < new Date());

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            <div className="absolute inset-0 z-0 bg-[url('/fondo-barberia-texture.png')] bg-cover bg-center opacity-20 pointer-events-none fixed" />

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex justify-between items-center py-6 border-b border-zinc-800 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-400 uppercase tracking-widest text-xs mb-1">Bienvenido</h1>
                        <h2 className="text-3xl font-black text-[#D4AF37] italic uppercase">{cliente.nombre}</h2>
                    </div>
                    <form action={async () => {
                        'use server';
                        const cookieStore = await cookies();
                        cookieStore.delete('client_session');
                        redirect('/');
                    }}>
                        <button className="bg-zinc-900 border border-zinc-800 p-3 rounded-full hover:bg-red-900/30 hover:border-red-800 hover:text-red-400 transition-all">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </form>
                </header>

                {/* Próximas Citas */}
                <section className="mb-12">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-6 uppercase tracking-wide">
                        <Calendar className="w-5 h-5 text-[#D4AF37]" /> Próximas Citas
                    </h3>

                    {upcomingAppointments.length === 0 ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
                            <p className="text-zinc-500 mb-4">No tienes citas programadas.</p>
                            <Link href="/reservas" className="inline-block bg-[#D4AF37] text-black font-bold py-3 px-6 rounded-full hover:bg-[#b08d55] transition-colors">
                                Reservar Ahora
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingAppointments.map((cita) => (
                                <div key={cita.id} className="bg-zinc-900 border border-[#D4AF37]/50 rounded-2xl p-6 relative overflow-hidden group hover:border-[#D4AF37] transition-all shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                                    <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-xl uppercase">
                                        {cita.stripePaymentId && cita.stripePaymentId !== 'PAGO_EN_LOCAL' ? 'PAGADO' : 'PENDIENTE PAGO'}
                                    </div>

                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-1">{cita.servicio.nombre}</h4>
                                            <p className="text-[#D4AF37] font-bold text-lg">${cita.precio.toString()} MXN</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400">
                                        <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg">
                                            <Calendar className="w-4 h-4 text-zinc-500" />
                                            <span>{new Date(cita.fechaInicio).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg">
                                            <Clock className="w-4 h-4 text-zinc-500" />
                                            <span>{new Date(cita.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                                        <span className={`flex items-center gap-2 text-sm font-bold ${cita.estado === 'CONFIRMADA' ? 'text-green-500' : 'text-zinc-500'}`}>
                                            {cita.estado === 'CONFIRMADA' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {cita.estado}
                                        </span>
                                        {/* Botón de cancelar podría ir aquí en v2 */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Historial */}
                <section>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-500 mb-4 uppercase tracking-wide">
                        <Clock className="w-5 h-5" /> Historial
                    </h3>
                    <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                        {pastAppointments.map((cita) => (
                            <div key={cita.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-white">{cita.servicio.nombre}</p>
                                    <p className="text-xs text-zinc-500">{new Date(cita.fechaInicio).toLocaleDateString()}</p>
                                </div>
                                <span className="text-zinc-600 font-mono text-sm">${cita.precio.toString()}</span>
                            </div>
                        ))}
                        {pastAppointments.length === 0 && (
                            <p className="text-zinc-600 text-sm">No hay citas pasadas.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
