const BASE =
  window.location.hostname === "localhost"
    ? "https://wheretowatch-theta.vercel.app/api/football"
    : "/api/football";

function formatMatchDate(utcDate) {
  if (!utcDate) return "—";
  return new Date(utcDate).toLocaleString("pl-PL", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Warsaw",
  });
}

/** Mecze zaplanowane w najbliższych 7 dniach via Vercel proxy. */
export async function fetchScheduledMatches() {
  const now = new Date();
  const dateTo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);
  const endpoint = `matches?status=SCHEDULED&dateFrom=${fmt(now)}&dateTo=${fmt(dateTo)}`;
  const url = `${BASE}?endpoint=${encodeURIComponent(endpoint)}`;

  console.log("[Football] Fetching via proxy:", url);
  const res = await fetch(url);
  console.log("[Football] Proxy response status:", res.status);
  if (!res.ok) throw new Error(`Proxy błąd ${res.status}`);
  const data = await res.json();
  console.log("[Football] Matches received:", data.matches?.length ?? 0);

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
