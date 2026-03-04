/**
 * Systeemplafond Rekenmachine
 * Alle berekeningen lokaal in JS — geen backend nodig.
 */

// ============================================================================
// CONSTANTEN — materiaalfactoren per m² of per strekkende meter
// ============================================================================

const SYSTEMEN = {
  '600x600': {
    label:              '600×600',
    hoofdprofiel:       0.2333,  // stuks per m²  (3600mm profiel, hart op hart 600mm → 1/0.6/7.2=nee, afgeleid)
    tussenprofiel_1200: 1.392,   // stuks per m²
    tussenprofiel_600:  1.392,   // stuks per m²  (alleen 600×600)
    plafondplaat:       2.78,    // stuks per m²  (600×600 tegel)
    hoeklijn:           1 / 3,   // stuks per strekkende meter (3000mm)
    kantlat:            1 / 3,   // stuks per strekkende meter (3000mm)
  },
  '600x1200': {
    label:              '600×1200',
    hoofdprofiel:       0.2333,
    tussenprofiel_1200: 1.392,
    tussenprofiel_600:  0,       // niet van toepassing
    plafondplaat:       1.392,   // stuks per m²  (600×1200 plaat)
    hoeklijn:           1 / 3,
    kantlat:            1 / 3,
  },
};

const DEBOUNCE_MS = 400;

// ============================================================================
// STATE
// ============================================================================

const state = {
  systeem:    null,   // '600x600' | '600x1200'
  inputMode:  'sqm',  // 'sqm' | 'dimensions'
  ruimtes:    [],     // [{ id, naam, sqm, omtrek, systeem, resultaten }]
};

// ============================================================================
// DOM — eenmalig ophalen
// ============================================================================

const D = {
  // Knoppen systeem
  systeemBtns:    document.querySelectorAll('[data-system]'),

  // Input mode
  modeRadios:     document.querySelectorAll('input[name="input-mode"]'),
  sqmGroup:       document.getElementById('sqm-input-group'),
  lengteGroup:    document.getElementById('lengte-input-group'),
  breedteGroup:   document.getElementById('breedte-input-group'),
  berekendeGroup: document.getElementById('berekende-sqm-group'),
  berekendeSqm:   document.getElementById('berekende-sqm'),

  // Inputs
  ruimteNaam:     document.getElementById('ruimte-naam'),
  sqmInput:       document.getElementById('vierkante-meters'),
  lengteInput:    document.getElementById('lengte'),
  breedteInput:   document.getElementById('breedte'),
  omtrekInput:    document.getElementById('strekkende-meters'),

  // Acties
  btnToevoegen:   document.getElementById('btn-toevoegen'),
  calcStatus:     document.getElementById('calc-status'),

  // Header
  projectNaam:    document.getElementById('project-naam'),
  btnReset:       document.getElementById('btn-alles-reset'),

  // Resultaten
  resultsSection: document.getElementById('results-section'),
  countRuimtes:   document.getElementById('count-ruimtes'),
  ruimtesTbody:   document.getElementById('ruimtes-tbody'),

  // Totaalrij ruimtetabel
  totalSqm:       document.getElementById('total-sqm'),
  totalOmtrek:    document.getElementById('total-omtrek'),
  totalPlaten:    document.getElementById('total-platen'),
  totalHprofiel:  document.getElementById('total-hprofiel'),
  totalT1200:     document.getElementById('total-t1200'),
  totalT600:      document.getElementById('total-t600'),
  totalHoeklijn:  document.getElementById('total-hoeklijn'),
  totalKantlat:   document.getElementById('total-kantlat'),

  // Totaaloverzicht tabel
  tbodyTotalen:   document.getElementById('tbody-totalen'),
};

// ============================================================================
// BEREKENING — pure functie, geen side-effects
// ============================================================================

function bereken(sqm, omtrek, systeemId) {
  const s = SYSTEMEN[systeemId];
  return {
    plafondplaten:      Math.ceil(sqm * s.plafondplaat),
    hoofdprofielen:     Math.ceil(sqm * s.hoofdprofiel),
    tussenprofiel_1200: Math.ceil(sqm * s.tussenprofiel_1200),
    tussenprofiel_600:  s.tussenprofiel_600 > 0 ? Math.ceil(sqm * s.tussenprofiel_600) : null,
    hoeklijn:           Math.ceil(omtrek * s.hoeklijn),
    kantlat:            Math.ceil(omtrek * s.kantlat),
  };
}

// ============================================================================
// VALIDATIE & STATUS
// ============================================================================

let debounceTimer = null;

function getSqm() {
  if (state.inputMode === 'sqm') {
    return parseFloat(D.sqmInput.value) || 0;
  }
  const l = parseFloat(D.lengteInput.value) || 0;
  const b = parseFloat(D.breedteInput.value) || 0;
  return l > 0 && b > 0 ? l * b : 0;
}

function getOmtrek() {
  return parseFloat(D.omtrekInput.value) || 0;
}

