// app/layout.js - Root layout wraps every page

export const metadata = {
  title: 'Auth App — Next.js + PostgreSQL',
  description: 'Beginner login & registration example',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          /* ── Reset & Base ── */
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f0f4ff;
            color: #1a1a2e;
            min-height: 100vh;
          }

          /* ── Card ── */
          .card {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(79, 70, 229, 0.10);
            padding: 40px;
            width: 100%;
            max-width: 420px;
            margin: 0 auto;
          }

          /* ── Page Centering ── */
          .page-center {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          /* ── Typography ── */
          h1 { font-size: 1.75rem; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
          .subtitle { color: #6b7280; font-size: 0.9rem; margin-bottom: 28px; }

          /* ── Form Elements ── */
          .form-group { margin-bottom: 18px; }

          label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
          }

          input {
            width: 100%;
            padding: 11px 14px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 1rem;
            color: #1a1a2e;
            background: #fafafa;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
          }
          input:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
            background: #fff;
          }
          input::placeholder { color: #adb5bd; }

          /* ── Buttons ── */
          .btn {
            display: block;
            width: 100%;
            padding: 13px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            text-decoration: none;
          }
          .btn-primary {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: #fff;
          }
          .btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(79,70,229,0.35);
          }
          .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
          .btn-outline {
            background: transparent;
            border: 2px solid #4f46e5;
            color: #4f46e5;
            margin-top: 10px;
          }
          .btn-outline:hover { background: #f0f4ff; }

          /* ── Alert Messages ── */
          .alert {
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 0.9rem;
            margin-bottom: 18px;
          }
          .alert-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
          .alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; }

          /* ── Links ── */
          .link-row {
            text-align: center;
            margin-top: 20px;
            font-size: 0.88rem;
            color: #6b7280;
          }
          .link-row a { color: #4f46e5; font-weight: 600; text-decoration: none; }
          .link-row a:hover { text-decoration: underline; }

          /* ── Logo / Brand ── */
          .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 28px;
          }
          .brand-icon {
            width: 42px; height: 42px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 1.2rem; font-weight: 700;
          }
          .brand-name { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; }

          /* ── Dashboard ── */
          .dashboard-page {
            min-height: 100vh;
            background: #f0f4ff;
          }
          .navbar {
            background: #fff;
            padding: 0 32px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 1px 8px rgba(79,70,229,0.08);
          }
          .nav-brand { font-size: 1.1rem; font-weight: 700; color: #4f46e5; }
          .nav-user { display: flex; align-items: center; gap: 14px; font-size: 0.9rem; color: #6b7280; }
          .dashboard-content {
            max-width: 720px;
            margin: 48px auto;
            padding: 0 24px;
          }
          .welcome-banner {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: #fff;
            border-radius: 16px;
            padding: 36px;
            margin-bottom: 24px;
          }
          .welcome-banner h2 { font-size: 1.6rem; margin-bottom: 6px; }
          .welcome-banner p { opacity: 0.85; font-size: 0.95rem; }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .info-card {
            background: #fff;
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 2px 12px rgba(79,70,229,0.07);
          }
          .info-card .label { font-size: 0.8rem; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
          .info-card .value { font-size: 1rem; font-weight: 600; color: #1a1a2e; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
