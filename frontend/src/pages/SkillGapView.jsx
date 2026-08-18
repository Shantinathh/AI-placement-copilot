import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const SkillGapView = ({ profile, resumeAnalysis, onGenerateRoadmap, onNavigateToProfile, onNavigateToResume }) => {
  const [gaps, setGaps] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'readiness' | 'resume'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const missingSkillsList = resumeAnalysis?.missing_skills || [];

  useEffect(() => {
    if (!profile && missingSkillsList.length === 0) {
      setLoading(false);
      return;
    }

    const fetchGaps = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.getSkillGaps({
          profile: profile || null,
          missing_skills: missingSkillsList,
          extracted_skills: resumeAnalysis?.extracted_skills || [],
          domain: resumeAnalysis?.domain || "General"
        });
        setGaps(res.gaps || []);
      } catch (err) {
        setErrorMsg("Failed to load skill gap analysis.");
      } finally {
        setLoading(false);
      }
    };
    fetchGaps();
  }, [profile, JSON.stringify(missingSkillsList)]);

  const getSeverityBadge = (severity) => {
    if (severity === "High") {
      return (
        <span style={{
          padding: '4px 10px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
          fontWeight: '700',
          fontSize: '0.75rem',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ● HIGH PRIORITY
        </span>
      );
    }
    if (severity === "Medium") {
      return (
        <span style={{
          padding: '4px 10px',
          borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B',
          fontWeight: '700',
          fontSize: '0.75rem',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ▲ MEDIUM
        </span>
      );
    }
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '12px',
        background: 'rgba(34, 197, 94, 0.15)',
        color: '#22C55E',
        fontWeight: '700',
        fontSize: '0.75rem',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        ✓ OPTIMAL
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const isResume = category?.toLowerCase().includes("resume");
    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: '8px',
        background: isResume ? 'rgba(14, 165, 233, 0.12)' : 'rgba(99, 102, 241, 0.12)',
        color: isResume ? '#0284C7' : 'var(--badge-indigo-text)',
        fontWeight: '600',
        fontSize: '0.72rem',
        border: `1px solid ${isResume ? 'rgba(14, 165, 233, 0.25)' : 'var(--badge-indigo-border)'}`
      }}>
        {isResume ? '📄 Missing Resume Skill' : '🎯 Readiness & Profile Gap'}
      </span>
    );
  };

  // Filtered gaps
  const readinessGaps = gaps.filter(g => !g.category || g.category.toLowerCase().includes("readiness") || g.category.toLowerCase().includes("profile"));
  const resumeGaps = gaps.filter(g => g.category && g.category.toLowerCase().includes("resume"));

  const displayedGaps = activeTab === 'readiness'
    ? readinessGaps
    : activeTab === 'resume'
    ? resumeGaps
    : gaps;

  // No profile and no resume yet
  if (!profile && missingSkillsList.length === 0 && !loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '80px auto', textAlign: 'center', padding: '40px 24px' }} className="card-3d">
        <div style={{ fontSize: '3.2rem', marginBottom: '16px' }}>🎯</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
          No Gap Analysis Data Yet
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: '1.6' }}>
          Skill gap analysis audits your profile readiness metrics (such as <strong>Communication & Soft Skills, Aptitude, Internships</strong>) and flags <strong>technical skills missing from your resume</strong>.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {onNavigateToProfile && (
            <button onClick={onNavigateToProfile} className="btn-3d-primary">
              🚀 1. Fill Readiness Profile
            </button>
          )}
          {onNavigateToResume && (
            <button onClick={onNavigateToResume} className="btn-3d-secondary">
              📄 2. Scan Resume for Missing Skills
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1140px', margin: '30px auto', padding: '0 20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>
            Comprehensive Skill Gap Analysis
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Auditing soft skills & readiness scores (Communication, Aptitude) alongside technical skills missing from your resume.
          </p>
        </div>
        <button
          onClick={() => {
            const gapNames = gaps
              .filter(g => g.severity === 'High' || g.severity === 'Medium')
              .map(g => g.area.replace('Missing Skill: ', ''));
            if (onGenerateRoadmap) {
              onGenerateRoadmap(gapNames.length > 0 ? gapNames : gaps.map(g => g.area.replace('Missing Skill: ', '')));
            }
          }}
          className="btn-3d-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          ✨ Fix All Gaps with GenAI Roadmap
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="card-3d" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>TOTAL AUDITED GAPS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-heading)', marginTop: '4px' }}>
            {gaps.length}
          </div>
        </div>
        <div className="card-3d" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--badge-indigo-text)' }}>READINESS & SOFT SKILLS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--badge-indigo-text)', marginTop: '4px' }}>
            {readinessGaps.length} <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>metrics</span>
          </div>
        </div>
        <div className="card-3d" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0284C7' }}>MISSING RESUME SKILLS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0284C7', marginTop: '4px' }}>
            {resumeGaps.length} <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>keywords</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('all')}
          className={activeTab === 'all' ? 'btn-3d-primary' : 'btn-3d-secondary'}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          All Gaps ({gaps.length})
        </button>
        <button
          onClick={() => setActiveTab('readiness')}
          className={activeTab === 'readiness' ? 'btn-3d-primary' : 'btn-3d-secondary'}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          🎯 Readiness & Soft Skills ({readinessGaps.length})
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={activeTab === 'resume' ? 'btn-3d-primary' : 'btn-3d-secondary'}
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          📄 Missing Resume Skills ({resumeGaps.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid #4F46E5', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
          Auditing placement benchmarks, communication scores & resume keywords...
        </div>
      ) : errorMsg ? (
        <div style={{ padding: '16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '12px' }}>{errorMsg}</div>
      ) : displayedGaps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
          <div style={{ fontWeight: '700', color: 'var(--color-text-heading)' }}>No gaps found in this category!</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {activeTab === 'resume' ? 'Upload your resume to audit missing technical keywords.' : 'All metrics meet or exceed hiring benchmarks.'}
          </p>
          {activeTab === 'resume' && onNavigateToResume && (
            <button onClick={onNavigateToResume} className="btn-3d-primary" style={{ marginTop: '14px', fontSize: '0.85rem' }}>
              📄 Scan Resume
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {displayedGaps.map((item, idx) => {
            const isMissingResumeSkill = item.category?.toLowerCase().includes("resume");
            const cleanArea = item.area.replace('Missing Skill: ', '');

            return (
              <div key={idx} className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
                    <div>
                      {getCategoryBadge(item.category)}
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-text-heading)', marginTop: '6px' }}>
                        {item.area}
                      </h3>
                    </div>
                    {getSeverityBadge(item.severity)}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '12px',
                    background: 'var(--color-bg)',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>YOUR STATUS</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: isMissingResumeSkill ? '#EF4444' : 'var(--badge-indigo-text)' }}>
                        {typeof item.current_value === 'number' ? item.current_value : item.current_value}
                      </div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--color-border)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>BENCHMARK / TARGET</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>
                        {typeof item.benchmark === 'number' ? item.benchmark : item.benchmark}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-body)',
                    lineHeight: '1.5',
                    background: isMissingResumeSkill ? 'rgba(14, 165, 233, 0.08)' : 'var(--badge-indigo-bg)',
                    padding: '14px',
                    borderRadius: '10px',
                    border: `1px solid ${isMissingResumeSkill ? 'rgba(14, 165, 233, 0.2)' : 'var(--badge-indigo-border)'}`
                  }}>
                    💡 <strong>Action Plan:</strong> {item.tip}
                  </div>
                </div>

                <button
                  onClick={() => onGenerateRoadmap && onGenerateRoadmap([cleanArea])}
                  className="btn-3d-secondary"
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    fontSize: '0.85rem',
                    padding: '10px 14px',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🎯 Target "{cleanArea}" in AI Roadmap
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SkillGapView;
