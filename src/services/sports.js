export const DISCIPLINES = [
  { id: "all",        label: "Wszystkie",   icon: "🏆" },
  { id: "football",   label: "Piłka nożna", icon: "⚽" },
  { id: "tennis",     label: "Tenis",        icon: "🎾" },
  { id: "f1",         label: "F1",           icon: "🏎️" },
  { id: "basketball", label: "Koszykówka",   icon: "🏀" },
  { id: "volleyball", label: "Siatkówka",    icon: "🏐" },
];

// Ceny aktualne na kwiecień 2026
const P = {
  CANAL:    { name: "Canal+",        price: "45 zł/msc" },
  POLSAT:   { name: "Polsat Sport",  price: "30 zł/msc" },
  TVP:      { name: "TVP Sport",     price: "Za darmo"  },
  TVP1:     { name: "TVP 1",         price: "Za darmo"  },
  EUROSPORT:{ name: "Eurosport",     price: "29.99 zł/msc" },
  MAX:      { name: "Max",           price: "29.99 zł/msc" },
  VIAPLAY:  { name: "Viaplay",       price: "34 zł/msc" },
  ELEVEN:   { name: "Eleven Sports", price: "25 zł/msc" },
};

export const SPORTS_EVENTS = [
  // ── PIŁKA NOŻNA ─────────────────────────────────────────────
  {
    id: 1, discipline: "football", icon: "⚽",
    event: "Liga Mistrzów — Ćwierćfinał (rewanż)",
    teams: "Arsenal vs Real Madryt",
    date: "15 kwi 2026, 21:00",
    platforms: [P.CANAL, P.TVP],
  },
  {
    id: 2, discipline: "football", icon: "⚽",
    event: "Liga Mistrzów — Ćwierćfinał (rewanż)",
    teams: "Bayern Monachium vs Atletico Madryt",
    date: "16 kwi 2026, 21:00",
    platforms: [P.CANAL],
  },
  {
    id: 3, discipline: "football", icon: "⚽",
    event: "Ekstraklasa — 29. kolejka",
    teams: "Lech Poznań vs Legia Warszawa",
    date: "13 kwi 2026, 17:30",
    platforms: [P.CANAL],
  },
  {
    id: 4, discipline: "football", icon: "⚽",
    event: "Ekstraklasa — 30. kolejka",
    teams: "Raków Częstochowa vs Legia Warszawa",
    date: "19 kwi 2026, 17:30",
    platforms: [P.CANAL],
  },
  {
    id: 5, discipline: "football", icon: "⚽",
    event: "Ekstraklasa — 31. kolejka",
    teams: "Wisła Kraków vs Lech Poznań",
    date: "26 kwi 2026, 15:00",
    platforms: [P.CANAL],
  },
  {
    id: 6, discipline: "football", icon: "⚽",
    event: "Liga Mistrzów — Półfinał (1. mecz)",
    teams: "Real Madryt vs Arsenal",
    date: "29 kwi 2026, 21:00",
    platforms: [P.CANAL, P.TVP1],
  },
  {
    id: 7, discipline: "football", icon: "⚽",
    event: "Liga Mistrzów — Półfinał (1. mecz)",
    teams: "Bayern Monachium vs PSG",
    date: "30 kwi 2026, 21:00",
    platforms: [P.CANAL],
  },
  {
    id: 8, discipline: "football", icon: "⚽",
    event: "Liga Europejska — Półfinał",
    teams: "Manchester United vs Roma",
    date: "1 maj 2026, 21:00",
    platforms: [P.POLSAT, P.TVP],
  },
  {
    id: 9, discipline: "football", icon: "⚽",
    event: "Liga Mistrzów — Półfinał (rewanż)",
    teams: "Arsenal vs Real Madryt",
    date: "6 maj 2026, 21:00",
    platforms: [P.CANAL, P.TVP],
  },
  {
    id: 10, discipline: "football", icon: "⚽",
    event: "Liga Mistrzów — Półfinał (rewanż)",
    teams: "PSG vs Bayern Monachium",
    date: "7 maj 2026, 21:00",
    platforms: [P.CANAL],
  },
  {
    id: 11, discipline: "football", icon: "⚽",
    event: "Liga Europejska — Finał",
    teams: "Finał w Bilbao",
    date: "21 maj 2026, 21:00",
    platforms: [P.POLSAT, P.TVP],
  },
  {
    id: 12, discipline: "football", icon: "⚽",
    event: "Liga Mistrzów — Finał",
    teams: "Finał w Monachium",
    date: "30 maj 2026, 21:00",
    platforms: [P.CANAL, P.TVP1],
  },
  // ── FORMUŁA 1 ───────────────────────────────────────────────
  {
    id: 13, discipline: "f1", icon: "🏎️",
    event: "GP Miami — Wyścig",
    teams: "Formula 1 · Miami International Autodrome",
    date: "4 maj 2026, 21:00",
    platforms: [P.VIAPLAY],
  },
  {
    id: 14, discipline: "f1", icon: "🏎️",
    event: "GP Emilia-Romagna — Wyścig",
    teams: "Formula 1 · Imola",
    date: "18 maj 2026, 15:00",
    platforms: [P.VIAPLAY],
  },
  {
    id: 15, discipline: "f1", icon: "🏎️",
    event: "GP Monako — Wyścig",
    teams: "Formula 1 · Circuit de Monaco",
    date: "25 maj 2026, 15:00",
    platforms: [P.VIAPLAY],
  },
  {
    id: 16, discipline: "f1", icon: "🏎️",
    event: "GP Kanady — Wyścig",
    teams: "Formula 1 · Circuit Gilles Villeneuve",
    date: "15 cze 2026, 20:00",
    platforms: [P.VIAPLAY],
  },
  // ── TENIS ───────────────────────────────────────────────────
  {
    id: 17, discipline: "tennis", icon: "🎾",
    event: "Roland Garros — Start turnieju",
    teams: "Iga Świątek, Carlos Alcaraz, Novak Djokovic",
    date: "25 maj 2026, 11:00",
    platforms: [P.EUROSPORT, P.TVP],
  },
  {
    id: 18, discipline: "tennis", icon: "🎾",
    event: "Roland Garros — Finał kobiet",
    teams: "Finał turnieju",
    date: "6 cze 2026, 15:00",
    platforms: [P.EUROSPORT, P.TVP],
  },
  {
    id: 19, discipline: "tennis", icon: "🎾",
    event: "Roland Garros — Finał mężczyzn",
    teams: "Finał turnieju",
    date: "7 cze 2026, 15:00",
    platforms: [P.EUROSPORT],
  },
  {
    id: 20, discipline: "tennis", icon: "🎾",
    event: "Wimbledon — Finał kobiet",
    teams: "Finał turnieju",
    date: "12 lip 2026, 14:00",
    platforms: [P.EUROSPORT, P.TVP],
  },
  {
    id: 21, discipline: "tennis", icon: "🎾",
    event: "Wimbledon — Finał mężczyzn",
    teams: "Finał turnieju",
    date: "13 lip 2026, 14:00",
    platforms: [P.EUROSPORT],
  },
  // ── KOSZYKÓWKA ──────────────────────────────────────────────
  {
    id: 22, discipline: "basketball", icon: "🏀",
    event: "NBA Playoffs — 1. runda",
    teams: "Boston Celtics vs Miami Heat",
    date: "20 kwi 2026, 21:30",
    platforms: [P.MAX, P.ELEVEN],
  },
  {
    id: 23, discipline: "basketball", icon: "🏀",
    event: "EuroLeague Final Four — Półfinał",
    teams: "Real Madryt vs Panathinaikos",
    date: "23 maj 2026, 18:00",
    platforms: [P.ELEVEN],
  },
  {
    id: 24, discipline: "basketball", icon: "🏀",
    event: "EuroLeague Final Four — Finał",
    teams: "Finał turnieju",
    date: "25 maj 2026, 18:00",
    platforms: [P.ELEVEN],
  },
  // ── SIATKÓWKA ───────────────────────────────────────────────
  {
    id: 25, discipline: "volleyball", icon: "🏐",
    event: "Liga Narodów — Polska vs Brazylia",
    teams: "Polska vs Brazylia",
    date: "5 cze 2026, 20:00",
    platforms: [P.POLSAT, P.TVP],
  },
  {
    id: 26, discipline: "volleyball", icon: "🏐",
    event: "Liga Narodów — Polska vs Francja",
    teams: "Polska vs Francja",
    date: "7 cze 2026, 20:00",
    platforms: [P.POLSAT],
  },
  {
    id: 27, discipline: "volleyball", icon: "🏐",
    event: "Liga Narodów — Polska vs USA",
    teams: "Polska vs Stany Zjednoczone",
    date: "12 cze 2026, 20:00",
    platforms: [P.POLSAT, P.TVP],
  },
];

export function filterByDiscipline(events, discipline) {
  if (discipline === "all") return events;
  return events.filter(e => e.discipline === discipline);
}
