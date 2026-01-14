# 📊 EcoDashboard Mercosur
**Análisis de Poder Adquisitivo Real (Paraguay)**

Esta aplicación web es una herramienta financiera avanzada diseñada para calcular y visualizar la erosión del poder adquisitivo de ingresos en **Dólares (USD)** convertidos a **Guaraníes (PYG)**, ajustados por la inflación local (IPC) y la variación del tipo de cambio.

## 🚀 Características Principales

*   **Cálculo de Valor Real vs Nominal:** Determina cuánto valor real ha perdido (o ganado) un ingreso en USD a lo largo del tiempo.
*   **Ajuste por Inflación (IPC):** Utiliza datos históricos del Índice de Precios al Consumidor para deflactar los valores nominales.
*   **Selector de Fechas Dual:** Interfaz intuitiva "Desde / Hasta" para seleccionar periodos de análisis precisos.
*   **Visualización de Datos:**
    *   Gráficos de evolución del tipo de cambio.
    *   Comparativa de barras (Inicio vs Fin).
    *   Gráfico de "Brecha" (Pérdida mensual acumulada).
*   **Comparativa Regional:** Indicadores de estabilidad monetaria comparando PYG vs ARS (Argentina) y BRL (Brasil).
*   **Exportación PDF Premium:** Generación de informes profesionales en PDF con tablas detalladas y gráficos vectoriales integrados.

## 🛠️ Tecnologías

*   **Core:** HTML5, CSS3 (Variables + Flexbox/Grid), JavaScript (ES6+ Modules).
*   **Gráficos:** [Chart.js](https://www.chartjs.org/)
*   **PDF:** [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable).
*   **Iconografía:** Emojis nativos y diseño CSS puro.
*   **Fuentes:** Inter & Outfit (Google Fonts).

## 📋 Requisitos Previos

No requiere instalación de dependencias complejas (como Node.js o NPM) para *ejecutarse*, ya que usa módulos JS nativos. Sin embargo, **necesitas un servidor web local** debido a las políticas de seguridad de CORS de los navegadores para módulos ES6.

## ▶️ Cómo Ejecutar el Proyecto

### Opción 1: Python (Recomendado / Preinstalado en mayoría de OS)
Si tienes Python instalado, abre una terminal en la carpeta del proyecto y ejecuta:

```bash
# Python 3
python -m http.server

# O Python 2
python -m SimpleHTTPServer
```
Luego abre tu navegador en: `http://localhost:8000`

### Opción 2: VS Code "Live Server"
1.  Instala la extensión **Live Server** de Ritwick Dey en VS Code.
2.  Haz clic derecho en `index.html`.
3.  Selecciona **"Open with Live Server"**.

### Opción 3: Node.js (http-server)
Si prefieres usar Node.js:
```bash
npx http-server .
```

## 📂 Estructura del Proyecto

```
PAP/
├── src/
│   ├── data/
│   │   └── constants.js       # Datos estáticos (IPC, T. Cambio fallback)
│   ├── services/
│   │   └── api.js             # Lógica de fetch de datos externos
│   ├── ui/
│   │   ├── charts.js          # Configuración de gráficos Chart.js
│   │   ├── dashboard.js       # Manipulación del DOM y actualizaciones UI
│   │   └── datepicker.js      # Lógica del componente Datepicker Dual
│   ├── utils/
│   │   ├── calculations.js    # Lógica financiera pura (Matemáticas)
│   │   └── export_engine.js   # Motor de generación de PDF
│   └── main.js                # Punto de entrada principal
├── index.html                 # Estructura HTML
├── styles.css                 # Estilos globales y componentes
├── README.md                  # Documentación
└── .gitignore                 # Archivos ignorados por Git
```

## ⚠️ Notas Importantes
*   **Firefox:** Recomendado para desarrollo por su manejo de módulos, aunque funciona perfectamente en Chrome/Edge.
*   **Caché:** Si realizas cambios en el código (`.js`), asegúrate de actualizar la versión en los imports de `index.html` (ej: `main.js?v=4`) para forzar la recarga en los navegadores de los usuarios.

---
*Desarrollado para análisis financiero personal y proyección económica.*
