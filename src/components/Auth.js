import { useState } from 'react';
import { supabase } from '../services/supabase';
import { t } from '../theme';

const INPUT = {
  width: '100%',
  background: 'var(--t-bg)',
  border: '1.5px solid var(--t-b)',
  borderRadius: 12,
  padding: '13px 16px',
  color: 'var(--t-tx)',
  fontSize: 14,
  outline: 'none',
  marginBottom: 10,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const BTN_PRIMARY = {
  width: '100%', background: 'var(--t-a)', border: 'none',
  borderRadius: 12, color: '#fff',
  fontSize: 14, fontWeight: 800,
  padding: '14px 0',
  transition: 'opacity 0.15s', fontFamily: 'inherit',
};

export function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function switchMode(m) {
    setMode(m);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase nie jest skonfigurowany. Uzupełnij .env i uruchom ponownie.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (mode === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onAuth(data.user);
        onClose();
      } else if (mode === 'register') {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setSuccess('Sprawdź email — link aktywacyjny już czeka!');
      } else if (mode === 'forgot') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (err) throw err;
        setSuccess('Link resetujący został wysłany na ' + email);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9000, padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: t.s, borderRadius: 22, padding: 28,
          width: '100%', maxWidth: 380,
          border: '1px solid ' + t.b,
          boxShadow: '0 8px 48px rgba(0,0,0,0.55)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Logo */}
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
          <span style={{ color: t.a }}>Where</span>
          <span style={{ color: t.tm, fontWeight: 400 }}>to</span>
          <span style={{ color: t.tx }}>Watch</span>
        </div>

        {/* Forgot password view */}
        {mode === 'forgot' ? (
          <>
            <button
              onClick={() => switchMode('login')}
              style={{
                background: 'none', border: 'none', color: t.tm,
                fontSize: 12, cursor: 'pointer', padding: '0 0 16px',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              ← Wróć do logowania
            </button>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 6 }}>
              Resetowanie hasła
            </div>
            <div style={{ fontSize: 12, color: t.tm, marginBottom: 18 }}>
              Wyślemy link resetujący na Twój adres email.
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{ ...INPUT, marginBottom: 16 }}
              />
              {error && (
                <div style={{ color: t.d, fontSize: 12, marginBottom: 12 }}>{error}</div>
              )}
              {success && (
                <div style={{ color: t.a, fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>
                  ✓ {success}
                </div>
              )}
              {!success && (
                <button
                  type="submit" disabled={loading}
                  style={{ ...BTN_PRIMARY, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? '...' : 'Wyślij link resetujący'}
                </button>
              )}
            </form>
          </>
        ) : (
          <>
            {/* Tabs login / register */}
            <div style={{
              display: 'flex', background: t.bg,
              borderRadius: 12, padding: 4, marginBottom: 22,
            }}>
              {[['login', 'Zaloguj się'], ['register', 'Zarejestruj']].map(([id, label]) => (
                <button key={id} onClick={() => switchMode(id)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                  background: mode === id ? t.a : 'transparent',
                  color: mode === id ? '#fff' : t.tm,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}>{label}</button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={INPUT}
              />
              <input
                type="password" placeholder="Hasło (min. 6 znaków)" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6}
                style={INPUT}
              />

              {/* Forgot link — only in login mode */}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  style={{
                    background: 'none', border: 'none', color: t.tm,
                    fontSize: 11, cursor: 'pointer', padding: '0 0 14px',
                    fontFamily: 'inherit', display: 'block',
                    textDecoration: 'underline',
                  }}
                >
                  Zapomniałeś hasła?
                </button>
              )}

              {!mode !== 'login' && <div style={{ height: 14 }} />}

              {error && (
                <div style={{ color: t.d, fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>{error}</div>
              )}
              {success && (
                <div style={{ color: t.a, fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>{success}</div>
              )}
              <button
                type="submit" disabled={loading || !!success}
                style={{
                  ...BTN_PRIMARY,
                  cursor: (loading || success) ? 'default' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '...' : mode === 'login' ? 'Zaloguj się' : 'Zarejestruj'}
              </button>
            </form>
          </>
        )}

        {!supabase && (
          <div style={{ marginTop: 16, fontSize: 11, color: t.tm, textAlign: 'center', lineHeight: 1.5 }}>
            Uzupełnij <code>REACT_APP_SUPABASE_URL</code> i{' '}
            <code>REACT_APP_SUPABASE_ANON_KEY</code> w <code>.env</code>.
          </div>
        )}
      </div>
    </div>
  );
}
