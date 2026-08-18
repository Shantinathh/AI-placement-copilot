import React, { useState } from 'react';
import { api } from '../services/api';
import { ResumeAnalysis } from './ResumeAnalysis';

const DOMAINS = [
  { id: 'Software Engineering', label: 'Software Engineering', icon: '💻' },
  { id: 'AI & ML',              label: 'AI & ML',              icon: '🤖' },
  { id: 'Data Analytics',       label: 'Data Analytics',       icon: '📊' },
  { id: 'Core Engineering',     label: 'Core Engineering',     icon: '⚙️' },
  { id: 'Cybersecurity',        label: 'Cybersecurity',        icon: '🔐' },
  { id: 'Product Management',   label: 'Product Management',   icon: '🗺️' },
];

export const ResumeUpload = ({ onAnalysisComplete }) => {
  // State Machine: 'idle' | 'fileSelected' | 'domainSelected' | 'loading' | 'success' | 'error'
  const [statusState, setStatusState] = useState('idle');
  const [file, setFile] = useState(null);
  const [domain, setDomain] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const isReady = file && domain;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusState(domain ? 'domainSelected' : 'fileSelected');
      setErrorMsg('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatusState(domain ? 'domainSelected' : 'fileSelected');
      setErrorMsg('');
    }
  };

  const handleDomainSelect = (d) => {
    setDomain(d);
    if (file) setStatusState('domainSelected');
  };

  const handleReset = () => {
    setFile(null);
    setDomain('');
    setAnalysisData(null);
    setErrorMsg('');
    setStatusState('idle');
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      setErrorMsg('Please select or drop a PDF/DOCX resume file.');
      return;
    }
    if (!domain) {
      setErrorMsg('Please select a target domain before analyzing.');
      return;
    }
    setErrorMsg('');
    setStatusState('loading');

    try {
      const result = await api.analyzeResume(file, domain);
      setAnalysisData(result);
      setStatusState('success');
      if (onAnalysisComplete) onAnalysisComplete(result);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to parse resume.');
      setStatusState('error');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      {statusState !== 'success' && (
        <div className="card-3d" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', padding: '40px 30px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
            ATS Resume Analyzer
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '30px' }}>
            Scan your resume against top ATS parser algorithms (Workday, Greenhouse, Taleo) to check formatting, keyword match, and contact links.
          </p>

          {/* Error Banner */}
          {statusState === 'error' && (
            <div style={{
              padding: '16px 20px',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              borderRadius: '12px',
              fontSize: '0.9rem',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span>⚠️ {errorMsg || 'Failed to parse resume file.'}</span>
              <button
                onClick={() => setStatusState(isReady ? 'domainSelected' : file ? 'fileSelected' : 'idle')}
                className="btn-3d-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Spinner */}
          {statusState === 'loading' ? (
            <div style={{ padding: '50px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 20px auto', width: '48px', height: '48px', border: '4px solid var(--color-border)', borderTop: '4px solid #4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '8px' }}>
                Parsing Resume Text &amp; Evaluating Keywords…
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Analyzing for <strong>{domain}</strong> — checking section headers, contact links, action verbs, and skill density metrics.
              </p>
            </div>
          ) : (
            <div>
              {/* ─── Domain Selector ─── */}
              <div style={{ marginBottom: '28px', textAlign: 'left' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Step 1 — Select Your Target Domain
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {DOMAINS.map((d) => {
                    const active = domain === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => handleDomainSelect(d.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 16px',
                          borderRadius: '30px',
                          border: active ? '2px solid #4F46E5' : '1.5px solid var(--color-border)',
                          background: active
                            ? 'linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(139,92,246,0.18) 100%)'
                            : 'var(--color-bg)',
                          color: active ? '#4F46E5' : 'var(--color-text-body)',
                          fontWeight: active ? '700' : '500',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          boxShadow: active ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                          transform: active ? 'translateY(-1px)' : 'none',
                        }}
                      >
                        <span>{d.icon}</span>
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                {domain && (
                  <p style={{ fontSize: '0.8rem', color: '#4F46E5', fontWeight: '600', marginTop: '10px' }}>
                    ✓ Analyzing for: <strong>{domain}</strong>
                  </p>
                )}
              </div>

              {/* ─── Upload Zone ─── */}
              <div style={{ marginBottom: '6px', textAlign: 'left' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Step 2 — Upload Your Resume
                </p>
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                className={`upload-zone-3d ${isDragActive ? 'active' : ''}`}
                style={{
                  border: `2px dashed ${isDragActive ? '#4F46E5' : 'var(--color-border)'}`,
                  borderRadius: '16px',
                  padding: '36px 20px',
                  background: isDragActive ? 'rgba(79, 70, 229, 0.05)' : 'var(--color-bg)',
                  transition: 'all 0.2s ease',
                  marginBottom: '24px'
                }}
              >
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div className="icon-chip icon-chip-primary" style={{ margin: '0 auto 16px auto', width: '56px', height: '56px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>

                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-heading)', marginBottom: '6px' }}>
                  {file ? file.name : 'Drag & Drop your Resume here'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  Supports PDF or DOCX formats (Max size: 10 MB)
                </p>

                <label htmlFor="resume-file-input" className="btn-3d-secondary" style={{ cursor: 'pointer' }}>
                  {file ? 'Change Selected File' : 'Browse Computer'}
                </label>
              </div>

              {/* File preview + action button */}
              {file && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)'
                  }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-heading)' }}>
                      📄 {file.name} <span style={{ color: 'var(--color-text-muted)', fontWeight: '400' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                    </span>
                    <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: '700', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>

                  <button
                    onClick={handleUploadSubmit}
                    disabled={!isReady}
                    className="btn-3d-primary"
                    style={{
                      width: '100%',
                      padding: '14px',
                      opacity: isReady ? 1 : 0.5,
                      cursor: isReady ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {!domain
                      ? '⚡ Select a Domain to Continue'
                      : `⚡ Analyze Resume for ${domain}`}
                  </button>
                </div>
              )}

              {/* Idle state – no file yet */}
              {!file && (
                <button
                  disabled
                  className="btn-3d-primary"
                  style={{ width: '100%', padding: '14px', opacity: 0.4, cursor: 'not-allowed', filter: 'grayscale(100%)' }}
                >
                  ⚡ Analyze Resume (Please Select a File First)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Success – Render ATS Results */}
      {statusState === 'success' && analysisData && (
        <ResumeAnalysis analysis={analysisData} onReupload={handleReset} />
      )}
    </div>
  );
};
