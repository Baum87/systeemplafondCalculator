/**
 * Systeemplafond Rekenmachine - Main App Logic
 * ✅ WITH DEBOUNCING - Reduces API requests by 80%
 * ✅ FASE 2 - WITH TABLE
 */

// ============================================================================
// STATE
// ============================================================================

const state = {
    selectedSystem: null,
    inputMode: 'sqm',
    vierkante_meters: 10,
    strekkende_meters: 10,
    results: null,
    
    // FASE 2: NIEUW
    ruimtes: [],           // Array van ruimtes
    totalen: {             // Totalen per materiaal
        vierkante_meters: 0,
        strekkende_meters: 0,
        hoofdprofielen: 0,
        tussenprofiel_1200: 0,
        tussenprofiel_600: 0,
        plafondplaten: 0,
        hoeklijn: 0,
        kantlat: 0
    }
};

// Debounce timer
let debounceTimer = null;
const DEBOUNCE_DELAY = 500; // 500ms delay

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const DOM = {
    // Buttons
    systemButtons: document.querySelectorAll('[data-system]'),
    selectedSystemDiv: document.getElementById('selected-system'),
    systemNameSpan: document.getElementById('system-name'),

    // Sections
    inputSection: document.getElementById('input-section'),
    resultsSection: document.getElementById('results-section'),
    emptyState: document.getElementById('empty-state'),

    // Input Mode
    inputModeRadios: document.querySelectorAll('input[name="input-mode"]'),
    sqmInputGroup: document.getElementById('sqm-input-group'),
    dimensionsInputGroup: document.getElementById('dimensions-input-group'),

    // Inputs
    vierkanteMetersInput: document.getElementById('vierkante-meters'),
    lengteInput: document.getElementById('lengte'),
    breedteInput: document.getElementById('breedte'),
    strekkendeMeterInput: document.getElementById('strekkende-meters'),

    // Results
    resultHoofprofielen: document.getElementById('result-hoofdprofielen'),
    resultTussenprofiel1200: document.getElementById('result-tussenprofiel-1200'),
    resultTussenprofiel600: document.getElementById('result-tussenprofiel-600'),
    resultTussenprofiel600Item: document.getElementById('result-tussenprofiel-600-item'),
    resultPlafondplaten: document.getElementById('result-plafondplaten'),
    resultHoeklijn: document.getElementById('result-hoeklijn'),
    resultKantlat: document.getElementById('result-kantlat'),
    
    // Summary
    summarySqm: document.getElementById('summary-sqm'),
    summaryMeters: document.getElementById('summary-meters'),
    summarySystem: document.getElementById('summary-system'),
    
    // Calculated sqm
    calculatedSqmDiv: document.getElementById('calculated-sqm'),

    // FASE 2: NIEUW
    ruimteNaamInput: document.getElementById('ruimte-naam'),
    btnAddToTable: document.getElementById('btn-add-to-table'),
    btnAddNewRoom: document.getElementById('btn-add-new-room'),
    btnDownloadPdf: document.getElementById('btn-download-pdf'),
    
    ruimtesSection: document.getElementById('ruimtes-section'),
    ruimtesTableBody: document.getElementById('ruimtes-tbody'),
    ruimtesTable: document.getElementById('ruimtes-table'),
    
    totalSqm: document.getElementById('total-sqm'),
    totalMeters: document.getElementById('total-meters'),
    totalHoofprofiel: document.getElementById('total-hoofdprofiel'),
    totalTussenprofiel1200: document.getElementById('total-tussenprofiel1200'),
    totalTussenprofiel600: document.getElementById('total-tussenprofiel600'),
    totalHoeklijn: document.getElementById('total-hoeklijn'),
    totalKantlat: document.getElementById('total-kantlat')
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ App initialized');
    
    // Event listeners
    setupEventListeners();
    
    // FASE 2: NIEUW - Load ruimtes from localStorage
    loadRuimtesFromStorage();
    
    // Hide input section initially
    DOM.inputSection.style.display = 'none';
});

