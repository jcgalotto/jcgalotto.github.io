export class DatePicker {
    constructor(elementId, onOptionsChange) {
        console.log("DatePicker (MonthGrid) initializing on:", elementId);
        this.container = document.getElementById(elementId);
        this.onOptionsChange = onOptionsChange;

        // Internal State
        // Default range: Jan 2023 to Today
        this.startDate = new Date('2023-01-01');
        this.endDate = new Date(); // Today

        // Navigation State (Year viewing)
        this.currentYear = new Date().getFullYear();

        this.months = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        this.render();
        this.attachEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="date-trigger" id="dateTrigger">
                <span id="dateLabel">📅 Cargar Fechas...</span>
                <span class="icon">▼</span>
            </div>
            
            <div class="date-overlay hidden" id="dateOverlay">
                <!-- Sidebar Presets -->
                <div class="date-sidebar">
                    <button class="preset-btn" data-preset="12m">Últimos 12 Meses</button>
                    <button class="preset-btn" data-preset="YTD">Año Actual (YTD)</button>
                    <button class="preset-btn" data-preset="MAX">Todo (2022-Hoy)</button>
                </div>
                
                <!-- Main Grid Area -->
                <div class="date-main">
                    <!-- Year Navigation -->
                    <div class="calendar-header">
                        <button class="nav-btn" id="prevYear">‹</button>
                        <span class="current-year">${this.currentYear}</span>
                        <button class="nav-btn" id="nextYear">›</button>
                    </div>

                    <!-- Months Grid -->
                    <div class="months-grid">
                        ${this.months.map((m, index) => {
            const date = new Date(this.currentYear, index, 1);
            const cssClass = this.getMonthClass(date);
            return `<button class="month-btn ${cssClass}" data-month="${index}">${m}</button>`;
        }).join('')}
                    </div>
                    
                    <div class="date-actions">
                        <div class="selection-info">
                            <small>Seleccionado:</small><br>
                            <span id="selectionText">...</span>
                        </div>
                        <div class="buttons-right">
                            <button class="btn-cancel" id="btnCancel">Cancelar</button>
                            <button class="btn-apply" id="btnApply">Aplicar Rango</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateLabel();
        this.updateSelectionText();
    }

    getMonthClass(date) {
        // Compare YYYY-MM
        const time = date.getTime();
        const start = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1).getTime();
        const end = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), 1).getTime();

        if (time === start || time === end) return 'selected';
        if (time > start && time < end) return 'in-range';
        return '';
    }

    attachEvents() {
        const trigger = this.container.querySelector('#dateTrigger');
        const overlay = this.container.querySelector('#dateOverlay');

        // Toggle
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            overlay.classList.toggle('hidden');
        });

        // Outside click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                overlay.classList.add('hidden');
            }
        });

        // Navigation
        this.container.querySelector('#prevYear').addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            this.currentYear--;
            this.reRenderGrid();
        });
        this.container.querySelector('#nextYear').addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            this.currentYear++;
            this.reRenderGrid();
        });

        // Month Selection Logic
        this.container.querySelector('.months-grid').addEventListener('click', (e) => {
            if (e.target.classList.contains('month-btn')) {
                e.preventDefault(); e.stopPropagation();
                const month = parseInt(e.target.dataset.month);
                this.handleMonthClick(month);
            }
        });

        // Presets
        this.container.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyPreset(preset);
            });
        });

        // Apply
        this.container.querySelector('#btnApply').addEventListener('click', (e) => {
            e.preventDefault();
            overlay.classList.add('hidden');
            this.updateLabel();
            if (this.onOptionsChange) this.onOptionsChange(this.getRange());
        });
    }

    handleMonthClick(monthIndex) {
        const clickedDate = new Date(this.currentYear, monthIndex, 1);

        // Simple Logic: Reset if end is set and click is outside, or extend?
        // Let's allow "Click start, Click end".
        // If clicking before start, update start.
        // If clicking after start, update end.

        if (clickedDate < this.startDate) {
            this.startDate = clickedDate;
        } else if (clickedDate > this.startDate) {
            this.endDate = clickedDate;
        } else {
            // Clicked exactly start or end? leave it (or maybe reset to single month?)
            this.startDate = clickedDate;
            this.endDate = clickedDate;
        }

        this.reRenderGrid();
        this.updateSelectionText();
    }

    applyPreset(preset) {
        const today = new Date();
        const end = new Date(today.getFullYear(), today.getMonth(), 1);
        let start = new Date(end);

        if (preset === '12m') {
            start.setMonth(start.getMonth() - 11);
        } else if (preset === 'YTD') {
            start.setMonth(0);
        } else if (preset === 'MAX') {
            start = new Date('2022-01-01');
        }

        this.startDate = start;
        this.endDate = end;
        this.currentYear = end.getFullYear(); // Jump to relevant year
        this.reRenderGrid();
        this.updateSelectionText();
    }

    reRenderGrid() {
        const grid = this.container.querySelector('.months-grid');
        grid.innerHTML = this.months.map((m, index) => {
            const date = new Date(this.currentYear, index, 1);
            const cssClass = this.getMonthClass(date);
            return `<button class="month-btn ${cssClass}" data-month="${index}">${m}</button>`;
        }).join('');

        this.container.querySelector('.current-year').textContent = this.currentYear;
    }

    updateLabel() {
        const fmt = (d) => d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        this.container.querySelector('#dateLabel').textContent = `${fmt(this.startDate)} - ${fmt(this.endDate)}`;
    }

    updateSelectionText() {
        const fmt = (d) => d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        this.container.querySelector('#selectionText').textContent = `${fmt(this.startDate)} - ${fmt(this.endDate)}`;
    }

    getRange() {
        // Return ISO strings for Main App
        return {
            start: this.startDate.toISOString().slice(0, 7),
            end: this.endDate.toISOString().slice(0, 7)
        };
    }
}
