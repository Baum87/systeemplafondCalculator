/**
 * Systeemplafond Rekenmachine
 * Volledig lokaal — geen backend nodig.
 */

// ── Materiaalfactoren ──────────────────────────────────────────────────────

const SYSTEMEN = {
  '600x600': {
    label:    '600×600',
    plaatMaat: '600×600 mm',
    factoren: {
      plafondplaat:       2.78,
      hoofdprofiel:       0.2333,
      tussenprofiel_1200: 1.392,
      tussenprofiel_600:  1.392,
      hoeklijn:           1 / 3,
      kantlat:            1 / 3,
    }
  },
  '600x1200': {
    label:    '600×1200',
    plaatMaat: '600×1200 mm',
    factoren: {
      plafondplaat:       1.392,
      hoofdprofiel:       0.2333,
      tussenprofiel_1200: 1.392,
      tussenprofiel_600:  0,
      hoeklijn:           1 / 3,
      kantlat:            1 / 3,
    }
  }
};

// Profielmerken per systeemtype.
// Uitbreiden zodra een tweede merk ondersteund wordt — koppel dan
// aan een keuzelijst in de UI, net als bij plafondplaten.
const PROFIEL_MERKEN = {
  '600x600':  'API',
  '600x1200': 'API',
};

const MATERIAAL_VOLGORDE = [
  'Plafondplaten',
  'Hoofdprofielen',
  'Tussenprofielen 1200',
  'Tussenprofielen 600',
  'Hoeklijn',
  'Kantlat'
];

// ── State ──────────────────────────────────────────────────────────────────

let gekozenSysteem  = null;   // '600x600' | '600x1200'
var extraMaterialen  = [];    // handmatig toegevoegde items
let gekozenKleur    = 'wit';  // 'wit' | 'zwart'
let gekozenMerk     = '';     // string
let invoerModus     = 'sqm';  // 'sqm' | 'dimensions'
let ruimtes         = [];
let debounceTimer   = null;

// ── Berekening ─────────────────────────────────────────────────────────────

function bereken(sqm, omtrek, systeemId) {
  const f = SYSTEMEN[systeemId].factoren;
  return {
    plafondplaten:      Math.ceil(sqm   * f.plafondplaat),
    hoofdprofielen:     Math.ceil(sqm   * f.hoofdprofiel),
    tussenprofiel_1200: Math.ceil(sqm   * f.tussenprofiel_1200),
    tussenprofiel_600:  f.tussenprofiel_600 > 0 ? Math.ceil(sqm * f.tussenprofiel_600) : null,
    hoeklijn:           Math.ceil(omtrek * f.hoeklijn),
    kantlat:            Math.ceil(omtrek * f.kantlat),
  };
}

// ── Invoer lezen ───────────────────────────────────────────────────────────

function getSqm() {
  if (invoerModus === 'sqm') {
    return parseFloat(document.getElementById('vierkante-meters').value) || 0;
  }
  const l = parseFloat(document.getElementById('lengte').value)  || 0;
  const b = parseFloat(document.getElementById('breedte').value) || 0;
  return (l > 0 && b > 0) ? l * b : 0;
}

function getOmtrek() {
  return parseFloat(document.getElementById('strekkende-meters').value) || 0;
}

function getMerk() {
  const sel = document.getElementById('plaat-merk').value;
  if (sel === 'anders') {
    return document.getElementById('plaat-merk-anders').value.trim();
  }
  return sel;
}

// ── Statusbalk ─────────────────────────────────────────────────────────────

function updateStatus() {
  const knop    = document.getElementById('btn-toevoegen');
  const status  = document.getElementById('calc-status');
  const sqm     = getSqm();
  const omtrek  = getOmtrek();
  const merk    = getMerk();

  function setStatus(tekst, cls) {
    status.textContent = tekst;
    status.className   = 'calc-status' + (cls ? ' ' + cls : '');
  }

  if (!gekozenSysteem) {
    setStatus('Kies een systeemtype', ''); knop.disabled = true; return;
  }
  if (sqm <= 0) {
    setStatus('Voer een geldige oppervlakte in', ''); knop.disabled = true; return;
  }
  if (omtrek <= 0) {
    setStatus('Voer een geldige omtrek in', ''); knop.disabled = true; return;
  }

  setStatus('Klaar om toe te voegen', 'ready');
  knop.disabled = false;
}

function debounceUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateStatus, 400);
}

// ── Helpers weergave ───────────────────────────────────────────────────────

function kleurSwatch(kleur) {
  var bg   = kleur === 'zwart' ? '#1C2B3A' : '#ffffff';
  var rand = kleur === 'zwart' ? '#1C2B3A' : '#CECCBF';
  var cap  = kleur.charAt(0).toUpperCase() + kleur.slice(1);
  return '<span style="display:inline-block;width:11px;height:11px;border-radius:2px;' +
         'background:' + bg + ';border:1.5px solid ' + rand + ';' +
         'vertical-align:middle;margin-right:5px;"></span>' + cap;
}

function fmtSqm(n) {
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Tabel renderen ─────────────────────────────────────────────────────────

function renderTabel() {
  var resultsEl = document.getElementById('results-section');
  var countEl   = document.getElementById('count-ruimtes');
  var tbody     = document.getElementById('ruimtes-tbody');
  var totSqmEl  = document.getElementById('total-sqm');
  var totOmEl   = document.getElementById('total-omtrek');
  var totaalEl  = document.getElementById('tbody-totalen');

  resultsEl.style.display = ruimtes.length > 0 ? 'flex' : 'none';
  countEl.textContent = ruimtes.length + ' ruimte' + (ruimtes.length !== 1 ? 's' : '');

  if (ruimtes.length === 0) {
    tbody.innerHTML    = '<tr class="empty-row"><td colspan="13">Nog geen ruimtes toegevoegd</td></tr>';
    totSqmEl.textContent  = '0';
    totOmEl.textContent   = '0';
    totaalEl.innerHTML = '<tr class="empty-row"><td colspan="6">Nog geen ruimtes toegevoegd</td></tr>';
    return;
  }

  // Ruimterijen
  var html = '';
  for (var i = 0; i < ruimtes.length; i++) {
    var r   = ruimtes[i];
    var res = r.resultaten;
    html += '<tr>' +
      '<td>' + esc(r.naam) + '</td>' +
      '<td>' + SYSTEMEN[r.systeem].label + '</td>' +
      '<td style="max-width:110px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' + esc(r.merk) + '">' + esc(r.merk || '\u2014') + '</td>' +
      '<td>' + kleurSwatch(r.kleur) + '</td>' +
      '<td class="num">' + fmtSqm(r.sqm) + '</td>' +
      '<td class="num">' + r.omtrek + '</td>' +
      '<td class="num">' + res.plafondplaten + '</td>' +
      '<td class="num">' + res.hoofdprofielen + '</td>' +
      '<td class="num">' + res.tussenprofiel_1200 + '</td>' +
      '<td class="num">' + (res.tussenprofiel_600 !== null ? res.tussenprofiel_600 : '\u2014') + '</td>' +
      '<td class="num">' + res.hoeklijn + '</td>' +
      '<td class="num">' + res.kantlat + '</td>' +
      '<td><button class="btn-delete-room" data-id="' + r.id + '" title="Verwijder">\u2715</button></td>' +
      '</tr>';
  }
  tbody.innerHTML = html;

  // Delete listeners
  var delBtns = tbody.querySelectorAll('.btn-delete-room');
  for (var d = 0; d < delBtns.length; d++) {
    delBtns[d].addEventListener('click', function() {
      verwijderRuimte(Number(this.dataset.id));
    });
  }

  // Totaalrij
  var totSqm = 0, totOmtrek = 0;
  for (var j = 0; j < ruimtes.length; j++) {
    totSqm    += ruimtes[j].sqm;
    totOmtrek += ruimtes[j].omtrek;
  }
  totSqmEl.textContent = fmtSqm(totSqm);
  totOmEl.textContent  = totOmtrek;

  renderTotaalTabel();
}

// ── Totaaloverzicht ────────────────────────────────────────────────────────

function renderTotaalTabel() {
  var totaalEl = document.getElementById('tbody-totalen');

  // Bouw map op: key → {materiaal, merk, maat, kleur, aantal}
  var map = {};

  function add(materiaal, subkey, merk, maat, kleur, n) {
    var key = materiaal + '||' + subkey;
    if (!map[key]) {
      map[key] = { materiaal: materiaal, merk: merk, maat: maat, kleur: kleur, aantal: 0 };
    }
    map[key].aantal += n;
  }

  for (var i = 0; i < ruimtes.length; i++) {
    var r   = ruimtes[i];
    var res = r.resultaten;
    var sys = SYSTEMEN[r.systeem];

    add('Plafondplaten',      r.merk + '|' + sys.plaatMaat, r.merk, sys.plaatMaat, null, res.plafondplaten);
    var profielMerk = PROFIEL_MERKEN[r.systeem] || '';
    add('Hoofdprofielen',       r.kleur, profielMerk, '3600 mm', r.kleur, res.hoofdprofielen);
    add('Tussenprofielen 1200', r.kleur, profielMerk, '1200 mm', r.kleur, res.tussenprofiel_1200);
    if (res.tussenprofiel_600 !== null) {
      add('Tussenprofielen 600', r.kleur, profielMerk, '600 mm', r.kleur, res.tussenprofiel_600);
    }
    add('Hoeklijn',  r.kleur, profielMerk, '3000 mm', r.kleur, res.hoeklijn);
    add('Kantlat',   'kantlat', '', '3000 mm', null, res.kantlat);
  }

  // Sorteer op vaste volgorde
  var keys = Object.keys(map);
  keys.sort(function(a, b) {
    var ia = MATERIAAL_VOLGORDE.indexOf(map[a].materiaal);
    var ib = MATERIAAL_VOLGORDE.indexOf(map[b].materiaal);
    if (ia !== ib) return ia - ib;
    return a.localeCompare(b);
  });

  var html = '';
  var huidigMateriaal = null;

  for (var k = 0; k < keys.length; k++) {
    var item = map[keys[k]];

    if (item.materiaal !== huidigMateriaal) {
      huidigMateriaal = item.materiaal;
      html += '<tr class="totaal-categorie-header"><td colspan="6">' + esc(item.materiaal) + '</td></tr>';
    }

    var kleurCel = item.kleur
      ? kleurSwatch(item.kleur)
      : '<span style="color:var(--ink-3)">\u2014</span>';

    var merkCel = item.merk
      ? esc(item.merk)
      : '<span style="color:var(--ink-3)">\u2014</span>';

    html += '<tr>' +
      '<td>' + esc(item.materiaal) + '</td>' +
      '<td>' + merkCel + '</td>' +
      '<td class="num">' + esc(item.maat) + '</td>' +
      '<td>' + kleurCel + '</td>' +
      '<td class="num">' + item.aantal + '</td>' +
      '<td>st</td>' +
      '</tr>';
  }

  // ── Handmatig toegevoegde materialen ─────────────────────────────────────
  if (extraMaterialen.length > 0) {
    html += '<tr class="totaal-categorie-header totaal-header-extra"><td colspan="6">Handmatig toegevoegd</td></tr>';
    for (var e = 0; e < extraMaterialen.length; e++) {
      var em = extraMaterialen[e];
      html += '<tr class="extra-rij">' +
        '<td colspan="4">' + esc(em.omschrijving) + '</td>' +
        '<td class="num">' + em.aantal + '</td>' +
        '<td>' + esc(em.eenheid) + ' ' +
          '<button class="btn-delete-room" style="margin-left:4px;" onclick="verwijderExtra(' + em.id + ')" title="Verwijder">✕</button>' +
        '</td>' +
        '</tr>';
    }
  }

  totaalEl.innerHTML = html || '<tr class="empty-row"><td colspan="6">—</td></tr>';
}

// ── Toevoegen / verwijderen ────────────────────────────────────────────────

function voegToe() {
  var sqm    = getSqm();
  var omtrek = getOmtrek();
  var merk   = getMerk();

  if (!gekozenSysteem || sqm <= 0 || omtrek <= 0) return;

  var naamInput = document.getElementById('ruimte-naam');
  var naam = naamInput.value.trim() || ('Ruimte ' + (ruimtes.length + 1));

  ruimtes.push({
    id:         Date.now(),
    naam:       naam,
    sqm:        sqm,
    omtrek:     omtrek,
    systeem:    gekozenSysteem,
    kleur:      gekozenKleur,
    merk:       merk,
    resultaten: bereken(sqm, omtrek, gekozenSysteem)
  });

  slaOp();
  renderTabel();
  resetInvoer();
}

function verwijderRuimte(id) {
  ruimtes = ruimtes.filter(function(r) { return r.id !== id; });
  slaOp();
  renderTabel();
}

function resetInvoer() {
  var volgend = ruimtes.length + 1;
  document.getElementById('ruimte-naam').value         = 'Ruimte ' + volgend;
  document.getElementById('vierkante-meters').value    = '';
  document.getElementById('lengte').value              = '';
  document.getElementById('breedte').value             = '';
  document.getElementById('strekkende-meters').value   = '';
  document.getElementById('berekende-sqm').textContent = '\u2014';
  document.getElementById('btn-toevoegen').disabled    = true;
  document.getElementById('calc-status').textContent   = '';
  document.getElementById('calc-status').className     = 'calc-status';
  document.getElementById('vierkante-meters').focus();
}

// ── Invoermodus ────────────────────────────────────────────────────────────

function setInvoerModus(modus) {
  invoerModus = modus;
  var isDim = modus === 'dimensions';
  document.getElementById('sqm-input-group').style.display       = isDim ? 'none' : '';
  document.getElementById('lengte-input-group').style.display    = isDim ? '' : 'none';
  document.getElementById('breedte-input-group').style.display   = isDim ? '' : 'none';
  document.getElementById('berekende-sqm-group').style.display   = isDim ? '' : 'none';
  updateStatus();
}

// ── Persistentie ───────────────────────────────────────────────────────────

function slaOp() {
  try {
    localStorage.setItem('sp_ruimtes', JSON.stringify(ruimtes));
    localStorage.setItem('sp_project', document.getElementById('project-naam').value);
    localStorage.setItem('sp_extra', JSON.stringify(extraMaterialen));
  } catch(e) {}
}

function laadOp() {
  try {
    var opgeslagenRuimtes  = localStorage.getItem('sp_ruimtes');
    var opgeslagenProject  = localStorage.getItem('sp_project');
    var opgeslagenExtra    = localStorage.getItem('sp_extra');
    if (opgeslagenRuimtes) ruimtes = JSON.parse(opgeslagenRuimtes);
    if (opgeslagenProject) document.getElementById('project-naam').value = opgeslagenProject;
    if (opgeslagenExtra)   extraMaterialen = JSON.parse(opgeslagenExtra);
  } catch(e) {}
}

function resetAlles() {
  if ((ruimtes.length > 0 || extraMaterialen.length > 0) &&
      !confirm('Alle ruimtes, handmatige items en projectnaam verwijderen?')) return;
  ruimtes = [];
  extraMaterialen = [];
  document.getElementById('project-naam').value = '';
  localStorage.removeItem('sp_ruimtes');
  localStorage.removeItem('sp_project');
  localStorage.removeItem('sp_extra');
  renderTabel();
  resetInvoer();
}

// ── Handmatig materiaal toevoegen ────────────────────────────────────────────

function voegHandmatigToe() {
  var omschrijving = document.getElementById('extra-omschrijving').value.trim();
  var aantalRaw    = document.getElementById('extra-aantal').value;
  var eenheid      = document.getElementById('extra-eenheid').value.trim() || 'st';
  var aantal       = parseFloat(aantalRaw);

  if (!omschrijving || isNaN(aantal) || aantal <= 0) {
    document.getElementById('extra-omschrijving').focus();
    return;
  }

  extraMaterialen.push({
    id:           Date.now(),
    omschrijving: omschrijving,
    aantal:       aantal,
    eenheid:      eenheid,
  });

  document.getElementById('extra-omschrijving').value = '';
  document.getElementById('extra-aantal').value       = '';
  document.getElementById('extra-eenheid').value      = '';

  slaOp();
  renderTotaalTabel();
}

function verwijderExtra(id) {
  extraMaterialen = extraMaterialen.filter(function(e) { return e.id !== id; });
  slaOp();
  renderTotaalTabel();
}

// ── Init ───────────────────────────────────────────────────────────────────

window.addEventListener('load', function() {

  laadOp();
  renderTabel();

  // Systeemknoppen
  var systeemBtns = document.querySelectorAll('[data-system]');
  for (var i = 0; i < systeemBtns.length; i++) {
    systeemBtns[i].addEventListener('click', function() {
      gekozenSysteem = this.dataset.system;
      for (var j = 0; j < systeemBtns.length; j++) {
        systeemBtns[j].classList.remove('active');
      }
      this.classList.add('active');
      updateStatus();
    });
  }

  // Kleurknoppen
  var kleurBtns = document.querySelectorAll('[data-kleur]');
  for (var i = 0; i < kleurBtns.length; i++) {
    kleurBtns[i].addEventListener('click', function() {
      gekozenKleur = this.dataset.kleur;
      for (var j = 0; j < kleurBtns.length; j++) {
        kleurBtns[j].classList.remove('active');
      }
      this.classList.add('active');
      updateStatus();
    });
  }

  // Plaatmerk select
  document.getElementById('plaat-merk').addEventListener('change', function() {
    var isAnders = this.value === 'anders';
    document.getElementById('plaat-merk-anders').style.display = isAnders ? '' : 'none';
    if (isAnders) {
      document.getElementById('plaat-merk-anders').focus();
    }
    updateStatus();
  });

  document.getElementById('plaat-merk-anders').addEventListener('input', debounceUpdate);

  // Invoermodus radio
  var modeRadios = document.querySelectorAll('input[name="input-mode"]');
  for (var i = 0; i < modeRadios.length; i++) {
    modeRadios[i].addEventListener('change', function() {
      setInvoerModus(this.value);
    });
  }

  // Numerieke inputs
  var numInputs = [
    document.getElementById('vierkante-meters'),
    document.getElementById('lengte'),
    document.getElementById('breedte'),
    document.getElementById('strekkende-meters')
  ];
  for (var i = 0; i < numInputs.length; i++) {
    numInputs[i].addEventListener('input', function() {
      if (invoerModus === 'dimensions') {
        var l = parseFloat(document.getElementById('lengte').value)  || 0;
        var b = parseFloat(document.getElementById('breedte').value) || 0;
        document.getElementById('berekende-sqm').textContent =
          (l > 0 && b > 0) ? (l * b).toFixed(2) + ' m\u00b2' : '\u2014';
      }
      debounceUpdate();
    });
  }

  // Handmatig toevoegen
  document.getElementById('btn-handmatig-add').addEventListener('click', voegHandmatigToe);

  // Enter in handmatig velden
  var handmatigInputs = [
    document.getElementById('extra-omschrijving'),
    document.getElementById('extra-aantal'),
    document.getElementById('extra-eenheid')
  ];
  for (var i = 0; i < handmatigInputs.length; i++) {
    handmatigInputs[i].addEventListener('keydown', function(e) {
      if (e.key === 'Enter') voegHandmatigToe();
    });
  }

  // Toevoegen
  document.getElementById('btn-toevoegen').addEventListener('click', voegToe);

  // Reset alles
  document.getElementById('btn-alles-reset').addEventListener('click', resetAlles);

  // Projectnaam opslaan
  document.getElementById('project-naam').addEventListener('input', slaOp);

  // Initiële statusmelding
  document.getElementById('calc-status').textContent = 'Kies een systeemtype om te beginnen';

});