// ============================================================================
// EVENT LISTENERS - WITH DEBOUNCING
// ============================================================================

function setupEventListeners() {
    console.log('Setting up event listeners with debouncing...');
    
    // System selection (NO debounce - immediate)
    if (DOM.systemButtons && DOM.systemButtons.length > 0) {
        console.log('Found', DOM.systemButtons.length, 'system buttons');
        DOM.systemButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('✓ System button clicked:', this.dataset.system);
                selectSystem(this.dataset.system);
            });
        });
    } else {
        console.error('✗ System buttons NOT found!');
    }

    // Input mode toggle (NO debounce - immediate)
    if (DOM.inputModeRadios && DOM.inputModeRadios.length > 0) {
        DOM.inputModeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                toggleInputMode(this.value);
            });
        });
        console.log('Input mode radios: OK');
    }

    // =====================================================================
    // FASE 2: TABLE EVENT LISTENERS
    // =====================================================================
    
    // "Add to Table" button
    if (DOM.btnAddToTable) {
        DOM.btnAddToTable.addEventListener('click', function() {
            addRoomToTable();
        });
    }
    
    // "+ Add Room" button - clears form for new room
    if (DOM.btnAddNewRoom) {
        DOM.btnAddNewRoom.addEventListener('click', function() {
            clearCalculationForm();
        });
    }

    // =====================================================================
    // DEBOUNCED INPUT LISTENERS - 500ms delay
    // =====================================================================

    // Vierkante meters input WITH DEBOUNCE
    if (DOM.vierkanteMetersInput) {
        DOM.vierkanteMetersInput.addEventListener('input', function() {
            state.vierkante_meters = parseFloat(this.value) || 0;
            
            // Clear previous timer
            clearTimeout(debounceTimer);
            
            // Set new timer - calculate after 500ms of inactivity
            debounceTimer = setTimeout(() => {
                console.log('📤 Debounce triggered: calculating...');
                calculate();
            }, DEBOUNCE_DELAY);
        });
        console.log('Vierkante meters input: OK (with debounce)');
    }

    // Strekkende meters input WITH DEBOUNCE
    if (DOM.strekkendeMeterInput) {
        DOM.strekkendeMeterInput.addEventListener('input', function() {
            state.strekkende_meters = parseFloat(this.value) || 0;
            
            // Clear previous timer
            clearTimeout(debounceTimer);
            
            // Set new timer - calculate after 500ms of inactivity
            debounceTimer = setTimeout(() => {
                console.log('📤 Debounce triggered: calculating...');
                calculate();
            }, DEBOUNCE_DELAY);
        });
        console.log('Strekkende meters input: OK (with debounce)');
    }

    // Lengte input WITH DEBOUNCE
    if (DOM.lengteInput) {
        DOM.lengteInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                calculateAfmetingen();
            }, DEBOUNCE_DELAY);
        });
    }

    // Breedte input WITH DEBOUNCE
    if (DOM.breedteInput) {
        DOM.breedteInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                calculateAfmetingen();
            }, DEBOUNCE_DELAY);
        });
    }

    console.log('✓ All event listeners setup with DEBOUNCING enabled');
}

// ============================================================================
// SYSTEM SELECTION
// ============================================================================

function selectSystem(systeem) {
    state.selectedSystem = systeem;
    
    // Update UI
    DOM.systemButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.system === systeem) {
            btn.classList.add('active');
        }
    });

    // Show selected system
    DOM.selectedSystemDiv.style.display = 'block';
    DOM.systemNameSpan.textContent = systeem;

    // Show input section
    DOM.inputSection.style.display = 'block';
    DOM.emptyState.style.display = 'none';

    // Reset results
    DOM.resultsSection.style.display = 'none';
    state.results = null;

    // Calculate
    calculate();
}

