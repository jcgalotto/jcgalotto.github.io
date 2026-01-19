export function getMonthsBetween(startMonth, endMonth) {
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
}

export function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

export function calculateFinancialSeries(usdAmount, dateFrom, dateTo, exchangeRateData, inflationData) {
    const months = getMonthsBetween(dateFrom, dateTo);
    const monthlyData = [];

    let cumulativeInflationFactor = 1.0000;

    months.forEach((month, index) => {
        const exchangeRate = exchangeRateData[month] || 7500.00;
        const monthlyInflation = inflationData[month] || 0.005;

        // Calculate cumulative inflation from start
        if (index > 0) {
            cumulativeInflationFactor *= (1 + monthlyInflation);
        }

        const nominalPYG = usdAmount * exchangeRate;
        const realPYG = nominalPYG / cumulativeInflationFactor;
        const realUSD = realPYG / exchangeRate;

        monthlyData.push({
            date: month,
            usdAmount: usdAmount,
            exchangeRate: exchangeRate,
            nominalPYG: nominalPYG,
            cumulativeInflationFactor: cumulativeInflationFactor,
            realPYG: realPYG,
            realUSD: realUSD,
            monthlyInflation: monthlyInflation
        });
    });

    return monthlyData;
}
