import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';
import { formatMonthYear } from '../utils/formatters';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function CustomDatePicker({ startDate, endDate, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse current props to Date objects for easy comparison
    // Format: "YYYY-MM"
    const startYear = parseInt(startDate.split('-')[0]);
    const startMonth = parseInt(startDate.split('-')[1]) - 1;

    const endYear = parseInt(endDate.split('-')[0]);
    const endMonth = parseInt(endDate.split('-')[1]) - 1;

    // View State (Independent navigation)
    const [viewYearStart, setViewYearStart] = useState(startYear);
    const [viewYearEnd, setViewYearEnd] = useState(endYear);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePreset = (preset) => {
        const now = new Date();
        let sDate, eDate = now;

        if (preset === '12m') {
            sDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        } else if (preset === 'YTD') {
            sDate = new Date(now.getFullYear(), 0, 1);
        } else if (preset === 'MAX') {
            sDate = new Date(2022, 0, 1);
        }

        const sStr = formatDate(sDate);
        const eStr = formatDate(eDate);

        onChange(sStr, eStr);

        // Sync view
        setViewYearStart(sDate.getFullYear());
        setViewYearEnd(eDate.getFullYear());
    };

    const handleMonthClick = (monthIndex, panel) => {
        const targetYear = panel === 'start' ? viewYearStart : viewYearEnd;
        const clickedDate = new Date(targetYear, monthIndex, 1);

        const currentStartDate = new Date(startYear, startMonth, 1);
        const currentEndDate = new Date(endYear, endMonth, 1);

        if (panel === 'start') {
            // Logic: If new start is after current end, push end forward by same gap, OR just set to start
            if (clickedDate > currentEndDate) {
                // Option A: Just update start, let end be invalid? No, user hates that.
                // Option B: Push end to start + 1 month
                const newEnd = new Date(targetYear, monthIndex + 1, 1);
                onChange(formatDate(clickedDate), formatDate(newEnd));
                // Update view end if needed
                if (newEnd.getFullYear() !== viewYearEnd) setViewYearEnd(newEnd.getFullYear());
            } else {
                onChange(formatDate(clickedDate), formatDate(currentEndDate));
            }
        } else {
            // Logic: If new end is before start, it's invalid.
            if (clickedDate < currentStartDate) {
                // Just force start to be same as end
                onChange(formatDate(clickedDate), formatDate(clickedDate));
                if (clickedDate.getFullYear() !== viewYearStart) setViewYearStart(clickedDate.getFullYear());
            } else {
                onChange(formatDate(currentStartDate), formatDate(clickedDate));
            }
        }
    };

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    };

    // Helper to check if a specific month button should be highlighted
    const getMonthStatus = (year, monthIndex) => {
        if (year === startYear && monthIndex === startMonth) return 'start';
        if (year === endYear && monthIndex === endMonth) return 'end';

        const current = new Date(year, monthIndex, 1);
        const s = new Date(startYear, startMonth, 1);
        const e = new Date(endYear, endMonth, 1);

        if (current > s && current < e) return 'range';
        return 'none';
    };

    const renderMonthGrid = (panel) => {
        const year = panel === 'start' ? viewYearStart : viewYearEnd;

        return (
            <div className="grid grid-cols-3 gap-2 mt-2">
                {MONTHS.map((m, i) => {
                    const status = getMonthStatus(year, i);
                    return (
                        <button
                            type="button"
                            key={i}
                            onClick={(e) => { e.stopPropagation(); handleMonthClick(i, panel); }}
                            className={clsx(
                                "text-xs py-2 rounded-md transition-all font-bold border",
                                status === 'start' ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105" :
                                    status === 'end' ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105" :
                                        status === 'range' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                            "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-300"
                            )}
                        >
                            {m}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white border border-slate-300 hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all rounded-lg px-3 py-2 text-sm text-slate-700 shadow-sm w-full md:w-auto justify-between"
            >
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="font-semibold">
                        {MONTHS[startMonth]} {startYear} - {MONTHS[endMonth]} {endYear}
                    </span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 z-[9999] w-[340px] md:w-[600px] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header / Presets */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider self-center mr-2">Rápido:</span>
                        <button type="button" onClick={() => handlePreset('12m')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors whitespace-nowrap">Últimos 12 Meses</button>
                        <button type="button" onClick={() => handlePreset('YTD')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors whitespace-nowrap">Año Actual</button>
                        <button type="button" onClick={() => handlePreset('MAX')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors whitespace-nowrap">Histórico Completo</button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Start Panel */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">Desde</span>
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                                    <button type="button" onClick={() => setViewYearStart(y => y - 1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600"><ChevronLeft size={14} /></button>
                                    <span className="text-sm font-bold text-slate-800 w-12 text-center">{viewYearStart}</span>
                                    <button type="button" onClick={() => setViewYearStart(y => y + 1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600"><ChevronRight size={14} /></button>
                                </div>
                            </div>
                            {renderMonthGrid('start')}
                        </div>

                        {/* Divider */}
                        <div className="hidden md:flex flex-col items-center justify-center">
                            <div className="h-full w-px bg-slate-100"></div>
                        </div>

                        {/* End Panel */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">Hasta</span>
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                                    <button type="button" onClick={() => setViewYearEnd(y => y - 1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600"><ChevronLeft size={14} /></button>
                                    <span className="text-sm font-bold text-slate-800 w-12 text-center">{viewYearEnd}</span>
                                    <button type="button" onClick={() => setViewYearEnd(y => y + 1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600"><ChevronRight size={14} /></button>
                                </div>
                            </div>
                            {renderMonthGrid('end')}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            Listo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
