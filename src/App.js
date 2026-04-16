import { useState, useEffect } from "react";
import { t } from "./theme";
import { SPORTS_EVENTS, DISCIPLINES, filterByDiscipline } from "./services/sports";
import {
  fetchPopular, fetchTopRated, searchMulti,
  fetchDetails, fetchProviders, fetchCredits, fetchSimilar, fetchRecommendations,
  fetchTrendingMovies, fetchTrendingTV, fetchUpcoming, fetchUpcomingCalendar,
  fetchEpisodes, fetchExternalIds, fetchVideos, LOGO_URL,
  fetchGenres, discoverMovies, setTMDBLocale,
} from "./services/tmdb";
import { useLanguage } from "./context/LanguageContext";
import { LANGUAGES, REGIONS } from "./config/locales";
import { fetchOMDbRatings } from "./services/omdb";
import { fetchScheduledMatches } from "./services/football";
import { supabase, loadSavedFromSupabase, addSavedToSupabase, removeSavedFromSupabase, fetchSportsEvents } from "./services/supabase";
import { Navigation } from "./components/Navigation";
import { MovieCard } from "./components/MovieCard";
import { SportCard } from "./components/SportCard";
import { RankingCard } from "./components/RankingCard";
import { AuthModal } from "./components/Auth";
import { AdminPanel } from "./components/AdminPanel";

const TMDB_PLATFORMS_PL = [
  { id: "8",    name: "Netflix",          price: "33 zł/msc" },
  { id: "337",  name: "Disney+",          price: "37.99 zł/msc" },
  { id: "1899", name: "Max",              price: "29.99 zł/msc" },
  { id: "35",   name: "Canal+",           price: "45 zł/msc" },
  { id: "350",  name: "Apple TV+",        price: "34.99 zł/msc" },
  { id: "9",    name: "Amazon Prime",     price: "49 zł/rok" },
  { id: "1773", name: "SkyShowtime",      price: "19.99 zł/msc" },
  { id: "76",   name: "Viaplay",          price: "34 zł/msc" },
  { id: "185",  name: "Player.pl",        price: "20 zł/msc" },
];

const COUNTRY_OPTIONS = [
  { code: "", label: "Wszystkie" },
  { code: "US", label: "USA" },
  { code: "PL", label: "Polska" },
  { code: "GB", label: "Wielka Brytania" },
  { code: "FR", label: "Francja" },
  { code: "DE", label: "Niemcy" },
  { code: "KR", label: "Korea Płd." },
  { code: "JP", label: "Japonia" },
];

const PLATFORM_PRICES = {
  "Netflix": "33 zł/msc",
  "Canal+": "45 zł/msc",
  "Apple TV+": "34.99 zł/msc",
  "Disney+": "37.99 zł/msc",
  "Max": "29.99 zł/msc",
  "SkyShowtime": "19.99 zł/msc",
  "Amazon Prime Video": "49 zł/rok",
  "Amazon Prime": "49 zł/rok",
  "Viaplay": "34 zł/msc",
  "Eurosport Player": "29.99 zł/msc",
  "TVP VOD": "Za darmo",
};

const WRAP = {
  fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
  background: t.bg,
  color: t.tx,
  minHeight: "100vh",
  maxWidth: 960,
  margin: "0 auto",
  paddingBottom: 90,
  width: "100%",
  overflowX: "hidden",
};

function Logo() {
  return (
    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
      <span style={{ color: t.a }}>Where</span>
      <span style={{ color: t.tm, fontWeight: 400 }}>to</span>
      <span style={{ color: t.tx }}>Watch</span>
    </div>
  );
}

function ThemeToggle({ darkMode, toggle }) {
  const { t: tr } = useLanguage();
  return (
    <button
      onClick={toggle}
      style={{
        background: t.ad, border: "1px solid " + t.ab,
        borderRadius: 20, color: t.a, fontSize: 16,
        cursor: "pointer", padding: "4px 12px",
        transition: "all 0.15s",
      }}
      title={darkMode ? tr('theme_light') : tr('theme_dark')}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 520);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 520px)");
    const handler = e => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function LocaleSelector({ language, region, setLanguage, setRegion }) {
  const isMobile = useIsMobile();
  const SELECT_STYLE = {
    background: t.s, border: "1px solid " + t.b,
    color: t.tx, borderRadius: 8, fontSize: 13,
    padding: "4px 4px", cursor: "pointer", outline: "none",
    fontFamily: "inherit", maxWidth: isMobile ? 38 : 130,
    overflow: "hidden",
  };
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <select value={language} onChange={e => setLanguage(e.target.value)} style={SELECT_STYLE} title="Język">
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{isMobile ? l.flag : `${l.flag} ${l.name}`}</option>
        ))}
      </select>
      <select value={region} onChange={e => setRegion(e.target.value)} style={SELECT_STYLE} title="Region">
        {REGIONS.map(r => (
          <option key={r.code} value={r.code}>{isMobile ? r.flag : `${r.flag} ${r.name}`}</option>
        ))}
      </select>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 11, fontWeight: 800, color: t.tm,
      textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12,
    }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: t.a }} />
      {children}
    </div>
  );
}

function SkeletonCompact() {
  return (
    <div style={{
      minWidth: 130, borderRadius: 18, overflow: "hidden",
      flexShrink: 0, border: "1px solid " + t.b, background: t.s,
    }}>
      <div className="skeleton" style={{ width: "100%", height: 160, borderRadius: 0 }} />
      <div style={{ padding: "10px 12px 14px" }}>
        <div className="skeleton" style={{ height: 12, borderRadius: 4, marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "60%" }} />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: t.s, borderRadius: 18, padding: 14,
      marginBottom: 10, border: "1px solid " + t.b,
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        <div className="skeleton" style={{ width: 58, height: 80, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 15, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 11, borderRadius: 4, width: "70%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 22, borderRadius: 8, width: 60 }} />
        </div>
      </div>
    </div>
  );
}

function SkeletonRankingItem({ isLast }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 16px",
      borderBottom: isLast ? "none" : "1px solid " + t.b,
    }}>
      <div className="skeleton" style={{ width: 30, height: 18, borderRadius: 4, flexShrink: 0 }} />
      <div className="skeleton" style={{ width: 32, height: 44, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 13, borderRadius: 4, marginBottom: 5 }} />
        <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "40%" }} />
      </div>
      <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 8, flexShrink: 0 }} />
    </div>
  );
}

function ErrorMsg({ msg }) {
  const { t: tr } = useLanguage();
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: t.tm }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.d, marginBottom: 4 }}>{tr('error_conn')}</div>
      <div style={{ fontSize: 12 }}>{msg}</div>
    </div>
  );
}

function daysUntil(dateStr, tr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (diff <= 0) return tr ? tr('already_avail') : "Już dostępne";
  if (diff === 1) return tr ? tr('tomorrow') : "Jutro";
  return tr ? tr('in_days', { n: diff }) : `za ${diff} dni`;
}

function groupPremieresByWeek(movies, tr, language = "pl-PL") {
  const groups = {};
  movies.forEach(m => {
    const date = new Date(m.releaseDate);
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
    monday.setHours(0, 0, 0, 0);
    const key = monday.toISOString().slice(0, 10);
    if (!groups[key]) groups[key] = { monday, movies: [] };
    groups[key].movies.push(m);
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const curDay = today.getDay();
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + (curDay === 0 ? -6 : 1 - curDay));

  return Object.values(groups)
    .sort((a, b) => a.monday - b.monday)
    .map(({ monday, movies: ms }) => {
      const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
      const fmt = d => d.toLocaleDateString(language, { day: "numeric", month: "short" });
      const range = `${fmt(monday)} – ${fmt(sunday)}`;
      const diffWeeks = Math.round((monday - thisMonday) / (7 * 86400000));
      let label;
      if (!tr) {
        if (diffWeeks === 0) label = `Ten tydzień · ${range}`;
        else if (diffWeeks === 1) label = `Przyszły tydzień · ${range}`;
        else label = `Za ${diffWeeks} ${diffWeeks < 5 ? "tygodnie" : "tygodni"} · ${range}`;
      } else if (diffWeeks === 0) {
        label = `${tr('this_week')} · ${range}`;
      } else if (diffWeeks === 1) {
        label = `${tr('next_week')} · ${range}`;
      } else {
        const weeksNoun = diffWeeks < 5 ? tr('week_2_4') : tr('week_5');
        label = `${tr('weeks_in')} ${diffWeeks} ${weeksNoun} · ${range}`;
      }
      return { label, movies: ms };
    });
}

function PremiereCard({ movie, onOpen }) {
  const { t: tr, language } = useLanguage();
  const days = daysUntil(movie.releaseDate, tr);
  const dateFormatted = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString(language, { day: "numeric", month: "long", year: "numeric" })
    : null;
  return (
    <div
      onClick={() => onOpen(movie)}
      className="compact-card-hover"
      style={{
        display: "flex", gap: 14, alignItems: "flex-start",
        background: t.s, borderRadius: 16, border: "1px solid " + t.b,
        padding: 12, marginBottom: 10, cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{
        width: 64, height: 90, borderRadius: 10, overflow: "hidden",
        background: t.ad, flexShrink: 0,
        boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
      }}>
        {movie.poster ? (
          <img src={movie.poster} alt="" loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 24 }}>🎬</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.tx, lineHeight: 1.3, marginBottom: 4 }}>
          {movie.title}
        </div>
        <div style={{ fontSize: 12, color: t.tm, marginBottom: 6 }}>
          {[movie.genre, movie.year].filter(Boolean).join(" · ")}
        </div>
        {dateFormatted && (
          <div style={{ fontSize: 11, color: t.tm, display: "flex", alignItems: "center", gap: 4 }}>
            <span>📅</span> {dateFormatted}
          </div>
        )}
        {movie.imdb > 0 && (
          <div style={{ fontSize: 11, color: t.w, marginTop: 4 }}>⭐ {movie.imdb}</div>
        )}
      </div>
      {days && (
        <div style={{
          flexShrink: 0, background: t.ad, border: "1px solid " + t.ab,
          borderRadius: 10, padding: "5px 10px",
          fontSize: 11, fontWeight: 800, color: t.a, textAlign: "center",
          whiteSpace: "nowrap",
        }}>
          {days}
        </div>
      )}
    </div>
  );
}

function TopTenCard({ movie, rank, onOpen }) {
  return (
    <div
      onClick={() => onOpen(movie)}
      className="compact-card-hover"
      style={{
        position: "relative", cursor: "pointer",
        minWidth: 130, flexShrink: 0,
        paddingLeft: rank >= 10 ? 30 : 24,
        paddingBottom: 12,
      }}
    >
      {/* Number Netflix-style */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, zIndex: 2,
        fontSize: 86, fontWeight: 800, lineHeight: 1,
        color: t.bg,
        WebkitTextStroke: "3px " + t.tm,
        userSelect: "none",
        letterSpacing: -4,
      }}>
        {rank}
      </div>
      {/* Poster */}
      <div style={{
        width: 120, height: 168, borderRadius: 14,
        overflow: "hidden", background: t.ad,
        position: "relative", zIndex: 1,
        boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
      }}>
        {movie.poster ? (
          <img src={movie.poster} alt="" loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>🎬</div>
        )}
      </div>
    </div>
  );
}

function UpcomingCard({ movie, onOpen }) {
  const { t: tr } = useLanguage();
  const days = daysUntil(movie.releaseDate, tr);
  const dateFormatted = movie.releaseDate
    ? movie.releaseDate.split("-").reverse().join(".")
    : null;
  return (
    <div
      onClick={() => onOpen(movie)}
      className="compact-card-hover"
      style={{ minWidth: 140, flexShrink: 0, cursor: "pointer" }}
    >
      <div style={{
        width: "100%", height: 196, borderRadius: 16, overflow: "hidden",
        background: t.ad, position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)", marginBottom: 8,
      }}>
        {movie.poster ? (
          <img src={movie.poster} alt="" loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>🎬</div>
        )}
        {days && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: t.a, color: "#0B0F1A",
            fontSize: 9, fontWeight: 800, borderRadius: 8,
            padding: "3px 7px",
          }}>
            {days}
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, marginBottom: 2, color: t.tx }}>
        {movie.title}
      </div>
      {dateFormatted && (
        <div style={{ fontSize: 10, color: t.tm }}>{dateFormatted}</div>
      )}
    </div>
  );
}

