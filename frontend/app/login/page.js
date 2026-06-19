'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, saveAuth } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();

  // State variables - these hold the form data and UI state
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');     // Error message to show user
  const [loading, setLoading]   = useState(false);  // Disable button while waiting

  // This runs when the form is submitted
  async function handleSubmit(e) {
    e.preventDefault(); // Stop the page from refreshing
    setError('');        // Clear any previous error
    setLoading(true);    // Show loading state

    try {
      // Call our API helper (which calls the backend)
      const data = await loginUser(email, password);

      // Save the token and user info in localStorage
      saveAuth(data.token, data.user);

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (err) {
      // Show the error message from the backend
      setError(err.message);
    } finally {
      setLoading(false); // Always re-enable the button
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        {/* Brand Logo */}
        <div className="brand">
          <div className="brand-icon">A</div>
          <span className="brand-name">AuthApp</span>
        </div>

        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your account to continue</p>

        {/* Error Message */}
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}  // Update state on every keystroke
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Link to Register */}
        <div className="link-row">
          Don't have an account?{' '}
          <Link href="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
