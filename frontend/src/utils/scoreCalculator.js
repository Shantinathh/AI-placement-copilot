/**
 * Utility to calculate Aptitude, Leadership, and Extracurricular scores
 * from objective student profile inputs. Matches the backend logic.
 */

export function calculateDerivedScores(profile) {
  if (!profile) {
    return {
      aptitude_score: 75.0,
      leadership_score: 70.0,
      extracurricular_score: 70.0
    };
  }

  const cgpa = parseFloat(profile.cgpa) || 7.5;
  const backlogs = parseInt(profile.backlogs, 10) || 0;
  const studyHours = parseFloat(profile.study_hours_per_day) || 3.5;
  const certs = parseInt(profile.certifications_count, 10) || 0;
  const tier = profile.college_tier || 'Tier 2';
  const hackathons = parseInt(profile.hackathons_participated, 10) || 0;
  const projects = parseInt(profile.projects_count, 10) || 0;
  const volunteer = (profile.volunteer_experience || 'No').toString().toLowerCase() === 'yes';
  const internships = parseInt(profile.internships_count, 10) || 0;
  const commScore = parseFloat(profile.communication_skill_score) || 70.0;
  const linkedin = parseInt(profile.linkedin_connections, 10) || 0;
  const repos = parseInt(profile.github_repos, 10) || 0;

  // 1. Aptitude Score Calculation (20.0 - 100.0)
  const aptBase = 35.0;
  const cgpaPts = ((Math.max(4.5, Math.min(10.0, cgpa)) - 4.5) / 5.5) * 40.0;
  const studyPts = Math.min(studyHours * 1.5, 10.0);
  const certPts = Math.min(certs * 2.0, 10.0);
  const tierBonus = tier === 'Tier 1' ? 5.0 : (tier === 'Tier 2' ? 2.5 : 0.0);
  const backlogPenalty = backlogs * 4.0;
  let aptitude = Math.round((aptBase + cgpaPts + studyPts + certPts + tierBonus - backlogPenalty) * 10) / 10;
  aptitude = Math.max(20.0, Math.min(100.0, aptitude));

  // 2. Leadership Score Calculation (0.0 - 100.0)
  const leadBase = 25.0;
  const hackPts = Math.min(hackathons * 5.0, 20.0);
  const projPts = Math.min(projects * 2.5, 15.0);
  const volPts = volunteer ? 15.0 : 0.0;
  const internPts = Math.min(internships * 3.0, 12.0);
  const commPts = (commScore / 100.0) * 15.0;
  const netPts = Math.min(linkedin / 50.0, 8.0);
  let leadership = Math.round((leadBase + hackPts + projPts + volPts + internPts + commPts + netPts) * 10) / 10;
  leadership = Math.max(0.0, Math.min(100.0, leadership));

  // 3. Extracurricular Score Calculation (0.0 - 100.0)
  const extraBase = 20.0;
  const volExtraPts = volunteer ? 20.0 : 0.0;
  const hackExtraPts = Math.min(hackathons * 6.0, 24.0);
  const repoPts = Math.min(repos * 2.5, 20.0);
  const certExtraPts = Math.min(certs * 3.0, 15.0);
  const netExtraPts = Math.min(linkedin / 80.0, 10.0);
  let extracurricular = Math.round((extraBase + volExtraPts + hackExtraPts + repoPts + certExtraPts + netExtraPts) * 10) / 10;
  extracurricular = Math.max(0.0, Math.min(100.0, extracurricular));

  return {
    aptitude_score: aptitude,
    leadership_score: leadership,
    extracurricular_score: extracurricular
  };
}

export function getScoreBreakdown(profile) {
  const scores = calculateDerivedScores(profile);
  const { aptitude_score: apt, leadership_score: lead, extracurricular_score: extra } = scores;

  // Level classification
  const aptLevel = apt >= 85 ? 'Exceptional Analytical' : (apt >= 75 ? 'High Analytical' : (apt >= 60 ? 'Proficient' : 'Needs Practice'));
  const leadLevel = lead >= 80 ? 'Team Lead Ready' : (lead >= 65 ? 'High Initiative' : (lead >= 50 ? 'Active Contributor' : 'Emerging Leader'));
  const extraLevel = extra >= 80 ? 'Well-Rounded Contributor' : (extra >= 65 ? 'Highly Involved' : (extra >= 50 ? 'Moderate Involvement' : 'Developing Portfolio'));

  const cgpa = profile?.cgpa ?? 7.5;
  const certs = profile?.certifications_count ?? 0;
  const studyHrs = profile?.study_hours_per_day ?? 0;
  const tier = profile?.college_tier ?? 'Tier 2';
  const backlogs = profile?.backlogs ?? 0;
  const hackathons = profile?.hackathons_participated ?? 0;
  const projects = profile?.projects_count ?? 0;
  const volunteer = profile?.volunteer_experience ?? 'No';
  const internships = profile?.internships_count ?? 0;
  const comm = profile?.communication_skill_score ?? 70;
  const repos = profile?.github_repos ?? 0;
  const linkedin = profile?.linkedin_connections ?? 0;

  return {
    aptitude_score: apt,
    leadership_score: lead,
    extracurricular_score: extra,
    breakdown: {
      aptitude: {
        score: apt,
        level: aptLevel,
        factors: [
          `CGPA: ${cgpa} / 10`,
          `${certs} Technical Certifications`,
          `${studyHrs}h Daily Study`,
          `${tier} Academic Benchmark`,
          ...(backlogs > 0 ? [`${backlogs} Active Backlog Penalty`] : [])
        ],
        summary: 'Calculated systematically from your CGPA, study hours, verified certifications, and institutional benchmark.'
      },
      leadership: {
        score: lead,
        level: leadLevel,
        factors: [
          `${hackathons} Team Hackathons`,
          `${projects} Technical Projects`,
          `Volunteer Initiative: ${volunteer}`,
          `${internships} Internships Completed`,
          `Communication Skill: ${comm}/100`
        ],
        summary: 'Calculated from collaborative hackathons, project execution, volunteer experience, and verbal/soft skills.'
      },
      extracurricular: {
        score: extra,
        level: extraLevel,
        factors: [
          `Volunteer Service: ${volunteer}`,
          `${hackathons} Competitive Hackathons`,
          `${repos} GitHub Public Repos`,
          `${certs} Certifications Completed`,
          `${linkedin} Professional Connections`
        ],
        summary: 'Calculated from community volunteering, public open-source repos, hackathons, and networking reach.'
      }
    }
  };
}
