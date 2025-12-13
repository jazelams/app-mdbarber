"use client";

import { useState as useReactState, useEffect as useReactEffect } from "react";
import Link from "next/link";
import { Scissors, Calendar, DollarSign, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface Appointment {
    id: string;
    nombreCliente: string;
    telefonoCliente: string;
    fechaInicio: string;
    estado: string;
    precio: string;
    servicio: {
        nombre: string;
    };
}

interface Stats {
    weekIncome: number;
    monthIncome: number;
    dayIncome: number;
    activeAppointments: number;
}

export default function DashboardPage() {
    const [appointments, setAppointments] = useReactState<Appointment[]>([]);
    const [stats, setStats] = useReactState<Stats>({ weekIncome: 0, monthIncome: 0, dayIncome: 0, activeAppointments: 0 });
    const [loading, setLoading] = useReactState(true);

    // Filter State
    const [period, setPeriod] = useReactState<'overview' | 'custom'>('overview');
    const [customRange, setCustomRange] = useReactState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [filteredStats, setFilteredStats] = useReactState<{ income: number, total: number, completed: number, cancelled: number } | null>(null);

    // Fetch Overview Data
    const fetchOverview = async () => {
        setLoading(true);
        try {
            const [resAppt, resStats] = await Promise.all([
                fetch('/api/admin/appointments'),
                fetch('/api/admin/stats')
            ]);
            if (resAppt.ok) setAppointments(await resAppt.json());
            if (resStats.ok) setStats(await resStats.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Filtered Data
    const fetchFiltered = async () => {
        setLoading(true);
        try {
            const query = `?startDate=${customRange.start}&endDate=${customRange.end}`;
            const [resAppt, resStats] = await Promise.all([
                fetch(`/api/admin/appointments${query}`),
                fetch(`/api/admin/stats${query}`)
            ]);

            if (resAppt.ok) setAppointments(await resAppt.json());
            if (resStats.ok) {
                const data = await resStats.json();
                setFilteredStats({
                    income: data.periodIncome,
                    total: data.totalAppointments,
                    completed: data.completed,
                    cancelled: data.cancelled
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useReactEffect(() => {
        if (period === 'overview') {
            fetchOverview();
        } else {
            fetchFiltered();
        }
    }, [period, customRange]); // Re-fetch when period or range changes

    // Helper to set preset ranges
    const applyPreset = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setCustomRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
        setPeriod('custom');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (!confirm(`¿Estás seguro de marcar esta cita como ${newStatus}?`)) return;

        try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Actualizar estado local
                setAppointments(prev => prev.map(apt =>
                    apt.id === id ? { ...apt, estado: newStatus } : apt
                ));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de ELIMINAR permanentemente esta cita? Esta acción no se puede deshacer.')) return;

        try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setAppointments(prev => prev.filter(apt => apt.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete appointment', error);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Panel de Control</h1>
                        <p className="text-zinc-500 text-sm">Bienvenido, Barbero Principal.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/admin/servicios" className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all text-sm font-bold flex items-center gap-2">
                            <Scissors className="w-4 h-4" /> Servicios
                        </Link>
                        <Link href="/admin/horarios" className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black hover:bg-[#B8860B] transition-all text-sm font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Horarios
                        </Link>
                        <Link href="/" className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all text-sm border border-zinc-800">
                            Ver Web Cliente
                        </Link>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <button
                        onClick={() => setPeriod('overview')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${period === 'overview' ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-800'}`}
                    >
                        Vision General
                    </button>
                    <div className="h-6 w-px bg-zinc-800 mx-2"></div>
                    <button
                        onClick={() => applyPreset(7)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${period === 'custom' && customRange.start ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-zinc-400 hover:bg-zinc-800'}`}
                    >
                        Últimos 7 días
                    </button>
                    <button
                        onClick={() => applyPreset(30)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${period === 'custom' ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-800'}`}
                    >
                        Último Mes
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs font-bold text-zinc-500 uppercase">Rango:</span>
                        <input
                            type="date"
                            value={customRange.start}
                            onChange={(e) => { setCustomRange({ ...customRange, start: e.target.value }); setPeriod('custom'); }}
                            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-[#D4AF37] outline-none"
                            style={{ colorScheme: 'dark' }}
                        />
                        <span className="text-zinc-600">-</span>
                        <input
                            type="date"
                            value={customRange.end}
                            onChange={(e) => { setCustomRange({ ...customRange, end: e.target.value }); setPeriod('custom'); }}
                            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-[#D4AF37] outline-none"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                {period === 'overview' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><DollarSign className="w-5 h-5" /></div>
                                <span className="text-zinc-400 text-sm font-medium">Ingresos Hoy</span>
                            </div>
                            <p className="text-3xl font-bold text-white">${stats.dayIncome} MXN</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl"><DollarSign className="w-5 h-5" /></div>
                                <span className="text-zinc-400 text-sm font-medium">Semanal</span>
                            </div>
                            <p className="text-3xl font-bold text-white">${stats.weekIncome} MXN</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><DollarSign className="w-5 h-5" /></div>
                                <span className="text-zinc-400 text-sm font-medium">Mensual</span>
                            </div>
                            <p className="text-3xl font-bold text-white">${stats.monthIncome} MXN</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><Calendar className="w-5 h-5" /></div>
                                <span className="text-zinc-400 text-sm font-medium">Activas</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.activeAppointments}</p>
                        </div>
                    </div>
                ) : (
                    // Filtered Stats View
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="bg-zinc-900/50 border border-[#D4AF37]/50 p-6 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-[#D4AF37] text-black rounded-xl"><DollarSign className="w-5 h-5" /></div>
                                <span className="text-[#D4AF37] text-sm font-bold">Ingresos del Periodo</span>
                            </div>
                            <p className="text-4xl font-black text-white">${filteredStats?.income || 0} MXN</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
                                <span className="text-zinc-400 text-sm font-medium">Completadas</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{filteredStats?.completed || 0}</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><XCircle className="w-5 h-5" /></div>
                                <span className="text-zinc-400 text-sm font-medium">Canceladas</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{filteredStats?.cancelled || 0}</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-zinc-800 text-zinc-400 rounded-xl"><Calendar className="w-5 h-5" /></div>
                                <span className="text-zinc-400 text-sm font-medium">Total Citas</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{filteredStats?.total || 0}</p>
                        </div>
                    </div>
                )}

                {/* Appointments Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">
                            {period === 'overview' ? 'Últimas Citas' : 'Resultados del Reporte'}
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-950/50 text-zinc-400 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Cliente</th>
                                    <th className="px-6 py-4 font-medium">Servicio</th>
                                    <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                                    <th className="px-6 py-4 font-medium">Precio</th>
                                    <th className="px-6 py-4 font-medium">Estado</th>
                                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-sm">
                                {loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                                            Cargando datos...
                                        </td>
                                    </tr>
                                )}

                                {!loading && appointments.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No se encontraron citas en este periodo.</td>
                                    </tr>
                                )}

                                {appointments.map((apt) => (
                                    <tr key={apt.id} className="text-zinc-300 hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{apt.nombreCliente}</div>
                                            <div className="text-xs text-zinc-500">{apt.telefonoCliente}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Scissors className="w-4 h-4 text-[#D4AF37]" />
                                                {apt.servicio.nombre}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-zinc-400">
                                            {formatDate(apt.fechaInicio)}
                                        </td>
                                        <td className="px-6 py-4 text-[#D4AF37] font-bold">
                                            ${apt.precio} MXN
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                        ${apt.estado === 'PENDIENTE' ? 'bg-yellow-500/10 text-yellow-500' : ''}
                                        ${apt.estado === 'CONFIRMADA' ? 'bg-green-500/10 text-green-500' : ''}
                                        ${apt.estado === 'COMPLETADA' ? 'bg-blue-500/10 text-blue-500' : ''}
                                        ${apt.estado === 'CANCELADA' ? 'bg-red-500/10 text-red-500' : ''}
                                    `}>
                                                {apt.estado === 'PENDIENTE' && <Clock className="w-3 h-3" />}
                                                {(apt.estado === 'CONFIRMADA' || apt.estado === 'COMPLETADA') && <CheckCircle className="w-3 h-3" />}
                                                {apt.estado === 'CANCELADA' && <XCircle className="w-3 h-3" />}
                                                {apt.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {apt.estado !== 'CANCELADA' && apt.estado !== 'COMPLETADA' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(apt.id, 'COMPLETADA')}
                                                            className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
                                                            title="Marcar como Completada"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(apt.id, 'CANCELADA')}
                                                            className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                                            title="Cancelar Cita"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(apt.id)}
                                                    className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-red-500 rounded-lg transition-colors"
                                                    title="Eliminar permanentemente"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div >
        </div >
    );
}
