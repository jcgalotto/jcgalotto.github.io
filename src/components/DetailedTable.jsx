import React from 'react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function DetailedTable({ data }) {
    if (!data || data.length === 0) return null;

    const incomeCurrency = data[0]?.incomeCurrency || 'USD';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Desglose Mensual Detallado</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Fecha</th>
                            <th className="px-6 py-3 font-semibold">Nominal (USD)</th>
                            <th className="px-6 py-3 font-semibold">Tipo Cambio</th>
                            <th className="px-6 py-3 font-semibold">Nominal (PYG)</th>
                            <th className="px-6 py-3 font-semibold text-center text-red-400">Factor IPC</th>
                            <th className="px-6 py-3 font-semibold">Real (PYG)</th>
                            <th className="px-6 py-3 font-semibold whitespace-nowrap">Poder Compra (USD)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{row.formattedDate}</td>
                                <td className={`px-6 py-4 font-medium ${incomeCurrency === 'USD' ? 'text-blue-600' : 'text-slate-500'}`}>
                                    {formatCurrency(row.nominalUSD, 'USD')}
                                </td>
                                <td className="px-6 py-4 text-slate-600">{formatNumber(row.exchangeRate)}</td>
                                <td className={`px-6 py-4 font-bold ${incomeCurrency === 'PYG' ? 'text-blue-600' : 'text-slate-500'}`}>
                                    {formatCurrency(row.nominalPYG)}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">{row.inflationFactor.toFixed(4)}</td>
                                <td className={`px-6 py-4 font-bold ${row.realPYG < row.nominalPYG ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {formatCurrency(row.realPYG)}
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.realUSD, 'USD')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
