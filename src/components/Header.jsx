import React from 'react';
import { Download, Settings } from 'lucide-react';

export default function Header({ onExport }) {
    return (
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 shadow-md text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Branding */}
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            📊 Poder Adquisitivo
                        </h1>
                        <span className="text-xs text-slate-400 font-medium">Monitor de Inflación y Tipo de Cambio</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Exportar PDF</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-all hover:shadow-blue-500/25">
                            <Settings size={16} />
                            <span className="hidden sm:inline">Configurar</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
