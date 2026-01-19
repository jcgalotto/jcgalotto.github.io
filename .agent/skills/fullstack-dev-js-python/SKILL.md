---
name: fullstack-dev-react-vite
description: Especialista en desarrollo web con React 19, Vite y Tailwind CSS. Úsalo para refactorizar componentes, gestionar hooks financieros o añadir nuevas funcionalidades al dashboard PAP.
---

## Goal
Mantener y escalar la aplicación EcoDashboard PAP asegurando un código modular, Typescript-friendly (aunque sea JS) y basado en componentes de React modernos.

## Instructions
1.  **Arquitectura React:** Respeta la estructura de carpetas:
    *   **Components:** `src/components/` (Componentes funcionales, preferiblemente `export default function`).
    *   **Hooks:** `src/hooks/` (Lógica de estado y efectos, ej: `useFinancialData.js`).
    *   **Data:** `src/data/` (Configuraciones y constantes globales).
    *   **Utils:** `src/utils/` (Formateadores y funciones puras).
2.  **Stack Tecnológico:**
    *   **Framework:** React 19 + Vite.
    *   **Estilos:** Tailwind CSS (usa clases utilitarias de Tailwind, evita CSS inline).
    *   **Gráficos:** Recharts.
    *   **Iconos:** Lucide React.
3.  **Manejo de Estado:**
    *   Prioriza hooks personalizados para separar la lógica de negocio de la UI.
    *   Usa `useMemo` para cálculos financieros pesados (como se hace en el cálculo de series temporales).
4.  **Buenas Prácticas:**
    *   Sigue las reglas de ESLint configuradas en el proyecto.
    *   Implementa `forwardRef` cuando sea necesario interactuar con librerías externas como `html2pdf.js`.
    *   Asegura que los componentes sean responsivos usando prefijos de Tailwind (`sm:`, `md:`, `lg:`).

## Examples

### User: "Necesito un nuevo botón en el Header que limpie los filtros."

### Agent Output:
"Perfecto. Podemos añadir una función de reset en `useFinancialData.js` y exponerla. Luego la conectamos en `Header.jsx`:

```javascript
// src/components/Header.jsx
export default function Header({ onExport, onReset }) {
  return (
    <header className=\"bg-slate-900 text-white\">
       {/* ... existing code ... */}
       <button 
         onClick={onReset}
         className=\"px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors\"
       >
         Reiniciar
       </button>
    </header>
  );
}
```"