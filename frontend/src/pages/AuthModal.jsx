import React, { useState } from 'react';
import { api } from '../services/api';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.login({ email, password });
      } else {
        res = await api.signup({ name, email, password });
      }
      
      localStorage.setItem("copilot_token", res.access_token);
      if (res.user) {
        localStorage.setItem("copilot_user", JSON.stringify(res.user));
      }
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card-3d" style={{ maxWidth: '440px', width: '100%', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#94A3B8'
          }}
        >
          ✕
        </button>

        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              color: isLogin ? '#4F46E5' : 'var(--color-text-muted)',
              borderBottom: isLogin ? '3px solid #4F46E5' : 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              color: !isLogin ? '#4F46E5' : 'var(--color-text-muted)',
              borderBottom: !isLogin ? '3px solid #4F46E5' : 'none',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#EF4444',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-body)', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Student"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--color-text-heading)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-body)', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'var(--input-bg)',
                color: 'var(--color-text-heading)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-body)', marginBottom: '6px' }}>
              Password { !isLogin && "(min. 8 characters)" }
            </label>
            <input
              type="password"
              required
              minLength={isLogin ? 1 : 8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'var(--input-bg)',
                color: 'var(--color-text-heading)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-3d-primary" style={{ marginTop: '8px', width: '100%' }}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Register Account")}
          </button>
        </form>
      </div>
    </div>
  );
};
