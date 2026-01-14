// export.js - Refactored for reliable PDF generation using jsPDF + Chart.js

const fmt = (val) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(val);
const fmtShort = (val) => {
    if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(2) + 'M';
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toFixed(0);
};

// --- Helper: Generate Chart Image ---
async function generateChartImage(type, data, options, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // Retina scale
    canvas.height = height * 2;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    // Scale for better quality
    ctx.scale(2, 2);

    const chartConfig = {
        type: type,
        data: data,
        options: {
            ...options,
            animation: false, // Important for immediate capture
            responsive: false,
            devicePixelRatio: 2
        }
    };

    const chart = new Chart(ctx, chartConfig);

    // Wait a brief moment to ensure render (sometimes needed even with animation: false for fonts)
    await new Promise(resolve => setTimeout(resolve, 100));

    const image = canvas.toDataURL('image/png', 1.0);

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

    const btn = document.getElementById('btnExport');
    const originalText = btn.innerText;
    btn.innerText = "⏳ Generando Gráficos...";
    btn.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // ================= HEADER =================
        // Dark Header Background
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 50, 'F');

        // Green Tag
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORME DE RENDIMIENTO', margin, 20);

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('Análisis de Poder Adquisitivo', margin, 30);

        // Subtitle
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Erosión inflacionaria y proyección USD/PYG', margin, 36);

        // Info Box (Right)
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('VENTANA TEMPORAL', pageWidth - margin, 20, { align: 'right' });

        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`${data.details[0].month} — ${data.details[data.details.length - 1].month}`, pageWidth - margin, 26, { align: 'right' });

        // ================= KPIS =================
        let yPos = 65;
        const kpiGap = 4;
        const kpiCount = 5;
        const kpiWidth = (contentWidth - ((kpiCount - 1) * kpiGap)) / kpiCount;
        const kpiHeight = 28;

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
                title: 'REAL (AJUSTADO)', value: fmtShort(data.kpis.finalReal), sub: 'Ajustado IPC',
                bg: [236, 253, 245], color: [5, 150, 105], borderColor: [167, 243, 208]
            },
            {
                title: 'IMPACTO (PÉRDIDA)', value: fmtShort(data.kpis.loss), sub: 'Monto Evaporado',
                bg: [254, 242, 242], color: [220, 38, 38], borderColor: [254, 202, 202]
            }
        ];

        kpis.forEach((kpi, i) => {
            const x = margin + (i * (kpiWidth + kpiGap));

            // Box
            doc.setDrawColor(...kpi.borderColor);
            doc.setFillColor(...kpi.bg);
            doc.roundedRect(x, yPos, kpiWidth, kpiHeight, 2, 2, 'FD');

            // Text
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139); // slate-500
            doc.setFont('helvetica', 'bold');
            doc.text(kpi.title, x + (kpiWidth / 2), yPos + 6, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(...kpi.color);
            doc.text(kpi.value, x + (kpiWidth / 2), yPos + 16, { align: 'center' });

            doc.setFontSize(6);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.setFont('helvetica', 'normal');
            doc.text(kpi.sub, x + (kpiWidth / 2), yPos + 22, { align: 'center' });
        });

        // ================= CHART GENERATION =================
        btn.innerText = "⏳ Generando Visuales...";

        // 1. Line Chart Data
        const chartLabels = data.details.map((d, i) => i % 6 === 0 ? d.date : '');
        const exchangeRates = data.details.map(d => d.exchangeRate);
        const minRate = Math.min(...exchangeRates) * 0.99;

        const lineChartImg = await generateChartImage('line', {
            labels: data.details.map(d => d.date),
            datasets: [{
                data: exchangeRates,
                borderColor: '#2563eb',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: {
                    target: 'origin',
                    above: 'rgba(37, 99, 235, 0.05)'
                }
            }]
        }, {
            scales: {
                y: { min: minRate, display: true, grid: { display: true, color: '#f1f5f9' } },
                x: { display: true, grid: { display: false }, ticks: { maxTicksLimit: 6 } }
            },
            plugins: { legend: { display: false } }
        }, 600, 300);

        // 2. Bar Chart Data (Comparison)
        const barChartImg = await generateChartImage('bar', {
            labels: ['Inicial', 'Nominal', 'Real'],
            datasets: [{
                data: [data.kpis.initialValue, data.kpis.finalNominal, data.kpis.finalReal],
                backgroundColor: ['#94a3b8', '#2563eb', '#059669'],
                borderRadius: 4,
                barPercentage: 0.6
            }]
        }, {
            indexAxis: 'y',
            scales: {
                x: { display: false },
                y: { display: true, grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }, 400, 200);

        // 3. Area Chart (Gap)
        const gapData = data.details.map(d => Math.abs(d.nominalPYG - d.realPYG));
        const gapChartImg = await generateChartImage('line', {
            labels: data.details.map(d => ''),
            datasets: [{
                data: gapData,
                borderColor: '#dc2626',
                borderWidth: 2,
                pointRadius: 0,
                fill: {
                    target: 'origin',
                    above: 'rgba(220, 38, 38, 0.1)'
                }
            }]
        }, {
            scales: { x: { display: false }, y: { display: false } },
            plugins: { legend: { display: false } }
        }, 400, 100);

        // ================= PLACING CHARTS =================
        yPos += kpiHeight + 10;
        const chartHeight = 55;
        const col1Width = contentWidth * 0.6;
        const col2Width = contentWidth * 0.38;
        const gap = contentWidth * 0.02;

        // Container 1 (Line Chart)
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, yPos, col1Width, chartHeight, 2, 2, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('Evolución Tipo de Cambio (USD/PYG)', margin + 4, yPos + 8);

        doc.addImage(lineChartImg, 'PNG', margin + 2, yPos + 12, col1Width - 4, chartHeight - 16);

        // Container 2 (Bars + Gap)
        const x2 = margin + col1Width + gap;
        doc.roundedRect(x2, yPos, col2Width, chartHeight, 2, 2, 'FD');

        doc.text('Poder Adquisitivo', x2 + 4, yPos + 8);

        // Add Bar Chart
        doc.addImage(barChartImg, 'PNG', x2 + 2, yPos + 10, col2Width - 4, 25);

        // Add Gap Label & Chart
        const gapY = yPos + 38;
        doc.setFontSize(7);
        doc.setTextColor(220, 38, 38);
        doc.text('BRECHA DE PÉRDIDA MENSUAL', x2 + 4, gapY);
        doc.addImage(gapChartImg, 'PNG', x2 + 2, gapY + 2, col2Width - 4, 12);

        // ================= TABLE =================
        yPos += chartHeight + 12;

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'bold');
        doc.text('DESGLOSE HISTÓRICO COMPLETO', margin, yPos);

        const tableData = data.details.map(row => {
            const loss = Math.abs(row.nominalPYG - row.realPYG);
            return [
                row.month,
                row.exchangeRate.toLocaleString('es-PY'),
                fmt(row.nominalPYG),
                (row.cumulativeInflationFactor).toFixed(4),
                fmt(row.realPYG),
                '-' + fmt(loss)
            ];
        });

        doc.autoTable({
            startY: yPos + 3,
            head: [['FECHA', 'T. CAMBIO', 'NOMINAL (GS)', 'INFLACIÓN', 'REAL (GS)', 'PÉRDIDA (GS)']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 7,
                cellPadding: 3,
                font: 'helvetica',
                lineColor: [241, 245, 249],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [100, 116, 139],
                fontStyle: 'bold',
                halign: 'right'
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold', textColor: [51, 65, 85] },
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right', textColor: [5, 150, 105], fontStyle: 'bold' },
                5: { halign: 'right', textColor: [220, 38, 38] }
            },
            margin: { left: margin, right: margin }
        });

        // ================= FOOTER =================
        const finalY = pageHeight - 15;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, finalY, pageWidth - margin, finalY);

        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Creado y Desarrollado por Julian C Galotto © 2025', pageWidth / 2, finalY + 6, { align: 'center' });
        doc.text(`Generado: ${new Date().toLocaleString()}`, pageWidth / 2, finalY + 10, { align: 'center' });

        // Save
        const filename = `InformePA_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);

        btn.innerText = originalText;
        btn.disabled = false;

    } catch (err) {
        console.error(err);
        alert("Error al exportar: " + err.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
