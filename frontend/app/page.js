'use client'; // This tells Next.js this component runs in the browser

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedUser } from '../lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const user = getSavedUser();
    if (user) {
      router.push('/dashboard'); // Go to dashboard if logged in
    } else {
      router.push('/login');     // Go to login if not
    }
  }, [router]);

  // Show a simple loading screen while redirecting
  return (
    <div className="page-center">
      <p style={{ color: '#6b7280' }}>Loading...</p>
    </div>
  );
}
