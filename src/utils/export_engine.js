// export_engine.js - The definitive PDF export engine V2

const fmt = (val) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(val);
const fmtShort = (val) => {
    if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(2) + 'M';
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toFixed(0);
};

// --- Helper: Generate Chart Image with Chart.js ---
async function generateChartImage(type, data, options, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // Retina scale
    canvas.height = height * 2;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Force white background for the chart image
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const chartConfig = {
        type: type,
        data: data,
        options: {
            ...options,
            animation: false,
            responsive: false,
            devicePixelRatio: 2
        },
        plugins: [{
            id: 'custom_background',
            beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d');
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        }]
    };

    const chart = new Chart(ctx, chartConfig);

    // Wait for fonts to render
    await new Promise(resolve => setTimeout(resolve, 150));

    const image = canvas.toDataURL('image/jpeg', 1.0); // JPEG prevents transparent background issues

    chart.destroy();
    document.body.removeChild(canvas);

    return image;
}

export async function exportDashboardToPDF() {
    const data = window.dashboardData;
    if (!data || !data.details) {
        alert("Por favor genera el dashboard primero.");
        return;
    }

    // DEBUG: Check data keys
    console.log("PDF Export Data Full:", data);
    console.log("First Row:", data.details[0]);

    // Validate Date Property
    const sampleRow = data.details[0];
    if (!sampleRow.date && !sampleRow.month) {
        alert("ERROR CRÍTICO DE DATOS: No se encuentra propiedad de fecha (date/month). Keys disponibles: " + Object.keys(sampleRow).join(", "));
        return;
    }

    const btn = document.getElementById('btnExport');
    const originalText = btn.innerText;
    btn.innerText = "⏳ Generando PDF...";
    btn.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // ================= HEADER =================
        doc.setFillColor(15, 23, 42); // slate-900 (Dark Blue)
        doc.rect(0, 0, pageWidth, 50, 'F');

        doc.setTextColor(16, 185, 129); // emerald-500
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORME DE RENDIMIENTO', margin, 18);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('Análisis de Poder Adquisitivo', margin, 28);

        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Erosión inflacionaria y proyección USD/PYG', margin, 34);

        // Header Info Box (Top Right)
        const boxWidth = 75;
        const boxHeight = 22;
        const boxX = pageWidth - margin - boxWidth;
        const boxY = 14;

        doc.setDrawColor(51, 65, 85); // slate-700 border
        doc.setFillColor(30, 41, 59); // slate-800 bg
        doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

        // Date Range Line
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Ventana:', boxX + 4, boxY + 8);

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        const dateStart = data.details[0].date || data.details[0].month || "Inicio";
        const dateEnd = data.details[data.details.length - 1].date || data.details[data.details.length - 1].month || "Fin";
        doc.text(`${dateStart} — ${dateEnd}`, boxX + 28, boxY + 8);

        // Investment Line
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Inversión:', boxX + 4, boxY + 16);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        // Assuming 1000 USD as user input isn't stored in dashboardData explicitly, defaulting to commonly used or calculating from first row
        const initialUSD = data.details[0].usdAmount || 1000;
        doc.text(`$${initialUSD.toLocaleString('en-US')}.00 USD`, boxX + 28, boxY + 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('/mes', boxX + 57, boxY + 16);


        // ================= KPIS =================
        let yPos = 65;
        const kpiGap = 4;
        const kpiCount = 5;
        const kpiWidth = (contentWidth - ((kpiCount - 1) * kpiGap)) / kpiCount;
        const kpiHeight = 35; // Taller cards

        const kpis = [
            {
                title: 'VARIACIÓN', value: data.kpis.lossPercent.toFixed(2) + '%', sub: 'Pérdida Neta',
                bg: [254, 242, 242], color: [220, 38, 38], borderColor: [254, 202, 202]
            },
            {
                title: 'INICIAL (PYG)', value: fmtShort(data.kpis.initialValue), sub: 'Base Histórica',
                bg: [255, 255, 255], color: [15, 23, 42], borderColor: [226, 232, 240]
            },
            {
                title: 'NOMINAL FINAL', value: fmtShort(data.kpis.finalNominal), sub: 'Proyección \'26',
                bg: [255, 255, 255], color: [37, 99, 235], borderColor: [226, 232, 240]
            },
            {
                title: 'REAL (AJUSTADO)', value: fmtShort(data.kpis.finalReal), sub: 'Poder Real',
                bg: [236, 253, 245], color: [5, 150, 105], borderColor: [167, 243, 208]
            },
            {
                title: 'IMPACTO (PÉRDIDA)', value: fmtShort(data.kpis.loss), sub: 'Monto Evaporado',
                bg: [254, 242, 242], color: [220, 38, 38], borderColor: [254, 202, 202]
            }
        ];

        kpis.forEach((kpi, i) => {
            const x = margin + (i * (kpiWidth + kpiGap));

            doc.setDrawColor(...kpi.borderColor);
            doc.setFillColor(...kpi.bg);
            doc.roundedRect(x, yPos, kpiWidth, kpiHeight, 2, 2, 'FD');

            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.setFont('helvetica', 'bold');
            doc.text(kpi.title, x + (kpiWidth / 2), yPos + 8, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(...kpi.color);
            doc.text(kpi.value, x + (kpiWidth / 2), yPos + 19, { align: 'center' });

            doc.setFontSize(6);
            doc.setTextColor(148, 163, 184);
            doc.setFont('helvetica', 'normal');
            doc.text(kpi.sub, x + (kpiWidth / 2), yPos + 26, { align: 'center' });
        });

        // ================= CHARTS =================
        const chartTopY = yPos + kpiHeight + 10;
        const chartHeight = 70;
        const gap = 10;
        const col1Width = (contentWidth * 0.6) - gap;
        const col2Width = (contentWidth * 0.4);

        // --- Left Container: Exchange Rate ---
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, chartTopY, col1Width, chartHeight, 3, 3, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('Evolución Tipo de Cambio (USD/PYG)', margin + 6, chartTopY + 10);
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Histórico y Proyección hasta 2026', margin + 6, chartTopY + 15);

        // Generate Line Chart
        const exchangeRates = data.details.map(d => d.exchangeRate);
        const minRate = Math.min(...exchangeRates) * 0.95;
        const lineChartImg = await generateChartImage('line', {
            labels: data.details.map(d => d.date || d.month),
            datasets: [{
                data: exchangeRates,
                borderColor: '#2563eb',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.05)'
            }]
        }, {
            layout: { padding: 10 },
            scales: {
                y: {
                    min: minRate,
                    display: true,
                    grid: { display: true, color: '#f1f5f9' },
                    ticks: { font: { size: 10 }, color: '#94a3b8' }
                },
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: { maxTicksLimit: 5, font: { size: 10 }, color: '#94a3b8' }
                }
            },
            plugins: { legend: { display: false } }
        }, 600, 300);

        doc.addImage(lineChartImg, 'JPEG', margin + 2, chartTopY + 18, col1Width - 4, chartHeight - 22);


        // --- Right Container: Purchasing Power (Manually Drawn Progress Bars) ---
        const x2 = margin + col1Width + gap;

        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x2, chartTopY, col2Width, chartHeight, 3, 3, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('Poder Adquisitivo', x2 + 6, chartTopY + 10);

        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Inicio vs Fin (Nominal vs Real)', x2 + 6, chartTopY + 15);

        // MANUAL BARS DRAWING
        const barData = [
            { label: 'Inicial', val: data.kpis.initialValue, color: [148, 163, 184] }, // Slate
            { label: 'Nominal Fin', val: data.kpis.finalNominal, color: [59, 130, 246] }, // Blue
            { label: 'Real (Ajustado)', val: data.kpis.finalReal, color: [16, 185, 129] } // Emerald
        ];

        const barsStartY = chartTopY + 22;
        const maxVal = Math.max(...barData.map(b => b.val));
        const barAreaWidth = col2Width - 12;

        barData.forEach((b, i) => {
            const y = barsStartY + (i * 12);

            // Text Label (Left)
            doc.setFontSize(7);
            doc.setTextColor(71, 85, 105);
            doc.setFont('helvetica', 'bold');
            doc.text(b.label, x2 + 6, y);

            // Value Label (Right)
            doc.text(`Gs. ${b.val.toLocaleString('es-PY')}`, x2 + col2Width - 6, y, { align: 'right' });

            // Bar Background
            doc.setFillColor(241, 245, 249); // slate-100
            doc.roundedRect(x2 + 6, y + 2, barAreaWidth, 4, 1, 1, 'F');

            // Bar Foreground
            const w = (b.val / maxVal) * barAreaWidth;
            doc.setFillColor(...b.color);
            doc.roundedRect(x2 + 6, y + 2, w, 4, 1, 1, 'F');
        });


        // 2. Gap Area Chart (Bottom)
        const gapY = chartTopY + 58;
        doc.setFontSize(7);
        doc.setTextColor(220, 38, 38);
        doc.text('BRECHA DE PÉRDIDA MENSUAL', x2 + 6, gapY);

        const gapData = data.details.map(d => Math.abs(d.nominalPYG - d.realPYG));
        const gapChartImg = await generateChartImage('line', {
            labels: data.details.map(d => ''),
            datasets: [{
                data: gapData,
                borderColor: '#dc2626',
                borderWidth: 1,
                pointRadius: 0,
                fill: true,
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
            }]
        }, {
            layout: { padding: 0 },
            scales: { x: { display: false }, y: { display: false } },
            plugins: { legend: { display: false } }
        }, 400, 80); // Short height

        doc.addImage(gapChartImg, 'JPEG', x2 + 4, gapY + 2, col2Width - 8, 8); // Very compact


        // ================= DATE TABLE =================
        const tableY = chartTopY + chartHeight + 10;
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.text('DESGLOSE HISTÓRICO COMPLETO', margin, tableY);

        const tableBody = data.details.map(row => {
            const loss = Math.abs(row.nominalPYG - row.realPYG);
            return [
                row.date || row.month,
                row.exchangeRate.toLocaleString('es-PY'),
                fmt(row.nominalPYG),
                (row.cumulativeInflationFactor).toFixed(4),
                fmt(row.realPYG),
                '-' + fmt(loss)
            ];
        });

        doc.autoTable({
            startY: tableY + 4,
            head: [['FECHA', 'T. CAMBIO', 'NOMINAL (GS)', 'INFLACIÓN', 'REAL (GS)', 'PÉRDIDA (GS)']],
            body: tableBody,
            theme: 'plain', // Clean theme
            styles: {
                fontSize: 8,
                cellPadding: 3,
                font: 'helvetica',
                lineColor: [226, 232, 240],
                lineWidth: 0,
            },
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [100, 116, 139],
                fontStyle: 'bold',
                halign: 'right'
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold', textColor: [51, 65, 85] }, // Date
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right', textColor: [16, 185, 129], fontStyle: 'bold', fillColor: [240, 253, 244] }, // Green
                5: { halign: 'right', textColor: [239, 68, 68], fillColor: [254, 242, 242] } // Red
            },
            margin: { left: margin, right: margin }
        });

        // ================= FOOTER =================
        const finalY = pageHeight - 12;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, finalY - 5, pageWidth - margin, finalY - 5);

        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Creado y Desarrollado por Julian C Galotto © 2025', pageWidth / 2, finalY, { align: 'center' });

        doc.save(`InformePA_${new Date().toISOString().slice(0, 10)}.pdf`);
        btn.innerText = originalText;
        btn.disabled = false;

    } catch (err) {
        console.error("PDF Export Error:", err);
        alert("Error: " + err.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
