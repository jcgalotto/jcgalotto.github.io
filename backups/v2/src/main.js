import { inflationData } from './data/constants.js';
import { exchangeRateData, exchangeRateDataSource, fetchExchangeRatesFromAPI } from './services/api.js';
import { getCurrentMonth, calculateFinancialSeries } from './utils/calculations.js';
import {
    showLoading,
    hideLoading,
    scrollToDashboard,
    updateSummary,
    updateKPIs,
    updateRegionalComparison,
    generateDetailedTable,
    addTechnicalNote,
    resetTechnicalNotes
} from './ui/dashboard.js?v=4';
import { generateExchangeRateChart, generateComparisonChart, generateGapChart } from './ui/charts.js?v=4';
import { DatePicker } from './ui/datepicker.js?v=4';
import { exportDashboardToPDF } from './utils/export.js?v=14';

let datePickerInstance;

// ===========================
// Form Submission Handler
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    // Init DatePicker
    datePickerInstance = new DatePicker('datePickerContainer', (range) => {
        // Auto-update dashboard when date range changes via Picker
        document.querySelector('.btn-primary').click();
    });

    const form = document.getElementById('analysisForm');
    const btnExport = document.getElementById('btnExport');

    btnExport.addEventListener('click', () => {
        exportDashboardToPDF();
    });

    // Simulate initial load click
    setTimeout(() => {
        document.querySelector('.btn-primary').click();
    }, 500);

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        try {
            // Get form values
            const usdAmount = parseFloat(document.getElementById('usdAmount').value);

            // Get dates from Picker
            const range = datePickerInstance.getRange();
            const dateFrom = range.start;
            const dateTo = range.end;

            // Show loading
            showLoading();

            // Try to fetch live exchange rate data
            // We await this but catch internal errors so we don't block dashboard generation
            try {
                await fetchExchangeRatesFromAPI(addTechnicalNote);
            } catch (apiError) {
                console.warn('API Fetch failed, continuing with static data:', apiError);
            }

            // Simulate processing delay for better UX
            setTimeout(() => {
                try {
                    generateDashboard(usdAmount, dateFrom, dateTo);
                } catch (dashboardError) {
                    console.error("Critical Dashboard Generation Error:", dashboardError);
                    alert("Error generando el dashboard. Ver consola.");
                } finally {
                    hideLoading(); // ALWAYS hide loading
                    scrollToDashboard();
                }
            }, 1000); // Reduced delay slightly

        } catch (err) {
            console.error("Submission Error:", err);
            hideLoading();
        }
    });
});


// ===========================
// Main Dashboard Generation
// ===========================
function generateDashboard(usdAmount, dateFrom, dateTo) {
    // Reset technical notes
    resetTechnicalNotes();

    // Generate monthly data using the pure function from calculations.js
    // We pass the current state of exchangeRateData (which might have been updated by API)
    const monthlyData = calculateFinancialSeries(usdAmount, dateFrom, dateTo, exchangeRateData, inflationData);

    // Update summary
    updateSummary(usdAmount, dateFrom, dateTo, exchangeRateDataSource);

    // Update KPIs
    updateKPIs(monthlyData, usdAmount);

    // Link charts
    generateExchangeRateChart(monthlyData);
    try {
        generateComparisonChart(monthlyData, usdAmount);
        generateGapChart(monthlyData);
    } catch (e) {
        console.error("Error generating advanced charts:", e);
    }

    // Update regional comparison
    updateRegionalComparison(monthlyData);

    // Generate detailed table
    generateDetailedTable(monthlyData);

    // Show dashboard
    document.getElementById('dashboardSection').classList.remove('hidden');

    // Show and Setup Export Button
    const btnExport = document.getElementById('btnExport');
    btnExport.classList.remove('hidden');
    // Remove old listeners to avoid duplicates (crude way, or just ensure generateDashboard doesn't add it repeatedly)
    // Better: Add listener once in DOMContentLoaded
}


