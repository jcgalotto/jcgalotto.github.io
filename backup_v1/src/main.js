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
} from './ui/dashboard.js';
import { generateExchangeRateChart } from './ui/charts.js';

// ===========================
// Form Submission Handler
// ===========================
document.getElementById('analysisForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form values
    const usdAmount = parseFloat(document.getElementById('usdAmount').value);
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value || getCurrentMonth();

    // Show loading
    showLoading();

    // Try to fetch live exchange rate data
    await fetchExchangeRatesFromAPI(addTechnicalNote);

    // Simulate processing delay for better UX
    setTimeout(() => {
        generateDashboard(usdAmount, dateFrom, dateTo);
        hideLoading();
        scrollToDashboard();
    }, 1500);
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

    // Generate chart
    generateExchangeRateChart(monthlyData);

    // Update regional comparison
    updateRegionalComparison(monthlyData);

    // Generate detailed table
    generateDetailedTable(monthlyData);

    // Show dashboard
    document.getElementById('dashboardSection').classList.remove('hidden');
}

// ===========================
// Initialize Default Date
// ===========================
document.addEventListener('DOMContentLoaded', function () {
    // Set default dateTo to current month
    const currentDate = getCurrentMonth();
    const dateToInput = document.getElementById('dateTo');
    if (dateToInput) {
        dateToInput.value = currentDate;
    }

    // Set default dateFrom to January 2022
    const dateFromInput = document.getElementById('dateFrom');
    if (dateFromInput) {
        dateFromInput.value = '2022-01';
    }
});
