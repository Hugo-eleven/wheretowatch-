const IS_LOCAL = window.location.hostname === "localhost";
const API_KEY = process.env.REACT_APP_FOOTBALL_API_KEY;
const FOOTBALL_BASE = "https://api.football-data.org/v4";

function apiFetch(path) {
  if (IS_LOCAL) {
    // Localhost: bezpośrednio przez corsproxy.io (omija CORS)
    const target = encodeURIComponent(`${FOOTBALL_BASE}/${path}`);
    const url = `https://corsproxy.io/?url=${target}`;
    console.log("[Football] corsproxy URL:", url);
    return fetch(url, {
      headers: { "X-Auth-Token": API_KEY ?? "" },
    }).then(res => {
      console.log("[Football] Status:", res.status);
      if (!res.ok) throw new Error(`Football API błąd ${res.status}`);
      return res.json();
    });
  } else {
    // Produkcja: Vercel serverless proxy
    const url = `/api/football?endpoint=${encodeURIComponent(path)}`;
    console.log("[Football] Vercel proxy URL:", url);
    return fetch(url).then(res => {
      console.log("[Football] Status:", res.status);
      if (!res.ok) throw new Error(`Proxy błąd ${res.status}`);
      return res.json();
    });
  }
}

function toDayKey(utcDate) {
  return new Date(utcDate).toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
}

function toTime(utcDate) {
  return new Date(utcDate).toLocaleTimeString("pl-PL", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw",
  });
}

export async function fetchScheduledMatches() {
  const now = new Date();
  const dateTo = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);
  const path = `matches?status=SCHEDULED&dateFrom=${fmt(now)}&dateTo=${fmt(dateTo)}`;
  const data = await apiFetch(path);
  console.log("[Football] Matches received:", data.matches?.length ?? 0);
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

export function dayLabel(dayKey) {
  const todayKey = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
  const [y, mo, d] = dayKey.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  const dayStr = `${d} ${PL_MONTHS[mo - 1]}`;
  if (dayKey === todayKey) return `Dziś · ${dayStr}`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
  if (dayKey === tomorrowKey) return `Jutro · ${dayStr}`;
  return `${PL_DAYS[date.getDay()]} · ${dayStr}`;
}

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
