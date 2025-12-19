"use client";

// Importaciones de librerías para manejo de fechas (date-fns) e iconos
import { useState, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameMonth,
    isToday,
    isBefore,
    startOfDay,
    getDay,
    isWithinInterval
} from 'date-fns';
import { es } from 'date-fns/locale'; // Configuración regional para español
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'; // Iconos de flechas y candado

// Definición de tipos para las props (propiedades) del componente
interface Bloqueo {
    start: string | Date; // Fecha inicio del bloqueo
    end: string | Date;   // Fecha fin del bloqueo
    motivo?: string;      // Razón opcional (ej: "Vacaciones")
}

interface ServiceCalendarProps {
    selectedDate: string;             // Fecha actualmente seleccionada (YYYY-MM-DD)
    onDateSelect: (date: string) => void; // Función que se ejecuta al seleccionar una fecha
    closedDays: number[];             // Array de días cerrados (0=Domingo, 1=Lunes, etc.)
    bloqueos?: Bloqueo[];             // Lista de rangos de fechas bloqueadas
}

export default function ServiceCalendar({ selectedDate, onDateSelect, closedDays = [], bloqueos = [] }: ServiceCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

    const today = startOfDay(new Date());

    // Check if a date is disabled
    const isDateDisabled = (date: Date) => {
        // 1. Past dates
        if (isBefore(date, today)) return true;

        // 2. Closed day of week
        const dayOfWeek = getDay(date);
        if (closedDays.includes(dayOfWeek)) return true;

        // 3. Blocked dates (Bloqueos)
        // Check if date falls within any bloqueo range
        const isBlocked = bloqueos.some(b => {
            const start = new Date(b.start);
            const end = new Date(b.end);
            // Ensure we compare entire days
            return isWithinInterval(date, { start: startOfDay(start), end: startOfDay(end) });
            // Note: Bloqueos might be granular to hours, but typically for "Closed Days" we block full days.
            // If bloqueo is partial day... this logic blocks the Whole day. 
            // Given user request "dia cerrado", blocking whole day is safer/expected for "Vacations".
        });

        if (isBlocked) return true;

        return false;
    };

    return (
        <div className="bg-black/20 border border-zinc-800 rounded-2xl p-6 overflow-hidden select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={handlePrevMonth}
                    disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), startOfMonth(today))}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <h3 className="text-white font-bold text-lg capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>

                <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Días de la semana (Encabezados) */}
            <div className="grid grid-cols-7 mb-4">
                {['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sa'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-zinc-600 uppercase tracking-widest">
                        {d}
                    </div>
                ))}
            </div>

            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                    // Cálculo de estados para cada día
                    const isDisabled = isDateDisabled(day); // ¿Está bloqueado/cerrado?
                    const isSelected = selectedDate === format(day, 'yyyy-MM-dd'); // ¿Está seleccionado por el usuario?
                    const isCurrentMonth = isSameMonth(day, currentMonth); // ¿Pertenece al mes que vemos?
                    const isTodayDate = isToday(day); // ¿Es hoy?

                    return (
                        <div key={idx} className={`relative aspect-square`}>
                            <button
                                type="button"
                                // Solo permite clic si no está deshabilitado
                                onClick={() => !isDisabled && onDateSelect(format(day, 'yyyy-MM-dd'))}
                                disabled={isDisabled}
                                className={`
                                    w-full h-full rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all
                                    ${!isCurrentMonth
                                        ? 'invisible pointer-events-none' // Prioridad absoluta: Si no es del mes, invisible
                                        : isDisabled
                                            ? 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed border border-transparent'
                                            : isSelected
                                                ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110 z-10'
                                                : isTodayDate
                                                    ? 'bg-zinc-800 text-[#D4AF37] border border-[#D4AF37]/50 hover:bg-zinc-700'
                                                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-transparent'
                                    }
                                `}
                            >
                                <span>{format(day, 'd')}</span>
                                {isDisabled && (
                                    <Lock className="w-3 h-3 absolute bottom-1 opacity-50" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Leyenda de colores / Estado */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    <span>Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>No Disponible</span>
                </div>
            </div>
        </div>
    );
}
