"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Save, ArrowLeft, Check } from "lucide-react";

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
                const fullWeek = DAYS.map((_, index) => ({
                    diaSemana: index,
                    horaInicio: "09:00",
                    horaFin: "18:00",
                    activo: index !== 0 // Domingo cerrado por defecto
                }));

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

    // --- Quick Config State ---
    const [quickConfig, setQuickConfig] = useState({
        startTime: "09:00",
        endTime: "18:00",
        active: true
    });
    // Array of selected day indexes (0-6)
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // L-V default
    const [applyingBulk, setApplyingBulk] = useState(false);

    const toggleDaySelection = (dayIndex: number) => {
        setSelectedDays(prev =>
            prev.includes(dayIndex)
                ? prev.filter(d => d !== dayIndex)
                : [...prev, dayIndex]
        );
    };

    const handleBulkApply = async () => {
        if (selectedDays.length === 0) {
            alert("Selecciona al menos un día para aplicar los cambios.");
            return;
        }

        setApplyingBulk(true);
        try {
            const updates: ScheduleDay[] = [];

            selectedDays.forEach(dayIndex => {
                updates.push({
                    diaSemana: dayIndex,
                    horaInicio: quickConfig.startTime,
                    horaFin: quickConfig.endTime,
                    activo: quickConfig.active
                });
            });

            // Execute updates to backend
            await Promise.all(updates.map(day =>
                fetch('/api/admin/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(day)
                })
            ));

            // Refresh local state without reloading
            const newSchedules = [...schedules];
            updates.forEach(update => {
                newSchedules[update.diaSemana] = update;
            });
            setSchedules(newSchedules);

            alert("Horarios aplicados correctamente a los días seleccionados.");
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
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/admin/dashboard" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Gestionar Horarios</h1>
                        <p className="text-zinc-500 text-sm">Configura la disponibilidad para cada día de la semana de forma independiente.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {schedules.map((day, index) => (
                        <div
                            key={index}
                            className={`
                                relative overflow-hidden rounded-3xl border transition-all duration-300
                                ${day.activo
                                    ? 'bg-zinc-900/80 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                                    : 'bg-black/50 border-zinc-900 opacity-80'}
                            `}
                        >
                            {/* Header Card */}
                            <div className={`
                                p-4 border-b flex items-center justify-between
                                ${day.activo ? 'border-[#D4AF37]/10 bg-[#D4AF37]/5' : 'border-zinc-800 bg-zinc-900'}
                            `}>
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
                                        ${day.activo ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-zinc-500'}
                                    `}>
                                        {DAYS[day.diaSemana].substring(0, 3).toUpperCase()}
                                    </div>
                                    <span className={`font-bold ${day.activo ? 'text-white' : 'text-zinc-500'}`}>
                                        {DAYS[day.diaSemana]}
                                    </span>
                                </div>
                                <div className={`
                                    px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                    ${day.activo ? 'bg-green-500/20 text-green-500' : 'bg-red-500/10 text-red-500'}
                                `}>
                                    {day.activo ? 'ABIERTO' : 'CERRADO'}
                                </div>
                            </div>

                            {/* Body Card */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {/* Toggle Switch styled as a big button */}
                                    <button
                                        onClick={() => updateState(index, 'activo', !day.activo)}
                                        className={`
                                            w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                                            ${day.activo
                                                ? 'bg-zinc-800 text-zinc-400 hover:bg-red-900/30 hover:text-red-400'
                                                : 'bg-zinc-800 text-zinc-300 hover:bg-green-900/30 hover:text-green-400'}
                                        `}
                                    >
                                        {day.activo ? 'Apagar Día' : 'Activar Día'}
                                    </button>

                                    {/* Time Inputs */}
                                    <div className={`transition-opacity duration-300 ${!day.activo ? 'opacity-25 pointer-events-none filter blur-[1px]' : ''}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-[#D4AF37]" />
                                            <span className="text-xs font-bold text-zinc-500 uppercase">Horario de Atención</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="time"
                                                    value={day.horaInicio}
                                                    onChange={(e) => updateState(index, 'horaInicio', e.target.value)}
                                                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-3 text-white text-center font-mono focus:border-[#D4AF37] outline-none transition-colors"
                                                />
                                            </div>
                                            <span className="text-zinc-600 font-bold">:</span>
                                            <div className="relative flex-1">
                                                <input
                                                    type="time"
                                                    value={day.horaFin}
                                                    onChange={(e) => updateState(index, 'horaFin', e.target.value)}
                                                    className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-3 text-white text-center font-mono focus:border-[#D4AF37] outline-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
                                <button
                                    onClick={() => handleSave(day)}
                                    disabled={saving}
                                    className={`
                                        w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                                        ${day.activo
                                            ? 'bg-[#D4AF37] text-black hover:bg-[#b08d55] shadow-[0_4px_15px_rgba(212,175,55,0.2)]'
                                            : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white'}
                                    `}
                                >
                                    {saving ? 'Guardando...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {day.activo ? 'Guardar Cambios' : 'Guardar Estado'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
