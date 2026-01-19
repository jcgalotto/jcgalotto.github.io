import { API_SOURCES, exchangeRateDataFallback } from '../data/constants.js';
import { getCurrentMonth } from '../utils/calculations.js';

// Import formatters correctly
import { formatMonthYear as formatMonthYearFormatter } from '../utils/formatters.js';

// State
export let exchangeRateData = { ...exchangeRateDataFallback };
export let exchangeRateDataSource = 'static';

// Helper to add technical notes - we need a way to callback to UI or just export the message
// For now, let's return messages or accept a callback.
// To keep it clean, we'll return the status and messages.

export async function fetchExchangeRatesFromAPI(uiCallback) {
    try {
        console.log('🔄 Intentando obtener datos del tipo de cambio desde fuentes oficiales...');

        // Try alternative API first (easier to parse and no CORS issues)
        const response = await fetch(API_SOURCES.EXCHANGERATE_API);

        if (response.ok) {
            const data = await response.json();

            // Get USD to PYG rate (if available)
            if (data.rates && data.rates.PYG) {
                const currentRate = data.rates.PYG;
                const currentMonth = getCurrentMonth();

                // Update current month rate with live data
                exchangeRateData[currentMonth] = currentRate;
                exchangeRateDataSource = 'api';

                console.log(`✅ Datos actualizados desde API: ${currentMonth} = ${currentRate}`);

                if (uiCallback) {
                    uiCallback(`El tipo de cambio para ${formatMonthYearFormatter(currentMonth)} fue actualizado desde una fuente externa en tiempo real (tasa actual: ${currentRate.toFixed(2)}).`);
                }

                return true;
            }
        }

        throw new Error('No se pudieron obtener datos de la API');

    } catch (error) {
        console.warn('⚠️ No se pudo conectar con las APIs externas. Usando datos de respaldo.', error);
        exchangeRateDataSource = 'static';

        if (uiCallback) {
            uiCallback('Los datos de tipo de cambio provienen de registros históricos del BCP. No se pudo establecer conexión con fuentes en tiempo real.');
        }

        return false;
    }
}
