import { useState } from "react";
import { t as theme } from "../theme";
import { useLanguage } from "../context/LanguageContext";
import { addSportsEvent, deleteSportsEvent } from "../services/supabase";

const DISCIPLINE_IDS = [
  { id: "football",   icon: "⚽" },
  { id: "tennis",     icon: "🎾" },
  { id: "f1",         icon: "🏎️" },
  { id: "basketball", icon: "🏀" },
  { id: "volleyball", icon: "🏐" },
];

const PLATFORM_OPTIONS = [
  { name: "Canal+",        price: "45 zł/msc" },
  { name: "Polsat Sport",  price: "30 zł/msc" },
  { name: "TVP Sport",     price: "Za darmo"  },
  { name: "TVP 1",         price: "Za darmo"  },
  { name: "Eurosport",     price: "29.99 zł/msc" },
  { name: "Max",           price: "29.99 zł/msc" },
  { name: "Viaplay",       price: "34 zł/msc" },
  { name: "Eleven Sports", price: "25 zł/msc" },
  { name: "WP Pilot",      price: "Za darmo"  },
];

const EMPTY_FORM = {
  discipline: "football",
  event: "",
  teams: "",
  date: "",
  platforms: [],
};

export function AdminPanel({ sportsEvents, onEventAdded, onEventDeleted, onBack }) {
  const { t } = useLanguage();

  const INPUT = {
    width: "100%", background: theme.bg, border: "1.5px solid " + theme.b,
    borderRadius: 12, padding: "12px 14px", color: theme.tx,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", marginBottom: 10,
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  function togglePlatform(platform) {
    setForm(f => {
      const exists = f.platforms.some(p => p.name === platform.name);
      return {
        ...f,
        platforms: exists
          ? f.platforms.filter(p => p.name !== platform.name)
          : [...f.platforms, platform],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.event.trim() || !form.date.trim()) {
      setError(t('admin_fill_req'));
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const added = await addSportsEvent(form);
      onEventAdded(added);
      setForm(EMPTY_FORM);
      setSuccess(t('admin_saved_ok'));
    } catch (err) {
      setError(err.message ?? t('admin_save_err'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteSportsEvent(id);
      onEventDeleted(id);
    } catch (err) {
      setError(t('admin_delete_err') + (err.message ?? ""));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ padding: "0 20px", paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: theme.s, border: "1px solid " + theme.b, borderRadius: 10,
            color: theme.a, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "7px 14px",
          }}
        >
          {t('back')}
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{t('admin_title')}</h2>
      </div>

      {/* Formularz */}
      <div style={{
        background: theme.s, borderRadius: 18, border: "1px solid " + theme.b,
        padding: 20, marginBottom: 28,
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: theme.a, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
          {t('admin_add_event')}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Dyscyplina */}
          <div style={{ fontSize: 11, color: theme.tm, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {t('admin_discipline')}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {DISCIPLINE_IDS.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, discipline: d.id }))}
                style={{
                  padding: "7px 14px", borderRadius: 20, cursor: "pointer",
                  border: "1.5px solid " + (form.discipline === d.id ? theme.a : theme.b),
                  background: form.discipline === d.id ? theme.ad : theme.bg,
                  color: form.discipline === d.id ? theme.a : theme.tm,
                  fontSize: 12, fontWeight: 700,
                }}
              >
                {d.icon} {t('disc_' + d.id)}
              </button>
            ))}
          </div>

          {/* Nazwa wydarzenia */}
          <div style={{ fontSize: 11, color: theme.tm, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {t('admin_event_name')}
          </div>
          <input
            style={INPUT}
            placeholder={t('admin_ph_event')}
            value={form.event}
            onChange={e => setForm(f => ({ ...f, event: e.target.value }))}
          />

          {/* Drużyny */}
          <div style={{ fontSize: 11, color: theme.tm, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {t('admin_teams')}
          </div>
          <input
            style={INPUT}
            placeholder={t('admin_ph_teams')}
            value={form.teams}
            onChange={e => setForm(f => ({ ...f, teams: e.target.value }))}
          />

          {/* Data */}
          <div style={{ fontSize: 11, color: theme.tm, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {t('admin_date')}
          </div>
          <input
            style={INPUT}
            placeholder={t('admin_ph_date')}
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />

          {/* Platformy */}
          <div style={{ fontSize: 11, color: theme.tm, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {t('admin_platforms_label')}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {PLATFORM_OPTIONS.map(p => {
              const selected = form.platforms.some(x => x.name === p.name);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  style={{
                    padding: "6px 12px", borderRadius: 10, cursor: "pointer",
                    border: "1.5px solid " + (selected ? theme.a : theme.b),
                    background: selected ? theme.ad : theme.bg,
                    color: selected ? theme.a : theme.tm,
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  {selected ? "✓ " : ""}{p.name}
                  <span style={{ fontSize: 10, opacity: 0.7 }}> · {p.price}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <div style={{ color: theme.d, fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ color: theme.a, fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%", padding: "14px", borderRadius: 14,
              background: theme.a, border: "none", color: "#0B0F1A",
              fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1, fontFamily: "inherit",
            }}
          >
            {saving ? t('admin_saving') : t('admin_add_btn')}
          </button>
        </form>
      </div>

      {/* Lista wydarzeń */}
      <div style={{ fontSize: 13, fontWeight: 800, color: theme.tm, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        {t('admin_all_events', { n: sportsEvents.length })}
      </div>
      {sportsEvents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: theme.tm, fontSize: 13 }}>
          {t('admin_no_events')}
        </div>
      ) : (
        sportsEvents.map(s => (
          <div
            key={s.id}
            style={{
              background: theme.s, borderRadius: 14, border: "1px solid " + theme.b,
              padding: "12px 16px", marginBottom: 8,
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.tx }}>
                {s.event}
              </div>
              <div style={{ fontSize: 11, color: theme.tm, marginTop: 2 }}>
                {s.teams} · {s.date}
              </div>
              <div style={{ fontSize: 11, color: theme.a, marginTop: 2 }}>
                {s.platforms.map(p => p.name).join(", ") || "—"}
              </div>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id}
              style={{
                background: "rgba(255,77,106,0.12)", border: "1px solid rgba(255,77,106,0.3)",
                borderRadius: 10, color: theme.d, fontSize: 12, fontWeight: 700,
                cursor: "pointer", padding: "6px 12px", flexShrink: 0,
                opacity: deletingId === s.id ? 0.5 : 1,
              }}
            >
              {t('admin_delete')}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
