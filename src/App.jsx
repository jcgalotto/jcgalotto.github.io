import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { useFinancialData } from './hooks/useFinancialData';
import Header from './components/Header';
import ConfigBar from './components/ConfigBar';
import KPIGrid from './components/KPIGrid';
import ChartsSection from './components/ChartsSection';
import DetailedTable from './components/DetailedTable';
import Footer from './components/Footer';
import ReportTemplate from './components/ReportTemplate';

function App() {
  const {
    monthlyAmount,
    setMonthlyAmount,
    incomeCurrency,
    setIncomeCurrency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,

    data,
    kpis,
    isRealTime,
    loading
  } = useFinancialData();

  const reportRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleExport = () => {
    const wrapper = wrapperRef.current;
    const element = reportRef.current;

    // 1. Show the wrapper as a full-screen overlay (Flash Preview)
    // This is necessary because html2canvas needs the element to be visible and in-viewport for reliable capturing across all browsers.
    wrapper.style.display = 'flex';

    const opt = {
      margin: 10,
      filename: `Reporte_PA_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, scrollY: 0, useCORS: true, windowWidth: 1000 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // WAIT for render (charts need time to mount/paint SVGs)
    setTimeout(() => {
      html2pdf().set(opt).from(element).save().then(() => {
        // 2. Hide again after save
        wrapper.style.display = 'none';
      }).catch(err => {
        console.error(err);
        wrapper.style.display = 'none';
      });
    }, 1500); // 1.5s delay to ensure charts are drawn
  };

  // Derived state for display
  const dateRange = data.length > 0
    ? `${data[0].formattedDate} - ${data[data.length - 1].formattedDate}`
    : 'Cargando...';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header onExport={handleExport} />

      <ConfigBar
        monthlyAmount={monthlyAmount}
        setMonthlyAmount={setMonthlyAmount}
        incomeCurrency={incomeCurrency}
        setIncomeCurrency={setIncomeCurrency}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        isRealTime={isRealTime}
        buyRate={kpis.buyRate}
        sellRate={kpis.sellRate}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-2">
              {/* KPI Grid */}
              <KPIGrid kpis={kpis} />
            </div>

            {/* Charts Area */}
            <ChartsSection data={data} currentRate={kpis.currentRate} />

            {/* Regional Cards removed */}

            {/* Data Table */}
            <DetailedTable data={data} />

            {/* Gap for separation specifically for export/view */}
            <div className="h-12"></div>
          </>
        )}
      </main>

      <Footer />

      {/* Hidden Report Container for PDF Generation - Overlay Mode */}
      {!loading && (
        <div
          ref={wrapperRef}
          style={{ display: 'none' }} // Hidden by default
          className="fixed inset-0 z-[10000] bg-slate-900/90 items-start justify-center overflow-auto pt-10"
        >
          <ReportTemplate
            ref={reportRef}
            data={data}
            kpis={kpis}
            monthlyAmount={monthlyAmount}
            incomeCurrency={incomeCurrency}
            startDate={data[0]?.formattedDate} // Send formatted
            endDate={data[data.length - 1]?.formattedDate}
          />
        </div>
      )}
    </div>
  );
}

export default App;
