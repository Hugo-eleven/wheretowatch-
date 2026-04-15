import { useState } from 'react';
import { supabase } from '../services/supabase';
import { t as theme } from '../theme';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
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
      setError(t('auth_supabase_err'));
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
        setSuccess(t('auth_check_email'));
      } else if (mode === 'forgot') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (err) throw err;
        setSuccess(t('auth_reset_sent') + email);
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
          background: theme.s, borderRadius: 22, padding: 28,
          width: '100%', maxWidth: 380,
          border: '1px solid ' + theme.b,
          boxShadow: '0 8px 48px rgba(0,0,0,0.55)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Logo */}
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
          <span style={{ color: theme.a }}>Where</span>
          <span style={{ color: theme.tm, fontWeight: 400 }}>to</span>
          <span style={{ color: theme.tx }}>Watch</span>
        </div>

        {/* Forgot password view */}
        {mode === 'forgot' ? (
          <>
            <button
              onClick={() => switchMode('login')}
              style={{
                background: 'none', border: 'none', color: theme.tm,
                fontSize: 12, cursor: 'pointer', padding: '0 0 16px',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {t('auth_back_login')}
            </button>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.tx, marginBottom: 6 }}>
              {t('auth_reset_title')}
            </div>
            <div style={{ fontSize: 12, color: theme.tm, marginBottom: 18 }}>
              {t('auth_reset_desc')}
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="email" placeholder={t('auth_email')} value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{ ...INPUT, marginBottom: 16 }}
              />
              {error && (
                <div style={{ color: theme.d, fontSize: 12, marginBottom: 12 }}>{error}</div>
              )}
              {success && (
                <div style={{ color: theme.a, fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>
                  ✓ {success}
                </div>
              )}
              {!success && (
                <button
                  type="submit" disabled={loading}
                  style={{ ...BTN_PRIMARY, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? '...' : t('auth_send_reset')}
                </button>
              )}
            </form>
          </>
        ) : (
          <>
            {/* Tabs login / register */}
            <div style={{
              display: 'flex', background: theme.bg,
              borderRadius: 12, padding: 4, marginBottom: 22,
            }}>
              {[['login', t('auth_login')], ['register', t('auth_register')]].map(([id, label]) => (
                <button key={id} onClick={() => switchMode(id)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                  background: mode === id ? theme.a : 'transparent',
                  color: mode === id ? '#fff' : theme.tm,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}>{label}</button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email" placeholder={t('auth_email')} value={email}
                onChange={e => setEmail(e.target.value)} required
                style={INPUT}
              />
              <input
                type="password" placeholder={t('auth_password')} value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6}
                style={INPUT}
              />

              {/* Forgot link — only in login mode */}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  style={{
                    background: 'none', border: 'none', color: theme.tm,
                    fontSize: 11, cursor: 'pointer', padding: '0 0 14px',
                    fontFamily: 'inherit', display: 'block',
                    textDecoration: 'underline',
                  }}
                >
                  {t('auth_forgot')}
                </button>
              )}

              {!mode !== 'login' && <div style={{ height: 14 }} />}

              {error && (
                <div style={{ color: theme.d, fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>{error}</div>
              )}
              {success && (
                <div style={{ color: theme.a, fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>{success}</div>
              )}
              <button
                type="submit" disabled={loading || !!success}
                style={{
                  ...BTN_PRIMARY,
                  cursor: (loading || success) ? 'default' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '...' : mode === 'login' ? t('auth_login') : t('auth_register')}
              </button>
            </form>
          </>
        )}

        {!supabase && (
          <div style={{ marginTop: 16, fontSize: 11, color: theme.tm, textAlign: 'center', lineHeight: 1.5 }}>
            {t('auth_supabase_hint')}
          </div>
        )}
      </div>
    </div>
  );
}
