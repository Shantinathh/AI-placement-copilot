import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const RoadmapView = ({ readinessScore, branch, skillGaps = [], profile, resumeAnalysis }) => {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [effectiveGaps, setEffectiveGaps] = useState([]);

  // Compute effective gaps from props if none passed explicitly
  useEffect(() => {
    let list = Array.isArray(skillGaps) && skillGaps.length > 0 ? [...skillGaps] : [];

    if (list.length === 0) {
      if (profile) {
        if (profile.communication_skill_score < 75) list.push("Communication & Group Discussions");
        if (profile.aptitude_score < 75) list.push("Aptitude & Logical Reasoning");
        if (profile.internships_count < 2) list.push("Internship Experience");
        if (profile.projects_count < 3 || profile.github_repos < 6) list.push("Projects & GitHub Portfolio");
        if (profile.leadership_score < 65) list.push("Leadership & Team Collaboration");
        if (profile.backlogs > 0) list.push("Active Backlogs");
        if (profile.cgpa < 7.5) list.push("Academic CGPA");
      }
      if (resumeAnalysis && Array.isArray(resumeAnalysis.missing_skills)) {
        resumeAnalysis.missing_skills.forEach(s => {
          const clean = s.replace("Missing Skill:", "").trim();
          if (clean && !list.includes(clean)) list.push(clean);
        });
      }
    }

    setEffectiveGaps(list);
  }, [JSON.stringify(skillGaps), profile, resumeAnalysis]);

  const loadRoadmap = async (forceRegen = false) => {
    if (forceRegen) setRegenerating(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const [res, progressRes] = await Promise.all([
        api.generateRoadmap(readinessScore || 75.0, effectiveGaps, branch || "CSE", forceRegen),
        api.getRoadmapProgress()
      ]);
      setWeeks(res.weeks || []);
      if (progressRes && progressRes.completed_tasks) {
        setCompletedTasks(progressRes.completed_tasks);
      }
    } catch (err) {
      setErrorMsg("Failed to generate AI roadmap.");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    if (effectiveGaps.length > 0 || profile || readinessScore) {
      loadRoadmap(false);
    }
  }, [readinessScore, branch, JSON.stringify(effectiveGaps)]);

  const toggleTask = (weekIdx, taskIdx) => {
    const key = `${weekIdx}-${taskIdx}`;
    const updated = { ...completedTasks, [key]: !completedTasks[key] };
    setCompletedTasks(updated);
    api.saveProgress({ completed_tasks: updated });
  };

  // Calculate total completed percentage
  const totalTasks = weeks.reduce((acc, w) => acc + (w.tasks?.length || 0), 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      {/* Header */}
      <div className="card-3d" style={{ marginBottom: '30px', padding: '28px 24px', background: 'var(--card-gradient-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--badge-indigo-bg)', color: 'var(--badge-indigo-text)', border: '1px solid var(--badge-indigo-border)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>
              ✨ Gap-Targeted AI Milestone Plan
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>
              Personalized 4-Week Placement Roadmap
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              100% structured around the skills and metrics you are currently lacking ({branch || 'CSE'} branch).
            </p>
            {effectiveGaps && effectiveGaps.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted)' }}>Targeting Your Gaps:</span>
                {effectiveGaps.map((g, idx) => (
                  <span key={idx} style={{
                    padding: '3px 9px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--badge-indigo-text)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    border: '1px solid var(--badge-indigo-border)'
                  }}>
                    🎯 {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ width: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '6px' }}>
                <span>Progress</span>
                <span style={{ color: 'var(--badge-indigo-text)' }}>{progressPct}%</span>
              </div>
              <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: '#4F46E5', borderRadius: '5px', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <button
              onClick={() => loadRoadmap(true)}
              disabled={regenerating || loading}
              className="btn-3d-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {regenerating ? '🔄 Regenerating...' : '🔄 Regenerate Roadmap'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid #4F46E5', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
          Generating milestone tasks specifically resolving your skill gaps...
        </div>
      ) : errorMsg ? (
        <div style={{ padding: '16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '12px' }}>{errorMsg}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="card-3d">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="icon-chip icon-chip-primary" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                  W{wIdx + 1}
                </span>
                {week.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {week.tasks && week.tasks.map((task, tIdx) => {
                  const isChecked = !!completedTasks[`${wIdx}-${tIdx}`];
                  return (
                    <label
                      key={tIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: isChecked ? 'rgba(34, 197, 94, 0.12)' : 'var(--color-bg)',
                        border: `1px solid ${isChecked ? 'rgba(34, 197, 94, 0.3)' : 'var(--color-border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTask(wIdx, tIdx)}
                        style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#4F46E5', cursor: 'pointer' }}
                      />
                      <span style={{
                        fontSize: '0.925rem',
                        fontWeight: '500',
                        color: isChecked ? '#22C55E' : 'var(--color-text-body)',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        lineHeight: '1.5'
                      }}>
                        {task}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
