const API_KEY = process.env.REACT_APP_FOOTBALL_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

function apiFetch(path) {
  const headers = {};
  if (API_KEY && API_KEY !== "placeholder") {
    headers["X-Auth-Token"] = API_KEY;
  }
  return fetch(`${BASE_URL}${path}`, { headers }).then(res => {
    if (!res.ok) throw new Error(`Football API błąd ${res.status}`);
    return res.json();
  });
}

function formatMatchDate(utcDate) {
  if (!utcDate) return "—";
  return new Date(utcDate).toLocaleString("pl-PL", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Warsaw",
  });
}

/** Mecze zaplanowane w najbliższych 7 dniach. */
export async function fetchScheduledMatches() {
  const now = new Date();
  const dateTo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);
  const data = await apiFetch(`/matches?status=SCHEDULED&dateFrom=${fmt(now)}&dateTo=${fmt(dateTo)}`);
  return (data.matches ?? []).slice(0, 30).map(m => ({
    id: m.id,
    competition: m.competition?.name ?? "Liga",
    area: m.area?.name ?? null,
    homeTeam: m.homeTeam?.shortName ?? m.homeTeam?.name ?? "?",
    awayTeam: m.awayTeam?.shortName ?? m.awayTeam?.name ?? "?",
    dateFormatted: formatMatchDate(m.utcDate),
    utcDate: m.utcDate,
  }));
}
