import { formatMonthYear, formatNumber } from '../utils/formatters.js';

let exchangeRateChart = null;
let comparisonChart = null;
let gapChart = null;

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#a8b2d1',
                font: { family: 'Outfit', weight: '500' }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(22, 33, 62, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#a8b2d1',
            borderColor: '#667eea',
            borderWidth: 1,
            padding: 12
        }
    },
    scales: {
        x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#a8b2d1', font: { family: 'Inter' } }
        },
        y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#a8b2d1', font: { family: 'Inter' } }
        }
    }
};

export function generateExchangeRateChart(monthlyData) {
    const ctx = document.getElementById('exchangeRateChart').getContext('2d');
    if (exchangeRateChart) exchangeRateChart.destroy();

    const labels = monthlyData.map(d => formatMonthYear(d.date));
    const dataNominal = monthlyData.map(d => d.nominalPYG);
    const dataReal = monthlyData.map(d => d.realPYG);

    exchangeRateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Poder Adquisitivo Nominal',
                    data: dataNominal,
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Poder Adquisitivo Real',
                    data: dataReal,
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    ...commonOptions.scales.y,
                    ticks: {
                        color: '#a8b2d1',
                        callback: (v) => 'Gs. ' + formatNumber(v)
                    }
                }
            }
        }
    });
}

export function generateComparisonChart(monthlyData, usdAmount) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    if (comparisonChart) comparisonChart.destroy();

    const startData = monthlyData[0];
    const endData = monthlyData[monthlyData.length - 1];

    // Use Nominal at Start (Ideal) vs Real at End (Actual)
    const startValue = startData.nominalPYG;
    const endValue = endData.realPYG;

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Inicio (Expectativa)', 'Fin (Realidad)'],
            datasets: [{
                label: 'Valor en Guaraníes',
                data: [startValue, endValue],
                backgroundColor: [
                    'rgba(67, 233, 123, 0.8)', // Green
                    'rgba(240, 147, 251, 0.8)'  // Pink/Purple
                ],
                borderColor: [
                    '#43e97b',
                    '#f093fb'
                ],
                borderWidth: 1,
                barPercentage: 0.5
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Gs. ${formatNumber(ctx.raw.toFixed(0))}`
                    }
                }
            }
        }
    });
}

export function generateGapChart(monthlyData) {
    const ctx = document.getElementById('gapChart').getContext('2d');
    if (gapChart) gapChart.destroy();

    const labels = monthlyData.map(d => formatMonthYear(d.date));
    // Gap = Nominal (What you got) - Real (What it's worth)
    // Positive gap means you "lost" that value to inflation
    const gapData = monthlyData.map(d => d.nominalPYG - d.realPYG);

    gapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pérdida por Inflación (Brecha)',
                data: gapData,
                backgroundColor: '#764ba2', // Deep Purple
                borderRadius: 4,
                hoverBackgroundColor: '#a18cd1'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    ...commonOptions.scales.y,
                    title: { display: true, text: 'Pérdida mensual (Gs)' }
                }
            }
        }
    });
}
