import React, { useState, useEffect } from 'react';

export const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const TOTAL_DURATION_MS = 8000; // 8 seconds
  const INTERVAL_MS = 80; // Update every 80ms
  const INCREMENT = 100 / (TOTAL_DURATION_MS / INTERVAL_MS); // 1% per step

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          triggerFinish();
          return 100;
        }
        return Math.min(100, prev + INCREMENT);
      });
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const triggerFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 500); // 500ms fade transition out
  };

  const statusMessages = [
    { threshold: 0, text: "Initializing Placement Copilot AI Engine..." },
    { threshold: 20, text: "Loading Scikit-Learn ML Placement Prediction Models..." },
    { threshold: 45, text: "Configuring SHAP Feature Explainability Engine..." },
    { threshold: 65, text: "Connecting MongoDB Atlas Cloud & ATS Keyword Parser..." },
    { threshold: 85, text: "Optimizing Personalised GenAI Roadmaps..." },
    { threshold: 98, text: "Engine Ready! Launching Application..." }
  ];

  const currentMessage = [...statusMessages].reverse().find(m => progress >= m.threshold)?.text || "Loading...";

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #312E81 70%, #4F46E5 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      opacity: isFadingOut ? 0 : 1,
      transform: isFadingOut ? 'scale(1.05)' : 'scale(1)',
      transition: 'opacity 500ms ease, transform 500ms ease',
      pointerEvents: isFadingOut ? 'none' : 'auto'
    }}>
      {/* Skip Button */}
      <button
        onClick={triggerFinish}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          padding: '8px 18px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#FFFFFF',
          fontSize: '0.85rem',
          fontWeight: '700',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease'
        }}
      >
        Skip Loading →
      </button>

      {/* Container for Logo + Shadow */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Floating Mascot Image */}
        <div className="splash-logo-container" style={{
          width: '240px',
          height: '240px',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(79, 70, 229, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          animation: 'splashFloat 3s ease-in-out infinite'
        }}>
          <img
            src="/assets/ai-copilot-logo.png"
            alt="AI Placement Copilot Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Pulsing Shadow beneath logo */}
        <div className="splash-shadow" style={{
          width: '160px',
          height: '18px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '50%',
          filter: 'blur(8px)',
          marginTop: '20px',
          animation: 'splashShadowPulse 3s ease-in-out infinite'
        }} />
      </div>

      {/* App Branding Text */}
      <div style={{ marginTop: '28px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Placement<span style={{ color: '#818CF8' }}>Copilot</span>
        </h1>

        <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.925rem', fontWeight: '500', minHeight: '28px', marginBottom: '24px' }}>
          {currentMessage}
        </p>

        {/* Progress Counter % */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
            System Loading
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38BDF8' }}>
            {Math.floor(progress)}%
          </span>
        </div>

        {/* Sleek Progress Track */}
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.12)',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #4F46E5 0%, #0EA5E9 100%)',
            borderRadius: '6px',
            boxShadow: '0 0 16px rgba(14, 165, 233, 0.8)',
            transition: 'width 0.1s linear'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes splashFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes splashShadowPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(0.85); opacity: 0.18; }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-logo-container, .splash-shadow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
