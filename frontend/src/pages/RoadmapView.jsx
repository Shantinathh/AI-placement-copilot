import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

const PACE_OPTIONS = [
  {
    key: 'Relaxed',
    label: '🌿 Relaxed',
    desc: '1 task per concept',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.35)',
  },
  {
    key: 'Standard',
    label: '⚡ Standard',
    desc: '2 tasks per concept',
    color: '#4F46E5',
    bg: 'rgba(79,70,229,0.12)',
    border: 'rgba(79,70,229,0.35)',
  },
  {
    key: 'Intensive',
    label: '🔥 Intensive',
    desc: '3 tasks per concept',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.35)',
  },
];

const SKILL_ICONS = {
  communication: '🗣️', aptitude: '🧠', sql: '🗄️', docker: '🐳',
  react: '⚛️', python: '🐍', aws: '☁️', system: '🏗️',
  github: '🐙', internship: '💼', project: '🚀', leadership: '👑',
  typescript: '🔷', redis: '⚡', kubernetes: '☸️', backlog: '📚',
  cgpa: '🎓', dsa: '🔢', algorithm: '🔢', default: '🎯',
};

const getSkillIcon = (skill) => {
  const lower = skill.toLowerCase();
  for (const [key, icon] of Object.entries(SKILL_ICONS)) {
    if (key !== 'default' && lower.includes(key)) return icon;
  }
  return SKILL_ICONS.default;
};

