import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './pages/AuthModal';
import { ProfileForm } from './pages/ProfileForm';
import { ReadinessResults } from './pages/ReadinessResults';
import { ResumeUpload } from './pages/ResumeUpload';
import { ResumeAnalysis } from './pages/ResumeAnalysis';
import { SkillGapView } from './pages/SkillGapView';
import { CompanyView } from './pages/CompanyView';
import { RoadmapView } from './pages/RoadmapView';
import { DashboardView } from './pages/DashboardView';
import { SplashScreen } from './components/SplashScreen';

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeScreen, setActiveScreen] = useState('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("copilot_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("copilot_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  // Application Data States
  const [profileData, setProfileData] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [resumeAnalysisResult, setResumeAnalysisResult] = useState(null);
  const [activeSkillGaps, setActiveSkillGaps] = useState([]);

  // Check stored user on load
  useEffect(() => {
    const token = localStorage.getItem("copilot_token");
    const storedUser = localStorage.getItem("copilot_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Invalid stored user — treat as logged out
        localStorage.removeItem("copilot_token");
        localStorage.removeItem("copilot_user");
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear auth tokens
    localStorage.removeItem("copilot_token");
    localStorage.removeItem("copilot_user");
    // Clear all in-memory session data so no stale data shows for the next user
    setUser(null);
    setProfileData(null);
    setPredictionResult(null);
    setResumeAnalysisResult(null);
    setActiveSkillGaps([]);
    setActiveScreen('landing');
  };

  const handleProfileSubmitSuccess = (prediction, profile) => {
    setPredictionResult(prediction);
    setProfileData(profile);
    setActiveScreen('results');
  };

  const handleResumeAnalysisComplete = (analysis) => {
    setResumeAnalysisResult(analysis);
    setActiveScreen('resume_results');
  };

  const handleGenerateRoadmapWithGaps = (customGaps) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (Array.isArray(customGaps) && customGaps.length > 0) {
      setActiveSkillGaps(customGaps);
    }
    setActiveScreen('roadmap');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeScreen === 'landing' && (
          <LandingPage
            onStartPrediction={() => setActiveScreen('profile')}
            onUploadResume={() => setActiveScreen('resume')}
            onGoDashboard={() => setActiveScreen('dashboard')}
          />
        )}

        {activeScreen === 'profile' && (
          <ProfileForm onSubmitSuccess={handleProfileSubmitSuccess} />
        )}

        {activeScreen === 'results' && (
          <ReadinessResults
            prediction={predictionResult}
            profile={profileData}
            onViewGaps={() => setActiveScreen('skillgap')}
            onViewCompanies={() => setActiveScreen('companies')}
            onGenerateRoadmap={handleGenerateRoadmapWithGaps}
          />
        )}

        {activeScreen === 'resume' && (
          <ResumeUpload onAnalysisComplete={handleResumeAnalysisComplete} />
        )}

        {activeScreen === 'resume_results' && (
          <ResumeAnalysis
            analysis={resumeAnalysisResult}
            onReupload={() => setActiveScreen('resume')}
          />
        )}

        {activeScreen === 'skillgap' && (
          <SkillGapView
            profile={profileData}
            resumeAnalysis={resumeAnalysisResult}
            onGenerateRoadmap={handleGenerateRoadmapWithGaps}
            onNavigateToProfile={() => setActiveScreen('profile')}
            onNavigateToResume={() => setActiveScreen('resume')}
          />
        )}

        {activeScreen === 'companies' && (
          predictionResult ? (
            <CompanyView
              readinessScore={predictionResult.readiness_score}
              branch={profileData?.branch || "CSE"}
              collegeTier={profileData?.college_tier || "Tier 2"}
              atsScore={resumeAnalysisResult?.ats_score || null}
              extractedSkills={resumeAnalysisResult?.extracted_skills || []}
              onNavigateToProfile={() => setActiveScreen('profile')}
            />
          ) : (
            <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px 20px' }} className="card-3d">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>Complete Your Profile First</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Company recommendations are based on your real readiness score. Please fill in your profile to get accurate matches.</p>
              <button onClick={() => setActiveScreen('profile')} className="btn-3d-primary">🚀 Fill Profile Now</button>
            </div>
          )
        )}

        {activeScreen === 'roadmap' && (
          !user ? (
            <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px 20px' }} className="card-3d">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-heading)', marginBottom: '8px' }}>Sign In Required</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Your personalized roadmap and task progress are saved to your account. Please sign in to access this feature.</p>
              <button onClick={() => setIsAuthOpen(true)} className="btn-3d-primary">🔑 Sign In / Register</button>
            </div>
          ) : (
            <RoadmapView
              readinessScore={predictionResult?.readiness_score}
              branch={profileData?.branch || "CSE"}
              profile={profileData}
              resumeAnalysis={resumeAnalysisResult}
              skillGaps={activeSkillGaps}
            />
          )
        )}

        {activeScreen === 'dashboard' && (
          <DashboardView onNavigate={(screen) => setActiveScreen(screen)} />
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(usr) => { setUser(usr); setIsAuthOpen(false); }}
      />
    </div>
  );
}

export default App;
