import React, { useState, useRef, useEffect } from 'react';

export const Navbar = ({ activeScreen, setActiveScreen, user, onOpenAuth, onLogout, theme, toggleTheme }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profile', label: 'Profile Form' },
    { id: 'resume', label: 'Resume ATS' },
    { id: 'skillgap', label: 'Skill Gap' },
    { id: 'companies', label: 'Companies' },
    { id: 'roadmap', label: 'AI Roadmap' }
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="glass-panel" style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        height: '64px',
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo Brand */}
          <div 
            onClick={() => { setActiveScreen('landing'); setIsMobileMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div className="icon-chip icon-chip-primary" style={{ width: '38px', height: '38px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--color-text-heading)', letterSpacing: '-0.02em' }}>
              Placement<span style={{ color: '#4F46E5' }}>Copilot</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {navItems.map((item) => {
              const isActive = activeScreen === item.id || 
                (item.id === 'profile' && activeScreen === 'results') ||
                (item.id === 'resume' && activeScreen === 'resume_results');
              const isLockedForGuest = item.id === 'roadmap' && !user;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isLockedForGuest) { onOpenAuth(); return; }
                    setActiveScreen(item.id);
                  }}
                  title={isLockedForGuest ? 'Sign in to access AI Roadmap' : ''}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isActive ? '#4F46E5' : 'transparent',
                    color: isActive ? '#FFFFFF' : isLockedForGuest ? 'var(--color-text-muted)' : 'var(--color-text-body)',
                    boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.4)' : 'none',
                    opacity: isLockedForGuest ? 0.7 : 1
                  }}
                >
                  {item.label}{isLockedForGuest ? ' 🔒' : ''}
                </button>
              );
            })}
          </nav>

          {/* Right Actions / Dark Mode Toggle / Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* ☀️ / 🌙 Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-heading)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(15, 23, 42, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {user ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    border: '2px solid var(--color-surface)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getInitials(user.name)}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '50px',
                    width: '220px',
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.3)',
                    padding: '8px',
                    zIndex: 300
                  }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-heading)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                    </div>
                    <button
                      onClick={() => { setActiveScreen('dashboard'); setIsDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--color-text-body)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      📊 Dashboard
                    </button>
                    <button
                      onClick={() => { setActiveScreen('profile'); setIsDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--color-text-body)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      ⚙️ Profile Settings
                    </button>
                    <button
                      onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: '#EF4444',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="btn-3d-primary" 
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-hamburger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--color-text-heading)'
              }}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          top: '64px',
          background: 'var(--color-surface)',
          zIndex: 190,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {navItems.map((item) => {
            const isLockedForGuest = item.id === 'roadmap' && !user;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLockedForGuest) { onOpenAuth(); setIsMobileMenuOpen(false); return; }
                  setActiveScreen(item.id);
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  textAlign: 'left',
                  background: activeScreen === item.id ? 'rgba(79, 70, 229, 0.15)' : 'var(--color-bg)',
                  color: activeScreen === item.id ? '#4F46E5' : isLockedForGuest ? 'var(--color-text-muted)' : 'var(--color-text-heading)',
                  opacity: isLockedForGuest ? 0.7 : 1
                }}
              >
                {item.label}{isLockedForGuest ? ' 🔒' : ''}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
};
