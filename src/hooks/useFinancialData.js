import { useState, useEffect, useMemo } from 'react';
import { exchangeRateDataFallback, inflationData, API_SOURCES } from '../data/constants.js';
import { formatMonthYear } from '../utils/formatters.js';

export function useFinancialData() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [monthlyAmount, setMonthlyAmount] = useState(1000); // Amount
    const [incomeCurrency, setIncomeCurrency] = useState('USD'); // 'USD' or 'PYG'
    const [exchangeRates, setExchangeRates] = useState(exchangeRateDataFallback);
    const [isRealTime, setIsRealTime] = useState(false);

    // Helpers
    const getMonthsBetween = (startMonth, endMonth) => {
        const months = [];
        let current = new Date(startMonth + '-01');
        const end = new Date(endMonth + '-01');

        while (current <= end) {
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            months.push(`${year}-${month}`);
            current.setMonth(current.getMonth() + 1);
        }
        return months;
    };

    const getCurrentMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    // Fetch API Data
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch(API_SOURCES.EXCHANGERATE_API);
                if (response.ok) {
                    const data = await response.json();
                    if (data.rates && data.rates.PYG) {
                        const currentRate = data.rates.PYG;
                        const currentMonth = getCurrentMonth();

                        setExchangeRates(prev => ({
                            ...prev,
                            [currentMonth]: currentRate
                        }));
                        setIsRealTime(true);
                    }
                }
            } catch (err) {
                console.warn('API Fetch failed, using fallback', err);
                setIsRealTime(false);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();

        // Refresh every 15 minutes (900,000 ms)
        const intervalId = setInterval(fetchRates, 15 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    const [startDate, setStartDate] = useState('2022-01');
    const [endDate, setEndDate] = useState(getCurrentMonth());

    // Calculate Series
    const calculatedData = useMemo(() => {
        const months = getMonthsBetween(startDate, endDate);
        const data = [];
        let cumulativeInflationFactor = 1.0000;

        months.forEach((month, index) => {
            const rate = exchangeRates[month] || 7500.00;
            const inf = inflationData[month] || 0.005;

            if (index > 0) {
                cumulativeInflationFactor *= (1 + inf);
            }

            // Calculation depends on income currency
            let nominalPYG, nominalUSD, realPYG, realUSD;

            if (incomeCurrency === 'USD') {
                nominalUSD = monthlyAmount;
                nominalPYG = nominalUSD * rate;
                realPYG = nominalPYG / cumulativeInflationFactor;
                realUSD = realPYG / rate;
            } else {
                // Base is PYG
                nominalPYG = monthlyAmount;
                nominalUSD = nominalPYG / rate;
                realPYG = nominalPYG / cumulativeInflationFactor;
                realUSD = realPYG / rate;
            }

            data.push({
                month,
                formattedDate: formatMonthYear(month),
                incomeCurrency,
                nominalUSD,
                nominalPYG,
                realPYG,
                realUSD,
                exchangeRate: rate,
                inflationFactor: cumulativeInflationFactor,
                lossPercentage: ((realPYG - nominalPYG) / nominalPYG) * 100
            });
        });

        return data;
    }, [monthlyAmount, incomeCurrency, exchangeRates, startDate, endDate]);

    const kpis = useMemo(() => {
        if (calculatedData.length === 0) return {};
        const first = calculatedData[0];
        const last = calculatedData[calculatedData.length - 1];

        return {
            incomeCurrency,
            initialRate: first.exchangeRate,
            initialValuePYG: first.nominalPYG,
            initialValueUSD: first.nominalUSD,
            currentNominalValuePYG: last.nominalPYG,
            currentNominalValueUSD: last.nominalUSD,
            currentRealValuePYG: last.realPYG,
            inflationLoss: last.nominalPYG - last.realPYG,
            realDevaluation: last.lossPercentage,
            currentRate: last.exchangeRate,
            buyRate: last.exchangeRate - 50,
            sellRate: last.exchangeRate + 50
        };
    }, [calculatedData]);

    return {
        loading,
        error,
        monthlyAmount,
        setMonthlyAmount,
        incomeCurrency,
        setIncomeCurrency,
        data: calculatedData,
        kpis,
        isRealTime,
        startDate,
        setStartDate,
        endDate,
        setEndDate
    };

}
