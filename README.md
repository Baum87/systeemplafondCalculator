# Systeemplafond Rekenmachine

Materiaalcalculator voor systeemplafonds. Berekent alle benodigde materialen op basis van oppervlakte en omtrek per ruimte.

---

## Bestanden

```
systeemplafond/
├── index.html      # HTML interface
├── app.js          # Alle logica en berekeningen
└── style.css       # Gedeelde stijl (afbouwr.nl)
```

> **Geen backend nodig.** Alle berekeningen gebeuren lokaal in de browser.

---

## Hoe het werkt

1. Kies een systeemtype (600×600 of 600×1200)
2. Vul omschrijving, oppervlakte en omtrek in
3. De statusbalk toont direct een preview van de berekening
4. Klik **+ Toevoegen aan lijst** om de ruimte op te slaan
5. Voeg meerdere ruimtes toe — totalen worden automatisch bijgehouden
6. Gebruik **⎙ Afdrukken** voor een overzicht op papier

Ruimtes en projectnaam worden opgeslagen in `localStorage` en blijven bewaard bij het herladen van de pagina.

---

## Materiaalfactoren

### 600×600 systeem

| Materiaal            | Factor            |
|----------------------|-------------------|
| Plafondplaten        | 2,78 st / m²      |
| Hoofdprofielen       | 0,2333 st / m²    |
| Tussenprofielen 1200 | 1,392 st / m²     |
| Tussenprofielen 600  | 1,392 st / m²     |
| Hoeklijn (3000 mm)   | 0,333 st / str. m |
| Kantlat (3000 mm)    | 0,333 st / str. m |

### 600×1200 systeem

| Materiaal            | Factor            |
|----------------------|-------------------|
| Plafondplaten        | 1,392 st / m²     |
| Hoofdprofielen       | 0,2333 st / m²    |
| Tussenprofielen 1200 | 1,392 st / m²     |
| Hoeklijn (3000 mm)   | 0,333 st / str. m |
| Kantlat (3000 mm)    | 0,333 st / str. m |

Alle aantallen worden naar boven afgerond (`Math.ceil`).

---

## Factoren aanpassen

Open `app.js` en pas de `SYSTEMEN`-constante bovenaan het bestand aan:

```js
const SYSTEMEN = {
  '600x600': {
    plafondplaat:       2.78,    // ← stuks per m²
    hoofdprofiel:       0.2333,
    tussenprofiel_1200: 1.392,
    tussenprofiel_600:  1.392,
    hoeklijn:           1 / 3,   // ← stuks per strekkende meter
    kantlat:            1 / 3,
  },
  // ...
};
```

---

## Lokaal draaien

```bash
# Python 3
python -m http.server 8000

# Node (npx)
npx serve .
```

Open daarna `http://localhost:8000` in de browser.

---

## Deployment

Frontend via **GitHub Pages**:

1. Push naar GitHub
2. Ga naar *Settings → Pages → Deploy from branch*
3. Kies `main` / `root`
4. Subdomain instellen via Hostinger: `systeemplafond.afbouwr.nl → CNAME → jouw-repo.github.io`

---

## Volgende calculators

Zie het [project-instructie-document](../PROJECT_INSTRUCTIONS.md) voor het stappenplan om een nieuwe calculator toe te voegen (Metalstud Wand, Metalstud Plafond, etc.).