function updateStatus() {
  const sqm    = getSqm();
  const omtrek = getOmtrek();

  if (!state.systeem) {
    setStatus('Kies eerst een systeemtype', '');
    D.btnToevoegen.disabled = true;
    return;
  }
  if (sqm <= 0) {
    setStatus('Voer een geldige oppervlakte in', '');
    D.btnToevoegen.disabled = true;
    return;
  }
  if (omtrek <= 0) {
    setStatus('Voer een geldige omtrek in', '');
    D.btnToevoegen.disabled = true;
    return;
  }

  // Alles geldig — toon preview
  const r = bereken(sqm, omtrek, state.systeem);
  setStatus(
    `${r.plafondplaten} platen · ${r.hoofdprofielen} H-prof · ${r.tussenprofiel_1200} T-1200` +
    (r.tussenprofiel_600 !== null ? ` · ${r.tussenprofiel_600} T-600` : '') +
    ` · ${r.hoeklijn} hoeklijn · ${r.kantlat} kantlat`,
    'ready'
  );
  D.btnToevoegen.disabled = false;
}

function setStatus(tekst, klasse) {
  D.calcStatus.textContent = tekst;
  D.calcStatus.className = 'calc-status' + (klasse ? ' ' + klasse : '');
}

function debounceUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateStatus, DEBOUNCE_MS);
}

// ============================================================================
// TABEL RENDEREN
// ============================================================================

function renderTabel() {
  const ruimtes = state.ruimtes;

  // Sectie tonen/verbergen
  D.resultsSection.style.display = ruimtes.length > 0 ? 'flex' : 'none';
  D.countRuimtes.textContent = `${ruimtes.length} ruimte${ruimtes.length !== 1 ? 's' : ''}`;

  if (ruimtes.length === 0) {
    D.ruimtesTbody.innerHTML = '<tr class="empty-row"><td colspan="11">Nog geen ruimtes toegevoegd</td></tr>';
    resetTotaalrij();
    renderTotaalTabel([]);
    return;
  }

  // Ruimterijen
  D.ruimtesTbody.innerHTML = ruimtes.map(r => {
    const res = r.resultaten;
    return `
      <tr>
        <td>${escHtml(r.naam)}</td>
        <td>${SYSTEMEN[r.systeem].label}</td>
        <td class="num">${r.sqm % 1 === 0 ? r.sqm : r.sqm.toFixed(2)}</td>
        <td class="num">${r.omtrek}</td>
        <td class="num">${res.plafondplaten}</td>
        <td class="num">${res.hoofdprofielen}</td>
        <td class="num">${res.tussenprofiel_1200}</td>
        <td class="num">${res.tussenprofiel_600 !== null ? res.tussenprofiel_600 : '—'}</td>
        <td class="num">${res.hoeklijn}</td>
        <td class="num">${res.kantlat}</td>
        <td>
          <button class="btn-delete-room" data-id="${r.id}" title="Verwijder">✕</button>
        </td>
      </tr>`;
  }).join('');

  // Delete listeners
  D.ruimtesTbody.querySelectorAll('.btn-delete-room').forEach(btn => {
    btn.addEventListener('click', () => verwijderRuimte(Number(btn.dataset.id)));
  });

  // Totalen berekenen
  const totalen = ruimtes.reduce((acc, r) => {
    const res = r.resultaten;
    acc.sqm       += r.sqm;
    acc.omtrek    += r.omtrek;
    acc.platen    += res.plafondplaten;
    acc.hprofiel  += res.hoofdprofielen;
    acc.t1200     += res.tussenprofiel_1200;
    acc.t600      += res.tussenprofiel_600 ?? 0;
    acc.hoeklijn  += res.hoeklijn;
    acc.kantlat   += res.kantlat;
    return acc;
  }, { sqm: 0, omtrek: 0, platen: 0, hprofiel: 0, t1200: 0, t600: 0, hoeklijn: 0, kantlat: 0 });

  // Totaalrij bijwerken
  D.totalSqm.textContent      = totalen.sqm % 1 === 0 ? totalen.sqm : totalen.sqm.toFixed(2);
  D.totalOmtrek.textContent   = totalen.omtrek;
  D.totalPlaten.textContent   = totalen.platen;
  D.totalHprofiel.textContent = totalen.hprofiel;
  D.totalT1200.textContent    = totalen.t1200;
  D.totalT600.textContent     = totalen.t600 > 0 ? totalen.t600 : '—';
  D.totalHoeklijn.textContent = totalen.hoeklijn;
  D.totalKantlat.textContent  = totalen.kantlat;

  renderTotaalTabel(totalen);
}

function resetTotaalrij() {
  ['totalSqm','totalOmtrek','totalPlaten','totalHprofiel','totalT1200','totalT600','totalHoeklijn','totalKantlat']
    .forEach(k => D[k].textContent = '0');
}

