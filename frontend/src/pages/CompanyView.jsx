import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const CompanyView = ({ readinessScore, branch, collegeTier, atsScore, extractedSkills, onNavigateToProfile }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('matched');

  useEffect(() => {
    // Only fetch when real profile data is available
    if (!readinessScore) {
      setLoading(false);
      return;
    }
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await api.getCompanyRecommendations(
          readinessScore,
          branch || "CSE",
          collegeTier || "Tier 2",
          atsScore || null,
          extractedSkills || []
        );
        setCompanies(res || []);
      } catch (err) {
        setErrorMsg("Failed to load company recommendations.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [readinessScore, branch, collegeTier, atsScore, extractedSkills]);

  const matchedCompanies = companies.filter(c => !c.is_stretch_goal);
  const stretchCompanies = companies.filter(c => c.is_stretch_goal);
  const displayedCompanies = activeTab === 'matched' ? matchedCompanies : stretchCompanies;

  const getCategoryBadge = (category) => {
    let color = '#4F46E5';
    let bg = 'rgba(79, 70, 229, 0.12)';
    if (category.includes('MAANG')) { color = '#8B5CF6'; bg = 'rgba(139, 92, 246, 0.15)'; }
    else if (category.includes('Startups')) { color = '#EC4899'; bg = 'rgba(236, 72, 153, 0.15)'; }
    else if (category.includes('Services')) { color = '#0284C7'; bg = 'rgba(2, 132, 199, 0.15)'; }
    else if (category.includes('Core')) { color = '#D97706'; bg = 'rgba(217, 119, 6, 0.15)'; }
    return (
      <span style={{ padding: '4px 10px', borderRadius: '12px', background: bg, color: color, fontWeight: '700', fontSize: '0.725rem', border: `1px solid ${color}33` }}>
        {category}
      </span>
    );
  };

  // No real profile data yet
  if (!readinessScore && !loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>
            Target Tech &amp; Hiring Organizations
          </h2>
        </div>
        <div style={{ maxWidth: '560px', margin: '40px auto', textAlign: 'center', padding: '40px 24px' }} className="card-3d">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>Complete Your Profile First</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Company recommendations are calculated from your real readiness score. Please fill in your placement profile to get accurate, personalized matches.
          </p>
          {onNavigateToProfile && (
            <button onClick={onNavigateToProfile} className="btn-3d-primary">🚀 Fill Profile Now</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>
          Target Tech &amp; Hiring Organizations
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Weighted matching based on your branch ({branch || 'CSE'}), college tier ({collegeTier || 'Tier 2'}), readiness score ({readinessScore}%), and ATS resume index.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('matched')} className={activeTab === 'matched' ? "btn-3d-primary" : "btn-3d-secondary"} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
          🎯 Matched Companies ({matchedCompanies.length})
        </button>
        <button onClick={() => setActiveTab('stretch')} className={activeTab === 'stretch' ? "btn-3d-primary" : "btn-3d-secondary"} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
          🚀 Stretch Goals ({stretchCompanies.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
          Computing weighted match score against top hiring benchmarks...
        </div>
      ) : errorMsg ? (
        <div style={{ padding: '16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '12px' }}>{errorMsg}</div>
      ) : displayedCompanies.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
          No companies found in this category. Check out your matched companies tab!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {displayedCompanies.map((c, idx) => {
            const isHighMatch = c.match_percentage >= 70;
            return (
              <div key={idx} className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ marginBottom: '6px' }}>{getCategoryBadge(c.category)}</div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>{c.name}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                        Expected Package: <strong style={{ color: '#4F46E5' }}>{c.expected_package_lpa} LPA</strong>
                      </span>
                    </div>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      background: c.is_stretch_goal ? 'rgba(239, 68, 68, 0.15)' : (isHighMatch ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
                      color: c.is_stretch_goal ? '#EF4444' : (isHighMatch ? '#22C55E' : '#F59E0B'),
                      border: `1px solid ${c.is_stretch_goal ? 'rgba(239, 68, 68, 0.3)' : (isHighMatch ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)')}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      {c.is_stretch_goal ? `${c.match_percentage}% (Stretch)` : `${c.match_percentage}% Match`}
                    </span>
                  </div>

                  {c.is_stretch_goal && readinessScore < 75 && (
                    <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', color: '#EF4444', fontSize: '0.8rem', fontWeight: '600', marginBottom: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      💡 <strong>Gap to close:</strong> Increase readiness score by +{(75 - readinessScore).toFixed(0)} points to reach tier threshold.
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Target Roles</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {c.roles && c.roles.map((role, rIdx) => (
                        <span key={rIdx} style={{ padding: '4px 10px', background: 'var(--chip-bg)', color: 'var(--chip-text)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Key Skills Evaluated</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {c.matched_skills && c.matched_skills.map((skill, sIdx) => (
                        <span key={sIdx} style={{ padding: '4px 10px', background: 'var(--badge-indigo-bg)', color: 'var(--badge-indigo-text)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid var(--badge-indigo-border)' }}>
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <button className="btn-3d-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                    View Company Preparation Syllabus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
