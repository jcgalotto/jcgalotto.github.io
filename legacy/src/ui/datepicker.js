export class DatePicker {
    constructor(elementId, onOptionsChange) {
        this.container = document.getElementById(elementId);
        this.onOptionsChange = onOptionsChange;

        // Default Date Range
        this.startDate = new Date('2023-01-01');
        this.endDate = new Date(); // Today

        // View State (Independent Years for Left/Right panels)
        this.yearStart = this.startDate.getFullYear();
        this.yearEnd = this.endDate.getFullYear();

        // Ensure yearEnd is at least yearStart
        if (this.yearEnd < this.yearStart) this.yearEnd = this.yearStart;

        this.months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        this.render();
        this.attachEvents();
    }

    getRange() {
        return {
            start: this.formatDate(this.startDate),
            end: this.formatDate(this.endDate)
        };
    }

    render() {
        this.container.innerHTML = `
            <div class="date-trigger" id="dateTrigger">
                <span id="dateLabel">📅 Cargar Fechas...</span>
                <span class="icon">▼</span>
            </div>
            
            <div class="date-overlay hidden" id="dateOverlay">
                <!-- Sidebar -->
                <div class="date-sidebar">
                    <div style="font-size:0.75rem; color:#64748b; font-weight:700; margin-bottom:0.5rem; text-transform:uppercase;">Rápido</div>
                    <button type="button" class="preset-btn" data-preset="12m">Últimos 12 Meses</button>
                    <button type="button" class="preset-btn" data-preset="YTD">Año Actual (YTD)</button>
                    <button type="button" class="preset-btn" data-preset="MAX">Todo (2022-Hoy)</button>
                </div>
                
                <div class="date-main">
                    <div class="picker-split-container">
                        
                        <!-- LEFT COLUMN: DESDE -->
                        <div class="picker-col">
                            <div class="picker-col-title">DESDE</div>
                            <!-- Calendar Header -->
                            <div class="calendar-header-small">
                                <button type="button" class="nav-btn-small" data-action="prev-start">‹</button>
                                <span class="current-year">${this.yearStart}</span>
                                <button type="button" class="nav-btn-small" data-action="next-start">›</button>
                            </div>
                            <!-- Months Grid -->
                            <div class="months-grid-small">
                                ${this.months.map((m, i) => this.renderMonthButton(i, 'start')).join('')}
                            </div>
                        </div>

                        <!-- DIVIDER ARROW -->
                        <div class="picker-arrow">→</div>

                        <!-- RIGHT COLUMN: HASTA -->
                        <div class="picker-col">
                             <div class="picker-col-title">HASTA</div>
                            <!-- Calendar Header -->
                            <div class="calendar-header-small">
                                <button type="button" class="nav-btn-small" data-action="prev-end">‹</button>
                                <span class="current-year">${this.yearEnd}</span>
                                <button type="button" class="nav-btn-small" data-action="next-end">›</button>
                            </div>
                            <!-- Months Grid -->
                            <div class="months-grid-small">
                                ${this.months.map((m, i) => this.renderMonthButton(i, 'end')).join('')}
                            </div>
                        </div>

                    </div>
                    
                    <div class="date-actions">
                        <div class="selection-info">
                            <small>Rango Seleccionado:</small>
                            <span id="selectionText" style="color:#4facfe; font-size:1.1rem;">...</span>
                        </div>
                        <div class="buttons-right">
                            <button type="button" class="btn-cancel" id="btnCancel">Cancelar</button>
                            <button type="button" class="btn-apply" id="btnApply">Aplicar Rango</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateLabel();
        this.updateSelectionDisplay();
    }

    renderMonthButton(monthIndex, type) {
        // Construct the date represented by this button
        const year = type === 'start' ? this.yearStart : this.yearEnd;
        const btnDate = new Date(year, monthIndex, 1);

        let cssClass = 'month-btn-small';

        // Exact Start/End Logic
        const isStart = (
            this.startDate.getFullYear() === year &&
            this.startDate.getMonth() === monthIndex
        );
        const isEnd = (
            this.endDate.getFullYear() === year &&
            this.endDate.getMonth() === monthIndex
        );

        // In-Range Logic
        const btnTime = btnDate.getTime();
        const startTime = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1).getTime();
        const endTime = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), 1).getTime();

        if (isStart) cssClass += ' is-start';
        else if (isEnd) cssClass += ' is-end';
        else if (btnTime > startTime && btnTime < endTime) cssClass += ' in-range';

        return `<button type="button" class="${cssClass}" data-type="${type}" data-month="${monthIndex}">${this.months[monthIndex]}</button>`;
    }

    attachEvents() {
        const overlay = this.container.querySelector('#dateOverlay');
        const trigger = this.container.querySelector('#dateTrigger');

        // Toggle
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            overlay.classList.toggle('hidden');
        });

        // Outside Click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                overlay.classList.add('hidden');
            }
        });

        // Navigation Buttons (Prev/Next Year)
        this.container.querySelectorAll('.nav-btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                if (action === 'prev-start') this.yearStart--;
                if (action === 'next-start') this.yearStart++;
                if (action === 'prev-end') this.yearEnd--;
                if (action === 'next-end') this.yearEnd++;
                this.refreshUI();
            });
        });

        // Month Selection
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('month-btn-small')) {
                e.stopPropagation();
                const month = parseInt(e.target.dataset.month);
                const type = e.target.dataset.type;

                if (type === 'start') {
                    // Set New Start
                    const newStart = new Date(this.yearStart, month, 1);
                    if (newStart > this.endDate) {
                        // If start is after end, push end forward
                        this.startDate = newStart;
                        this.endDate = new Date(this.yearStart, month + 5, 1);
                        this.yearEnd = this.endDate.getFullYear();
                    } else {
                        this.startDate = newStart;
                    }
                } else {
                    // Set New End
                    const newEnd = new Date(this.yearEnd, month, 1);
                    if (newEnd < this.startDate) {
                        // If end is before start, invalid (or set start = end)
                        alert("La fecha final no puede ser anterior a la inicial.");
                        return;
                    }
                    this.endDate = newEnd;
                }
                this.refreshUI();
            }
        });

        // Presets
        this.container.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const preset = e.target.dataset.preset;
                const now = new Date();

                if (preset === '12m') {
                    this.endDate = now;
                    this.startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
                } else if (preset === 'YTD') {
                    this.endDate = now;
                    this.startDate = new Date(now.getFullYear(), 0, 1);
                } else if (preset === 'MAX') {
                    this.endDate = now;
                    this.startDate = new Date(2022, 0, 1);
                }

                // Update views to match selection
                this.yearStart = this.startDate.getFullYear();
                this.yearEnd = this.endDate.getFullYear();
                this.refreshUI();
            });
        });

        // Apply
        this.container.querySelector('#btnApply').addEventListener('click', () => {
            this.updateLabel();
            this.onOptionsChange(this.formatDate(this.startDate), this.formatDate(this.endDate));
            overlay.classList.add('hidden');
        });

        // Cancel
        this.container.querySelector('#btnCancel').addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
    }

    refreshUI() {
        // Re-render only grid parts - Simplest is re-render whole innerHTML or just update strings.
        // For simplicity/robustness, we re-run render attach but keep state
        // Actually, better to just update the grids dynamically to avoid losing event listeners

        // Update Title Years
        const years = this.container.querySelectorAll('.current-year');
        years[0].textContent = this.yearStart;
        years[1].textContent = this.yearEnd;

        // Update Grids
        const grids = this.container.querySelectorAll('.months-grid-small');
        grids[0].innerHTML = this.months.map((m, i) => this.renderMonthButton(i, 'start')).join('');
        grids[1].innerHTML = this.months.map((m, i) => this.renderMonthButton(i, 'end')).join('');

        this.updateSelectionDisplay();
    }

    updateLabel() {
        const startStr = this.formatDateLabel(this.startDate);
        const endStr = this.formatDateLabel(this.endDate);
        this.container.querySelector('#dateLabel').innerText = `${startStr} - ${endStr}`;
    }

    updateSelectionDisplay() {
        const startStr = this.formatDateLabel(this.startDate);
        const endStr = this.formatDateLabel(this.endDate);
        this.container.querySelector('#selectionText').innerText = `${startStr} ➝ ${endStr}`;
    }

    formatDate(date) {
        // Returns YYYY-MM
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    }

    formatDateLabel(date) {
        // Returns "Ene 2024"
        return `${this.months[date.getMonth()]} ${date.getFullYear()}`;
    }
}