const CONCEPT_COLORS = [
  { bg: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.2)', dot: '#4F46E5', label: 'rgba(79,70,229,0.9)' },
  { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', dot: '#10B981', label: 'rgba(16,185,129,0.9)' },
  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', dot: '#F59E0B', label: 'rgba(245,158,11,0.9)' },
];

export const RoadmapView = ({ readinessScore, branch, skillGaps = [], profile, resumeAnalysis }) => {
  const [tracks, setTracks] = useState([]);
  const [pace, setPace] = useState('Standard');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [effectiveGaps, setEffectiveGaps] = useState([]);
  const effectiveGapsRef = useRef([]);
  const paceRef = useRef('Standard');

  // Compute effective gaps from props
  useEffect(() => {
    let list = Array.isArray(skillGaps) && skillGaps.length > 0 ? [...skillGaps] : [];
    if (list.length === 0) {
      if (profile) {
        if (profile.communication_skill_score < 75) list.push('Communication & Group Discussions');
        if (profile.aptitude_score < 75) list.push('Aptitude & Logical Reasoning');
        if (profile.internships_count < 2) list.push('Internship Experience');
        if (profile.projects_count < 3 || profile.github_repos < 6) list.push('Projects & GitHub Portfolio');
        if (profile.leadership_score < 65) list.push('Leadership & Team Collaboration');
        if (profile.backlogs > 0) list.push('Active Backlogs');
        if (profile.cgpa < 7.5) list.push('Academic CGPA');
      }
      if (resumeAnalysis && Array.isArray(resumeAnalysis.missing_skills)) {
        resumeAnalysis.missing_skills.forEach(s => {
          const clean = s.replace('Missing Skill:', '').trim();
          if (clean && !list.includes(clean)) list.push(clean);
        });
      }
    }
    setEffectiveGaps(list);
    effectiveGapsRef.current = list;
  }, [JSON.stringify(skillGaps), profile, resumeAnalysis]);

  const loadRoadmap = useCallback(async (forceRegen = false, overridePace) => {
    const gaps = effectiveGapsRef.current;
    const activePace = overridePace || paceRef.current;
    if (forceRegen) setRegenerating(true);
    setLoading(true);
    setErrorMsg('');
    try {
      const [res, progressRes] = await Promise.all([
        api.generateRoadmap(readinessScore || 75.0, gaps, branch || 'CSE', forceRegen, activePace),
        api.getRoadmapProgress(),
      ]);
      setTracks(res.tracks || []);
      if (progressRes?.completed_tasks) setCompletedTasks(progressRes.completed_tasks);
    } catch {
      setErrorMsg('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }, [readinessScore, branch]);

  useEffect(() => {
    loadRoadmap(false);
  }, [readinessScore, branch, JSON.stringify(effectiveGaps)]);

  const handlePaceChange = (newPace) => {
    if (newPace === pace) return;
    setPace(newPace);
    paceRef.current = newPace;
    loadRoadmap(true, newPace);
  };

  // Key format: trackIdx-conceptIdx-taskIdx
  const toggleTask = (trackIdx, conceptIdx, taskIdx) => {
    const key = `${trackIdx}-${conceptIdx}-${taskIdx}`;
    const updated = { ...completedTasks, [key]: !completedTasks[key] };
    setCompletedTasks(updated);
    api.saveProgress({ completed_tasks: updated });
  };

  // Count total tasks across all tracks and concepts
  const totalTasks = tracks.reduce((sum, t) =>
    sum + (t.concepts || []).reduce((s2, c) => s2 + (c.tasks?.length || 0), 0), 0
  );
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const overallPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const activePaceInfo = PACE_OPTIONS.find(p => p.key === pace) || PACE_OPTIONS[1];

  return (
    <div style={{ maxWidth: '1040px', margin: '30px auto', padding: '0 20px' }}>

      {/* ── Header ── */}
      <div className="card-3d" style={{ marginBottom: '28px', padding: '28px 24px', background: 'var(--card-gradient-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--badge-indigo-bg)', color: 'var(--badge-indigo-text)', border: '1px solid var(--badge-indigo-border)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>
              🎯 Skill-Gap Targeted Roadmap
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '6px' }}>
              Personalized Placement Roadmap
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '0' }}>
              One focused learning track per skill gap — broken into concepts with specific topics to read & practice.
            </p>

            {/* Skill gap badges */}
            {effectiveGaps.length > 0 && (
              <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {effectiveGaps.map((g, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: '8px', background: 'rgba(99,102,241,0.12)', color: 'var(--badge-indigo-text)', fontSize: '0.75rem', fontWeight: '700', border: '1px solid var(--badge-indigo-border)' }}>
                    {getSkillIcon(g)} {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: progress + regen */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px', minWidth: '180px' }}>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '6px' }}>
                <span>Overall Progress</span>
                <span style={{ color: 'var(--badge-indigo-text)' }}>{completedCount}/{totalTasks}</span>
              </div>
              <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${overallPct}%`, background: 'linear-gradient(90deg,#4F46E5,#7C3AED)', borderRadius: '5px', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: 'right' }}>{overallPct}% complete</div>
            </div>
            <button
              onClick={() => loadRoadmap(true)}
              disabled={loading || regenerating}
              className="btn-3d-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
            >
              {regenerating ? '🔄 Regenerating...' : '🔄 Regenerate'}
            </button>
          </div>
        </div>

        {/* ── Pace Selector ── */}
        <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
            📈 Learning Pace
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {PACE_OPTIONS.map(opt => {
              const active = pace === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handlePaceChange(opt.key)}
                  disabled={loading || regenerating}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: `1.5px solid ${active ? opt.border : 'var(--color-border)'}`,
                    background: active ? opt.bg : 'transparent',
                    color: active ? opt.color : 'var(--color-text-muted)',
                    fontWeight: active ? '700' : '500',
                    fontSize: '0.83rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    minWidth: '110px',
                  }}
                >
                  <span>{opt.label}</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.75 }}>{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid #4F46E5', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 18px', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontWeight: '600', marginBottom: '6px' }}>
            {regenerating ? '🤖 Generating fresh tasks from AI...' : '⚙️ Building your personalized roadmap...'}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.65 }}>
            This may take up to 30 seconds while the AI crafts tasks for each skill gap.
          </div>
        </div>
      ) : errorMsg ? (
        <div style={{ padding: '18px', background: '#FEE2E2', color: '#DC2626', borderRadius: '12px', fontWeight: '600' }}>{errorMsg}</div>
      ) : tracks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }} className="card-3d">
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🗺️</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>No Roadmap Generated Yet</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Complete your profile and skill gap analysis, then click Regenerate to get your personalized roadmap.
          </p>
          <button onClick={() => loadRoadmap(true)} className="btn-3d-primary">
            🚀 Generate My Roadmap
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {tracks.map((track, tIdx) => {
            const concepts = track.concepts || [];
            const trackTotalTasks = concepts.reduce((s, c) => s + (c.tasks?.length || 0), 0);
            const trackCompleted = concepts.reduce((s, c, cIdx) =>
              s + (c.tasks || []).filter((_, tskIdx) => completedTasks[`${tIdx}-${cIdx}-${tskIdx}`]).length, 0
            );
            const trackPct = trackTotalTasks > 0 ? Math.round((trackCompleted / trackTotalTasks) * 100) : 0;
            const icon = getSkillIcon(track.skill);

            return (
              <div key={tIdx} className="card-3d" style={{ overflow: 'hidden' }}>
                {/* Track Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '12px',
                      background: activePaceInfo.bg, border: `1.5px solid ${activePaceInfo.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem', flexShrink: 0,
                    }}>
                      {icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-text-heading)', margin: 0 }}>
                        {track.skill}
                      </h3>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {concepts.length} concept{concepts.length !== 1 ? 's' : ''} · {trackCompleted}/{trackTotalTasks} tasks
                      </div>
                    </div>
                  </div>

                  {/* Per-track progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '140px' }}>
                    <div style={{ flex: 1, height: '7px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${trackPct}%`, background: activePaceInfo.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: activePaceInfo.color, minWidth: '36px', textAlign: 'right' }}>{trackPct}%</span>
                  </div>
                </div>

                {/* Concepts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {concepts.map((concept, cIdx) => {
                    const conceptColor = CONCEPT_COLORS[cIdx % CONCEPT_COLORS.length];
                    const conceptTasks = concept.tasks || [];
                    const conceptCompleted = conceptTasks.filter((_, tskIdx) => completedTasks[`${tIdx}-${cIdx}-${tskIdx}`]).length;

                    return (
                      <div key={cIdx} style={{
                        borderRadius: '12px',
                        border: `1px solid ${conceptColor.border}`,
                        background: conceptColor.bg,
                        overflow: 'hidden',
                      }}>
                        {/* Concept Header */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderBottom: `1px solid ${conceptColor.border}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: conceptColor.dot, flexShrink: 0
                            }} />
                            <span style={{
                              fontSize: '0.82rem', fontWeight: '800',
                              color: conceptColor.label,
                              letterSpacing: '0.01em',
                            }}>
                              {`Concept ${cIdx + 1}: ${concept.name}`}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: '700',
                            color: conceptColor.dot,
                            background: 'rgba(255,255,255,0.6)',
                            padding: '2px 8px', borderRadius: '8px',
                          }}>
                            {conceptCompleted}/{conceptTasks.length}
                          </span>
                        </div>

                        {/* Tasks under this concept */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                          {conceptTasks.map((task, tskIdx) => {
                            const isChecked = !!completedTasks[`${tIdx}-${cIdx}-${tskIdx}`];
                            // Detect task type for a visual indicator
                            const isRead = task.toLowerCase().startsWith('read') || task.toLowerCase().startsWith('study');
                            const isPractice = task.toLowerCase().startsWith('practice') || task.toLowerCase().startsWith('solve');
                            const taskTypeIcon = isRead ? '📖' : isPractice ? '💻' : '✅';

                            return (
                              <label
                                key={tskIdx}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                                  padding: '12px 14px',
                                  cursor: 'pointer',
                                  background: isChecked ? 'rgba(16,185,129,0.08)' : 'transparent',
                                  borderTop: tskIdx > 0 ? `1px solid ${conceptColor.border}` : 'none',
                                  transition: 'background 0.2s ease',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleTask(tIdx, cIdx, tskIdx)}
                                  style={{ marginTop: '3px', width: '15px', height: '15px', accentColor: '#10B981', cursor: 'pointer', flexShrink: 0 }}
                                />
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', flex: 1 }}>
                                  <span style={{ fontSize: '0.82rem', flexShrink: 0, marginTop: '1px' }}>{taskTypeIcon}</span>
                                  <span style={{
                                    fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.55',
                                    color: isChecked ? '#10B981' : 'var(--color-text-body)',
                                    textDecoration: isChecked ? 'line-through' : 'none',
                                    transition: 'color 0.2s ease',
                                  }}>
                                    {task}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
