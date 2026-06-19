'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, clearAuth, getSavedUser } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      // First, show the saved user immediately (fast)
      const saved = getSavedUser();
      if (!saved) {
        router.push('/login'); // Not logged in → go to login
        return;
      }
      setUser(saved);

      // Then verify with the backend (secure)
      const freshUser = await getCurrentUser();
      if (!freshUser) {
        clearAuth();
        router.push('/login'); // Token expired → go to login
        return;
      }
      setUser(freshUser);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  if (loading && !user) {
    return (
      <div className="page-center">
        <p style={{ color: '#6b7280' }}>Loading your dashboard...</p>
      </div>
    );
  }

  // Format the date nicely
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : 'Today';

  return (
    <div className="dashboard-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <span className="nav-brand">✦ AuthApp</span>
        <div className="nav-user">
          <span>👤 {user?.name}</span>
          <Link href="/logs" className="btn btn-outline"
            style={{ width: 'auto', padding: '8px 18px', marginTop: 0 }}>
            📋 View Logs
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ width: 'auto', padding: '8px 18px', marginTop: 0 }}
          >
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>You're successfully logged in. This is your protected dashboard.</p>
        </div>

        {/* User Info Cards */}
        <div className="info-grid">
          <div className="info-card">
            <div className="label">Full Name</div>
            <div className="value">{user?.name}</div>
          </div>
          <div className="info-card">
            <div className="label">Email</div>
            <div className="value" style={{ fontSize: '0.9rem' }}>{user?.email}</div>
          </div>
          <div className="info-card">
            <div className="label">Account ID</div>
            <div className="value">#{user?.id}</div>
          </div>
          <div className="info-card">
            <div className="label">Member Since</div>
            <div className="value" style={{ fontSize: '0.88rem' }}>{joinedDate}</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-card" style={{ marginTop: '16px' }}>
          <div className="label" style={{ marginBottom: '10px' }}>🔐 How authentication works</div>
          <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.7' }}>
            When you logged in, the backend verified your password and returned a <strong>JWT token</strong>.
            That token is saved in <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>localStorage</code> and
            sent with every API request in the <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>Authorization</code> header.
            The server verifies the token to confirm you're allowed to access this page.
          </p>
        </div>
      </div>
    </div>
  );
}
