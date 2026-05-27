import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function AuthPage() {
  const { login, signup, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else if (mode === 'signup') {
        if (!form.name.trim()) throw new Error('Please enter your name.');
        if (form.password.length < 6)
          throw new Error('Password must be at least 6 characters.');
        if (form.password !== form.confirm)
          throw new Error('Passwords do not match.');
        await signup(form.email, form.password, form.name);
      } else if (mode === 'forgot') {
        if (form.newPassword.length < 6)
          throw new Error('Password must be at least 6 characters.');
        await resetPassword(form.email, form.newPassword);
        setSuccess('Password reset! You can now log in.');
        setMode('login');
        setForm((f) => ({ ...f, password: '' }));
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              color: 'var(--primary)',
              letterSpacing: '3px',
              textShadow: '0 0 40px rgba(255,203,5,0.5)',
            }}
          >
            ⚡ POKETRACKER
          </div>
          <div
            style={{
              color: 'var(--text-muted)',
              marginTop: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            {mode === 'login' && 'Sign in to your collection'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          {success && (
            <div
              style={{
                background: 'rgba(59,255,138,0.1)',
                border: '1px solid rgba(59,255,138,0.3)',
                color: 'var(--green)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {success}
            </div>
          )}
          {error && (
            <div
              style={{
                background: 'rgba(255,59,59,0.1)',
                border: '1px solid rgba(255,59,59,0.3)',
                color: 'var(--red)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {mode === 'signup' && (
              <div className="form-group">
                <label>Your Name</label>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Ash Ketchum"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {mode === 'login' && (
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => set('confirm', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            {mode === 'forgot' && (
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => set('newPassword', e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '0.5rem',
                padding: '0.75rem',
              }}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Account'
                : 'Reset Password'}
            </button>
          </form>

          {/* Footer links */}
          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {mode === 'login' && (
              <>
                <button
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Forgot your password?
                </button>
                <div
                  style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
                >
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}
            {(mode === 'signup' || mode === 'forgot') && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  ← Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
