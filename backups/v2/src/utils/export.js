// Helper to format currency
const fmt = (val) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(val);
const fmtShort = (val) => {
    if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(2) + 'M';
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toFixed(0);
};

export function exportDashboardToPDF() {
    const data = window.dashboardData;
    if (!data || !data.details) {
        alert("Por favor genera el dashboard primero.");
        return;
    }

    const btn = document.getElementById('btnExport');
    const originalText = btn.innerText;
    btn.innerText = "⏳ Generando Vista...";
    btn.disabled = true;

    // === 1. 构建 CSS Styles (Ported from React/Tailwind) ===
    const styleContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        #pdf-container {
            font-family: 'Inter', system-ui, sans-serif;
            background: #f1f5f9; /* slate-100 */
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            color: #1e293b;
            box-sizing: border-box;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 10000;
        }
        
        .pdf-page {
            background: white;
            width: 210mm;
            min-height: 297mm;
            padding: 0;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            display: flex;
            flex-direction: column;
        }

        .header-bg {
            background: #0f172a; /* slate-900 */
            color: white;
            padding: 2rem 2.5rem;
        }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
            padding: 0 2.5rem;
            margin-top: 2rem;
        }

        .card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
        }

        .card.danger { background: #fef2f2; border-color: #fee2e2; }
        .card.success { background: #ecfdf5; border-color: #d1fae5; }
        
        .kpi-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.05em; }
        .kpi-value { font-size: 22px; font-weight: 700; color: #0f172a; }
        .kpi-sub { font-size: 10px; color: #94a3b8; margin-top: 4px; }
        .trend { font-size: 11px; font-weight: 600; margin-top: 8px; display: flex; align-items: center; gap: 4px; }
        
        /* Charts Section */
        .charts-row {
            display: grid;
            grid-template-columns: 1.8fr 1.2fr;
            gap: 1.5rem;
            padding: 0 2.5rem;
            margin-top: 2rem;
            height: 240px;
        }

        .chart-container {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1.25rem;
            position: relative;
        }

        /* Table Section */
        .table-section {
            padding: 0 2.5rem;
            margin-top: 2rem;
            flex: 1;
        }

        .custom-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }

        .custom-table th {
            text-align: right;
            padding: 8px;
            background: #f8fafc;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
        }
        .custom-table th:first-child { text-align: left; }

        .custom-table td {
            text-align: right;
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            font-family: monospace;
        }
        .custom-table td:first-child { text-align: left; font-family: 'Inter', sans-serif; font-weight: 500; }
        
        .badge { padding: 2px 6px; border-radius: 4px; font-weight: 600; }
        .bg-red { background: #fef2f2; color: #dc2626; }
        .bg-green { background: #ecfdf5; color: #059669; }

        .footer {
            margin-top: auto;
            border-top: 1px solid #e2e8f0;
            padding: 1rem 2.5rem;
            display: flex;
            justify-content: space-between;
            color: #94a3b8;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 600;
        }
    `;

    // === 2. helper para generar gráficos SVG inline ===
    const generateLineChartSVG = (details) => {
        const rates = details.map(d => d.exchangeRate);
        const min = Math.min(...rates) * 0.99;
        const max = Math.max(...rates) * 1.01;
        const width = 500;
        const height = 150;

        const path = rates.map((r, i) => {
            const x = (i / (rates.length - 1)) * width;
            const y = height - ((r - min) / (max - min)) * height;
            return `${x},${y}`;
        }).join(' ');

        return `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; height: 100%; overflow:visible;">
                <polyline points="${path}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="${width}" cy="${height - ((rates[rates.length - 1] - min) / (max - min)) * height}" r="4" fill="#2563eb" />
            </svg>
        `;
    };

    const generateGapChartSVG = (details) => {
        const losses = details.map(d => Math.abs(d.nominalPYG - d.realPYG));
        const max = Math.max(...losses);
        const width = 300;
        const height = 60;

        const path = losses.map((l, i) => {
            const x = (i / (losses.length - 1)) * width;
            const y = height - (l / max) * height;
            return `${x},${y}`;
        }).join(' ');

        return `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; height: 100%; overflow:visible;">
                <path d="M 0,${height} L ${path} L ${width},${height} Z" fill="#fee2e2" opacity="0.5" />
                <polyline points="${path}" fill="none" stroke="#dc2626" stroke-width="2" />
            </svg>
        `;
    };

    // === 3. Build HTML Structure ===
    const container = document.createElement('div');
    container.id = 'pdf-container';

    // Add Style
    const styleEl = document.createElement('style');
    styleEl.innerHTML = styleContent;
    document.head.appendChild(styleEl);

    container.innerHTML = `
        <div class="pdf-page">
            <!-- Header -->
            <div class="header-bg">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div style="color:#10b981; font-weight:700; font-size:11px; margin-bottom:6px; letter-spacing:0.1em;">INFORME DE RENDIMIENTO</div>
                        <h1 style="margin:0; font-size:32px; font-weight:800; letter-spacing:-0.02em;">Análisis de Poder Adquisitivo</h1>
                        <p style="margin:4px 0 0; color:#94a3b8; font-size:14px;">Erosión inflacionaria y proyección USD/PYG</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:10px; color:#94a3b8; font-weight:600; margin-bottom:4px;">VENTANA TEMPORAL</div>
                        <div style="font-size:14px; font-weight:600;">${data.details[0].month} — ${data.details[data.details.length - 1].month}</div>
                        <div style="margin-top:8px; font-size:12px; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px;">
                            Inversión: <b>${fmtShort(data.kpis.initialValue)}</b> /mes
                        </div>
                    </div>
                </div>
            </div>

            <!-- KPIs -->
            <div class="kpi-grid">
                <div class="card danger">
                    <div class="kpi-title">Variación Poder Adq.</div>
                    <div class="kpi-value text-red-600" style="color:#dc2626;">${data.kpis.lossPercent.toFixed(2)}%</div>
                    <div class="trend" style="color:#dc2626;">↓ Pérdida Neta</div>
                </div>
                <div class="card">
                    <div class="kpi-title">Valor Inicial (PYG)</div>
                    <div class="kpi-value">${fmtShort(data.kpis.initialValue)}</div>
                    <div class="kpi-sub">Base histórica (Dic '22)</div>
                </div>
                <div class="card">
                    <div class="kpi-title">Nominal Final</div>
                    <div class="kpi-value" style="color:#2563eb;">${fmtShort(data.kpis.finalNominal)}</div>
                    <div class="kpi-sub">Proyección 2026</div>
                </div>
                <div class="card success">
                    <div class="kpi-title">Valor Real Actualizado</div>
                    <div class="kpi-value" style="color:#059669;">${fmtShort(data.kpis.finalReal)}</div>
                    <div class="trend" style="color:#059669;">Ajustado IPC</div>
                </div>
                <div class="card danger">
                    <div class="kpi-title">Impacto Inflación</div>
                    <div class="kpi-value" style="color:#dc2626;">${fmtShort(data.kpis.loss)}</div>
                    <div class="kpi-sub">Monto evaporado</div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="charts-row">
                <div class="chart-container">
                    <div style="margin-bottom:1rem;">
                        <div style="font-weight:700; color:#1e293b; font-size:14px;">Evolución Tipo de Cambio (USD/PYG)</div>
                        <div style="font-size:11px; color:#64748b;">Histórico y Proyección hasta 2026</div>
                    </div>
                    <div style="height:140px; width:100%;">
                        ${generateLineChartSVG(data.details)}
                    </div>
                </div>
                
                <div class="chart-container">
                    <div style="margin-bottom:1rem;">
                        <div style="font-weight:700; color:#1e293b; font-size:14px;">Poder Adquisitivo</div>
                        <div style="font-size:11px; color:#64748b;">Comparativa Nominal vs Real</div>
                    </div>
                    <!-- Bar Bars inline -->
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px; color:#64748b;">
                                <span>Inicial</span> <span>${fmtShort(data.kpis.initialValue)}</span>
                            </div>
                            <div style="height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                                <div style="height:100%; width:100%; background:#94a3b8;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px; color:#64748b;">
                                <span>Nominal Fin</span> <span>${fmtShort(data.kpis.finalNominal)}</span>
                            </div>
                            <div style="height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                                <div style="height:100%; width:${(data.kpis.finalNominal / data.kpis.initialValue) * 100}%; background:#2563eb;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px; color:#64748b;">
                                <span>Real (Ajustado)</span> <span>${fmtShort(data.kpis.finalReal)}</span>
                            </div>
                            <div style="height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                                <div style="height:100%; width:${(data.kpis.finalReal / data.kpis.initialValue) * 100}%; background:#059669;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:1.5rem;">
                         <div style="font-size:9px; font-weight:700; color:#dc2626; margin-bottom:4px; text-transform:uppercase;">Brecha de Pérdida Mensual</div>
                         <div style="height:40px;">
                            ${generateGapChartSVG(data.details)}
                         </div>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="table-section">
                <div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                    <div style="width:6px; height:6px; background:#475569; border-radius:50%;"></div>
                    Desglose Histórico Completo
                </div>
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>T. Cambio</th>
                            <th>Nominal (Gs)</th>
                            <th>Inflación</th>
                            <th>Real (Gs)</th>
                            <th>Pérdida (Gs)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.details.map(row => {
        const loss = Math.abs(row.nominalPYG - row.realPYG);
        return `
                                <tr>
                                    <td>${row.month}</td>
                                    <td>${row.exchangeRate.toLocaleString('es-PY')}</td>
                                    <td>${fmt(row.nominalPYG)}</td>
                                    <td>${(row.cumulativeInflationFactor || 1).toFixed(4)}</td>
                                    <td><span class="badge bg-green">${fmt(row.realPYG)}</span></td>
                                    <td><span class="badge bg-red">-${fmt(loss)}</span></td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div>Análisis Financiero Privado</div>
                <div>Creado y Desarrollado por Julian C Galotto © 2025 • ${new Date().toLocaleDateString()}</div>
            </div>
        </div>
    `;

    document.body.appendChild(container);
    window.scrollTo(0, 0);

    // === 4. Capture ===
    btn.innerText = "📸 Capturando PDF...";

    // Use html2pdf with strict settings
    setTimeout(() => {
        const filename = `InformePA_${new Date().toISOString().slice(0, 10)}.pdf`;
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true,
                scrollY: 0,
                windowWidth: container.offsetWidth,
                windowHeight: container.offsetHeight
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(container).save().then(() => {
            document.body.removeChild(container);
            styleEl.remove();
            btn.innerText = originalText;
            btn.disabled = false;
        }).catch(err => {
            console.error(err);
            alert("Error al exportar.");
            document.body.removeChild(container);
            styleEl.remove();
            btn.innerText = originalText;
            btn.disabled = false;
        });
    }, 1500); // 1.5s delay to ensure fonts load and render
}