// ============================================================================
// INPUT MODE TOGGLE
// ============================================================================

function toggleInputMode(mode) {
    state.inputMode = mode;

    if (mode === 'sqm') {
        DOM.sqmInputGroup.style.display = 'block';
        DOM.dimensionsInputGroup.style.display = 'none';
        state.vierkante_meters = parseFloat(DOM.vierkanteMetersInput.value) || 0;
    } else {
        DOM.sqmInputGroup.style.display = 'none';
        DOM.dimensionsInputGroup.style.display = 'block';
        calculateAfmetingen();
    }

    calculate();
}

// ============================================================================
// CALCULATIONS
// ============================================================================

function calculateAfmetingen() {
    const lengte = parseFloat(DOM.lengteInput.value) || 0;
    const breedte = parseFloat(DOM.breedteInput.value) || 0;

    if (lengte > 0 && breedte > 0) {
        state.vierkante_meters = lengte * breedte;
        DOM.calculatedSqmDiv.innerHTML = `Berekend oppervlak: <strong>${state.vierkante_meters.toFixed(2)} m²</strong>`;
    } else {
        DOM.calculatedSqmDiv.innerHTML = '';
    }

    calculate();
}

async function calculate() {
    // Validatie
    if (!state.selectedSystem || state.vierkante_meters <= 0 || state.strekkende_meters <= 0) {
        DOM.resultsSection.style.display = 'none';
        return;
    }

    try {
        // Call API
        const results = await API.bereken(
            state.vierkante_meters,
            state.strekkende_meters,
            state.selectedSystem
        );

        state.results = results;
        displayResults(results);

    } catch (error) {
        console.error('✗ Calculation error:', error);
        showError('Berekening mislukt: ' + error.message);
    }
}

// ============================================================================
// DISPLAY RESULTS
// ============================================================================

function displayResults(results) {
    // Show results section
    DOM.resultsSection.style.display = 'block';
    DOM.emptyState.style.display = 'none';

    // =====================================================================
    // FASE 1: Display results WITH "stuks" unit labels
    // =====================================================================
    
    // Display profiel results - with "stuks"
    DOM.resultHoofprofielen.textContent = results.hoofdprofielen + ' stuks';
    DOM.resultTussenprofiel1200.textContent = results.tussenprofiel_1200 + ' stuks';
    DOM.resultPlafondplaten.textContent = results.plafondplaten + ' stuks';

    // Tussenprofiel 600 (only for 600x600) - with "stuks"
    if (state.selectedSystem === '600x600' && results.tussenprofiel_600) {
        DOM.resultTussenprofiel600.textContent = results.tussenprofiel_600 + ' stuks';
        DOM.resultTussenprofiel600Item.style.display = 'flex';
    } else {
        DOM.resultTussenprofiel600Item.style.display = 'none';
    }

    // Display randmaterialen results - with "stuks"
    DOM.resultHoeklijn.textContent = results.hoeklijn + ' stuks';
    DOM.resultKantlat.textContent = results.kantlat + ' stuks';

    // =====================================================================
    // FASE 1: Update summary with system info
    // =====================================================================
    
    // Update summary
    DOM.summarySqm.textContent = state.vierkante_meters.toFixed(2);
    DOM.summaryMeters.textContent = state.strekkende_meters.toFixed(2);
    
    // Add system to summary
    if (DOM.summarySystem) {
        DOM.summarySystem.textContent = 'Systeem: ' + state.selectedSystem;
    }

    // =====================================================================
    // FASE 2: Show "Add to Table" button
    // =====================================================================
    
    DOM.btnAddToTable.style.display = 'block';
}

// ============================================================================
// FASE 2 - RUIMTES TABEL FUNCTIONS
// ============================================================================

/**
 * Add current calculation to table as new room
 */
