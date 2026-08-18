import React from 'react';

export const LandingPage = ({ onStartPrediction, onUploadResume, onGoDashboard }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', margin: '30px 0 60px 0' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: 'var(--badge-indigo-bg)',
          border: '1px solid var(--badge-indigo-border)',
          color: 'var(--badge-indigo-text)',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)'
        }}>
          ✨ Trained on 100,000 Real Engineering Placement Records
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: '800',
          color: 'var(--color-text-heading)',
          lineHeight: '1.15',
          letterSpacing: '-1px',
          marginBottom: '20px'
        }}>
          Predict Your Placement Readiness & <br/>
          <span style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Accelerate Your Campus Hiring
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--color-text-body)',
          maxWidth: '740px',
          margin: '0 auto 36px auto',
          lineHeight: '1.6'
        }}>
          AI-Placement Copilot uses machine learning algorithms trained on 100,000 student data points to predict your hiring probability, analyze ATS resumes, highlight critical skill gaps, match company roles, and build custom GenAI roadmaps.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={onStartPrediction} className="btn-3d-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            🚀 Calculate My Readiness Score
          </button>
          <button onClick={onUploadResume} className="btn-3d-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            📄 Upload Resume for ATS Check
          </button>
        </div>
      </section>

      {/* STATS SHOWCASE */}
      <section className="card-3d" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        textAlign: 'center',
        background: 'var(--card-gradient-hero)',
        marginBottom: '60px'
      }}>
        <div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#4F46E5' }}>100,000</div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Training Data Records</div>
        </div>
        <div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#0EA5E9' }}>15+</div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Evaluated Profile Parameters</div>
        </div>
        <div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#22C55E' }}>RandomForest</div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Dual ML Classifiers</div>
        </div>
        <div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#F59E0B' }}>Mistral-7B</div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>GenAI Roadmap Engine</div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '12px' }}>
          End-to-End Placement Intelligence Suite
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-body)', marginBottom: '40px' }}>
          Everything engineering candidates need to crack top product and tier-1 service company interviews.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div className="card-3d">
            <div className="icon-chip icon-chip-primary" style={{ marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
              ML Readiness Calculator
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)' }}>
              Input your CGPA, internships, projects, hackathons, and study habits to get your placement probability score (0–100) and expected LPA package.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card-3d">
            <div className="icon-chip icon-chip-info" style={{ marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
              ATS Resume Parser
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)' }}>
              Upload your PDF/DOCX resume to instantly scan keyword density, extract technical skills, check contact formatting, and identify missing high-value keywords.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card-3d">
            <div className="icon-chip icon-chip-warning" style={{ marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
              Benchmark Skill Gap Radar
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)' }}>
              Compare your academic, aptitude, and portfolio metrics against Tier-1, Tier-2, and Tier-3 college benchmark standards with severity badges.
            </p>
          </div>

          {/* Card 4 */}
          <div className="card-3d">
            <div className="icon-chip icon-chip-success" style={{ marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
              Company Matching Engine
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)' }}>
              Receive AI-matched company recommendations (Google, Microsoft, Amazon, TCS Digital, etc.) based on your branch, tier, and readiness percentage.
            </p>
          </div>

          {/* Card 5 */}
          <div className="card-3d">
            <div className="icon-chip icon-chip-primary" style={{ marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
              GenAI Prep Roadmap
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)' }}>
              Get a weekly customized action plan generated by Mistral-7B for DSA, system design, projects, and HR prep, with interactive task progress tracking.
            </p>
          </div>

          {/* Card 6 */}
          <div className="card-3d">
            <div className="icon-chip icon-chip-info" style={{ marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
              Unified Student Dashboard
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)' }}>
              Consolidate your readiness score ring, ATS checks, active roadmap checklist, and top company targets into one central view.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
