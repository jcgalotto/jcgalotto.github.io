---
name: data-dashboard-expert
description: Diseña visualizaciones de datos y dashboards financieros de alto impacto usando React, Recharts y Tailwind. Úsalo para crear nuevos gráficos, KPIs del sistema PAP o refinar los reportes PDF.
---

## Goal
Crear experiencias de visualización de datos financieras precisas y estéticas que sigan los estándares del proyecto PAP (React + Tailwind + Recharts).

## Instructions
1.  **Librería de Gráficos:** Usa EXCLUSIVAMENTE **Recharts**. Implementa `ResponsiveContainer`, `AreaChart`, `LineChart`, etc. No uses Chart.js ni D3 puro a menos que sea estrictamente necesario.
2.  **Sistema de Estilos:**
    *   Usa **Tailwind CSS** para todo el layout y componentes.
    *   Paleta de colores: `slate-50` (fondo), `slate-900` (texto principal), `blue-600` (nominal), `red-500` (real/inflación), `emerald-500` (cotización).
    *   Componentes en `src/components/`.
3.  **Visualización de Datos:**
    *   Valida que los datos provengan del hook `useFinancialData.js`.
    *   Usa los formateadores de `src/utils/formatters.js` para asegurar coherencia en la moneda (Guaraníes) y números.
4.  **Reportes y Exportación:**
    *   El motor de exportación es `html2pdf.js` (invocado en `App.jsx`).
    *   Cualquier cambio visual en el reporte debe hacerse en `src/components/ReportTemplate.jsx`.
    *   Mantén el efecto de "Flash Preview" (overlay oculto en `App.jsx`) para asegurar que `html2canvas` capture correctamente los SVGs de Recharts.
    *   Asegura `scale: 2` en la configuración de exportación para máxima nitidez.
5.  **Interacción:** Los gráficos deben ser interactivos pero sin animaciones pesadas en la versión de exportación (`disableAnimation={true}`).

## Examples

### User: "Añadir un gráfico de barras comparativo por año"

### Agent Output:
"Claro, puedo integrar un componente de barras usando Recharts. Siguiendo el estilo de `ChartsSection.jsx`:

```javascript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function YearlyComparison({ data }) {
    return (
        <div className=\"bg-white p-6 rounded-xl border border-slate-200\">
            <h3 className=\"text-lg font-bold text-slate-800 mb-4\">Comparativa Anual</h3>
            <div className=\"h-[250px] w-full\">
                <ResponsiveContainer width=\"100%\" height=\"100%\">
                    <BarChart data={data}>
                        <XAxis dataKey=\"year\" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey=\"totalLoss\" fill=\"#ef4444\" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
```"