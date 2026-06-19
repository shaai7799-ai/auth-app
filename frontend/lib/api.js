// lib/api.js - Helper functions for talking to our backend API

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Register a new user ──────────────────────────────────────────────────────
export async function registerUser(name, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data; // { message, token, user }
}

// ─── Log in an existing user ──────────────────────────────────────────────────
export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data; // { message, token, user }
}

// ─── Get the currently logged-in user ────────────────────────────────────────
export async function getCurrentUser() {
  const token = localStorage.getItem('token');

  if (!token) return null;

  const response = await fetch(`${API_URL}/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.user;
}

// ─── Save token after login/register ─────────────────────────────────────────
export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// ─── Remove token on logout ───────────────────────────────────────────────────
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ─── Get saved user from localStorage ────────────────────────────────────────
export function getSavedUser() {
  if (typeof window === 'undefined') return null; // SSR safety
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
