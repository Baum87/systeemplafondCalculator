/**
 * Systeemplafond Rekenmachine - Main App Logic
 */

// ============================================================================
// STATE
// ============================================================================

const state = {
    selectedSystem: null,
    inputMode: 'sqm',
    vierkante_meters: 10,
    strekkende_meters: 10,
    results: null
};

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
    
    // Calculated sqm
    calculatedSqmDiv: document.getElementById('calculated-sqm')
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    
    // Event listeners
    setupEventListeners();
    
    // Hide input section initially
    DOM.inputSection.style.display = 'none';
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // System selection
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

    // Input mode toggle
    if (DOM.inputModeRadios && DOM.inputModeRadios.length > 0) {
        DOM.inputModeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                toggleInputMode(this.value);
            });
        });
        console.log('Input mode radios: OK');
    }

    // Input changes
    if (DOM.vierkanteMetersInput) {
        DOM.vierkanteMetersInput.addEventListener('input', function() {
            state.vierkante_meters = parseFloat(this.value) || 0;
            calculate();
        });
        console.log('Vierkante meters input: OK');
    }

    if (DOM.strekkendeMeterInput) {
        DOM.strekkendeMeterInput.addEventListener('input', function() {
            state.strekkende_meters = parseFloat(this.value) || 0;
            calculate();
        });
        console.log('Strekkende meters input: OK');
    }

    if (DOM.lengteInput && DOM.breedteInput) {
        DOM.lengteInput.addEventListener('input', calculateAfmetingen);
        DOM.breedteInput.addEventListener('input', calculateAfmetingen);
        console.log('Length/width inputs: OK');
    }

    console.log('✓ All event listeners setup complete');
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
        console.error('Calculation error:', error);
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

    // Display profiel results
    DOM.resultHoofprofielen.textContent = results.hoofdprofielen;
    DOM.resultTussenprofiel1200.textContent = results.tussenprofiel_1200;
    DOM.resultPlafondplaten.textContent = results.plafondplaten;

    // Tussenprofiel 600 (only for 600x600)
    if (state.selectedSystem === '600x600' && results.tussenprofiel_600) {
        DOM.resultTussenprofiel600.textContent = results.tussenprofiel_600;
        DOM.resultTussenprofiel600Item.style.display = 'flex';
    } else {
        DOM.resultTussenprofiel600Item.style.display = 'none';
    }

    // Display randmaterialen results
    DOM.resultHoeklijn.textContent = results.hoeklijn;
    DOM.resultKantlat.textContent = results.kantlat;

    // Update summary
    DOM.summarySqm.textContent = state.vierkante_meters.toFixed(2);
    DOM.summaryMeters.textContent = state.strekkende_meters.toFixed(2);
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