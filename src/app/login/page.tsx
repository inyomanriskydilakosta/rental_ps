'use client';

import { useState } from 'react';
import { Eye, EyeOff, User, Gamepad2 } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    // TODO: integrate real auth
  };

  return (
    <div className="login-root">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-wrapper">
        {/* ── DESKTOP: two-panel layout ── */}
        <div className="login-card">

          {/* LEFT PANEL — branding */}
          <div className="brand-panel">
            <div className="brand-content">
              <div className="brand-icon-wrap">
                <Gamepad2 className="brand-icon" />
              </div>
              <h1 className="brand-title">PS CAPT</h1>
              <p className="brand-sub">RENTAL PS AMAN DAN CEPAT</p>
              <div className="brand-divider" />
              <p className="brand-desc">
                Kelola sesi rental PlayStation Anda dengan mudah, cepat, dan
                terpercaya. Satu platform untuk semua kebutuhan rental Anda.
              </p>
              <ul className="brand-features">
                <li>✦ Monitoring sesi real-time</li>
                <li>✦ Manajemen unit PlayStation</li>
                <li>✦ Laporan transaksi lengkap</li>
              </ul>
            </div>
            <p className="brand-footer">© 2026 PS CAPT · All rights reserved</p>
          </div>

          {/* RIGHT PANEL — form */}
          <div className="form-panel">
            {/* Mobile-only logo */}
            <div className="mobile-logo">
              <div className="mobile-logo-icon">
                <Gamepad2 size={28} color="#fff" />
              </div>
              <div>
                <div className="mobile-logo-title">PS CAPT</div>
                <div className="mobile-logo-sub">RENTAL PS AMAN DAN CEPAT</div>
              </div>
            </div>

            <div className="form-header">
              <h2 className="form-title">Selamat Datang</h2>
              <p className="form-subtitle">Masuk ke akun admin Anda</p>
            </div>

            <form onSubmit={handleLogin} className="login-form" noValidate>
              {/* Username */}
              <div className="field-wrap">
                <label htmlFor="username" className="field-label">
                  Username
                </label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <User size={18} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-wrap">
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <EyeOff size={18} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    required
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    className="toggle-pw"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-btn"
                type="submit"
                className={`login-btn${isLoading ? ' loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner" />
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Reset & Root ───────────────────────────────────── */
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #020f3a 0%, #021277 40%, #0a1fa8 70%, #0d2fd4 100%);
          position: relative;
          overflow: hidden;
          padding: 1rem;
        }

        /* ── Animated blobs ─────────────────────────────────── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: float 8s ease-in-out infinite;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #1e40af, transparent);
          top: -150px; left: -150px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #3b82f6, transparent);
          bottom: -100px; right: -100px;
          animation-delay: 3s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #60a5fa, transparent);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 6s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* ── Card wrapper ───────────────────────────────────── */
        .login-wrapper {
          width: 100%;
          max-width: 900px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          display: flex;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.06);
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
        }

        /* ── LEFT — Brand panel ─────────────────────────────── */
        .brand-panel {
          display: none; /* hidden on mobile */
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
          border-right: 1px solid rgba(255,255,255,0.08);
          width: 52%;
          flex-shrink: 0;
        }

        .brand-content {}

        .brand-icon-wrap {
          width: 64px; height: 64px;
          background: rgba(255,255,255,0.15);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .brand-icon { width: 36px; height: 36px; color: #fff; }

        .brand-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1;
          margin: 0 0 0.3rem;
        }
        .brand-sub {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          margin: 0 0 1.5rem;
        }
        .brand-divider {
          width: 48px; height: 3px;
          background: linear-gradient(90deg, #60a5fa, #3b82f6);
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }
        .brand-desc {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          margin: 0 0 1.5rem;
        }
        .brand-features {
          list-style: none;
          padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .brand-features li {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
        }
        .brand-footer {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }

        /* ── RIGHT — Form panel ─────────────────────────────── */
        .form-panel {
          flex: 1;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Mobile logo — only visible on small screens */
        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }
        .mobile-logo-icon {
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.15);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .mobile-logo-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .mobile-logo-sub {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          margin-top: 2px;
        }

        .form-header { margin-bottom: 2rem; }
        .form-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.3rem;
        }
        .form-subtitle {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        /* ── Form elements ──────────────────────────────────── */
        .login-form { display: flex; flex-direction: column; gap: 1.25rem; }

        .field-wrap { display: flex; flex-direction: column; gap: 0.4rem; }
        .field-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.03em;
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: rgba(255,255,255,0.45);
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.3); }
        .login-input:focus {
          border-color: rgba(96,165,250,0.6);
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 3px rgba(96,165,250,0.15);
        }

        .toggle-pw {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color 0.2s;
        }
        .toggle-pw:hover { color: rgba(255,255,255,0.75); }

        /* ── Login button ───────────────────────────────────── */
        .login-btn {
          width: 100%;
          padding: 0.95rem;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.02em;
          box-shadow: 0 6px 24px rgba(37,99,235,0.45);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(37,99,235,0.55);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn.loading {
          opacity: 0.75;
          cursor: not-allowed;
        }

        /* ── Spinner ────────────────────────────────────────── */
        .spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Responsive ─────────────────────────────────────── */

        /* Tablet & up: show brand panel */
        @media (min-width: 640px) {
          .brand-panel { display: flex; }
          .mobile-logo { display: none; }
          .form-panel { padding: 3rem 2.5rem; }
        }

        /* Large desktop */
        @media (min-width: 1024px) {
          .login-wrapper { max-width: 960px; }
          .brand-panel { padding: 4rem; }
          .form-panel { padding: 4rem 3rem; }
          .form-title { font-size: 2rem; }
        }

        /* Mobile tweaks */
        @media (max-width: 639px) {
          .login-root { padding: 0; align-items: stretch; }
          .login-wrapper { max-width: 100%; height: 100%; display: flex; }
          .login-card {
            border-radius: 0;
            flex: 1;
            flex-direction: column;
            background: transparent;
            box-shadow: none;
          }
          .form-panel {
            padding: 3rem 1.75rem 2rem;
            justify-content: center;
          }
          .login-input { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}
