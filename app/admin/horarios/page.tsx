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
                        <p className="text-zinc-500 text-sm">Aplica el mismo horario a múltiples días rápidamente.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* 1. Select Days */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase block mb-3">1. Selecciona los días</label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map((day, index) => {
                                    const isSelected = selectedDays.includes(index);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => toggleDaySelection(index)}
                                            className={`
                                                px-3 py-2 rounded-lg text-sm font-medium transition-all border
                                                ${isSelected
                                                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'}
                                            `}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Configure Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase block mb-3">2. Define el horario</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={quickConfig.startTime}
                                        onChange={(e) => setQuickConfig({ ...quickConfig, startTime: e.target.value })}
                                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-[#D4AF37]"
                                    />
                                    <span className="text-zinc-600">-</span>
                                    <input
                                        type="time"
                                        value={quickConfig.endTime}
                                        onChange={(e) => setQuickConfig({ ...quickConfig, endTime: e.target.value })}
                                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-[#D4AF37]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg hover:border-[#D4AF37]/50 transition-colors" title="Habilitar/Deshabilitar">
                                    <input
                                        type="checkbox"
                                        checked={quickConfig.active}
                                        onChange={(e) => setQuickConfig({ ...quickConfig, active: e.target.checked })}
                                        className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-white">Marcar como abierto</span>
                                </label>

                                <button
                                    onClick={handleBulkApply}
                                    disabled={applyingBulk}
                                    className="flex-1 bg-[#D4AF37] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#FCC200] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {applyingBulk ? 'Aplicando...' : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Aplicar a seleccionados
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950/30">
                        <h3 className="text-lg font-bold text-white">Detalle por Día</h3>
                    </div>
                    <div className="divide-y divide-zinc-800">
                        {schedules.map((day, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 hover:bg-zinc-800/20 transition-colors">
                                <div className="flex items-center gap-4 w-full md:w-1/3">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                        ${day.activo ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-zinc-800 text-zinc-500'}
                                    `}>
                                        {DAYS[day.diaSemana].substring(0, 3)}
                                    </div>
                                    <div>
                                        <span className={`font-bold ${day.activo ? 'text-white' : 'text-zinc-500'}`}>{DAYS[day.diaSemana]}</span>
                                        {!day.activo && <p className="text-xs text-red-500 font-medium">CERRADO</p>}
                                    </div>
                                </div>

                                <div className={`flex items-center gap-2 w-full md:w-1/3 justify-center ${!day.activo ? 'opacity-30 pointer-events-none' : ''}`}>
                                    <input
                                        type="time"
                                        value={day.horaInicio}
                                        onChange={(e) => updateState(index, 'horaInicio', e.target.value)}
                                        className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white text-sm focus:border-[#D4AF37] outline-none"
                                    />
                                    <span className="text-zinc-500">-</span>
                                    <input
                                        type="time"
                                        value={day.horaFin}
                                        onChange={(e) => updateState(index, 'horaFin', e.target.value)}
                                        className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white text-sm focus:border-[#D4AF37] outline-none"
                                    />
                                </div>

                                <div className="w-full md:w-auto flex justify-end gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer md:mr-4">
                                        <span className="text-xs text-zinc-500 uppercase">Abierto</span>
                                        <input
                                            type="checkbox"
                                            checked={day.activo}
                                            onChange={(e) => updateState(index, 'activo', e.target.checked)}
                                            className="w-4 h-4 accent-[#D4AF37]"
                                        />
                                    </label>
                                    <button
                                        onClick={() => handleSave(day)}
                                        disabled={saving}
                                        className="p-2 bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 rounded-lg transition-colors"
                                        title="Guardar cambios individuales"
                                    >
                                        <Save className="w-4 h-4" />
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