function renderTotaalTabel(totalen) {
  if (!totalen || totalen.platen === 0) {
    D.tbodyTotalen.innerHTML = '<tr class="empty-row"><td colspan="4">Nog geen ruimtes toegevoegd</td></tr>';
    return;
  }

  const rijen = [
    { naam: 'Plafondplaten',          maat: '600×600 mm / 600×1200 mm', aantal: totalen.platen },
    { naam: 'Hoofdprofielen',         maat: '3600 mm',                  aantal: totalen.hprofiel },
    { naam: 'Tussenprofielen 1200',   maat: '1200 mm',                  aantal: totalen.t1200 },
    totalen.t600 > 0
      ? { naam: 'Tussenprofielen 600', maat: '600 mm',                  aantal: totalen.t600 }
      : null,
    { naam: 'Hoeklijn',               maat: '3000 mm',                  aantal: totalen.hoeklijn },
    { naam: 'Kantlat',                maat: '3000 mm',                  aantal: totalen.kantlat },
  ].filter(Boolean);

  D.tbodyTotalen.innerHTML = rijen.map(r => `
    <tr>
      <td>${r.naam}</td>
      <td class="num">${r.maat}</td>
      <td class="num">${r.aantal}</td>
      <td>st</td>
    </tr>`).join('');
}

// ============================================================================
// RUIMTE TOEVOEGEN / VERWIJDEREN
// ============================================================================

function voegToe() {
  const sqm    = getSqm();
  const omtrek = getOmtrek();
  if (!state.systeem || sqm <= 0 || omtrek <= 0) return;

  const naam = D.ruimteNaam.value.trim() || `Ruimte ${state.ruimtes.length + 1}`;

  state.ruimtes.push({
    id:         Date.now(),
    naam,
    sqm,
    omtrek,
    systeem:    state.systeem,
    resultaten: bereken(sqm, omtrek, state.systeem),
  });

  slaOp();
  renderTabel();
  resetInvoer();
}

function verwijderRuimte(id) {
  state.ruimtes = state.ruimtes.filter(r => r.id !== id);
  slaOp();
  renderTabel();
}

function resetInvoer() {
  // Verhoog ruimtenummer
  const volgend = state.ruimtes.length + 1;
  D.ruimteNaam.value   = `Ruimte ${volgend}`;
  D.sqmInput.value     = '';
  D.lengteInput.value  = '';
  D.breedteInput.value = '';
  D.omtrekInput.value  = '';
  D.berekendeSqm.textContent = '—';
  D.btnToevoegen.disabled = true;
  setStatus('', '');
  D.sqmInput.focus();
}

// ============================================================================
// INVOERMODUS WISSELEN
// ============================================================================

function setInputMode(mode) {
  state.inputMode = mode;
  const isDim = mode === 'dimensions';

  D.sqmGroup.style.display       = isDim ? 'none' : '';
  D.lengteGroup.style.display    = isDim ? '' : 'none';
  D.breedteGroup.style.display   = isDim ? '' : 'none';
  D.berekendeGroup.style.display = isDim ? '' : 'none';

  updateStatus();
}

// ============================================================================
// PERSISTENTIE
// ============================================================================

function slaOp() {
  try {
    localStorage.setItem('sp_ruimtes',     JSON.stringify(state.ruimtes));
    localStorage.setItem('sp_project',     D.projectNaam.value);
  } catch (_) {}
}

function laadOp() {
  try {
    const ruimtes = localStorage.getItem('sp_ruimtes');
    const project = localStorage.getItem('sp_project');
    if (ruimtes) state.ruimtes = JSON.parse(ruimtes);
    if (project) D.projectNaam.value = project;
  } catch (_) {}
}

function resetAlles() {
  if (state.ruimtes.length > 0 && !confirm('Alle ruimtes en resultaten verwijderen?')) return;
  state.ruimtes = [];
  D.projectNaam.value = '';
  localStorage.removeItem('sp_ruimtes');
  localStorage.removeItem('sp_project');
  renderTabel();
  resetInvoer();
}

// ============================================================================
// HELPERS
// ============================================================================

function escHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ============================================================================
// INITIALISATIE
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {

  // Laad opgeslagen data
  laadOp();
  renderTabel();

  // Systeemknoppen
  D.systeemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.systeem = btn.dataset.system;
      D.systeemBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateStatus();
    });
  });

  // Invoermodus
  D.modeRadios.forEach(radio => {
    radio.addEventListener('change', () => setInputMode(radio.value));
  });

  // Numerieke inputs met debounce
  [D.sqmInput, D.lengteInput, D.breedteInput, D.omtrekInput].forEach(input => {
    input.addEventListener('input', () => {
      // Toon live berekende m² bij dimensie-modus
      if (state.inputMode === 'dimensions') {
        const l = parseFloat(D.lengteInput.value) || 0;
        const b = parseFloat(D.breedteInput.value) || 0;
        D.berekendeSqm.textContent = (l > 0 && b > 0) ? `${(l * b).toFixed(2)} m²` : '—';
      }
      debounceUpdate();
    });
  });

  // Toevoegen
  D.btnToevoegen.addEventListener('click', voegToe);

  // Reset alles
  D.btnReset.addEventListener('click', resetAlles);

  // Projectnaam opslaan bij wijziging
  D.projectNaam.addEventListener('input', slaOp);

  // Initiële status
  setStatus('Kies eerst een systeemtype', '');
});
