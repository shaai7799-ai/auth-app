'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, saveAuth } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState(''); // Confirm password field
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validation before even calling the API
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);

    try {
      const data = await registerUser(name, email, password);
      saveAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Password strength indicator
  function getStrength(pwd) {
    if (!pwd) return null;
    if (pwd.length < 6)  return { label: 'Too short', color: '#ef4444' };
    if (pwd.length < 8)  return { label: 'Weak',      color: '#f97316' };
    if (pwd.length < 12) return { label: 'Good',      color: '#eab308' };
    return                      { label: 'Strong',    color: '#22c55e' };
  }

  const strength = getStrength(password);

  return (
    <div className="page-center">
      <div className="card">
        {/* Brand Logo */}
        <div className="brand">
          <div className="brand-icon">A</div>
          <span className="brand-name">AuthApp</span>
        </div>

        <h1>Create account</h1>
        <p className="subtitle">Join us today — it's free!</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {/* Password strength indicator */}
            {strength && (
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  height: '4px', flex: 1, background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: strength.color,
                    width: strength.label === 'Too short' ? '20%'
                         : strength.label === 'Weak'      ? '40%'
                         : strength.label === 'Good'      ? '70%' : '100%',
                    transition: 'width 0.3s, background 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: '0.78rem', color: strength.color, fontWeight: 600 }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              style={{
                borderColor: confirm && confirm !== password ? '#ef4444' : '',
              }}
            />
            {confirm && confirm !== password && (
              <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' }}>
                Passwords don't match
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="link-row">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
