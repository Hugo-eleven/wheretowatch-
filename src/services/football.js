const BASE =
  window.location.hostname === "localhost"
    ? "https://wheretowatch-theta.vercel.app/api/football"
    : "/api/football";

/** Zamienia utcDate na datę lokalną (Warsaw) w formacie YYYY-MM-DD */
function toDayKey(utcDate) {
  return new Date(utcDate).toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
}

/** Zamienia utcDate na godzinę HH:MM (Warsaw) */
function toTime(utcDate) {
  return new Date(utcDate).toLocaleTimeString("pl-PL", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw",
  });
}

/** Mecze zaplanowane w najbliższych 14 dniach via Vercel proxy. */
export async function fetchScheduledMatches() {
  const now = new Date();
  const dateTo = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);
  const endpoint = `matches?status=SCHEDULED&dateFrom=${fmt(now)}&dateTo=${fmt(dateTo)}`;
  const url = `${BASE}?endpoint=${encodeURIComponent(endpoint)}`;

  console.log("[Football] Fetching:", url);
  const res = await fetch(url);
  console.log("[Football] Status:", res.status);
  if (!res.ok) throw new Error(`Proxy błąd ${res.status}`);
  const data = await res.json();
  console.log("[Football] Matches:", data.matches?.length ?? 0);

  return (data.matches ?? []).map(m => ({
    id: m.id,
    competition: m.competition?.name ?? "Liga",
    competitionEmblem: m.competition?.emblem ?? null,
    homeTeam: m.homeTeam?.shortName ?? m.homeTeam?.name ?? "?",
    homeTeamCrest: m.homeTeam?.crest ?? null,
    awayTeam: m.awayTeam?.shortName ?? m.awayTeam?.name ?? "?",
    awayTeamCrest: m.awayTeam?.crest ?? null,
    time: toTime(m.utcDate),
    dayKey: toDayKey(m.utcDate),
    utcDate: m.utcDate,
  }));
}

const PL_DAYS = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
const PL_MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];

/** Zwraca etykietę dnia: "Dziś - 13 kwi", "Jutro - 14 kwi", "Środa - 15 kwi" */
export function dayLabel(dayKey) {
  const todayKey = toDayKey(new Date().toISOString());
  const [y, mo, d] = dayKey.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  const day = `${d} ${PL_MONTHS[mo - 1]}`;
  if (dayKey === todayKey) return `Dziś · ${day}`;
  const [ty, tm, td] = todayKey.split("-").map(Number);
  const tomorrow = new Date(ty, tm - 1, td + 1);
  if (date.toDateString() === tomorrow.toDateString()) return `Jutro · ${day}`;
  return `${PL_DAYS[date.getDay()]} · ${day}`;
}

/** Grupuje mecze: { dayKey → { competition → { emblem, matches[] } } } */
export function groupMatchesByDayAndLeague(matches) {
  const result = {};
  for (const m of matches) {
    if (!result[m.dayKey]) result[m.dayKey] = {};
    if (!result[m.dayKey][m.competition]) {
      result[m.dayKey][m.competition] = { emblem: m.competitionEmblem, matches: [] };
    }
    result[m.dayKey][m.competition].matches.push(m);
  }
  return result;
}
