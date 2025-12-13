"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Save, ArrowLeft } from "lucide-react";

interface ScheduleDay {
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    activo: boolean;
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<ScheduleDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/admin/schedule')
            .then(res => res.json())
            .then(data => {
                // 1. Crear estructura base para los 7 días
                const fullWeek = DAYS.map((_, index) => ({
                    diaSemana: index,
                    horaInicio: "09:00",
                    horaFin: "18:00",
                    activo: index !== 0 // Domingo cerrado por defecto
                }));

                // 2. Si hay datos guardados, sobrescribir los días correspondientes
                if (Array.isArray(data)) {
                    data.forEach((savedDay: ScheduleDay) => {
                        const index = savedDay.diaSemana;
                        if (index >= 0 && index < 7) {
                            fullWeek[index] = savedDay;
                        }
                    });
                }

                setSchedules(fullWeek);
                setLoading(false);
            });
    }, []);

    const handleSave = async (day: ScheduleDay) => {
        setSaving(true);
        try {
            await fetch('/api/admin/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(day)
            });
            // Feedback visual simple
            alert(`Horario de ${DAYS[day.diaSemana]} guardado.`);
        } catch (e) {
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const updateState = (index: number, field: keyof ScheduleDay, value: any) => {
        const newSchedules = [...schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setSchedules(newSchedules);
    };

    // State for Quick Config
    const [quickConfig, setQuickConfig] = useState({
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "18:00",
        active: true
    });
    const [applyingBulk, setApplyingBulk] = useState(false);

    const handleBulkApply = async () => {
        if (!quickConfig.startDate || !quickConfig.endDate) {
            alert("Por favor selecciona una fecha de inicio y fin.");
            return;
        }

        setApplyingBulk(true);
        try {
            // Create date objects ensuring local time interpretation (formatting as YYYY-MM-DD usually works with input date)
            const start = new Date(quickConfig.startDate + 'T00:00:00');
            const end = new Date(quickConfig.endDate + 'T00:00:00');

            const daysToUpdate = new Set<number>();

            // Iterate loop
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                daysToUpdate.add(d.getDay());
            }

            const updates: ScheduleDay[] = [];
            daysToUpdate.forEach(dayIndex => {
                updates.push({
                    diaSemana: dayIndex,
                    horaInicio: quickConfig.startTime,
                    horaFin: quickConfig.endTime,
                    activo: quickConfig.active
                });
            });

            // Execute all updates
            await Promise.all(updates.map(day =>
                fetch('/api/admin/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(day)
                })
            ));

            // Refresh local state
            const newSchedules = [...schedules];
            updates.forEach(update => {
                newSchedules[update.diaSemana] = update;
            });
            setSchedules(newSchedules);

            alert("Horarios actualizados correctamente.");
        } catch (error) {
            console.error(error);
            alert("Error al aplicar configuración.");
        } finally {
            setApplyingBulk(false);
        }
    };

    if (loading) return <div className="p-10 text-white text-center">Cargando horarios...</div>;

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/admin/dashboard" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Configurar Horarios</h1>
                </header>

                {/* Quick Config Section */}
                <div className="bg-zinc-900 border border-[#D4AF37]/30 rounded-2xl overflow-hidden mb-8 shadow-lg shadow-[#D4AF37]/5">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950/30">
                        <h2 className="text-xl font-bold text-[#D4AF37] flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Configuración Rápida
                        </h2>
                        <p className="text-zinc-500 text-sm">Selecciona un rango de fechas para aplicar el horario.</p>
                    </div>
                    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5 items-end">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Desde</label>
                            <input
                                type="date"
                                value={quickConfig.startDate}
                                onChange={(e) => setQuickConfig({ ...quickConfig, startDate: e.target.value })}
                                className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-[#D4AF37] w-full"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Hasta</label>
                            <input
                                type="date"
                                value={quickConfig.endDate}
                                onChange={(e) => setQuickConfig({ ...quickConfig, endDate: e.target.value })}
                                className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-[#D4AF37] w-full"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Horario</label>
                            <div className="flex items-center gap-1">
                                <input
                                    type="time"
                                    value={quickConfig.startTime}
                                    onChange={(e) => setQuickConfig({ ...quickConfig, startTime: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white w-full text-sm outline-none focus:border-[#D4AF37]"
                                />
                                <span className="text-zinc-600">-</span>
                                <input
                                    type="time"
                                    value={quickConfig.endTime}
                                    onChange={(e) => setQuickConfig({ ...quickConfig, endTime: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white w-full text-sm outline-none focus:border-[#D4AF37]"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 justify-center pb-3 items-center">
                            <label className="flex items-center gap-2 cursor-pointer" title="Habilitar/Deshabilitar">
                                <span className="text-xs font-bold text-zinc-500 uppercase mr-1">Activo</span>
                                <input
                                    type="checkbox"
                                    checked={quickConfig.active}
                                    onChange={(e) => setQuickConfig({ ...quickConfig, active: e.target.checked })}
                                    className="w-6 h-6 accent-[#D4AF37] rounded cursor-pointer"
                                />
                            </label>
                        </div>
                        <div>
                            <button
                                onClick={handleBulkApply}
                                disabled={applyingBulk}
                                className="w-full bg-[#D4AF37] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#FCC200] transition-colors disabled:opacity-50"
                            >
                                {applyingBulk ? 'Aplicando...' : 'Aplicar'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden s-p-6">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950/30">
                        <h3 className="text-lg font-bold text-white">Días Individuales</h3>
                    </div>
                    <div className="p-6 grid gap-6">
                        {schedules.map((day, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                                <div className="flex items-center gap-4 w-full md:w-1/3">
                                    <input
                                        type="checkbox"
                                        checked={day.activo}
                                        onChange={(e) => updateState(index, 'activo', e.target.checked)}
                                        className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
                                    />
                                    <span className={`font-bold ${day.activo ? 'text-white' : 'text-zinc-500'}`}>{DAYS[day.diaSemana]}</span>
                                    {!day.activo && <span className="text-xs text-red-500 font-medium ml-2">CERRADO</span>}
                                </div>

                                <div className={`flex items-center gap-2 w-full md:w-1/3 ${!day.activo ? 'opacity-30 pointer-events-none' : ''}`}>
                                    <Clock className="w-4 h-4 text-zinc-500" />
                                    <input
                                        type="time"
                                        value={day.horaInicio}
                                        onChange={(e) => updateState(index, 'horaInicio', e.target.value)}
                                        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                                    />
                                    <span className="text-zinc-500">-</span>
                                    <input
                                        type="time"
                                        value={day.horaFin}
                                        onChange={(e) => updateState(index, 'horaFin', e.target.value)}
                                        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-sm"
                                    />
                                </div>

                                <div className="w-full md:w-auto">
                                    <button
                                        onClick={() => handleSave(day)}
                                        disabled={saving}
                                        className="w-full md:w-auto px-4 py-2 bg-zinc-800 hover:bg-[#D4AF37] hover:text-black text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        <Save className="w-4 h-4" />
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
