import React, { forwardRef } from 'react';
import KPIGrid from './KPIGrid';
import ChartsSection from './ChartsSection';
import DetailedTable from './DetailedTable';

// This component is rendered solely for the purpose of exporting to PDF.
// It enforces fixed dimensions and a vertical layout.
const ReportTemplate = forwardRef(({ data, kpis, monthlyAmount, incomeCurrency, startDate, endDate }, ref) => {
    return (
        <div ref={ref} className="bg-white p-8 w-[800px] mx-auto shadow-2xl">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 rounded-t-xl mb-6">
                <h1 className="text-2xl font-bold mb-2">Informe de Poder Adquisitivo</h1>
                <p className="text-slate-400 text-sm">Análisis de erosión inflacionaria y proyección USD/PYG</p>
                <div className="mt-4 flex gap-8 text-sm">
                    <div>
                        <span className="text-slate-500 block text-xs uppercase font-bold">Periodo</span>
                        <span className="font-semibold">{startDate} — {endDate}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block text-xs uppercase font-bold">Monto Analizado</span>
                        <span className="font-semibold">
                            {incomeCurrency === 'USD' ? `$ ${monthlyAmount} USD` : `${monthlyAmount.toLocaleString('es-PY')} Gs.`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Logic - Forced Vertical Stack for PDF */}
            <div className="flex flex-col gap-6">

                {/* KPIs */}
                <KPIGrid kpis={kpis} />

                {/* Main Message */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <p className="text-slate-700 text-sm leading-relaxed text-justify">
                        Este reporte analiza la variación real de su ingreso mensual ajustado por la inflación acumulada (IPC)
                        y la fluctuación del tipo de cambio. Los gráficos a continuación detallan la brecha entre el valor nominal
                        y el poder de compra efectivo en el mercado local.
                    </p>
                </div>

                {/* Charts - Force Layout Override via Props or CSS */}
                <div className="pdf-charts-wrapper">
                    <ChartsSection data={data} currentRate={kpis.currentRate} disableAnimation={true} />
                </div>

                <DetailedTable data={data} />
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
                Generado automáticamente por el Sistema de Monitoreo Financiero • {new Date().toLocaleDateString()}
            </div>
        </div>
    );
});

export default ReportTemplate;
