import React from 'react';
import { Calendar, DollarSign, Activity } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

export default function ConfigBar({
    monthlyAmount,
    setMonthlyAmount,
    incomeCurrency,
    setIncomeCurrency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isRealTime,
    buyRate,
    sellRate
}) {
    return (
        <div className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Input Section */}
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 group-focus-within:text-blue-600 transition-colors">
                                    Ingreso Mensual
                                </label>
                                <div className="relative">
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                        {incomeCurrency === 'USD' ? '$' : 'Gs'}
                                    </div>
                                    <input
                                        type="number"
                                        value={monthlyAmount}
                                        onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                                        className="pl-8 pr-3 py-1.5 w-32 md:w-44 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Moneda
                                </label>
                                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                    <button
                                        onClick={() => setIncomeCurrency('USD')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${incomeCurrency === 'USD'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        USD
                                    </button>
                                    <button
                                        onClick={() => setIncomeCurrency('PYG')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${incomeCurrency === 'PYG'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        PYG
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block h-8 w-px bg-slate-200"></div>

                        {/* Date Range Inputs */}
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Periodo Analizado</span>
                            <CustomDatePicker
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(start, end) => {
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                            />
                        </div>
                    </div>

                    {/* Exchange Rate Widget */}
                    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 shadow-sm min-w-[140px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">USD / PYG</span>
                            {isRealTime && <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div>
                                <span className="text-slate-400 mr-1">Compra:</span>
                                <span className="font-bold text-slate-700">{typeof buyRate === 'number' ? buyRate.toLocaleString('es-PY') : '-'}</span>
                            </div>
                            <div className="h-3 w-px bg-slate-300"></div>
                            <div>
                                <span className="text-slate-400 mr-1">Venta:</span>
                                <span className="font-bold text-slate-700">{typeof sellRate === 'number' ? sellRate.toLocaleString('es-PY') : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
