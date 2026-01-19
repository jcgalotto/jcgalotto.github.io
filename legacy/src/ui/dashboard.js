import { formatNumber, formatMonthYear } from '../utils/formatters.js';

export function updateSummary(usdAmount, dateFrom, dateTo, dataSourceType) {
    document.getElementById('summaryUSD').textContent = `$${formatNumber(usdAmount)} USD`;
    document.getElementById('summaryPeriod').textContent = `${formatMonthYear(dateFrom)} a ${formatMonthYear(dateTo)}`;

    // Update data source badge
    const badge = document.getElementById('dataSourceBadge');
    if (dataSourceType === 'api') {
        badge.className = 'badge badge-api';
        badge.textContent = '🌐 Datos en Tiempo Real';
    } else {
        badge.className = 'badge badge-static';
        badge.textContent = '📊 Datos Históricos';
    }
}

export function updateKPIs(monthlyData, usdAmount) {
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];

    const initialPYG = firstMonth.nominalPYG;
    const finalRealPYG = lastMonth.realPYG;
    const finalRealUSD = lastMonth.realUSD;

    const finalNominalPYG = lastMonth.nominalPYG;
    const gapPYG = finalNominalPYG - finalRealPYG; // The "lost" value
    const gapPercent = (gapPYG / finalNominalPYG) * 100;

    // Calculate purchasing power variation
    const variation = ((finalRealUSD - usdAmount) / usdAmount) * 100;

    // Update KPI values safely
    const elVariation = document.getElementById('kpiVariation');
    const elStatus = document.getElementById('kpiStatus');
    const elInitial = document.getElementById('kpiInitial');
    const elReal = document.getElementById('kpiReal');

    // New Elements
    const elNominalFinal = document.getElementById('kpiNominalFinal');
    const elGap = document.getElementById('kpiGap');
    const elGapPercent = document.getElementById('kpiGapPercent');

    if (elVariation) elVariation.textContent = `${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%`;
    else console.error("Missing ID: kpiVariation");

    if (elStatus) {
        elStatus.textContent = variation >= 0 ? '📈 Ganancia' : '📉 Pérdida';
        elStatus.className = variation >= 0 ? 'kpi-status text-success' : 'kpi-status text-danger';
    } else console.error("Missing ID: kpiStatus");

    if (elInitial) elInitial.textContent = `Gs. ${formatNumber(initialPYG.toFixed(0))}`;
    else console.error("Missing ID: kpiInitial");

    if (elReal) elReal.textContent = `Gs. ${formatNumber(finalRealPYG.toFixed(0))}`;
    else console.error("Missing ID: kpiReal");

    // EXPOSE DATA FOR EXPORT
    window.dashboardData = {
        details: monthlyData,
        kpis: {
            initialValue: initialPYG,
            finalNominal: finalNominalPYG,
            finalReal: finalRealPYG,
            loss: gapPYG,
            lossPercent: gapPercent
        }
    };

    hideLoading();

    // Update New KPIs
    if (elNominalFinal) {
        elNominalFinal.textContent = `Gs. ${formatNumber(finalNominalPYG.toFixed(0))}`;
    }

    if (elGap) {
        elGap.textContent = `Gs. ${formatNumber(gapPYG.toFixed(0))}`;
        elGap.style.color = '#ff6b6b'; // Highlight loss in red
    }

    if (elGapPercent) {
        elGapPercent.textContent = `-${gapPercent.toFixed(2)}% devaluación real`;
        elGapPercent.className = 'kpi-status text-danger';
    }
}

export function updateRegionalComparison(monthlyData) {
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];

    const exchangeRateChange = ((lastMonth.exchangeRate - firstMonth.exchangeRate) / firstMonth.exchangeRate) * 100;
    const totalInflation = ((lastMonth.cumulativeInflationFactor - 1) * 100);

    // Paraguay analysis
    const pyAnalysis = `El guaraní paraguayo mostró una ${exchangeRateChange >= 0 ? 'depreciación' : 'apreciación'} del ${Math.abs(exchangeRateChange).toFixed(2)}% frente al dólar en el período analizado. La inflación acumulada fue del ${totalInflation.toFixed(2)}%, lo que representa una relativa estabilidad en comparación con sus vecinos regionales.`;

    // Argentina analysis (estimated based on regional trends)
    const arAnalysis = `El peso argentino experimentó una volatilidad significativamente mayor, con tasas de devaluación anual superiores al 100% en varios períodos. La hiperinflación continúa siendo un desafío estructural, erosionando fuertemente el poder adquisitivo local.`;

    // Brasil analysis (estimated based on regional trends)
    const brAnalysis = `El real brasileño mostró mayor estabilidad que el peso argentino pero con fluctuaciones más pronunciadas que el guaraní. La inflación en Brasil se mantuvo en rangos del 4-6% anual, con políticas monetarias activas del Banco Central.`;

    document.getElementById('regionalPY').textContent = pyAnalysis;
    document.getElementById('regionalAR').textContent = arAnalysis;
    document.getElementById('regionalBR').textContent = brAnalysis;
}

export function generateDetailedTable(monthlyData) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    monthlyData.forEach(data => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${formatMonthYear(data.date)}</td>
            <td>${formatNumber(data.usdAmount)}</td>
            <td>${formatNumber(data.exchangeRate.toFixed(2))}</td>
            <td>${formatNumber(data.nominalPYG.toFixed(2))}</td>
            <td>${data.cumulativeInflationFactor.toFixed(4)}</td>
            <td>${formatNumber(data.realPYG.toFixed(2))}</td>
            <td class="highlight">${formatNumber(data.realUSD.toFixed(2))}</td>
        `;

        tbody.appendChild(row);
    });
}

export function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

export function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

export function scrollToDashboard() {
    document.getElementById('dashboardSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

export function addTechnicalNote(note) {
    const notesList = document.getElementById('technicalNotes');
    const li = document.createElement('li');
    li.textContent = note;
    notesList.appendChild(li);
}

export function resetTechnicalNotes() {
    const notesList = document.getElementById('technicalNotes');
    notesList.innerHTML = `
        <li>Los datos de tipo de cambio son obtenidos de fuentes oficiales del Banco Central del Paraguay.</li>
        <li>La inflación acumulada se calcula utilizando el Índice de Precios al Consumidor (IPC) oficial.</li>
    `;
}