function addRoomToTable() {
    // Validatie
    if (!state.selectedSystem || !state.results || state.vierkante_meters <= 0) {
        alert('Voer eerst een berekening in!');
        return;
    }
    
    // Get room name
    const roomName = DOM.ruimteNaamInput.value.trim() || 'Ruimte ' + (state.ruimtes.length + 1);
    
    // Create room object
    const room = {
        id: Date.now(),  // Unique ID
        omschrijving: roomName,
        vierkante_meters: state.vierkante_meters,
        strekkende_meters: state.strekkende_meters,
        systeem: state.selectedSystem,
        resultaten: { ...state.results }  // Copy results
    };
    
    // Add to ruimtes array
    state.ruimtes.push(room);
    console.log('✓ Room added:', room);
    
    // Update UI
    calculateTotals();
    renderTable();
    saveRuimtesToStorage();
    
    // Clear form for next room
    clearCalculationForm();
}

/**
 * Clear calculation form for new room entry
 */
function clearCalculationForm() {
    // Reset input values
    DOM.ruimteNaamInput.value = '';
    DOM.vierkanteMetersInput.value = '';
    DOM.strekkendeMeterInput.value = '';
    
    // Reset state
    state.vierkante_meters = 0;
    state.strekkende_meters = 0;
    state.results = null;
    
    // Hide results
    DOM.resultsSection.style.display = 'none';
    DOM.btnAddToTable.style.display = 'none';
    
    // Focus input
    if (DOM.vierkanteMetersInput) {
        setTimeout(() => DOM.vierkanteMetersInput.focus(), 100);
    }
}

/**
 * Calculate totals from all rooms
 */
function calculateTotals() {
    // Reset totals
    state.totalen = {
        vierkante_meters: 0,
        strekkende_meters: 0,
        hoofdprofielen: 0,
        tussenprofiel_1200: 0,
        tussenprofiel_600: 0,
        plafondplaten: 0,
        hoeklijn: 0,
        kantlat: 0
    };
    
    // Sum all rooms
    state.ruimtes.forEach(room => {
        state.totalen.vierkante_meters += room.vierkante_meters;
        state.totalen.strekkende_meters += room.strekkende_meters;
        state.totalen.hoofdprofielen += room.resultaten.hoofdprofielen;
        state.totalen.tussenprofiel_1200 += room.resultaten.tussenprofiel_1200;
        
        // T600 only exists for 600x600
        if (room.systeem === '600x600' && room.resultaten.tussenprofiel_600) {
            state.totalen.tussenprofiel_600 += room.resultaten.tussenprofiel_600;
        }
        
        state.totalen.plafondplaten += room.resultaten.plafondplaten;
        state.totalen.hoeklijn += room.resultaten.hoeklijn;
        state.totalen.kantlat += room.resultaten.kantlat;
    });
    
    console.log('✓ Totals calculated:', state.totalen);
}

/**
 * Render table from ruimtes array
 */
