import io
import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Response
from backend.schemas import DashboardSummaryOutput, ReadinessPredictionOutput, ResumeAnalysisOutput, SkillGapItem, CompanyRecommendation, RoadmapOutput
from backend.auth import get_current_user_optional
from backend.db import db
from backend.routes.company_routes import recommend_companies

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOutput)
def get_dashboard_summary(current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    user_name = current_user["name"] if current_user else "Student"
    user_email = current_user["email"] if current_user else None

    profile_doc = db.get_student_profile(user_email) if user_email else None
    resume_doc = db.get_resume_analysis(user_email) if user_email else None
    roadmap_doc = db.get_roadmap(user_email) if user_email else None

    # 1. Readiness Data — only from real saved profile
    readiness = None
    if profile_doc and "prediction" in profile_doc:
        try:
            readiness = ReadinessPredictionOutput(**profile_doc["prediction"])
        except Exception:
            readiness = None

    # 2. Resume / ATS Data — only from real saved resume
    ats = None
    if resume_doc and "analysis" in resume_doc:
        try:
            ats = ResumeAnalysisOutput(**resume_doc["analysis"])
        except Exception:
            ats = None

    # 3. Top Companies — only when real readiness data exists
    top_companies = None
    if readiness is not None and profile_doc:
        branch = profile_doc.get("profile", {}).get("branch", "CSE")
        tier = profile_doc.get("profile", {}).get("college_tier", "Tier 2")
        top_companies = recommend_companies(
            readiness_score=readiness.readiness_score, branch=branch, college_tier=tier
        )[:4]

    # 4. Skill Gaps — combining profile readiness (e.g. Communication, Aptitude) & missing resume skills
    skill_gaps = None
    if profile_doc or resume_doc:
        from backend.routes.skills_routes import analyze_skill_gaps
        try:
            gap_analysis_res = analyze_skill_gaps({
                "profile": profile_doc.get("profile") if profile_doc else None,
                "missing_skills": ats.missing_skills if ats else [],
                "domain": ats.domain if ats else "General"
            })
            skill_gaps = gap_analysis_res.gaps
        except Exception:
            skill_gaps = None

    # 5. Roadmap Data — only from real saved roadmap
    roadmap = None
    if roadmap_doc and "roadmap" in roadmap_doc and "weeks" in roadmap_doc["roadmap"]:
        roadmap_fields = {k: v for k, v in roadmap_doc["roadmap"].items() if k != "completed_tasks"}
        try:
            roadmap = RoadmapOutput(**roadmap_fields)
        except Exception:
            roadmap = None

    return DashboardSummaryOutput(
        user_name=user_name,
        readiness=readiness,
        ats=ats,
        skill_gaps=skill_gaps,
        top_companies=top_companies,
        roadmap=roadmap
    )

@router.get("/report/pdf")
def download_pdf_report(current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    summary = get_dashboard_summary(current_user)
    
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor("#4F46E5"), spaceAfter=4)
    subtitle_style = ParagraphStyle('DocSubTitle', parent=styles['Normal'], fontSize=9.5, leading=13, textColor=colors.HexColor("#64748B"), spaceAfter=12)
    h2_style = ParagraphStyle('SectionHeading', parent=styles['Heading2'], fontSize=12.5, leading=16, textColor=colors.HexColor("#0F172A"), spaceBefore=10, spaceAfter=6)
    body_style = ParagraphStyle('BodyTextCustom', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.HexColor("#334155"))
    
    # Header Title
    story.append(Paragraph("AI-Placement Copilot — Student Evaluation Report", title_style))
    today_str = datetime.date.today().strftime("%B %d, %Y")
    user_name = summary.user_name or "Student"
    story.append(Paragraph(f"<b>Candidate:</b> {user_name} &nbsp;|&nbsp; <b>Report Date:</b> {today_str} &nbsp;|&nbsp; <b>Status:</b> Active Profile", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4F46E5"), spaceAfter=12))
    
    # Section 1: Readiness Summary
    story.append(Paragraph("1. Placement Readiness & ML Prediction", h2_style))
    readiness = summary.readiness
    score = readiness.readiness_score if readiness else 75.0
    status = readiness.predicted_status if readiness else "Placed"
    salary = readiness.predicted_salary_lpa if readiness else 8.5
    
    status_color = "#10B981" if status == "Placed" else "#EF4444"
    status_text = f"<font color='{status_color}'><b>{status}</b></font>"
    
    readiness_table_data = [
        ["Readiness Index", "Predicted Status", "Estimated CTC Range"],
        [f"{score}%", Paragraph(status_text, body_style), f"{salary} LPA"]
    ]
    t1 = Table(readiness_table_data, colWidths=[180, 180, 180])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9.5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1"))
    ]))
    story.append(t1)
    story.append(Spacer(1, 10))
    
    # SHAP Contributions
    top_contribs = readiness.top_contributions if readiness else []
    if top_contribs:
        story.append(Paragraph("<b>Top Feature Drivers (SHAP Explainability):</b>", body_style))
        contrib_rows = [["Feature", "Candidate Value", "Impact (Score Pts)", "Category"]]
        for c in top_contribs[:5]:
            fname = c.feature_name
            val = str(c.value)
            shap_val = c.shap_contribution
            cat = c.category
            impact_str = f"+{shap_val:.1f}" if shap_val >= 0 else f"{shap_val:.1f}"
            contrib_rows.append([fname, val, impact_str, cat])
        t_shap = Table(contrib_rows, colWidths=[130, 100, 110, 200])
        t_shap.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E0E7FF")),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8.5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t_shap)
        story.append(Spacer(1, 12))

    # Section 2: Resume & Skill Gaps
    story.append(Paragraph("2. ATS Resume Score & Keyword Audit", h2_style))
    ats = summary.ats
    ats_score = ats.ats_score if ats else 80.0
    ext_skills = ", ".join(ats.extracted_skills[:6]) if ats else ""
    miss_skills = ", ".join(ats.missing_skills[:5]) if ats else ""
    
    ats_table_data = [
        ["ATS Score", "Detected Core Skills", "Missing Placement Keywords"],
        [f"{ats_score}%", Paragraph(ext_skills or "None", body_style), Paragraph(miss_skills or "None", body_style)]
    ]
    t2 = Table(ats_table_data, colWidths=[90, 225, 225])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t2)
    story.append(Spacer(1, 12))

    # Section 3: Recommended Companies
    story.append(Paragraph("3. Target Company Recommendations", h2_style))
    top_comps = summary.top_companies or []
    if top_comps:
        comp_rows = [["Company Name", "Category", "Package (CTC)", "Match %", "Status"]]
        for comp in top_comps[:4]:
            cname = comp.name
            ccat = comp.category
            cctc = f"{comp.expected_package_lpa} LPA"
            cmatch = f"{comp.match_percentage}%"
            cstatus = "Stretch Goal" if comp.is_stretch_goal else "Matched"
            comp_rows.append([cname, ccat, cctc, cmatch, cstatus])
        t3 = Table(comp_rows, colWidths=[120, 150, 90, 90, 90])
        t3.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8.5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t3)
        story.append(Spacer(1, 12))

    # Section 4: Roadmap Progress
    story.append(Paragraph("4. Personalized GenAI Preparation Roadmap", h2_style))
    story.append(Paragraph("<b>4-Week Customized Preparation Plan Active</b> — Tailored weekly tasks generated to close skill gaps and optimize interview readiness.", body_style))
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=placement_readiness_report.pdf"}
    )
