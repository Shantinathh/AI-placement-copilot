import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { getScoreBreakdown } from '../utils/scoreCalculator';

export const DashboardView = ({ onNavigate, profileData, predictionResult, resumeAnalysisResult }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      setApiError('Could not connect to backend server. Please ensure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDownloadPdf = async () => {
    setPdfError('');
    setDownloadingPdf(true);
    try {
      await api.downloadReportPdf();
    } catch (err) {
      setPdfError('Failed to download PDF report. Ensure backend server is running.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid #4F46E5', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
        Loading your placement dashboard...
      </div>
    );
  }

  if (apiError) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px 20px' }} className="card-3d">
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>Backend Unavailable</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>{apiError}</p>
        <button onClick={fetchDashboard} className="btn-3d-primary">🔄 Retry Connection</button>
      </div>
    );
  }

  const activeProfile = data?.profile || profileData;
  const readiness = data?.readiness || predictionResult;
  const ats = data?.ats || resumeAnalysisResult;
  const top_companies = data?.top_companies;
  const roadmap = data?.roadmap;
  const user_name = data?.user_name;

  const hasProfile = !!readiness || !!activeProfile;
  const hasResume = !!ats;
  const hasCompanies = top_companies && top_companies.length > 0;
  const hasRoadmap = roadmap && roadmap.tracks && roadmap.tracks.length > 0;

  // Retrieve calculated scores from backend or compute with frontend utility fallback
  const calculatedInfo = data?.calculated_scores || (activeProfile ? getScoreBreakdown(activeProfile) : null);

  // Empty state card helper
  const EmptyCard = ({ icon, title, desc, action, actionLabel }) => (
    <div style={{ textAlign: 'center', padding: '28px 20px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontWeight: '700', color: 'var(--color-text-heading)', fontSize: '0.95rem', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>{desc}</div>
      <button onClick={action} className="btn-3d-secondary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>{actionLabel}</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      {/* Welcome Banner */}
      <div className="card-3d" style={{
        marginBottom: '30px',
        padding: '30px 24px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '6px', color: '#FFFFFF' }}>
            Welcome Back, {user_name || 'Student'}! 👋
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            {hasProfile
              ? 'Here is your real-time placement readiness overview, calculated performance metrics, ATS resume status, and company target list.'
              : 'Complete your profile to unlock personalized placement insights and recommendations.'}
          </p>
          {pdfError && (
            <div style={{ marginTop: '10px', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              ⚠️ {pdfError}
            </div>
          )}
        </div>

        {hasProfile && (
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="btn-3d-primary"
            style={{
              background: '#FFFFFF',
              color: '#4F46E5',
              fontWeight: '800',
              padding: '12px 24px',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {downloadingPdf ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #4F46E5', borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                Generating PDF...
              </>
            ) : '📥 Download PDF Report'}
          </button>
        )}
      </div>

      {/* Primary Score Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        {/* Readiness Card */}
        <div className="card-3d" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', minHeight: '160px' }}>
          {hasProfile && readiness ? (
            <>
              <ScoreGauge score={readiness.readiness_score} title="Placement Readiness" subtitle="ML Model Index" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Status</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: readiness.predicted_status === 'Placed' ? '#22C55E' : '#EF4444' }}>
                  {readiness.predicted_status}
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Estimated LPA</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--badge-indigo-text)' }}>
                  {readiness.predicted_salary_lpa} LPA
                </div>
                <button onClick={() => onNavigate('profile')} className="btn-3d-secondary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.785rem' }}>
                  Recalculate
                </button>
              </div>
            </>
          ) : (
            <EmptyCard
              icon="📊"
              title="No Readiness Score Yet"
              desc="Fill in your profile to get your ML placement prediction."
              action={() => onNavigate('profile')}
              actionLabel="🚀 Fill Profile"
            />
          )}
        </div>

        {/* ATS Card */}
        <div className="card-3d" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', minHeight: '160px' }}>
          {hasResume ? (
            <>
              <ScoreGauge score={ats.ats_score} title="ATS Resume Score" subtitle="Keyword Compatibility" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Detected Skills</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0EA5E9' }}>{ats.extracted_skills?.length || 0} Skills</div>
                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Missing Keywords</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#F59E0B' }}>{ats.missing_skills?.length || 0} Keywords</div>
                <button onClick={() => onNavigate('resume')} className="btn-3d-secondary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.785rem' }}>
                  Scan New Resume
                </button>
              </div>
            </>
          ) : (
            <EmptyCard
              icon="📄"
              title="No Resume Scanned Yet"
              desc="Upload your PDF/DOCX to get your ATS compatibility score."
              action={() => onNavigate('resume')}
              actionLabel="📄 Upload Resume"
            />
          )}
        </div>
      </div>

      {/* AI-Calculated Performance Dimensions Section */}
      <div className="card-3d" style={{ marginBottom: '30px', padding: '28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>🤖</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>
                AI-Calculated Performance Scores
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Aptitude, Leadership, and Extracurricular metrics systematically derived from your academic credentials, projects, and activities.
            </p>
          </div>

          {hasProfile && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'var(--badge-indigo-bg)',
              color: 'var(--badge-indigo-text)',
              border: '1px solid var(--badge-indigo-border)',
              fontSize: '0.785rem',
              fontWeight: '700'
            }}>
              <span>⚡</span> Algorithmic Assessment
            </span>
          )}
        </div>

        {hasProfile && calculatedInfo ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Aptitude Score Card */}
            <div style={{
              background: 'var(--color-bg)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>🧠</span>
                    <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-text-heading)' }}>Aptitude Score</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    background: 'rgba(79, 70, 229, 0.12)',
                    color: '#4F46E5',
                    border: '1px solid rgba(79, 70, 229, 0.25)'
                  }}>
                    {calculatedInfo.breakdown?.aptitude?.level || 'Proficient'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#4F46E5', lineHeight: 1 }}>
                    {calculatedInfo.aptitude_score}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>/ 100</span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, calculatedInfo.aptitude_score))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #4F46E5 0%, #818CF8 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.8s ease-in-out'
                  }} />
                </div>

                {/* Factors Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {(calculatedInfo.breakdown?.aptitude?.factors || []).map((f, i) => (
                    <span key={i} style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'var(--chip-bg)',
                      color: 'var(--chip-text)',
                      border: '1px solid var(--color-border)'
                    }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                {calculatedInfo.breakdown?.aptitude?.summary || 'Calculated from CGPA, certifications, study hours, and institutional tier.'}
              </div>
            </div>

            {/* Leadership Score Card */}
            <div style={{
              background: 'var(--color-bg)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>👥</span>
                    <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-text-heading)' }}>Leadership Score</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: '#16A34A',
                    border: '1px solid rgba(34, 197, 94, 0.25)'
                  }}>
                    {calculatedInfo.breakdown?.leadership?.level || 'Active Contributor'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#16A34A', lineHeight: 1 }}>
                    {calculatedInfo.leadership_score}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>/ 100</span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, calculatedInfo.leadership_score))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #16A34A 0%, #4ADE80 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.8s ease-in-out'
                  }} />
                </div>

                {/* Factors Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {(calculatedInfo.breakdown?.leadership?.factors || []).map((f, i) => (
                    <span key={i} style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'var(--chip-bg)',
                      color: 'var(--chip-text)',
                      border: '1px solid var(--color-border)'
                    }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                {calculatedInfo.breakdown?.leadership?.summary || 'Calculated from hackathons, project execution, volunteer experience, and soft skills.'}
              </div>
            </div>

            {/* Extracurricular Score Card */}
            <div style={{
              background: 'var(--color-bg)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>🏆</span>
                    <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-text-heading)' }}>Extracurricular Score</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#D97706',
                    border: '1px solid rgba(245, 158, 11, 0.25)'
                  }}>
                    {calculatedInfo.breakdown?.extracurricular?.level || 'Moderate Involvement'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#D97706', lineHeight: 1 }}>
                    {calculatedInfo.extracurricular_score}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>/ 100</span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, calculatedInfo.extracurricular_score))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #D97706 0%, #FBBF24 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.8s ease-in-out'
                  }} />
                </div>

                {/* Factors Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {(calculatedInfo.breakdown?.extracurricular?.factors || []).map((f, i) => (
                    <span key={i} style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'var(--chip-bg)',
                      color: 'var(--chip-text)',
                      border: '1px solid var(--color-border)'
                    }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                {calculatedInfo.breakdown?.extracurricular?.summary || 'Calculated from volunteer work, open-source portfolio, and professional networking.'}
              </div>
            </div>
          </div>
        ) : (
          <EmptyCard
            icon="🧮"
            title="No Calculated Assessment Scores Yet"
            desc="Submit your student profile once to automatically evaluate your Aptitude, Leadership, and Extracurricular metrics."
            action={() => onNavigate('profile')}
            actionLabel="🚀 Evaluate Profile"
          />
        )}
      </div>

      {/* Companies + Roadmap Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Companies */}
        <div className="card-3d">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>Top Company Matches</h3>
            {hasCompanies && (
              <button onClick={() => onNavigate('companies')} className="btn-3d-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                View All ({top_companies.length}) →
              </button>
            )}
          </div>

          {hasCompanies ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {top_companies.map((c, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--color-text-heading)', fontSize: '0.95rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.expected_package_lpa} LPA</div>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22C55E',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    {c.match_percentage}% Match
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyCard
              icon="🏢"
              title="No Company Matches Yet"
              desc="Complete your profile first to get personalized company recommendations."
              action={() => onNavigate('profile')}
              actionLabel="🚀 Fill Profile"
            />
          )}
        </div>

        {/* Roadmap */}
        <div className="card-3d">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>Active Preparation Roadmap</h3>
            {hasRoadmap && (
              <button onClick={() => onNavigate('roadmap')} className="btn-3d-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Open Full Roadmap →
              </button>
            )}
          </div>

          {hasRoadmap ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roadmap.tracks.slice(0, 2).map((track, idx) => (
                <div key={idx} style={{ padding: '12px', background: 'var(--badge-indigo-bg)', borderRadius: '10px', border: '1px solid var(--badge-indigo-border)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--badge-indigo-text)', fontSize: '0.9rem', marginBottom: '6px' }}>
                    🎯 {track.skill}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--color-text-body)' }}>
                    • {track.tasks && track.tasks[0]}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyCard
              icon="🗺️"
              title="No Roadmap Generated Yet"
              desc="Generate a personalized AI roadmap based on your skill gaps."
              action={() => onNavigate('skillgap')}
              actionLabel="✨ Generate Roadmap"
            />
          )}
        </div>
      </div>
    </div>
  );
};
