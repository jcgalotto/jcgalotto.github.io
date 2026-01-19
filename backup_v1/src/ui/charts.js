import { formatMonthYear, formatNumber } from '../utils/formatters.js';

let exchangeRateChart = null;

export function generateExchangeRateChart(monthlyData) {
    const ctx = document.getElementById('exchangeRateChart').getContext('2d');

    // Destroy existing chart if it exists
    if (exchangeRateChart) {
        exchangeRateChart.destroy();
    }

    const labels = monthlyData.map(d => formatMonthYear(d.date));
    const data = monthlyData.map(d => d.exchangeRate);

    exchangeRateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tipo de Cambio USD/PYG',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a8b2d1',
                        font: { size: 14, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(22, 33, 62, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#a8b2d1',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `Gs. ${formatNumber(context.parsed.y.toFixed(2))}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a8b2d1',
                        font: { size: 12 },
                        callback: function (value) {
                            return 'Gs. ' + formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a8b2d1',
                        font: { size: 11 },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}
