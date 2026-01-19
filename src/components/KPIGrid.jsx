import React from 'react';
import { TrendingUp, AlertTriangle, ArrowDownRight, Wallet, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function KPIGrid({ kpis }) {
    if (!kpis || Object.keys(kpis).length === 0) return null;

    const incomeCurrency = kpis.incomeCurrency || 'USD';

    const cards = [
        {
            title: incomeCurrency === 'USD' ? "Ingreso Base (USD)" : "Sueldo Nominal (PYG)",
            value: incomeCurrency === 'USD' ? formatCurrency(kpis.initialValueUSD, 'USD') : formatCurrency(kpis.initialValuePYG),
            icon: Wallet,
            color: "text-slate-600",
            bgIcon: "bg-slate-100 text-slate-600",
            trend: "Monto fijo mensual"
        },
        {
            title: incomeCurrency === 'USD' ? "Equivalente Inicial (PYG)" : "Equivalente Inicial (USD)",
            value: incomeCurrency === 'USD'
                ? formatCurrency(kpis.initialValuePYG)
                : formatCurrency(kpis.initialValueUSD, 'USD'),
            icon: DollarSign,
            color: "text-blue-600",
            bgIcon: "bg-blue-50 text-blue-600",
            trend: "Al inicio del periodo"
        },
        {
            title: incomeCurrency === 'USD' ? "Equivalente Final (PYG)" : "Equivalente Final (USD)",
            value: incomeCurrency === 'USD'
                ? formatCurrency(kpis.currentNominalValuePYG)
                : formatCurrency(kpis.currentNominalValueUSD, 'USD'),
            icon: DollarSign,
            color: "text-blue-600",
            bgIcon: "bg-blue-50 text-blue-600",
            trend: "A cotización actual"
        },
        {
            title: "Poder de Compra Real",
            value: formatCurrency(kpis.currentRealValuePYG),
            icon: TrendingUp,
            color: "text-slate-800",
            bgIcon: "bg-indigo-50 text-indigo-600",
            trend: "Ajustado por inflación (IPC)"
        },
        {
            title: "Pérdida de Poder",
            value: formatCurrency(kpis.inflationLoss),
            icon: AlertTriangle,
            color: "text-red-500",
            bgIcon: "bg-red-50 text-red-500",
            trend: "Monto 'evaporado' por IPC",
            isAlert: true
        },
        {
            title: "Erosión Acumulada",
            value: `${formatNumber(kpis.realDevaluation)}%`,
            icon: ArrowDownRight,
            color: "text-red-600",
            bgIcon: "bg-red-50 text-red-600",
            trend: "Pérdida porcentual total",
            isAlert: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${card.bgIcon}`}>
                            <card.icon size={20} />
                        </div>
                        {card.isAlert && (
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">{card.title}</h3>
                        <div className={`text-xl font-bold tracking-tight ${card.color}`}>
                            {card.value}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-tight">
                            {card.trend}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
