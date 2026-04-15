import { useLanguage } from "../context/LanguageContext";

const NAV_ITEMS = [
  { id: "home",      key: "nav_discover", emoji: "🏠" },
  { id: "search",    key: "nav_search",   emoji: "🔍" },
  { id: "premieres", key: "nav_premieres", emoji: "📅" },
  { id: "sports",    key: "nav_sports",   emoji: "⚽" },
  { id: "platforms", key: "nav_prices",   emoji: "💰" },
  { id: "saved",     key: "nav_list",     emoji: "❤️" },
];

export function Navigation({ screen, setScreen }) {
  const { t } = useLanguage();
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 960,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      background: "rgba(11,15,26,0.65)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      padding: "8px 0 20px",
      zIndex: 100,
    }}>
      {NAV_ITEMS.map(item => {
        const active = screen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            style={{
              background: "none",
              border: "none",
              color: active ? "var(--t-a)" : "var(--t-tm)",
              fontSize: 10,
              fontWeight: active ? 700 : 600,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 8px",
              position: "relative",
              transition: "color 0.15s",
              letterSpacing: 0.3,
            }}
          >
            <span style={{ fontSize: 19, lineHeight: 1 }}>{item.emoji}</span>
            {t(item.key)}
            {active && <div className="nav-tab-underline" />}
          </button>
        );
      })}
    </div>
  );
}
