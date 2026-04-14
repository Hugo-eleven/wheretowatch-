const IS_LOCAL = window.location.hostname === "localhost";

function apiFetch(endpoint) {
  const base = IS_LOCAL
    ? "https://wheretowatch-theta.vercel.app/api/football"
    : "/api/football";
  const url = `${base}?endpoint=${endpoint}`;
  console.log("[Football] fetch:", url);
  return fetch(url).then(res => {
    console.log("[Football] status:", res.status);
    if (!res.ok) throw new Error(`Football proxy błąd ${res.status}`);
    return res.json();
  });
}

export async function fetchScheduledMatches() {
  const data = await apiFetch("matches?status=SCHEDULED&limit=20");
  console.log("[Football] matches received:", data.matches?.length ?? 0);
  return (data.matches ?? []).map(m => ({
    id: m.id,
    competition: m.competition?.name ?? "Liga",
    homeTeam: m.homeTeam?.shortName ?? m.homeTeam?.name ?? "?",
    awayTeam: m.awayTeam?.shortName ?? m.awayTeam?.name ?? "?",
    date: new Date(m.utcDate).toLocaleString("pl-PL", {
      day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Europe/Warsaw",
    }),
  }));
}
