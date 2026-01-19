import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, Legend } from 'recharts';
import { formatCurrency, formatNumber } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-slate-200 shadow-lg rounded-lg text-sm">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-slate-500 capitalize">{entry.name}:</span>
                        <span className="font-semibold text-slate-700">
                            {entry.name === 'Tipo de Cambio'
                                ? formatNumber(entry.value)
                                : formatCurrency(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function ChartsSection({ data, currentRate, disableAnimation = false }) {
    if (!data || data.length === 0) return null;

    const incomeCurrency = data[0]?.incomeCurrency || 'USD';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Chart: Purchasing Power Erosion */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800">
                        {incomeCurrency === 'USD' ? 'Erosión del Poder Adquisitivo (Base USD)' : 'Impacto Inflacionario en Sueldo Fijo (Base PYG)'}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {incomeCurrency === 'USD'
                            ? 'Comparativa: Valor Nominal (Azul) vs. Valor Real Ajustado por IPC (Rojo)'
                            : 'Muestra cómo un sueldo fijo en Guaraníes pierde valor real acumulado en el tiempo'}
                    </p>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="formattedDate"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="nominalPYG"
                                name="Valor Nominal"
                                stroke="#2563eb"
                                fillOpacity={1}
                                fill="url(#colorNominal)"
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="realPYG"
                                name="Valor Real"
                                stroke="#ef4444"
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorReal)"
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Secondary Charts Container */}
            <div className="flex flex-col gap-6">
                {/* Exchange Rate Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[280px]">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Tipo de Cambio</h3>
                        <p className="text-xs text-slate-500">Tendencia USD / PYG</p>
                    </div>

                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="formattedDate" hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="stepAfter"
                                    dataKey="exchangeRate"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={!disableAnimation}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* USD Equivalence Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[280px]">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Equivalente Real (USD)</h3>
                        <p className="text-xs text-slate-500">Capacidad de ahorro/compra en dólares</p>
                    </div>

                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorUSD" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="formattedDate" hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="realUSD"
                                    name="Valor en USD"
                                    stroke="#8b5cf6"
                                    fill="url(#colorUSD)"
                                    strokeWidth={2}
                                    isAnimationActive={!disableAnimation}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