function UserAvatar({ user, onSignOut, onShowAuth, isAdmin, onAdmin }) {
  const { t: tr } = useLanguage();
  const [open, setOpen] = useState(false);
  if (!user) {
    return (
      <button
        onClick={onShowAuth}
        style={{
          background: t.ad, border: "1.5px solid " + t.ab,
          borderRadius: 20, color: t.a,
          fontSize: 11, fontWeight: 700,
          cursor: "pointer", padding: "5px 13px",
        }}
      >
        {tr('header_login')}
      </button>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={user.email}
        style={{
          width: 34, height: 34, borderRadius: 17,
          background: t.a, border: "none", color: "#fff",
          fontSize: 13, fontWeight: 800, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {(user.email?.[0] ?? "U").toUpperCase()}
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 498 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute", top: 42, right: 0, zIndex: 499,
            background: t.s, border: "1px solid " + t.b,
            borderRadius: 14, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            minWidth: 210,
          }}>
            <div style={{
              padding: "11px 16px 10px", fontSize: 11,
              color: t.tm, borderBottom: "1px solid " + t.b,
              wordBreak: "break-all",
            }}>
              {user.email}
            </div>
            {isAdmin && (
              <button
                onClick={() => { onAdmin(); setOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", background: "none",
                  border: "none", padding: "11px 16px",
                  fontSize: 13, color: t.a, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  borderBottom: "1px solid " + t.b,
                }}
              >
                {tr('admin_panel_btn')}
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              style={{
                width: "100%", textAlign: "left", background: "none",
                border: "none", padding: "11px 16px",
                fontSize: 13, color: t.tx, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {tr('auth_my_profile')}
            </button>
            <button
              onClick={() => { onSignOut(); setOpen(false); }}
              style={{
                width: "100%", textAlign: "left", background: "none",
                border: "none", padding: "11px 16px",
                fontSize: 13, color: "#E50914", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                borderTop: "1px solid " + t.b,
              }}
            >
              {tr('header_logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SplashScreen({ onDone }) {
  const { t: tr } = useLanguage();
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0B0F1A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 32, textAlign: "center",
    }}>
      <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>
        <span style={{ color: "#E50914" }}>Where</span>
        <span style={{ color: "#6B7394", fontWeight: 400 }}>to</span>
        <span style={{ color: "#E8ECF4" }}>Watch</span>
      </div>
      <div style={{ fontSize: 15, color: "#6B7394", marginBottom: 52, lineHeight: 1.65, maxWidth: 280 }}>
        {tr('splash_tagline')}
      </div>
      <button
        onClick={onDone}
        style={{
          background: "#E50914", border: "none",
          borderRadius: 16, color: "#fff",
          fontSize: 16, fontWeight: 800,
          cursor: "pointer", padding: "14px 44px",
          boxShadow: "0 4px 24px rgba(229,9,20,0.4)",
        }}
      >
        {tr('splash_start')}
      </button>
    </div>
  );
}

function HeroBanner({ movies, index, setIndex, onOpen }) {
  const { t: tr } = useLanguage();
  const movie = movies[index];
  if (!movie?.backdrop) return null;
  return (
    <div style={{ position: "relative", width: "100%", height: 300, overflow: "hidden", marginBottom: 28 }}>
      <img
        src={movie.backdrop}
        alt={movie.title}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {/* gradient bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(11,15,26,1) 0%, rgba(11,15,26,0.55) 55%, transparent 100%)",
      }} />
      {/* content */}
      <div style={{ position: "absolute", bottom: 44, left: 24, right: 24 }}>
        <div style={{ fontSize: 23, fontWeight: 800, color: "#E8ECF4", marginBottom: 6, lineHeight: 1.2, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
          {movie.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {movie.imdb && (
            <span style={{ fontSize: 12, fontWeight: 700, color: "#FFB547" }}>⭐ {movie.imdb}</span>
          )}
          <span style={{ fontSize: 12, color: "rgba(232,236,244,0.65)" }}>
            {[movie.year, movie.genre].filter(Boolean).join(" · ")}
          </span>
        </div>
        <button
          onClick={() => onOpen(movie)}
          style={{
            background: "#E50914", border: "none",
            borderRadius: 12, color: "#fff",
            fontSize: 13, fontWeight: 800,
            cursor: "pointer", padding: "9px 24px",
            boxShadow: "0 2px 16px rgba(229,9,20,0.35)",
          }}
        >
          {tr('btn_details')}
        </button>
      </div>
      {/* dots */}
      <div style={{
        position: "absolute", bottom: 16, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 6,
      }}>
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`hero-dot${i === index ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function ratingColor(r) {
  if (!r || r < 0.5) return "#2a2e42";
  if (r >= 9.0) return "#2d7d46";
  if (r >= 8.0) return "#4CAF50";
  if (r >= 7.0) return "#8BC34A";
  if (r >= 6.0) return "#c48a00";
  if (r >= 5.0) return "#c46c00";
  return "#c0293b";
}

const RATING_LEGEND = [
  { label: "≥9.0", color: "#2d7d46" },
  { label: "≥8.0", color: "#4CAF50" },
  { label: "≥7.0", color: "#8BC34A" },
  { label: "≥6.0", color: "#FFB547" },
  { label: "≥5.0", color: "#FF9800" },
  { label: "<5.0",  color: "#FF4D6A" },
  { label: null,    color: "#2a2e42", key: "rating_no_data" },
];

function RatingsGrid({ seasonsList, ratingsMap, loading, onLoadMore, remainingSeasons }) {
  const { t: tr } = useLanguage();
  const [activeEp, setActiveEp] = useState(null);

  if (loading && (!ratingsMap || Object.keys(ratingsMap).length === 0)) {
    return (
      <div style={{ textAlign: "center", padding: "16px 0", color: t.tm, fontSize: 13 }}>
        {tr('ratings_loading')}
      </div>
    );
  }
  if (!ratingsMap || Object.keys(ratingsMap).length === 0) return null;

  const seasons = seasonsList.map(s => s.number).filter(sn => ratingsMap[sn]);
  if (seasons.length === 0) return null;
  const maxEps = Math.max(...seasons.map(sn => (ratingsMap[sn] ?? []).length), 0);
  if (maxEps === 0) return null;

  const CELL_W = 40;
  const CELL_H = 36;

  return (
    <div>
      {/* Legenda */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {RATING_LEGEND.map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 11, height: 11, borderRadius: 3, background: item.color, border: "1px solid rgba(255,255,255,0.12)" }} />
            <span style={{ fontSize: 10, color: t.tm, fontWeight: 600 }}>{item.label ?? tr(item.key)}</span>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ overflowX: "auto", paddingBottom: 6 }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 3, minWidth: "max-content" }}>
          <thead>
            <tr>
              <th style={{ minWidth: 28, width: 28, fontSize: 9, color: t.tm, textAlign: "center", fontWeight: 700, paddingBottom: 6 }}>
                Ep
              </th>
              {seasons.map(sn => (
                <th key={sn} style={{ minWidth: CELL_W, width: CELL_W, fontSize: 11, color: t.a, textAlign: "center", fontWeight: 800, paddingBottom: 6 }}>
                  S{sn}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxEps }, (_, i) => {
              const epNum = i + 1;
              return (
                <tr key={epNum}>
                  <td style={{ fontSize: 9, color: t.tm, textAlign: "center", fontWeight: 700, paddingRight: 4, verticalAlign: "middle" }}>
                    {epNum}
                  </td>
                  {seasons.map(sn => {
                    const eps = ratingsMap[sn] ?? [];
                    const ep = eps.find(e => e.number === epNum);
                    const hasEp = !!ep;
                    const hasRating = ep && (ep.rating ?? 0) > 0.5;
                    const bg = hasEp ? ratingColor(ep.rating) : "#1a1d2e";
                    const isActive = activeEp && activeEp.sn === sn && activeEp.ep?.number === epNum;
                    return (
                      <td
                        key={sn}
                        onClick={() => { if (!hasEp) return; setActiveEp(isActive ? null : { sn, ep }); }}
                        title={hasEp ? ep.title : ""}
                        style={{
                          minWidth: CELL_W, width: CELL_W, height: CELL_H,
                          background: bg, borderRadius: 6,
                          textAlign: "center", verticalAlign: "middle",
                          cursor: hasEp ? "pointer" : "default",
                          fontSize: 10, fontWeight: 800, color: "#fff",
                          outline: isActive ? "2px solid #fff" : "none",
                          outlineOffset: 1,
                          opacity: hasEp ? 1 : 0.25,
                          userSelect: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        {hasRating ? ep.rating.toFixed(1) : ""}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Załaduj więcej sezonów */}
      {onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          style={{
            marginTop: 12, width: "100%", padding: "10px",
            background: t.ad, border: "1.5px solid " + t.ab,
            borderRadius: 12, color: t.a, fontSize: 12, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? tr('general_loading') : tr('load_more_seasons', { n: remainingSeasons })}
        </button>
      )}

      {/* Tooltip odcinka */}
      {activeEp?.ep && (
        <div style={{
          background: t.s, border: "1px solid " + t.ab,
          borderRadius: 14, padding: "14px 16px", marginTop: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: t.a, fontWeight: 800, marginBottom: 4 }}>
                S{activeEp.sn} E{String(activeEp.ep.number).padStart(2, "0")}
                {activeEp.ep.rating > 0 && (
                  <span style={{
                    marginLeft: 8, background: ratingColor(activeEp.ep.rating),
                    padding: "2px 7px", borderRadius: 6, color: "#fff", fontSize: 10,
                  }}>
                    ⭐ {activeEp.ep.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.tx, marginBottom: 6 }}>
                {activeEp.ep.title}
              </div>
              {activeEp.ep.overview && (
                <div style={{ fontSize: 12, color: t.tm, lineHeight: 1.55 }}>
                  {activeEp.ep.overview.length > 200 ? activeEp.ep.overview.slice(0, 200) + "…" : activeEp.ep.overview}
                </div>
              )}
              {activeEp.ep.airDate && (
                <div style={{ fontSize: 11, color: t.tm, marginTop: 6 }}>📅 {activeEp.ep.airDate}</div>
              )}
            </div>
            <button
              onClick={() => setActiveEp(null)}
              style={{ background: "none", border: "none", color: t.tm, cursor: "pointer", fontSize: 18, padding: "0 0 0 8px", flexShrink: 0 }}
            >×</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RandomMovieModal({ onClose, onOpen, genres, savedMoviesData = [] }) {
  const { t: tr } = useLanguage();
  const [mode, setMode] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterGenre, setFilterGenre] = useState("");
  const [filterRating, setFilterRating] = useState(6);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [err, setErr] = useState(null);

  async function pick(params, preferGenreName = null) {
    setLoading(true); setMovie(null); setErr(null);
    try {
      // Krok 1: pobierz stronę 1 żeby poznać total_pages
      console.log("[RandomMovie] params:", JSON.stringify(params));
      const first = await discoverMovies({ ...params, page: 1 });
      const totalPages = Math.min(first.totalPages ?? 1, 500);
      console.log("[RandomMovie] total_pages:", first.totalPages, "→ używamy max:", totalPages);

      let results = first.results;

      // Krok 2: jeśli jest więcej stron, losuj jedną i pobierz
      if (totalPages > 1) {
        const randomPage = Math.floor(Math.random() * totalPages) + 1;
        console.log("[RandomMovie] losowa strona:", randomPage);
        if (randomPage > 1) {
          const { results: pageResults } = await discoverMovies({ ...params, page: randomPage });
          results = pageResults;
        }
      }

      if (results.length) {
        const film = { ...results[Math.floor(Math.random() * results.length)] };
        // Jeśli użytkownik wybrał konkretny gatunek, pokaż go zamiast genre_ids[0]
        if (preferGenreName) film.genre = preferGenreName;
        console.log("[RandomMovie] wylosowany film:", film.title, "gatunek:", film.genre, "(id:", film.id, ")");
        setMovie(film);
      } else {
        setErr(tr('random_no_results'));
      }
    } catch (e) {
      console.error("[RandomMovie] błąd:", e);
      setErr(tr('random_conn_error'));
    }
    setLoading(false);
  }

  function pickRandom() { pick({ minRating: 5 }); }

  function pickByTaste() {
    const counts = {};
    savedMoviesData.forEach(m => { if (m.genre) counts[m.genre] = (counts[m.genre] || 0) + 1; });
    const topGenre = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const matched = genres.find(g => g.name === topGenre);
    pick({ genreIds: matched ? [matched.id] : [], minRating: 6 }, matched?.name ?? null);
  }

  function pickFiltered() {
    const genreId = filterGenre ? Number(filterGenre) : null;
    const genreName = genreId ? (genres.find(g => g.id === genreId)?.name ?? null) : null;
    console.log("[pickFiltered] genreId:", genreId, "genreName:", genreName, "minRating:", filterRating, "platform:", filterPlatform || "dowolna");
    pick({ genreIds: genreId ? [genreId] : [], minRating: filterRating, providerId: filterPlatform }, genreName);
  }

  const SELECT_STYLE = {
    background: t.s, border: "1.5px solid " + t.b, borderRadius: 10,
    color: t.tx, fontSize: 13, padding: "9px 12px", width: "100%",
    outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 600,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: t.bg, borderRadius: "22px 22px 0 0",
        border: "1px solid " + t.b, width: "100%", maxWidth: 600,
        maxHeight: "92vh", overflowY: "auto", padding: "20px 20px 40px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{tr('random_random_movie')}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.tm, cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {!mode && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { id: "random", emoji: "🎲", title: tr('random_totally'), desc: tr('random_totally_desc') },
              { id: "taste",  emoji: "❤️", title: tr('random_taste'), desc: tr('random_taste_desc') },
              { id: "filter", emoji: "🎯", title: tr('random_filter'), desc: tr('random_filter_desc') },
            ].map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setMovie(null); setErr(null); if (m.id === "random") pickRandom(); if (m.id === "taste") pickByTaste(); }}
                style={{
                  background: t.s, border: "1.5px solid " + t.b, borderRadius: 16,
                  padding: "16px 18px", cursor: "pointer", textAlign: "left",
                  display: "flex", gap: 14, alignItems: "center",
                  transition: "border-color 0.15s",
                }}>
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.tx }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: t.tm, marginTop: 2 }}>{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {mode === "filter" && !movie && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button onClick={() => setMode(null)} style={{ background: "none", border: "none", color: t.a, cursor: "pointer", fontSize: 12, fontWeight: 700, textAlign: "left", padding: 0 }}>{tr('btn_back')}</button>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.tm, marginBottom: 6 }}>{tr('filter_genre')}</div>
              <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)} style={SELECT_STYLE}>
                <option value="">{tr('any_genre')}</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.tm, marginBottom: 6 }}>{tr('random_min_rating', { val: filterRating.toFixed(1) })}</div>
              <input type="range" min={5} max={9} step={0.5} value={filterRating} onChange={e => setFilterRating(Number(e.target.value))}
                style={{ width: "100%", accentColor: t.a }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.tm, marginBottom: 6 }}>{tr('filter_platform')}</div>
              <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={SELECT_STYLE}>
                <option value="">{tr('filter_any_platform')}</option>
                {TMDB_PLATFORMS_PL.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={pickFiltered} style={{
              background: "#E50914", border: "none", borderRadius: 14,
              color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", padding: "14px",
            }}>{tr('random_pick_btn')}</button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 14, color: t.tm }}>{tr('random_picking')}</div>
          </div>
        )}

        {err && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 13, color: t.d, marginBottom: 12 }}>{err}</div>
            <button onClick={() => setMode(null)} style={{ background: t.s, border: "1px solid " + t.b, borderRadius: 12, color: t.a, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "8px 20px" }}>{tr('btn_try_again')}</button>
          </div>
        )}

        {movie && !loading && (
          <div>
            <button onClick={() => { setMode(null); setMovie(null); }} style={{ background: "none", border: "none", color: t.a, cursor: "pointer", fontSize: 12, fontWeight: 700, padding: 0, marginBottom: 16 }}>{tr('btn_change_mode')}</button>
            <div style={{ background: t.s, border: "1px solid " + t.b, borderRadius: 18, overflow: "hidden" }}>
              {movie.poster && (
                <img src={movie.poster} alt={movie.title} style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
              )}
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>{movie.title}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {movie.imdb && <span style={{ fontSize: 12, fontWeight: 700, color: t.w, background: t.wa, padding: "3px 9px", borderRadius: 8 }}>⭐ {movie.imdb}</span>}
                  <span style={{ fontSize: 12, color: t.tm }}>{[movie.year, movie.genre].filter(Boolean).join(" · ")}</span>
                </div>
                <p style={{ fontSize: 13, color: t.tm, lineHeight: 1.65, margin: "0 0 16px" }}>
                  {movie.synopsis?.length > 200 ? movie.synopsis.slice(0, 200) + "…" : movie.synopsis}
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { onOpen(movie); onClose(); }} style={{
                    flex: 1, background: "#E50914", border: "none", borderRadius: 12,
                    color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", padding: "12px",
                  }}>{tr('btn_details')}</button>
                  <button onClick={() => { if (mode === "random") pickRandom(); else if (mode === "taste") pickByTaste(); else pickFiltered(); }} style={{
                    flex: 1, background: t.s, border: "1.5px solid " + t.b, borderRadius: 12,
                    color: t.a, fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "12px",
                  }}>{tr('btn_random_again')}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const { language, region, setLanguage, setRegion, t: tr } = useLanguage();
  const [screen, setScreen] = useState("home");
  const [prevScreen, setPrevScreen] = useState("home");
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Dane z API
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  // Mapuje id → mediaType żeby wiedzieć jak fetch'ować szczegóły zapisanego tytułu
  const [savedMediaTypes, setSavedMediaTypes] = useState({});

  // Detail
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState(null);
  const [selectedCredits, setSelectedCredits] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);

  // Sport
  const [sportsDiscipline, setSportsDiscipline] = useState("all");

  // Filtr wyszukiwarki
  const [searchFilter, setSearchFilter] = useState("all");

  // Rankingi
  const [rankingTab, setRankingTab] = useState("top_rated");

  // Sezony / odcinki (TV)
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episodeSort, setEpisodeSort] = useState("number");
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Stan ładowania
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Tryb jasny/ciemny
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("wtw_theme") !== "light"; }
    catch { return true; }
  });

  // Splash screen
  const [splashDone, setSplashDone] = useState(() => {
    try { return localStorage.getItem("wtw_splash") === "1"; }
    catch { return false; }
  });

  // Hero banner auto-rotation
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);

  // Top 10 + Upcoming
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  // Label "Podobne" vs "Rekomendowane" — stores translation key
  const [similarLabel, setSimilarLabel] = useState("similar_films");

  // Auth
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Sport z Supabase
  const [sportsFromDB, setSportsFromDB] = useState(null);

  // Mecze z football-data.org
  const [footballMatches, setFootballMatches] = useState([]);
  const [footballLoading, setFootballLoading] = useState(false);

  // Mapa ocen serialu
  const [ratingsMap, setRatingsMap] = useState(null);
  const [ratingsMapLoading, setRatingsMapLoading] = useState(false);

  // Premiery
  const [premieresMovies, setPremieresMovies] = useState([]);
  const [premieresLoading, setPremieresLoading] = useState(false);
  const [premieresLoaded, setPremieresLoaded] = useState(false);

  // Cache szczegółów filmów spoza popularMovies/searchResults
  const [savedMoviesCache, setSavedMoviesCache] = useState({});
  const [savedCacheLoading, setSavedCacheLoading] = useState(false);

  // Porównywarka subskrypcji
  const [savedProvidersMap, setSavedProvidersMap] = useState({});
  const [savedProvidersLoading, setSavedProvidersLoading] = useState(false);

  // Toast komunikat
  const [loginToast, setLoginToast] = useState(false);

  // "Co obejrzeć dziś" modal
  const [showRandom, setShowRandom] = useState(false);
  const [genres, setGenres] = useState([]);

  // Ekran Platformy — wyszukiwarka "gdzie obejrzę?"
  const [platformSearch, setPlatformSearch] = useState("");
  const [platformSearchResults, setPlatformSearchResults] = useState([]);
  const [platformSearchLoading, setPlatformSearchLoading] = useState(false);
  const [platformSearchMovie, setPlatformSearchMovie] = useState(null);
  const [platformSearchProviders, setPlatformSearchProviders] = useState(null);

  // Zaawansowane filtry wyszukiwarki
  const [showFilters, setShowFilters] = useState(false);
  const [filterGenreIds, setFilterGenreIds] = useState([]);
  const [filterYearFrom, setFilterYearFrom] = useState("");
  const [filterYearTo, setFilterYearTo] = useState("");
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [filterPlatformId, setFilterPlatformId] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [discoverResults, setDiscoverResults] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  // Sync motywu z DOM + localStorage
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("wtw_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(d => !d);

  // Toast "Zaloguj się, aby dodawać do listy" — renderowany przez imperatywne DOM
  useEffect(() => {
    if (!loginToast) return;
    const el = document.createElement('div');
    el.textContent = tr('login_toast');
    el.style.cssText = [
      'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%)',
      'background:#141929', 'border:1.5px solid #00E5A0', 'color:#E8ECF4',
      'font-size:14px', 'font-weight:600', 'padding:12px 24px', 'border-radius:12px',
      'z-index:9999', 'box-shadow:0 4px 20px rgba(0,0,0,0.5)',
      'white-space:nowrap', 'pointer-events:none',
    ].join(';');
    document.body.appendChild(el);
    return () => { if (document.body.contains(el)) document.body.removeChild(el); };
  }, [loginToast, tr]);

  // Ładuj wszystkie dane startowe — re-fetchuj przy zmianie języka/regionu
  useEffect(() => {
    setTMDBLocale(language, region);
    setHomeLoading(true);
    setHomeError(null);
    Promise.all([
      fetchPopular(),
      fetchTopRated(),
      fetchTrendingMovies().catch(() => []),
      fetchTrendingTV().catch(() => []),
      fetchUpcoming().catch(() => []),
    ]).then(([popular, topRated, trending, trendTV, upcoming]) => {
      setPopularMovies(popular);
      setTopRatedMovies(topRated);
      setTrendingMovies(trending);
      setTrendingTV(trendTV);
      setUpcomingMovies(upcoming);
      setHomeLoading(false);
    }).catch(err => {
      setHomeError(err.message);
      setHomeLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, region]);

  // Supabase auth
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) setUser(data.session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Ładuj ulubione z Supabase po zalogowaniu
  useEffect(() => {
    if (!user) return;
    loadSavedFromSupabase(user.id).then(result => {
      if (!result) return;
      setSavedMovies(result.ids);
      setSavedMediaTypes(result.types);
      if (result.cache) setSavedMoviesCache(prev => ({ ...prev, ...result.cache }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Ładuj sport z Supabase przy starcie
  useEffect(() => {
    fetchSportsEvents().then(data => { if (data) setSportsFromDB(data); }).catch(() => {});
  }, []);

  // Ładuj mecze z football-data.org przy starcie
  useEffect(() => {
    setFootballLoading(true);
    fetchScheduledMatches()
      .then(matches => { console.log("[App] Football matches:", matches.length); setFootballMatches(matches); })
      .catch(err => console.error("[App] Football error:", err.message))
      .finally(() => setFootballLoading(false));
  }, []);

  // Pobierz oceny odcinków serialu (pierwsze 10 sezonów)
  useEffect(() => {
    if (!selectedMovie || selectedMovie.mediaType !== "tv" || !selectedMovie.seasonsList?.length || ratingsMap !== null) return;
    const seasons = selectedMovie.seasonsList.slice(0, 10).map(s => s.number);
    setRatingsMapLoading(true);
    Promise.all(
      seasons.map(sn => fetchEpisodes(selectedMovie.id, sn).catch(() => []))
    ).then(results => {
      const map = {};
      seasons.forEach((sn, i) => { map[sn] = results[i]; });
      setRatingsMap(map);
      setRatingsMapLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMovie?.id, selectedMovie?.seasonsList?.length]);

  // Ładuj premiery gdy użytkownik wchodzi na zakładkę
  useEffect(() => {
    if (screen !== "premieres" || premieresLoaded) return;
    setPremieresLoading(true);
    fetchUpcomingCalendar()
      .then(data => { setPremieresMovies(data); setPremieresLoaded(true); })
      .catch(() => {})
      .finally(() => setPremieresLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Auto-rotacja hero banner co 6 sekund
  useEffect(() => {
    if (popularMovies.length === 0) return;
    const timer = setInterval(() => {
      setHeroBannerIndex(i => (i + 1) % Math.min(5, popularMovies.length));
    }, 6000);
    return () => clearInterval(timer);
  }, [popularMovies.length]);

  // Wyszukiwanie z debounce 400ms
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      searchMulti(searchQuery)
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Ładuj gatunki raz przy starcie
  useEffect(() => {
    fetchGenres().then(setGenres).catch(() => {});
  }, []);

  // Discover z filtrami (debounce 400ms)
  useEffect(() => {
    const hasFilters = filterGenreIds.length > 0 || filterMinRating > 0 || filterPlatformId || filterYearFrom || filterYearTo || filterCountry;
    if (!hasFilters) { setDiscoverResults([]); return; }
    setDiscoverLoading(true);
    const timer = setTimeout(() => {
      discoverMovies({ genreIds: filterGenreIds, minRating: filterMinRating, providerId: filterPlatformId, yearFrom: filterYearFrom, yearTo: filterYearTo, country: filterCountry })
        .then(({ results }) => setDiscoverResults(results))
        .catch(() => setDiscoverResults([]))
        .finally(() => setDiscoverLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGenreIds.join(","), filterMinRating, filterPlatformId, filterYearFrom, filterYearTo, filterCountry]);

  // Wyszukiwarka "gdzie obejrzę?" na ekranie Platformy
  useEffect(() => {
    if (!platformSearch.trim()) { setPlatformSearchResults([]); return; }
    setPlatformSearchLoading(true);
    const timer = setTimeout(() => {
      searchMulti(platformSearch)
        .then(r => setPlatformSearchResults(r.slice(0, 6)))
        .catch(() => setPlatformSearchResults([]))
        .finally(() => setPlatformSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [platformSearch]);

  // Pobieranie szczegółów filmów zapisanych w poprzednich sesjach (nie ma ich w popularMovies/searchResults)
  useEffect(() => {
    if (screen !== "saved" && screen !== "platforms") return;
    const loadedIds = new Set([...popularMovies, ...searchResults].map(m => m.id));
    const missingIds = savedMovies.filter(id => !loadedIds.has(id) && !(id in savedMoviesCache));
    if (missingIds.length === 0) return;

    setSavedCacheLoading(true);
    Promise.all(
      missingIds.map(id =>
        fetchDetails(id, savedMediaTypes[id] ?? "movie")
          .catch(() => null)
          .then(details => ({ id, details }))
      )
    ).then(results => {
      setSavedMoviesCache(prev => {
        const next = { ...prev };
        results.forEach(({ id, details }) => { if (details) next[id] = details; });
        return next;
      });
      setSavedCacheLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, savedMovies.length, popularMovies.length, searchResults.length]);

  // Pobieranie dostawców dla zapisanych filmów (porównywarka subskrypcji)
  useEffect(() => {
    if (screen !== "saved" && screen !== "platforms") return;
    const allKnown = [...popularMovies, ...searchResults, ...Object.values(savedMoviesCache)];
    const currentSavedList = allKnown.filter(
      (m, i, arr) => savedMovies.includes(m.id) && arr.findIndex(x => x.id === m.id) === i
    );
    const needProviders = currentSavedList.filter(m => !(m.id in savedProvidersMap));
    if (needProviders.length === 0) return;

    setSavedProvidersLoading(true);
    Promise.all(
      needProviders.map(m =>
        fetchProviders(m.id, m.mediaType ?? "movie")
          .then(p => ({ id: m.id, p }))
          .catch(() => ({ id: m.id, p: null }))
      )
    ).then(results => {
      setSavedProvidersMap(prev => {
        const next = { ...prev };
        results.forEach(({ id, p }) => { next[id] = p; });
        return next;
      });
      setSavedProvidersLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, savedMovies.length, popularMovies.length, searchResults.length, Object.keys(savedMoviesCache).length]);

  async function openMovie(movie, from) {
    // Push current state to history so goBack() can restore it
    const historyEntry = screen === "detail" && selectedMovie
      ? {
          screen: "detail",
          selectedMovie,
          selectedProviders,
          selectedCredits,
          similarMovies,
          ratings,
          trailerKey,
          selectedSeason,
          episodes,
          similarLabel,
          scrollY: window.scrollY,
        }
      : { screen: from || screen, scrollY: window.scrollY };
    setNavigationHistory(h => [...h, historyEntry]);

    window.scrollTo(0, 0);
    setPrevScreen(from || screen);
    setSelectedMovie(movie);
    setSelectedProviders(null);
    setSelectedCredits([]);
    setSimilarMovies([]);
    setRatings(null);
    setTrailerKey(null);
    setSelectedSeason(null);
    setEpisodes([]);
    setRatingsMap(null);
    setRatingsMapLoading(false);
    setDetailLoading(true);
    setScreen("detail");

    try {
      const mediaType = movie.mediaType ?? "movie";
      const [details, providers, credits, similar, videoKey] = await Promise.all([
        fetchDetails(movie.id, mediaType),
        fetchProviders(movie.id, mediaType),
        fetchCredits(movie.id, mediaType),
        fetchSimilar(movie.id, mediaType),
        fetchVideos(movie.id, mediaType),
      ]);
      setSelectedMovie(details);
      setSelectedProviders(providers);
      setSelectedCredits(credits);
      setTrailerKey(videoKey);

      // Filtruj podobne po ocenie > 6.0, sortuj po popularności (malejąco)
      const goodSimilar = similar
        .filter(m => (m.imdb ?? 0) >= 6.0)
        .sort((a, b) => (b.imdb ?? 0) - (a.imdb ?? 0));
      if (goodSimilar.length >= 3) {
        setSimilarMovies(goodSimilar);
        setSimilarLabel("similar_films");
      } else {
        try {
          const recs = await fetchRecommendations(movie.id, mediaType);
          const goodRecs = recs.filter(m => (m.imdb ?? 0) >= 6.0);
          setSimilarMovies(goodRecs.length > 0 ? goodRecs : goodSimilar);
          setSimilarLabel("recommended");
        } catch {
          setSimilarMovies(goodSimilar);
          setSimilarLabel("similar_films");
        }
      }

      const imdbId = await fetchExternalIds(movie.id, mediaType);
      if (imdbId) {
        const omdb = await fetchOMDbRatings(imdbId);
        setRatings(omdb);
      }
    } catch (e) {
      // Zostaw to co mamy z listy
    } finally {
      setDetailLoading(false);
    }
  }

  function goBack() {
    if (navigationHistory.length === 0) {
      setScreen("home");
      return;
    }
    const prev = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory(h => h.slice(0, -1));
    setScreen(prev.screen);
    if (prev.screen === "detail" && prev.selectedMovie) {
      setSelectedMovie(prev.selectedMovie);
      setSelectedProviders(prev.selectedProviders ?? null);
      setSelectedCredits(prev.selectedCredits ?? []);
      setSimilarMovies(prev.similarMovies ?? []);
      setRatings(prev.ratings ?? null);
      setTrailerKey(prev.trailerKey ?? null);
      setSelectedSeason(prev.selectedSeason ?? null);
      setEpisodes(prev.episodes ?? []);
      setSimilarLabel(prev.similarLabel ?? "similar_films");
      setDetailLoading(false);
    }
    setTimeout(() => window.scrollTo(0, prev.scrollY || 0), 0);
  }

  function navigateMain(screenName) {
    setNavigationHistory([]);
    setScreen(screenName);
  }

  function handleSignOut() {
    if (supabase) supabase.auth.signOut();
    setSavedMovies([]);
    setSavedMediaTypes({});
    setSavedMoviesCache({});
    setUser(null);
  }

  function toggleSaved(id, mediaType = "movie") {
    if (!user) {
      setLoginToast(true);
      setTimeout(() => setLoginToast(false), 3000);
      return;
    }
    const removing = savedMovies.includes(id);
    if (!removing) setSavedMediaTypes(mt => ({ ...mt, [id]: mediaType }));
    if (removing) {
      removeSavedFromSupabase(user.id, id);
    } else {
      const allMovies = [
        ...popularMovies, ...topRatedMovies, ...trendingMovies, ...trendingTV,
        ...searchResults, ...Object.values(savedMoviesCache),
        selectedMovie,
      ].filter(Boolean);
      const movieData = allMovies.find(m => m.id === id) ?? { id, mediaType };
      addSavedToSupabase(user.id, movieData);
    }
    setSavedMovies(prev => removing ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function loadMoreRatings() {
    if (!selectedMovie || !ratingsMap || ratingsMapLoading) return;
    const allSeasons = selectedMovie.seasonsList.map(s => s.number);
    const loaded = new Set(Object.keys(ratingsMap).map(Number));
    const remaining = allSeasons.filter(sn => !loaded.has(sn)).slice(0, 10);
    if (remaining.length === 0) return;
    setRatingsMapLoading(true);
    const results = await Promise.all(remaining.map(sn => fetchEpisodes(selectedMovie.id, sn).catch(() => [])));
    setRatingsMap(prev => {
      const next = { ...prev };
      remaining.forEach((sn, i) => { next[sn] = results[i]; });
      return next;
    });
    setRatingsMapLoading(false);
  }

  async function openSeason(seasonNumber) {
    if (selectedSeason === seasonNumber) {
      setSelectedSeason(null);
      setEpisodes([]);
      return;
    }
    setSelectedSeason(seasonNumber);
    setEpisodes([]);
    setEpisodesLoading(true);
    try {
      const eps = await fetchEpisodes(selectedMovie.id, seasonNumber);
      setEpisodes(eps);
    } catch (e) {
      setEpisodes([]);
    } finally {
      setEpisodesLoading(false);
    }
  }

  const isSaved = id => savedMovies.includes(id);

  // Sport: Supabase jeśli załadowany, fallback na SPORTS_EVENTS z pliku
  const effectiveSports = sportsFromDB ?? SPORTS_EVENTS;

  // Admin
  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
  const isAdmin = !!(user && adminEmail && user.email === adminEmail);

  // ====== SPLASH ======
  if (!splashDone) {
    return (
      <SplashScreen onDone={() => {
        try { localStorage.setItem("wtw_splash", "1"); } catch {}
        setSplashDone(true);
      }} />
    );
  }

  // ====== HOME ======
  if (screen === "home") {
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <UserAvatar
              user={user}
              onSignOut={handleSignOut}
              onShowAuth={() => setShowAuth(true)}
              isAdmin={isAdmin}
              onAdmin={() => setScreen("admin")}
            />
            <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>

        {/* Co obejrzeć dziś */}
        {!homeLoading && !homeError && (
          <div style={{ padding: "0 20px 20px" }}>
            <button
              onClick={() => setShowRandom(true)}
              style={{
                width: "100%", padding: "15px 20px",
                background: "linear-gradient(135deg, #E50914, #c40812)",
                border: "none", borderRadius: 16,
                color: "#fff", fontSize: 16, fontWeight: 800,
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 10,
                boxShadow: "0 4px 24px rgba(229,9,20,0.35)",
              }}
            >
              {tr('home_what_to_watch')}
            </button>
          </div>
        )}

        {/* Hero Banner */}
        {!homeLoading && !homeError && (
          <HeroBanner
            movies={popularMovies.slice(0, 5)}
            index={heroBannerIndex}
            setIndex={setHeroBannerIndex}
            onOpen={openMovie}
          />
        )}

        {homeError ? (
          <ErrorMsg msg={homeError} />
        ) : homeLoading ? (
          <>
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <SectionHeader>{tr('home_popular')}</SectionHeader>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {[...Array(5)].map((_, i) => <SkeletonCompact key={i} />)}
              </div>
            </div>
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <SectionHeader>{tr('home_top_rated')}</SectionHeader>
              <div style={{
                background: t.s, borderRadius: 18,
                border: "1px solid " + t.b, overflow: "hidden",
              }}>
                {[...Array(8)].map((_, i) => <SkeletonRankingItem key={i} isLast={i === 7} />)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Popularne teraz */}
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <SectionHeader>{tr('home_popular')}</SectionHeader>
              <div className="carousel-desktop" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, scrollBehavior: "smooth" }}>
                {popularMovies.slice(0, 10).map(m => (
                  <MovieCard key={m.id} movie={m} onOpen={openMovie} compact onToggleSaved={toggleSaved} saved={isSaved(m.id)} />
                ))}
              </div>
            </div>

            {/* Ranking z tabami */}
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <SectionHeader>{rankingTab === "top_rated" ? tr('home_top_rated') : tr('home_popular')}</SectionHeader>
                <div style={{ display: "flex", gap: 6 }}>
                  {[{ id: "top_rated", label: tr('tmdb_top') }, { id: "popular", label: tr('tmdb_popular') }].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setRankingTab(tab.id)}
                      style={{
                        padding: "5px 12px", borderRadius: 16, cursor: "pointer",
                        border: "1.5px solid " + (rankingTab === tab.id ? t.a : t.b),
                        background: rankingTab === tab.id ? t.ad : t.s,
                        color: rankingTab === tab.id ? t.a : t.tm,
                        fontSize: 11, fontWeight: 700,
                        transition: "all 0.15s",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{
                background: t.s, borderRadius: 18,
                border: "1px solid " + t.b, overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}>
                {(rankingTab === "top_rated" ? topRatedMovies : popularMovies).slice(0, 8).map((item, i) => (
                  <RankingCard
                    key={item.id}
                    item={item}
                    rank={i + 1}
                    isLast={i === 7}
                    onOpen={openMovie}
                  />
                ))}
              </div>
            </div>

            {/* Top 10 Filmów */}
            {trendingMovies.length > 0 && (
              <div style={{ padding: "0 20px", marginBottom: 28 }}>
                <SectionHeader>{tr('top10_movies')}</SectionHeader>
                <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 8, scrollBehavior: "smooth" }}>
                  {trendingMovies.map((m, i) => (
                    <TopTenCard key={m.id} movie={m} rank={i + 1} onOpen={openMovie} />
                  ))}
                </div>
              </div>
            )}

            {/* Top 10 Seriali */}
            {trendingTV.length > 0 && (
              <div style={{ padding: "0 20px", marginBottom: 28 }}>
                <SectionHeader>{tr('top10_series')}</SectionHeader>
                <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 8, scrollBehavior: "smooth" }}>
                  {trendingTV.map((m, i) => (
                    <TopTenCard key={m.id} movie={m} rank={i + 1} onOpen={openMovie} />
                  ))}
                </div>
              </div>
            )}

            {/* Wkrótce w kinach */}
            {upcomingMovies.length > 0 && (
              <div style={{ padding: "0 20px", marginBottom: 28 }}>
                <SectionHeader>{tr('coming_cinemas')}</SectionHeader>
                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, scrollBehavior: "smooth" }}>
                  {upcomingMovies.map(m => (
                    <UpcomingCard key={m.id} movie={m} onOpen={openMovie} />
                  ))}
                </div>
              </div>
            )}

            {/* Sport */}
            <div style={{ padding: "0 20px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <SectionHeader>{tr('upcoming_broadcasts')}</SectionHeader>
                <button
                  onClick={() => setScreen("sports")}
                  style={{ background: "none", border: "none", color: t.a, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                >
                  {tr('more_arrow')}
                </button>
              </div>
              {effectiveSports.slice(0, 3).map(s => <SportCard key={s.id} sport={s} />)}
            </div>
          </>
        )}

        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={u => { setUser(u); setShowAuth(false); }}
          />
        )}
        {showRandom && (
          <RandomMovieModal
            onClose={() => setShowRandom(false)}
            onOpen={openMovie}
            genres={genres}
            savedMoviesData={[...popularMovies, ...Object.values(savedMoviesCache)].filter(m => savedMovies.includes(m.id))}
          />
        )}
        <Navigation screen={screen} setScreen={navigateMain} />
      </div>
    );
  }

  // ====== SEARCH ======
  if (screen === "search") {
    const SEARCH_FILTERS = [
      { id: "all", label: tr('all_tab') },
      { id: "movie", label: tr('movies_tab') },
      { id: "tv", label: tr('series_tab') },
    ];
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <UserAvatar
              user={user}
              onSignOut={handleSignOut}
              onShowAuth={() => setShowAuth(true)}
              isAdmin={isAdmin}
              onAdmin={() => setScreen("admin")}
            />
            <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={u => { setUser(u); setShowAuth(false); }}
          />
        )}
        {(() => {
          const hasFilters = filterGenreIds.length > 0 || filterMinRating > 0 || filterPlatformId || filterYearFrom || filterYearTo || filterCountry;
          const usingDiscover = hasFilters && !searchQuery.trim();
          const visibleResults = searchFilter === "all" ? searchResults : searchResults.filter(m => m.mediaType === searchFilter);
          const FILTER_INPUT = { background: t.s, border: "1.5px solid " + t.b, borderRadius: 10, color: t.tx, fontSize: 12, padding: "7px 10px", outline: "none", fontFamily: "inherit" };

          return (
            <>
              <div style={{ padding: "8px 20px 12px" }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px" }}>{tr('search_title')}</h2>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
                  <input
                    type="text" placeholder={tr('search_placeholder')}
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%", background: t.s,
                      border: "1.5px solid " + (searchQuery ? t.a : t.b),
                      borderRadius: 14, padding: "14px 16px 14px 44px",
                      color: t.tx, fontSize: 15, outline: "none",
                      boxSizing: "border-box", transition: "border-color 0.15s",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {SEARCH_FILTERS.map(f => (
                      <button key={f.id} onClick={() => setSearchFilter(f.id)} style={{
                        padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                        border: "1.5px solid " + (searchFilter === f.id ? t.a : t.b),
                        background: searchFilter === f.id ? t.ad : t.s,
                        color: searchFilter === f.id ? t.a : t.tm,
                        fontSize: 12, fontWeight: 700, transition: "all 0.15s",
                      }}>{f.label}</button>
                    ))}
                  </div>
                  <button onClick={() => setShowFilters(v => !v)} style={{
                    background: hasFilters ? t.ad : t.s,
                    border: "1.5px solid " + (hasFilters ? t.a : t.b),
                    borderRadius: 20, color: hasFilters ? t.a : t.tm,
                    fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "7px 14px",
                  }}>
                    {showFilters ? tr('filters_hide') : tr('filters_show')}{hasFilters ? " ●" : ""}
                  </button>
                </div>

                {/* Panel filtrów */}
                {showFilters && (
                  <div style={{ marginTop: 14, background: t.s, border: "1px solid " + t.b, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Gatunki */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.tm, marginBottom: 8, textTransform: "uppercase" }}>{tr('genre')}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {genres.map(g => {
                          const active = filterGenreIds.includes(g.id);
                          return (
                            <button key={g.id} onClick={() => setFilterGenreIds(prev => active ? prev.filter(x => x !== g.id) : [...prev, g.id])} style={{
                              padding: "5px 11px", borderRadius: 14, cursor: "pointer", fontSize: 11, fontWeight: 700,
                              border: "1.5px solid " + (active ? t.a : t.b),
                              background: active ? t.ad : "transparent",
                              color: active ? t.a : t.tm, transition: "all 0.12s",
                            }}>{g.name}</button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rok + Ocena */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.tm, marginBottom: 6, textTransform: "uppercase" }}>{tr('year_from')}</div>
                        <input type="number" placeholder="2000" value={filterYearFrom} onChange={e => setFilterYearFrom(e.target.value)} style={{ ...FILTER_INPUT, width: "100%", boxSizing: "border-box" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.tm, marginBottom: 6, textTransform: "uppercase" }}>{tr('year_to')}</div>
                        <input type="number" placeholder="2024" value={filterYearTo} onChange={e => setFilterYearTo(e.target.value)} style={{ ...FILTER_INPUT, width: "100%", boxSizing: "border-box" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.tm, marginBottom: 6, textTransform: "uppercase" }}>{filterMinRating > 0 ? tr('min_rating', { val: filterMinRating.toFixed(1) }) : tr('min_rating_none')}</div>
                      <input type="range" min={0} max={9} step={0.5} value={filterMinRating} onChange={e => setFilterMinRating(Number(e.target.value))} style={{ width: "100%", accentColor: t.a }} />
                    </div>

                    {/* Platforma + Kraj */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.tm, marginBottom: 6, textTransform: "uppercase" }}>{tr('platform')}</div>
                        <select value={filterPlatformId} onChange={e => setFilterPlatformId(e.target.value)} style={{ ...FILTER_INPUT, width: "100%", boxSizing: "border-box" }}>
                          <option value="">{tr('any_platform')}</option>
                          {TMDB_PLATFORMS_PL.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: t.tm, marginBottom: 6, textTransform: "uppercase" }}>{tr('country')}</div>
                        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={{ ...FILTER_INPUT, width: "100%", boxSizing: "border-box" }}>
                          {COUNTRY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {hasFilters && (
                      <button onClick={() => { setFilterGenreIds([]); setFilterYearFrom(""); setFilterYearTo(""); setFilterMinRating(0); setFilterPlatformId(""); setFilterCountry(""); }} style={{
                        background: "none", border: "1px solid " + t.d, borderRadius: 10,
                        color: t.d, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "8px",
                      }}>{tr('clear_filters')}</button>
                    )}

                    {usingDiscover && <div style={{ fontSize: 11, color: t.tm, textAlign: "center" }}>{tr('discover_label')}</div>}
                  </div>
                )}
              </div>

              <div style={{ padding: "0 20px" }}>
                {usingDiscover ? (
                  discoverLoading ? (
                    <div className="search-results-grid">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
                  ) : discoverResults.length > 0 ? (
                    <div className="search-results-grid">
                      {discoverResults.map(m => (
                        <MovieCard key={m.id} movie={m} onOpen={openMovie} onToggleSaved={toggleSaved} saved={isSaved(m.id)} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
                      <div style={{ fontSize: 14 }}>{tr('no_results_filters')}</div>
                    </div>
                  )
                ) : searchLoading ? (
                  <div className="search-results-grid">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
                ) : visibleResults.length > 0 ? (
                  <div className="search-results-grid">
                    {visibleResults.map(m => (
                      <MovieCard key={m.id} movie={m} onOpen={openMovie} onToggleSaved={toggleSaved} saved={isSaved(m.id)} />
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{tr('no_results')}</div>
                    <div style={{ fontSize: 13 }}>{tr('try_other')}</div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontSize: 13 }}>{tr('enter_title')}</div>
                  </div>
                )}
              </div>
            </>
          );
        })()}

        <Navigation screen={screen} setScreen={navigateMain} />
      </div>
    );
  }

  // ====== DETAIL ======
  if (screen === "detail" && selectedMovie) {
    const m = selectedMovie;
    const providerGroups = [
      { label: tr('detail_streaming_label'), headerLabel: "🎬 " + tr('detail_streaming'), btnText: tr('btn_watch'), btnColor: "#E50914", items: selectedProviders?.flatrate ?? [] },
      { label: tr('detail_rent_label'), headerLabel: "💰 " + tr('detail_rent'), btnText: tr('detail_rent'), btnColor: "#2196F3", items: selectedProviders?.rent ?? [] },
      { label: tr('detail_buy_label'), headerLabel: "🛒 " + tr('detail_buy'), btnText: tr('detail_buy'), btnColor: "#4CAF50", items: selectedProviders?.buy ?? [] },
    ].filter(g => g.items.length > 0);

    return (
      <div style={WRAP}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button
              onClick={goBack}
              style={{ background: "none", border: "none", color: "#E50914", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0 }}
            >
              ← {tr('btn_back')}
            </button>
            <button
              onClick={() => { setNavigationHistory([]); setScreen("home"); }}
              style={{ background: "none", border: "none", color: "#888", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0 }}
            >
              🏠 {tr('btn_home')}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <UserAvatar
              user={user}
              onSignOut={handleSignOut}
              onShowAuth={() => setShowAuth(true)}
              isAdmin={isAdmin}
              onAdmin={() => setScreen("admin")}
            />
            <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>

        {/* Hero */}
        <div style={{ margin: "0 20px 24px" }}>
          <div style={{
            background: t.s, borderRadius: 22,
            border: "1px solid " + t.b,
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}>
            {m.poster ? (
              <div style={{ position: "relative" }}>
                <img
                  src={m.poster}
                  alt={m.title}
                  loading="lazy"
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }}
                />
                <button
                  onClick={() => toggleSaved(m.id, m.mediaType ?? "movie")}
                  style={{
                    position: "absolute", top: 12, right: 12,
                    width: 40, height: 40,
                    background: "rgba(0,0,0,0.5)",
                    border: "none", borderRadius: "50%",
                    fontSize: 20, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                  }}
                >
                  {isSaved(m.id) ? "❤️" : "🤍"}
                </button>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, var(--t-hero-grad))",
                  padding: "60px 20px 20px",
                }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.2 }}>
                    {m.title}
                  </h1>
                  <div style={{ fontSize: 13, color: t.tm }}>
                    {[m.year, m.genre, m.duration].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "28px 20px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>🎬</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{m.title}</h1>
                <div style={{ fontSize: 13, color: t.tm }}>
                  {[m.year, m.genre, m.duration].filter(Boolean).join(" · ")}
                </div>
              </div>
            )}
            {(m.imdb || ratings?.imdb || ratings?.rottenTomatoes) && (
              <div style={{ padding: "14px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {m.imdb && (
                  <span style={{
                    padding: "5px 12px", borderRadius: 10, fontSize: 12,
                    fontWeight: 700, background: t.ad, color: t.a,
                    border: "1px solid " + t.ab,
                  }}>
                    ⭐ {m.imdb} TMDB
                  </span>
                )}
                {ratings?.imdb && (
                  <span style={{
                    padding: "5px 12px", borderRadius: 10, fontSize: 12,
                    fontWeight: 700, background: t.wa, color: t.w,
                  }}>
                    ⭐ {ratings.imdb} IMDb
                  </span>
                )}
                {ratings?.rottenTomatoes && (
                  <span style={{
                    padding: "5px 12px", borderRadius: 10, fontSize: 12,
                    fontWeight: 700, background: t.da, color: t.d,
                    border: "1px solid " + t.d,
                  }}>
                    🍅 {ratings.rottenTomatoes}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Trailer YouTube */}
          {trailerKey && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>{tr('trailer')}</SectionHeader>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                style={{
                  width: "100%", height: 220, border: "none",
                  borderRadius: 14, display: "block",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Trailer"
              />
            </div>
          )}

          {/* Szczegóły serialu */}
          {m.mediaType === "tv" && (m.seasons || m.episodes) && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>{tr('series_details')}</SectionHeader>
              <div style={{ display: "flex", gap: 10 }}>
                {m.seasons != null && (
                  <div style={{
                    flex: 1, background: t.s, borderRadius: 14,
                    border: "1px solid " + t.b, padding: "14px 12px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: t.a }}>{m.seasons}</div>
                    <div style={{ fontSize: 11, color: t.tm, marginTop: 3 }}>
                      {m.seasons === 1 ? tr('season_1') : m.seasons < 5 ? tr('season_2_4') : tr('season_5')}
                    </div>
                  </div>
                )}
                {m.episodes != null && (
                  <div style={{
                    flex: 1, background: t.s, borderRadius: 14,
                    border: "1px solid " + t.b, padding: "14px 12px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: t.a }}>{m.episodes}</div>
                    <div style={{ fontSize: 11, color: t.tm, marginTop: 3 }}>{tr('episodes_count')}</div>
                  </div>
                )}
                {m.status != null && (
                  <div style={{
                    flex: 1, background: t.s, borderRadius: 14,
                    border: "1px solid " + t.b, padding: "14px 12px", textAlign: "center",
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 800,
                      color: m.status === "Ended" ? t.tm : t.a,
                      lineHeight: 1.4,
                    }}>
                      {m.status === "Ended" ? tr('status_ended')
                        : m.status === "Returning Series" ? tr('status_ongoing')
                        : m.status === "Canceled" ? tr('status_cancelled')
                        : m.status}
                    </div>
                    <div style={{ fontSize: 11, color: t.tm, marginTop: 3 }}>{tr('status_label')}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista sezonów */}
          {m.mediaType === "tv" && m.seasonsList?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>{tr('seasons_list')}</SectionHeader>
              {m.seasonsList.map(season => {
                const isOpen = selectedSeason === season.number;
                const sortedEps = episodeSort === "rating"
                  ? [...episodes].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                  : [...episodes].sort((a, b) => a.number - b.number);
                return (
                  <div key={season.number}>
                    <div
                      onClick={() => openSeason(season.number)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        background: isOpen ? t.ad : t.s,
                        border: "1.5px solid " + (isOpen ? t.ab : t.b),
                        borderRadius: 14, padding: "11px 14px", marginBottom: 8,
                        cursor: "pointer",
                      }}
                    >
                      {season.poster ? (
                        <img
                          src={season.poster.replace("/w500", "/w92")}
                          alt=""
                          loading="lazy"
                          style={{ width: 32, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 32, height: 44, borderRadius: 6, flexShrink: 0,
                          background: t.sh, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 16,
                        }}>📺</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isOpen ? t.a : t.tx }}>
                          {season.name}
                        </div>
                        <div style={{ fontSize: 11, color: t.tm, marginTop: 2 }}>
                          {[season.airDate, season.episodeCount ? `${season.episodeCount} ${tr('episodes_count')}` : null].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: t.tm }}>{isOpen ? "▲" : "▼"}</span>
                    </div>

                    {isOpen && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                          {[{ id: "number", label: tr('sort_order') }, { id: "rating", label: tr('sort_rating') }].map(mode => (
                            <button
                              key={mode.id}
                              onClick={() => setEpisodeSort(mode.id)}
                              style={{
                                padding: "5px 12px", borderRadius: 16, cursor: "pointer",
                                border: "1.5px solid " + (episodeSort === mode.id ? t.a : t.b),
                                background: episodeSort === mode.id ? t.ad : t.s,
                                color: episodeSort === mode.id ? t.a : t.tm,
                                fontSize: 11, fontWeight: 700,
                                transition: "all 0.15s",
                              }}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                        {episodesLoading ? (
                          <div style={{ textAlign: "center", padding: "20px 0", color: t.tm, fontSize: 13 }}>
                            ⏳ Ładowanie odcinków...
                          </div>
                        ) : sortedEps.map(ep => (
                          <div key={ep.id} style={{
                            background: t.sh, border: "1px solid " + t.b,
                            borderRadius: 12, padding: "11px 14px", marginBottom: 8,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 10, color: t.a, fontWeight: 700, marginRight: 6 }}>
                                  E{String(ep.number).padStart(2, "0")}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{ep.title}</span>
                              </div>
                              {ep.rating > 0 ? (
                                <span style={{
                                  fontSize: 10, fontWeight: 700, color: t.w,
                                  background: t.wa, padding: "2px 7px", borderRadius: 6,
                                  flexShrink: 0, marginLeft: 8,
                                }}>
                                  ⭐ {ep.rating}
                                </span>
                              ) : (
                                <span style={{ fontSize: 10, color: t.tm, flexShrink: 0, marginLeft: 8 }}>
                                  Brak oceny
                                </span>
                              )}
                            </div>
                            {ep.airDate && (
                              <div style={{ fontSize: 10, color: t.tm, marginBottom: ep.overview ? 5 : 0 }}>
                                {ep.airDate}
                              </div>
                            )}
                            {ep.overview && (
                              <div style={{
                                fontSize: 11, color: t.tm, lineHeight: 1.5,
                                overflow: "hidden", display: "-webkit-box",
                                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                              }}>
                                {ep.overview}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Mapa ocen serialu */}
          {m.mediaType === "tv" && m.seasonsList?.length > 0 && (ratingsMapLoading || (ratingsMap && Object.keys(ratingsMap).length > 0)) && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>{tr('ratings_map')}</SectionHeader>
              <div style={{
                background: t.s, borderRadius: 18, border: "1px solid " + t.b,
                padding: "14px 16px", overflowX: "auto",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              }}>
                <RatingsGrid
                  seasonsList={m.seasonsList}
                  ratingsMap={ratingsMap}
                  loading={ratingsMapLoading}
                  onLoadMore={ratingsMap && !ratingsMapLoading && m.seasonsList.length > Object.keys(ratingsMap).length ? loadMoreRatings : null}
                  remainingSeasons={ratingsMap ? m.seasonsList.length - Object.keys(ratingsMap).length : 0}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <SectionHeader>{tr('detail_description')}</SectionHeader>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: t.tm, margin: 0 }}>{m.synopsis}</p>
          </div>

          {/* Obsada */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader>{tr('detail_cast')}</SectionHeader>
            {detailLoading ? (
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ minWidth: 70, textAlign: "center", flexShrink: 0 }}>
                    <div className="skeleton" style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 8px" }} />
                    <div className="skeleton" style={{ height: 10, borderRadius: 4, margin: "0 4px 4px" }} />
                    <div className="skeleton" style={{ height: 8, borderRadius: 4, margin: "0 10px" }} />
                  </div>
                ))}
              </div>
            ) : selectedCredits.length > 0 ? (
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
                {selectedCredits.map(actor => (
                  <div key={actor.id} style={{ minWidth: 72, textAlign: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      overflow: "hidden", margin: "0 auto 8px",
                      background: t.sh, border: "2px solid " + t.b,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {actor.photo ? (
                        <img
                          src={actor.photo}
                          alt={actor.name}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: 26 }}>👤</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, lineHeight: 1.3,
                      marginBottom: 2, overflow: "hidden",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {actor.name}
                    </div>
                    <div style={{
                      fontSize: 10, color: t.tm, lineHeight: 1.2,
                      overflow: "hidden", whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}>
                      {actor.character}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Nagrody */}
          {ratings?.awards && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>{tr('detail_awards')}</SectionHeader>
              <div style={{
                background: t.s, border: "1px solid " + t.b,
                borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>
                  {/won.*oscar|oscar.*won/i.test(ratings.awards) ? "🏆" :
                   /oscar|nominat/i.test(ratings.awards) ? "🥈" : "🏅"}
                </span>
                <span style={{
                  fontSize: 13, color: t.tx, lineHeight: 1.5,
                  fontWeight: /won.*oscar|oscar.*won/i.test(ratings.awards) ? 700 : 400,
                }}>
                  {ratings.awards}
                </span>
              </div>
            </div>
          )}

          {/* Gdzie obejrzeć */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader>
              {tr('detail_where_to_watch')} {REGIONS.find(r => r.code === region)?.flag ?? ""} {REGIONS.find(r => r.code === region)?.name ?? region}
            </SectionHeader>
            {detailLoading ? (
              <div>
                {[...Array(2)].map((_, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: t.s, border: "1.5px solid " + t.b,
                    borderRadius: 14, padding: "12px 16px", marginBottom: 8,
                  }}>
                    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 11, borderRadius: 4, width: "50%" }} />
                    </div>
                    <div className="skeleton" style={{ width: 70, height: 32, borderRadius: 10 }} />
                  </div>
                ))}
              </div>
            ) : providerGroups.length > 0 ? (
              providerGroups.map((group, idx) => (
                <div key={group.label} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700, color: "#ccc",
                    marginTop: idx > 0 ? 16 : 0,
                    marginBottom: 8,
                    paddingTop: idx > 0 ? 12 : 0,
                    borderTop: idx > 0 ? "1px solid #333" : "none",
                  }}>
                    {group.headerLabel}
                  </div>
                  {group.items.map(p => (
                    <div key={p.provider_id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: t.s, border: "1.5px solid " + t.b,
                      borderRadius: 14, padding: "12px 16px", marginBottom: 8,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, overflow: "hidden",
                        background: t.sh, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {p.logo_path ? (
                          <img
                            src={`${LOGO_URL}${p.logo_path}`}
                            alt={p.provider_name}
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                          />
                        ) : (
                          <span style={{ fontSize: 18, fontWeight: 800, color: t.a }}>
                            {p.provider_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{p.provider_name}</div>
                        <div style={{ fontSize: 11, color: t.tm, marginTop: 1 }}>{group.btnText}</div>
                      </div>
                      <a
                        href={selectedProviders?.link ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => { if (!selectedProviders?.link) e.preventDefault(); }}
                        style={{
                          fontSize: 12, fontWeight: 700, color: "#fff",
                          padding: "7px 16px", borderRadius: 10,
                          background: group.btnColor,
                          textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                        }}
                      >
                        {group.btnText}
                      </a>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{
                background: t.s, border: "1px solid " + t.b,
                borderRadius: 14, padding: "20px 16px",
                textAlign: "center", color: t.tm, fontSize: 13,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🌍</div>
                {tr('no_providers_pl')}
              </div>
            )}
          </div>

          {/* Podobne / Rekomendowane filmy */}
          {similarMovies.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>{tr(similarLabel)}</SectionHeader>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {similarMovies.slice(0, 8).map(s => (
                  <MovieCard key={s.id} movie={s} onOpen={openMovie} compact />
                ))}
              </div>
            </div>
          )}

        </div>

        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={u => { setUser(u); setShowAuth(false); }}
          />
        )}
        <Navigation screen="search" setScreen={navigateMain} />
      </div>
    );
  }

  // ====== SPORTS ======
  if (screen === "sports") {
    const filteredSports = filterByDiscipline(effectiveSports, sportsDiscipline);
    const showFootball = sportsDiscipline === "all" || sportsDiscipline === "football";
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <UserAvatar
              user={user}
              onSignOut={handleSignOut}
              onShowAuth={() => setShowAuth(true)}
              isAdmin={isAdmin}
              onAdmin={() => setScreen("admin")}
            />
            <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={u => { setUser(u); setShowAuth(false); }}
          />
        )}
        <div style={{ padding: "8px 20px 16px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>⚽ {tr('sport_live')}</h2>
          <p style={{ fontSize: 13, color: t.tm, margin: "4px 0 0" }}>{tr('sport_subtitle')} {REGIONS.find(r => r.code === region)?.flag ?? ''}</p>
        </div>
        <div style={{ padding: "0 20px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
          {DISCIPLINES.map(d => (
            <button
              key={d.id}
              onClick={() => setSportsDiscipline(d.id)}
              style={{
                flexShrink: 0,
                padding: "7px 14px", borderRadius: 20,
                border: "1.5px solid " + (sportsDiscipline === d.id ? t.a : t.b),
                background: sportsDiscipline === d.id ? t.ad : t.s,
                color: sportsDiscipline === d.id ? t.a : t.tm,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap", transition: "all 0.15s",
              }}
            >
              {d.icon} {tr('sport_filter_' + d.id)}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Nadchodzące mecze z football-data.org — pogrupowane po dniach i ligach */}
          {showFootball && footballLoading && (
            <div style={{ marginBottom: 24 }}>
              <SectionHeader>{tr('sport_upcoming_matches')}</SectionHeader>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: t.s, border: "1px solid " + t.b, borderRadius: 12, padding: "10px 14px", marginBottom: 6 }}>
                  <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "40%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 13, borderRadius: 4, marginBottom: 5 }} />
                  <div className="skeleton" style={{ height: 13, borderRadius: 4, width: "80%" }} />
                </div>
              ))}
            </div>
          )}
          {showFootball && !footballLoading && footballMatches.length > 0 && (() => {
            const TR_DAYS = [tr('day_sunday'), tr('day_monday'), tr('day_tuesday'), tr('day_wednesday'), tr('day_thursday'), tr('day_friday'), tr('day_saturday')];
            const PL_MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
            const byDay = {};
            for (const m of footballMatches) {
              const dayKey = m.date.split(",")[0].trim(); // "14.04"
              if (!byDay[dayKey]) byDay[dayKey] = {};
              if (!byDay[dayKey][m.competition]) byDay[dayKey][m.competition] = [];
              byDay[dayKey][m.competition].push(m);
            }
            const sortedDays = Object.entries(byDay).sort(([a], [b]) => {
              const n = k => { const [d, mo] = k.split("."); return Number(mo) * 100 + Number(d); };
              return n(a) - n(b);
            });
            const dayLabel = k => {
              const [d, mo] = k.split(".").map(Number);
              const date = new Date(new Date().getFullYear(), mo - 1, d);
              return `${TR_DAYS[date.getDay()]}, ${d} ${PL_MONTHS[mo - 1]}`;
            };
            return (
              <div style={{ marginBottom: 24 }}>
                <SectionHeader>{tr('sport_upcoming_matches')}</SectionHeader>
                {sortedDays.map(([dayKey, leagues]) => (
                  <div key={dayKey} style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 800, color: t.tx,
                      padding: "6px 0 8px", borderBottom: "1px solid " + t.b, marginBottom: 10,
                    }}>
                      {dayLabel(dayKey)}
                    </div>
                    {Object.entries(leagues).map(([league, lMatches]) => (
                      <div key={league} style={{ marginBottom: 12 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 700, color: t.a,
                          textTransform: "uppercase", letterSpacing: 0.6,
                          marginBottom: 6, paddingLeft: 2,
                        }}>
                          {league}
                        </div>
                        <div style={{ background: t.s, border: "1px solid " + t.b, borderRadius: 12, overflow: "hidden" }}>
                          {lMatches.map((m, idx) => (
                            <div key={m.id} style={{
                              padding: "10px 14px",
                              borderBottom: idx < lMatches.length - 1 ? "1px solid " + t.b : "none",
                            }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: t.tx }}>
                                {m.homeTeam} – {m.awayTeam}
                              </div>
                              <div style={{ fontSize: 11, color: t.tm, marginTop: 2 }}>{m.date}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Wydarzenia ręczne / planowane */}
          {filteredSports.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {showFootball && <SectionHeader>{tr('sport_planned_events')}</SectionHeader>}
              {filteredSports.map(s => <SportCard key={s.id} sport={s} />)}
            </div>
          )}
          {filteredSports.length === 0 && !showFootball && !footballLoading && (
            <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
              <div style={{ fontSize: 14 }}>{tr('sport_no_events')}</div>
            </div>
          )}
          {filteredSports.length === 0 && showFootball && footballMatches.length === 0 && !footballLoading && (
            <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
              <div style={{ fontSize: 14 }}>{tr('sport_no_events')}</div>
            </div>
          )}
        </div>
        <Navigation screen={screen} setScreen={navigateMain} />
      </div>
    );
  }

  // ====== PREMIERES ======
  if (screen === "premieres") {
    const grouped = groupPremieresByWeek(premieresMovies, tr, language);
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <UserAvatar
              user={user}
              onSignOut={handleSignOut}
              onShowAuth={() => setShowAuth(true)}
              isAdmin={isAdmin}
              onAdmin={() => setScreen("admin")}
            />
            <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={u => { setUser(u); setShowAuth(false); }}
          />
        )}
        <div style={{ padding: "8px 20px 16px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>📅 {tr('premieres_calendar')}</h2>
          <p style={{ fontSize: 13, color: t.tm, margin: "4px 0 0" }}>{tr('premieres_subtitle')} {REGIONS.find(r => r.code === region)?.flag ?? ''}</p>
        </div>

        {premieresLoading ? (
          <div style={{ padding: "0 20px" }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : grouped.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: t.tm }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 6 }}>{tr('no_data')}</div>
            <div style={{ fontSize: 13 }}>{tr('try_later')}</div>
          </div>
        ) : (
          <div style={{ padding: "0 20px" }}>
            {grouped.map(({ label, movies: ms }) => (
              <div key={label} style={{ marginBottom: 28 }}>
                <SectionHeader>{label}</SectionHeader>
                {ms.map(m => <PremiereCard key={m.id} movie={m} onOpen={openMovie} />)}
              </div>
            ))}
          </div>
        )}

        <Navigation screen={screen} setScreen={navigateMain} />
      </div>
    );
  }

  // ====== ADMIN ======
  if (screen === "admin") {
    if (!isAdmin) {
      return (
        <div style={WRAP}>
          <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Logo />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <UserAvatar
                user={user}
                onSignOut={handleSignOut}
                onShowAuth={() => setShowAuth(true)}
                isAdmin={isAdmin}
                onAdmin={() => setScreen("admin")}
              />
              <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
            </div>
          </div>
          {showAuth && (
            <AuthModal
              onClose={() => setShowAuth(false)}
              onAuth={u => { setUser(u); setShowAuth(false); }}
            />
          )}
          <div style={{ textAlign: "center", padding: "80px 20px", color: t.tm }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.tx, marginBottom: 6 }}>{tr('admin_no_access')}</div>
            <div style={{ fontSize: 13, marginBottom: 24 }}>{tr('admin_requires_perms')}</div>
            <button
              onClick={() => setScreen("home")}
              style={{
                background: t.a, border: "none", borderRadius: 12,
                color: "#0B0F1A", fontSize: 14, fontWeight: 700,
                cursor: "pointer", padding: "12px 28px",
              }}
            >
              {tr('btn_home')}
            </button>
          </div>
          <Navigation screen="home" setScreen={navigateMain} />
        </div>
      );
    }
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <UserAvatar
              user={user}
              onSignOut={handleSignOut}
              onShowAuth={() => setShowAuth(true)}
              isAdmin={isAdmin}
              onAdmin={() => setScreen("admin")}
            />
            <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>
        <AdminPanel
          sportsEvents={effectiveSports}
          onEventAdded={event => setSportsFromDB(prev => [...(prev ?? SPORTS_EVENTS), event])}
          onEventDeleted={id => setSportsFromDB(prev => (prev ?? SPORTS_EVENTS).filter(e => e.id !== id))}
          onBack={() => setScreen("home")}
        />
      </div>
    );
  }

  // ====== PLATFORMS ======
  if (screen === "platforms") {
    // Saved list for comparison
    const plSavedList = [...popularMovies, ...searchResults, ...Object.values(savedMoviesCache)].filter(
      (m, i, arr) => savedMovies.includes(m.id) && arr.findIndex(x => x.id === m.id) === i
    );
    const plCounts = {};
    plSavedList.forEach(m => {
      const prov = savedProvidersMap[m.id];
      if (!prov) return;
      const seen = new Set();
      (prov.flatrate ?? []).forEach(p => {
        if (!seen.has(p.provider_name)) { seen.add(p.provider_name); plCounts[p.provider_name] = (plCounts[p.provider_name] || 0) + 1; }
      });
    });
    const plRanking = Object.entries(plCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }));

    const LABEL_STYLE = { fontSize: 10, fontWeight: 700, color: t.tm, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 };
    const INPUT_STYLE = { width: "100%", background: t.s, border: "1.5px solid " + t.b, borderRadius: 12, padding: "12px 16px", color: t.tx, fontSize: 14, outline: "none", boxSizing: "border-box" };

    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <UserAvatar user={user} onSignOut={handleSignOut} onShowAuth={() => setShowAuth(true)} isAdmin={isAdmin} onAdmin={() => setScreen("admin")} />
            <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={u => { setUser(u); setShowAuth(false); }} />}
        <div style={{ padding: "8px 20px 20px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>💰 {tr('platforms_title')}</h2>
          <p style={{ fontSize: 13, color: t.tm, margin: "0 0 24px" }}>{tr('platforms_subtitle')}</p>

          {/* A) Tabela cen */}
          <div style={{ marginBottom: 28 }}>
            <div style={LABEL_STYLE}>{tr('compare_pricing')}</div>
            <div style={{ background: t.s, border: "1px solid " + t.b, borderRadius: 16, overflow: "hidden" }}>
              {TMDB_PLATFORMS_PL.map((p, i) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < TMDB_PLATFORMS_PL.length - 1 ? "1px solid " + t.b : "none" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: t.tx }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.a }}>{p.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* B) Porównywarka z listy */}
          {user && plSavedList.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={LABEL_STYLE}>{tr('best_platform_for_list')}</div>
              {savedProvidersLoading && plRanking.length === 0 ? (
                <div style={{ textAlign: "center", padding: 16, color: t.tm, fontSize: 13 }}>⏳ {tr('general_loading')}</div>
              ) : plRanking.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plRanking.map(({ name, count }, i) => {
                    const price = PLATFORM_PRICES[name];
                    return (
                      <div key={name} style={{ background: t.s, border: "1px solid " + (i === 0 ? t.a : t.b), borderRadius: 14, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? t.a : t.tx }}>{["🏆","🥈","🥉"][i]} {name}</div>
                          <div style={{ fontSize: 11, color: t.tm, marginTop: 2 }}>{count} z {plSavedList.length} tytułów</div>
                        </div>
                        {price && <span style={{ fontSize: 12, fontWeight: 700, color: t.tm }}>{price}</span>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: t.tm, textAlign: "center", padding: 16 }}>{tr('no_platform_data')}</div>
              )}
            </div>
          )}

          {/* C) Wyszukiwarka "gdzie obejrzę?" */}
          <div>
            <div style={LABEL_STYLE}>{tr('compare_where')}</div>
            <input
              type="text" placeholder={tr('platform_search_placeholder')}
              value={platformSearch} onChange={e => { setPlatformSearch(e.target.value); setPlatformSearchMovie(null); setPlatformSearchProviders(null); }}
              style={INPUT_STYLE}
            />
            {platformSearchLoading && (
              <div style={{ textAlign: "center", padding: 16, color: t.tm, fontSize: 13 }}>⏳ {tr('searching')}</div>
            )}
            {platformSearchResults.length > 0 && !platformSearchMovie && (
              <div style={{ marginTop: 8, background: t.s, border: "1px solid " + t.b, borderRadius: 14, overflow: "hidden" }}>
                {platformSearchResults.map((m, i) => (
                  <button key={m.id} onClick={async () => {
                    setPlatformSearchMovie(m);
                    setPlatformSearchResults([]);
                    setPlatformSearchProviders(null);
                    try {
                      const p = await fetchProviders(m.id, m.mediaType ?? "movie");
                      setPlatformSearchProviders(p);
                    } catch { setPlatformSearchProviders(null); }
                  }} style={{
                    width: "100%", background: "none", border: "none", borderBottom: i < platformSearchResults.length - 1 ? "1px solid " + t.b : "none",
                    padding: "11px 16px", cursor: "pointer", textAlign: "left", display: "flex", gap: 10, alignItems: "center",
                  }}>
                    {m.poster && <img src={m.poster} alt="" width={32} height={44} style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.tx }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: t.tm }}>{[m.year, m.genre].filter(Boolean).join(" · ")}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {platformSearchMovie && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  {platformSearchMovie.poster && <img src={platformSearchMovie.poster} alt="" width={40} height={56} style={{ borderRadius: 8, objectFit: "cover" }} />}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>{platformSearchMovie.title}</div>
                    <div style={{ fontSize: 12, color: t.tm }}>{[platformSearchMovie.year, platformSearchMovie.genre].filter(Boolean).join(" · ")}</div>
                  </div>
                  <button onClick={() => { setPlatformSearchMovie(null); setPlatformSearchProviders(null); }} style={{ marginLeft: "auto", background: "none", border: "none", color: t.tm, cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
                {platformSearchProviders === undefined ? (
                  <div style={{ fontSize: 13, color: t.tm }}>⏳ {tr('loading_platforms')}</div>
                ) : platformSearchProviders === null ? (
                  <div style={{ fontSize: 13, color: t.tm, textAlign: "center", padding: 16 }}>{tr('no_providers_for_title')}</div>
                ) : (() => {
                  const groups = [
                    { label: tr('detail_streaming_label'), items: platformSearchProviders.flatrate ?? [] },
                    { label: tr('detail_rent_label'), items: platformSearchProviders.rent ?? [] },
                    { label: tr('detail_buy_label'), items: platformSearchProviders.buy ?? [] },
                  ].filter(g => g.items.length > 0);
                  if (!groups.length) return <div style={{ fontSize: 13, color: t.tm, textAlign: "center", padding: 16 }}>{tr('not_available_streaming')}</div>;
                  return groups.map(g => (
                    <div key={g.label} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.tm, textTransform: "uppercase", marginBottom: 8 }}>{g.label}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {g.items.map(p => (
                          <div key={p.provider_id} style={{ background: t.s, border: "1px solid " + t.b, borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                            {p.logo_path && <img src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} alt="" width={22} height={22} style={{ borderRadius: 5, objectFit: "cover" }} />}
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: t.tx }}>{p.provider_name}</div>
                              {PLATFORM_PRICES[p.provider_name] && <div style={{ fontSize: 10, color: t.tm }}>{PLATFORM_PRICES[p.provider_name]}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
        <Navigation screen={screen} setScreen={navigateMain} />
      </div>
    );
  }

  // ====== SAVED ======
  // Łączy popularne, wyniki wyszukiwania i cache filmów z poprzednich sesji
  const savedList = [...popularMovies, ...searchResults, ...Object.values(savedMoviesCache)].filter(
    (m, i, arr) => savedMovies.includes(m.id) && arr.findIndex(x => x.id === m.id) === i
  );

  // Oblicz ranking platform (flatrate = streaming)
  const platformCounts = {};
  savedList.forEach(m => {
    const providers = savedProvidersMap[m.id];
    if (!providers) return;
    const seen = new Set();
    (providers.flatrate ?? []).forEach(p => {
      if (!seen.has(p.provider_name)) {
        seen.add(p.provider_name);
        platformCounts[p.provider_name] = (platformCounts[p.provider_name] || 0) + 1;
      }
    });
  });
  const platformRanking = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count, price: PLATFORM_PRICES[name] ?? null }));

  const hasProviderData = savedList.length > 0 && savedList.some(m => m.id in savedProvidersMap);
  const RANK_ICONS = ["🏆", "🥈", "🥉"];

  return (
    <div style={WRAP}>
      <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <UserAvatar
            user={user}
            onSignOut={handleSignOut}
            onShowAuth={() => setShowAuth(true)}
            isAdmin={isAdmin}
            onAdmin={() => setScreen("admin")}
          />
          <LocaleSelector language={language} region={region} setLanguage={setLanguage} setRegion={setRegion} />
          <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
        </div>
      </div>
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={u => { setUser(u); setShowAuth(false); }}
        />
      )}
      <div style={{ padding: "8px 20px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>❤️ {tr('list_title')}</h2>
        <p style={{ fontSize: 13, color: t.tm, margin: "4px 0 0" }}>
          {!user ? tr('list_login_prompt')
            : savedMovies.length > 0
              ? `${savedMovies.length} ${savedMovies.length === 1 ? "tytuł" : savedMovies.length < 5 ? "tytuły" : "tytułów"}`
              : tr('list_empty_saved')}
        </p>
      </div>

      {/* Porównywarka subskrypcji */}
      {(savedList.length > 0 || (savedCacheLoading && savedMovies.length > 0)) && (
        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <SectionHeader>{tr('best_subscription')}</SectionHeader>
          {savedProvidersLoading && !hasProviderData ? (
            [...Array(2)].map((_, i) => (
              <div key={i} style={{
                background: t.s, border: "1px solid " + t.b,
                borderRadius: 14, padding: "14px 16px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 11, borderRadius: 4, width: "60%" }} />
                </div>
                <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 10 }} />
              </div>
            ))
          ) : platformRanking.length > 0 ? (
            platformRanking.map(({ name, count, price }, i) => (
              <div key={name} className="card-fade-in" style={{
                background: i === 0 ? t.ad : t.s,
                border: "1.5px solid " + (i === 0 ? t.ab : t.b),
                borderRadius: 14, padding: "14px 16px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: i === 0 ? t.ab : t.sh,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {RANK_ICONS[i]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: i === 0 ? t.a : t.tx }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 12, color: t.tm, marginTop: 2 }}>
                    {tr('covers_of_titles', { count, total: savedList.length })}
                  </div>
                </div>
                {price && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: i === 0 ? t.a : t.tm,
                    background: i === 0 ? t.ab : t.sh,
                    padding: "4px 10px", borderRadius: 10,
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {price}
                  </span>
                )}
              </div>
            ))
          ) : hasProviderData ? (
            <div style={{
              background: t.s, border: "1px solid " + t.b,
              borderRadius: 14, padding: "16px",
              textAlign: "center", color: t.tm, fontSize: 13,
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🌍</div>
              {tr('no_streaming_pl')}
            </div>
          ) : null}
        </div>
      )}

      <div style={{ padding: "0 20px" }}>
        {savedCacheLoading && savedMovies.length > 0 && savedList.length === 0 ? (
          [...Array(Math.min(savedMovies.length, 3))].map((_, i) => <SkeletonCard key={i} />)
        ) : !user ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: t.tm }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔐</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: t.tx }}>
              {tr('list_login_to_save')}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 24 }}>
              {tr('list_sync_desc')}
            </div>
            <button
              onClick={() => setShowAuth(true)}
              style={{
                background: t.a, border: "none", borderRadius: 14,
                color: "#0B0F1A", fontSize: 14, fontWeight: 800,
                cursor: "pointer", padding: "12px 32px",
              }}
            >
              {tr('header_login')}
            </button>
          </div>
        ) : savedList.length > 0 ? savedList.map(m => (
          <MovieCard
            key={m.id} movie={m}
            onOpen={openMovie}
            onToggleSaved={toggleSaved}
            saved
          />
        )) : (
          <div style={{ textAlign: "center", padding: "60px 20px", color: t.tm }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🤍</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: t.tx }}>
              {tr('list_empty')}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              {tr('list_add_hint')}
            </div>
          </div>
        )}
      </div>
      <Navigation screen={screen} setScreen={navigateMain} />
    </div>
  );
}

export default App;
