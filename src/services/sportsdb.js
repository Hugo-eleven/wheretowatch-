const BASE = "https://www.thesportsdb.com/api/v1/json/3";

const LEAGUES = [
  { id: "4480", name: "Liga Mistrzów",  icon: "⭐", discipline: "football" },
  { id: "4328", name: "Premier League", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", discipline: "football" },
  { id: "4335", name: "La Liga",        icon: "🇪🇸", discipline: "football" },
  { id: "4331", name: "Bundesliga",     icon: "🇩🇪", discipline: "football" },
  { id: "4332", name: "Serie A",        icon: "🇮🇹", discipline: "football" },
  { id: "4334", name: "Ligue 1",        icon: "🇫🇷", discipline: "football" },
  { id: "4344", name: "Ekstraklasa",    icon: "🇵🇱", discipline: "football" },
  { id: "4356", name: "Formula 1",      icon: "🏎️",  discipline: "f1" },
];

function mapEvent(e, league) {
  const dateRaw = e.dateEvent ?? "";
  const time = e.strTime ? e.strTime.slice(0, 5) : "";
  let dateFormatted = "—";
  if (dateRaw) {
    try {
      const d = new Date(dateRaw + (time ? "T" + e.strTime : ""));
      dateFormatted = d.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
      if (time) dateFormatted += ", " + time;
    } catch {
      dateFormatted = dateRaw + (time ? " " + time : "");
    }
  }
  return {
    id: "sdb_" + e.idEvent,
    discipline: league.discipline,
    event: league.name,
    teams: e.strEvent ?? ((e.strHomeTeam ?? "") + (e.strAwayTeam ? " vs " + e.strAwayTeam : "")),
    date: dateFormatted,
    dateRaw: dateRaw + (time ? "T" + e.strTime : "T00:00:00"),
    icon: league.icon,
    platforms: [],
    thumb: e.strThumb ?? null,
    source: "thesportsdb",
  };
}

export async function fetchUpcomingSportsEvents() {
  const results = await Promise.allSettled(
    LEAGUES.map(league =>
      fetch(`${BASE}/eventsnextleague.php?id=${league.id}`)
        .then(r => r.ok ? r.json() : { events: null })
        .then(d => (d.events ?? []).slice(0, 3).map(e => mapEvent(e, league)))
        .catch(() => [])
    )
  );

  const events = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  return events
    .filter(e => e.dateRaw)
    .sort((a, b) => new Date(a.dateRaw) - new Date(b.dateRaw))
    .slice(0, 20);
}
