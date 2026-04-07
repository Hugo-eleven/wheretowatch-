import { t } from "../theme";

const NAV_ITEMS = [
  { id: "home", label: "Odkrywaj", emoji: "🏠" },
  { id: "search", label: "Szukaj", emoji: "🔍" },
  { id: "sports", label: "Sport", emoji: "⚽" },
  { id: "saved", label: "Lista", emoji: "❤️" },
];

export function Navigation({ screen, setScreen }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      background: "var(--t-nav-bg)",
      backdropFilter: "blur(20px)",
      borderTop: "1px solid " + t.b,
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
              background: active ? t.ad : "none",
              border: active ? "1px solid " + t.ab : "1px solid transparent",
              borderRadius: 12,
              color: active ? t.a : t.tm,
              fontSize: 10,
              fontWeight: active ? 700 : 600,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 16px",
              transition: "all 0.15s",
              letterSpacing: 0.3,
            }}
          >
            <span style={{ fontSize: 19, lineHeight: 1 }}>{item.emoji}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
