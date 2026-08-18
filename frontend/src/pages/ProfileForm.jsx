import React, { useState } from 'react';
import { api } from '../services/api';

export const ProfileForm = ({ onSubmitSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 19 Profile fields matching Pydantic ranges & defaults
  const [formData, setFormData] = useState({
    age: 21,
    gender: 'Male',
    cgpa: 8.2,
    branch: 'CSE',
    college_tier: 'Tier 2',
    internships_count: 2,
    projects_count: 4,
    certifications_count: 3,
    aptitude_score: 80.0,
    communication_skill_score: 85.0,
    hackathons_participated: 2,
    github_repos: 8,
    linkedin_connections: 450,
    backlogs: 0,
    extracurricular_score: 70.0,
    leadership_score: 75.0,
    volunteer_experience: 'Yes',
    sleep_hours: 7.0,
    study_hours_per_day: 5.0
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepperChange = (field, delta, minVal, maxVal) => {
    setFormData(prev => {
      const current = parseInt(prev[field], 10) || 0;
      const nextVal = Math.min(maxVal, Math.max(minVal, current + delta));
      return { ...prev, [field]: nextVal };
    });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        cgpa: parseFloat(formData.cgpa),
        branch: formData.branch,
        college_tier: formData.college_tier,
        internships_count: parseInt(formData.internships_count, 10),
        projects_count: parseInt(formData.projects_count, 10),
        certifications_count: parseInt(formData.certifications_count, 10),
        aptitude_score: parseFloat(formData.aptitude_score),
        communication_skill_score: parseFloat(formData.communication_skill_score),
        hackathons_participated: parseInt(formData.hackathons_participated, 10),
        github_repos: parseInt(formData.github_repos, 10),
        linkedin_connections: parseInt(formData.linkedin_connections, 10) || 0,
        backlogs: parseInt(formData.backlogs, 10),
        extracurricular_score: parseFloat(formData.extracurricular_score),
        leadership_score: parseFloat(formData.leadership_score),
        volunteer_experience: formData.volunteer_experience,
        sleep_hours: parseFloat(formData.sleep_hours),
        study_hours_per_day: parseFloat(formData.study_hours_per_day)
      };

      const result = await api.predictReadiness(payload);
      onSubmitSuccess(result, payload);
    } catch (err) {
      setErrorMsg(err.message || "Failed to calculate readiness score.");
    } finally {
      setLoading(false);
    }
  };

  // Helper component for modern Stepper Controls (- / +)
  const StepperInput = ({ label, field, minVal, maxVal }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-body)', marginBottom: '8px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => handleStepperChange(field, -1, minVal, maxVal)}
        >
          -
        </button>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: '800',
          color: 'var(--color-text-heading)',
          minWidth: '36px',
          textAlign: 'center'
        }}>
          {formData[field]}
        </span>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => handleStepperChange(field, 1, minVal, maxVal)}
        >
          +
        </button>
      </div>
    </div>
  );

  // Helper component for Slider with Live Floating Chip
  const SliderInput = ({ label, field, minVal, maxVal, step = "1", unit = "" }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-body)' }}>
          {label}
        </label>
        <span style={{
          padding: '4px 10px',
          borderRadius: '12px',
          background: 'var(--badge-indigo-bg)',
          color: 'var(--badge-indigo-text)',
          fontSize: '0.8rem',
          fontWeight: '800',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          {formData[field]} {unit}
        </span>
      </div>
      <input
        type="range"
        min={minVal}
        max={maxVal}
        step={step}
        value={formData[field]}
        onChange={e => handleChange(field, e.target.value)}
        style={{ width: '100%', accentColor: '#4F46E5', cursor: 'pointer' }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '840px', margin: '36px auto', padding: '0 20px' }}>
      <div className="card-3d">
        {/* Horizontal Stepper Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-heading)' }}>
                Placement Readiness Evaluator
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Fill out the 3 profile sections to calculate your hiring probability.
              </p>
            </div>
            <span className="mobile-step-text" style={{ fontSize: '0.9rem', fontWeight: '700', color: '#4F46E5', display: 'none' }}>
              Step {step} of 3
            </span>
          </div>

          {/* Desktop Horizontal Stepper Bar */}
          <div className="desktop-stepper" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[
              { num: 1, title: 'Academic Info' },
              { num: 2, title: 'Skills & Projects' },
              { num: 3, title: 'Habits & Leadership' }
            ].map((s, idx) => {
              const isCompleted = step > s.num;
              const isActive = step === s.num;
              return (
                <React.Fragment key={s.num}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      background: isActive ? '#4F46E5' : (isCompleted ? '#22C55E' : 'var(--color-border)'),
                      color: isActive || isCompleted ? '#FFFFFF' : 'var(--color-text-muted)',
                      boxShadow: isActive ? '0 4px 14px rgba(79, 70, 229, 0.4)' : 'none',
                      transition: 'all 0.25s ease'
                    }}>
                      {isCompleted ? '✓' : s.num}
                    </div>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: isActive ? 'var(--color-text-heading)' : (isCompleted ? '#16A34A' : 'var(--color-text-muted)')
                    }}>
                      {s.title}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div style={{ height: '2px', flex: 1, background: isCompleted ? '#22C55E' : 'var(--color-border)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#EF4444',
            borderRadius: '12px',
            fontSize: '0.875rem',
            marginBottom: '24px'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); if (step === 3) handleFinalSubmit(e); else setStep(step + 1); }}>
          {/* STEP 1: Academic & Institution Record */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-body)', marginBottom: '8px' }}>
                  Engineering Branch
                </label>
                <select
                  value={formData.branch}
                  onChange={e => handleChange('branch', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--input-bg)', color: 'var(--color-text-heading)', fontWeight: '600' }}
                >
                  <option value="CSE">CSE (Computer Science)</option>
                  <option value="IT">IT (Information Tech)</option>
                  <option value="ECE">ECE (Electronics & Comm)</option>
                  <option value="EEE">EEE (Electrical & Electronics)</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-body)', marginBottom: '8px' }}>
                  College Tier
                </label>
                <select
                  value={formData.college_tier}
                  onChange={e => handleChange('college_tier', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--input-bg)', color: 'var(--color-text-heading)', fontWeight: '600' }}
                >
                  <option value="Tier 1">Tier 1 (IITs, NITs, BITS)</option>
                  <option value="Tier 2">Tier 2 (Top State/Private Tech)</option>
                  <option value="Tier 3">Tier 3 (Affiliated Colleges)</option>
                </select>
              </div>

              <SliderInput label="Cumulative CGPA" field="cgpa" minVal="4.5" maxVal="10.0" step="0.1" />

              <StepperInput label="Active Backlogs" field="backlogs" minVal={0} maxVal={6} />
              <StepperInput label="Student Age" field="age" minVal={18} maxVal={24} />

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-body)', marginBottom: '8px' }}>
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--input-bg)', color: 'var(--color-text-heading)', fontWeight: '600' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Technical Skills & Projects */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              <StepperInput label="Internships Count" field="internships_count" minVal={0} maxVal={8} />
              <StepperInput label="Projects Completed" field="projects_count" minVal={0} maxVal={13} />
              <StepperInput label="Certifications Count" field="certifications_count" minVal={0} maxVal={11} />
              <StepperInput label="Hackathons Participated" field="hackathons_participated" minVal={0} maxVal={8} />
              <StepperInput label="GitHub Repositories" field="github_repos" minVal={0} maxVal={16} />

              <SliderInput label="Aptitude Score" field="aptitude_score" minVal="20" maxVal="100" unit="/ 100" />
              <SliderInput label="Communication Skill Score" field="communication_skill_score" minVal="20" maxVal="100" unit="/ 100" />
            </div>
          )}

          {/* STEP 3: Habits & Personality */}
          {step === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              <SliderInput label="Daily Study Hours" field="study_hours_per_day" minVal="0.5" maxVal="10.0" step="0.5" unit="hrs" />
              <SliderInput label="Daily Sleep Hours" field="sleep_hours" minVal="3.0" maxVal="10.0" step="0.5" unit="hrs" />
              <SliderInput label="Leadership Score" field="leadership_score" minVal="0" maxVal="100" unit="/ 100" />
              <SliderInput label="Extracurricular Score" field="extracurricular_score" minVal="0" maxVal="100" unit="/ 100" />

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-body)', marginBottom: '8px' }}>
                  LinkedIn Connections / Followers
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleStepperChange('linkedin_connections', -50, 0, 100000)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    step="50"
                    value={formData.linkedin_connections}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                      handleChange('linkedin_connections', isNaN(val) ? '' : val);
                    }}
                    placeholder="e.g. 500 or 2500"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--color-text-heading)',
                      fontWeight: '700',
                      fontSize: '1rem',
                      textAlign: 'center'
                    }}
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleStepperChange('linkedin_connections', 50, 0, 100000)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-body)', marginBottom: '8px' }}>
                  Volunteer Experience
                </label>
                <select
                  value={formData.volunteer_experience}
                  onChange={e => handleChange('volunteer_experience', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--input-bg)', color: 'var(--color-text-heading)', fontWeight: '600' }}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-3d-secondary">
                ← Back
              </button>
            ) : <div />}

            <button type="submit" disabled={loading} className="btn-3d-primary">
              {loading ? "Evaluating RandomForest Models..." : (step === 3 ? "🎯 Predict My Readiness" : "Next Step →")}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .desktop-stepper { display: none !important; }
          .mobile-step-text { display: block !important; }
        }
      `}</style>
    </div>
  );
};