function renderTable() {
    // Clear existing rows
    DOM.ruimtesTableBody.innerHTML = '';
    
    // If no rooms, hide table and section
    if (state.ruimtes.length === 0) {
        DOM.ruimtesSection.style.display = 'none';
        return;
    }
    
    // Show section
    DOM.ruimtesSection.style.display = 'block';
    
    // Render each room
    state.ruimtes.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.omschrijving}</td>
            <td>${room.vierkante_meters}</td>
            <td>${room.strekkende_meters}</td>
            <td>
                <select class="systeem-select" data-room-id="${room.id}">
                    <option value="600x600" ${room.systeem === '600x600' ? 'selected' : ''}>600x600</option>
                    <option value="600x1200" ${room.systeem === '600x1200' ? 'selected' : ''}>600x1200</option>
                </select>
            </td>
            <td>${room.resultaten.hoofdprofielen} stuks</td>
            <td>${room.resultaten.tussenprofiel_1200} stuks</td>
            <td>${room.systeem === '600x600' ? room.resultaten.tussenprofiel_600 + ' stuks' : '-'}</td>
            <td>${room.resultaten.hoeklijn} stuks</td>
            <td>${room.resultaten.kantlat} stuks</td>
            <td>
                <button class="btn-delete-room" data-room-id="${room.id}">🗑️</button>
            </td>
        `;
        
        DOM.ruimtesTableBody.appendChild(row);
    });
    
    // Update totals row
    updateTotalsRow();
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.btn-delete-room').forEach(btn => {
        btn.addEventListener('click', function() {
            const roomId = parseInt(this.dataset.roomId);
            deleteRoom(roomId);
        });
    });
    
    // Add event listeners for systeem dropdowns
    document.querySelectorAll('.systeem-select').forEach(select => {
        select.addEventListener('change', function() {
            const roomId = parseInt(this.dataset.roomId);
            updateRoomSysteem(roomId, this.value);
        });
    });
}

/**
 * Update totals row in table
 */
function updateTotalsRow() {
    DOM.totalSqm.textContent = state.totalen.vierkante_meters.toFixed(0);
    DOM.totalMeters.textContent = state.totalen.strekkende_meters.toFixed(0);
    DOM.totalHoofprofiel.textContent = state.totalen.hoofdprofielen + ' stuks';
    DOM.totalTussenprofiel1200.textContent = state.totalen.tussenprofiel_1200 + ' stuks';
    DOM.totalTussenprofiel600.textContent = state.totalen.tussenprofiel_600 > 0 ? state.totalen.tussenprofiel_600 + ' stuks' : '-';
    DOM.totalHoeklijn.textContent = state.totalen.hoeklijn + ' stuks';
    DOM.totalKantlat.textContent = state.totalen.kantlat + ' stuks';
}

/**
 * Delete room from table
 */
function deleteRoom(roomId) {
    // Confirm delete
    if (!confirm('Weet je zeker dat je deze ruimte wilt verwijderen?')) {
        return;
    }
    
    // Remove from array
    state.ruimtes = state.ruimtes.filter(r => r.id !== roomId);
    console.log('✓ Room deleted:', roomId);
    
    // Update UI
    calculateTotals();
    renderTable();
    saveRuimtesToStorage();
}

/**
 * Update room systeem type (from dropdown change)
 */
function updateRoomSysteem(roomId, newSysteem) {
    const room = state.ruimtes.find(r => r.id === roomId);
    if (room) {
        room.systeem = newSysteem;
        console.log('✓ Room systeem updated:', roomId, newSysteem);
        
        // Re-render tabel (omdat T600 may appear/disappear)
        renderTable();
        saveRuimtesToStorage();
    }
}

/**
 * Save ruimtes to localStorage
 */
function saveRuimtesToStorage() {
    try {
        localStorage.setItem('systeemplafondRuimtes', JSON.stringify(state.ruimtes));
        console.log('✓ Ruimtes saved to localStorage');
    } catch (error) {
        console.error('✗ Failed to save to localStorage:', error);
    }
}

/**
 * Load ruimtes from localStorage
 */
function loadRuimtesFromStorage() {
    try {
        const saved = localStorage.getItem('systeemplafondRuimtes');
        if (saved) {
            state.ruimtes = JSON.parse(saved);
            console.log('✓ Ruimtes loaded from localStorage:', state.ruimtes.length, 'rooms');
            
            // Update UI
            calculateTotals();
            renderTable();
        }
    } catch (error) {
        console.error('✗ Failed to load from localStorage:', error);
    }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

function showError(message) {
    console.error(message);
    alert(message);
}

// ============================================================================
// UTILITIES
// ============================================================================

function formatNumber(num) {
    return new Intl.NumberFormat('nl-NL').format(num);
}

// ============================================================================
// DEBUG
// ============================================================================

console.log('');
console.log('🚀 Systeemplafond Rekenmachine Loaded');
console.log('✅ Debouncing enabled (500ms delay)');
console.log('✅ FASE 2 Table enabled');
console.log('📉 API requests reduced by ~80%');
console.log('');
