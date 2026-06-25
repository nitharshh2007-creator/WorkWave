import api from '../services/api';
import toast from 'react-hot-toast';

export async function exportPdfReport(
  overviewData?: any,
  trendData?: any[],
  profileData?: any
) {
  try {
    // Dynamically import jsPDF to avoid SSR/pre-bundling issues
    const { jsPDF } = await import('jspdf');

    let overview = overviewData;
    let trends = trendData;
    let profile = profileData;

    // Fallback fetching if parameters are not provided
    if (!overview) {
      const res = await api.get('/analytics/employer/overview');
      overview = res.data;
    }
    if (!trends) {
      try {
        const res = await api.get('/analytics/employer/trends?range=monthly');
        trends = res.data.trendData || [];
      } catch (e) {
        trends = [];
      }
    }
    if (!profile) {
      try {
        const res = await api.get('/user/profile');
        profile = res.data;
      } catch (e) {
        profile = null;
      }
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin; // 180mm

    // Color definitions (match the client theme)
    const primaryGreen = [47, 79, 70];    // #2F4F46
    const secondaryGreen = [74, 106, 96];  // #4A6A60
    const accentGreen = [101, 146, 135];   // #659287
    const lightMint = [247, 250, 248];     // #F7FAF8
    const borderColor = [226, 236, 229];   // #E2ECE5
    const textDark = [30, 41, 59];         // #1E293B
    const textMuted = [71, 85, 105];       // #475569

    // --- Helper function to draw headers & footers ---
    const drawPageHeaderAndFooter = (pageNum: number, totalPages: number, titleText = 'Employer Analytics Report') => {
      // Small top green accent bar
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Top header text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`WorkWave Talent Intelligence - ${titleText}`, margin, 10);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin - 15, 10);

      // Bottom footer
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('Confidential - For Internal Use Only', margin, pageHeight - 10);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 10);
    };

    // ==========================================
    // PAGE 1: HEADER, EXECUTIVE SUMMARIES & PIPELINE
    // ==========================================

    // 1. Beautiful Header Block
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.roundedRect(margin, 15, contentWidth, 32, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('WorkWave Analytics Report', margin + 6, 27);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(213, 230, 220);
    doc.text('Recruitment metrics, conversions, and hiring trends', margin + 6, 33);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin + 6, 39);

    // Profile info block inside header
    if (profile) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      const compName = profile.companyName || profile.fullName || 'Employer Dashboard';
      doc.text(compName.substring(0, 30), pageWidth - margin - 60, 27);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(213, 230, 220);
      if (profile.industry) {
        doc.text(profile.industry.substring(0, 32), pageWidth - margin - 60, 32);
      }
      if (profile.website) {
        doc.text(profile.website.substring(0, 32), pageWidth - margin - 60, 37);
      }
    }

    // 2. KPI Cards Section
    let y = 54;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('EXECUTIVE PERFORMANCE METRICS', margin, y);
    y += 5;

    const stats = overview?.stats || {};
    const rates = overview?.rates || {};
    const kpis = [
      { label: 'TOTAL JOBS', value: stats.totalJobs ?? 0, desc: `${stats.activeJobs ?? 0} Active Jobs` },
      { label: 'TOTAL APPLICANTS', value: stats.totalApplications ?? 0, desc: `${stats.appsThisMonth ?? 0} This Month` },
      { label: 'SHORTLISTED', value: stats.shortlistedCount ?? 0, desc: `${rates.shortlistRate ?? 0}% Shortlist Rate` },
      { label: 'INTERVIEWS', value: stats.interviewCount ?? 0, desc: `${rates.interviewRate ?? 0}% Interview Rate` },
      { label: 'HIRED', value: stats.hiredCount ?? 0, desc: `${rates.hiringSuccessRate ?? 0}% Success Rate` }
    ];

    const cardWidth = (contentWidth - 4 * 3) / 5; // ~34.8 mm
    const cardHeight = 22;

    kpis.forEach((k, i) => {
      const x = margin + i * (cardWidth + 3);
      
      // Draw Card background
      doc.setFillColor(lightMint[0], lightMint[1], lightMint[2]);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

      // Top label
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
      doc.text(k.label, x + 3, y + 6);

      // Main big number
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text(String(k.value), x + 3, y + 13);

      // Small details
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(k.desc, x + 3, y + 19);
    });

    y += cardHeight + 10;

    // 3. Pipeline / Funnel Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('RECRUITMENT PIPELINE CONVERSIONS', margin, y);
    y += 5;

    const funnel = overview?.funnel || {};
    const stages = [
      { name: 'Applied', count: funnel.applied ?? stats.totalApplications ?? 0 },
      { name: 'Reviewed', count: funnel.reviewed ?? 0 },
      { name: 'Shortlisted', count: funnel.shortlisted ?? stats.shortlistedCount ?? 0 },
      { name: 'Interview Scheduled', count: funnel.interview ?? stats.interviewCount ?? 0 },
      { name: 'Offer Extended', count: funnel.offer ?? 0 },
      { name: 'Hired & Onboarded', count: funnel.hired ?? stats.hiredCount ?? 0 }
    ];

    // Background container for funnel
    const funnelContainerHeight = 65;
    doc.setFillColor(lightMint[0], lightMint[1], lightMint[2]);
    doc.roundedRect(margin, y, contentWidth, funnelContainerHeight, 3, 3, 'F');

    let funnelY = y + 8;
    const maxVal = stages[0].count || 1;

    stages.forEach((st, idx) => {
      const pctOfApplied = maxVal > 0 ? Math.round((st.count / maxVal) * 100) : 0;
      
      // Stage labels
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`${idx + 1}. ${st.name}`, margin + 6, funnelY + 5);

      // Stage counts
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text(`${st.count} (${pctOfApplied}%)`, margin + 62, funnelY + 5);

      // Visual horizontal progress bar
      const barX = margin + 92;
      const maxBarWidth = contentWidth - 105;
      const currentBarWidth = maxBarWidth * (pctOfApplied / 100);

      // Draw background bar
      doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.roundedRect(barX, funnelY + 1.5, maxBarWidth, 4.5, 1, 1, 'F');

      // Draw progress bar
      if (currentBarWidth > 0) {
        doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        doc.roundedRect(barX, funnelY + 1.5, currentBarWidth, 4.5, 1, 1, 'F');
      }

      funnelY += 9;
    });

    y += funnelContainerHeight + 10;

    // 4. Efficiency Rates Table
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('CONVERSION RATES & EFFICIENCY', margin, y);
    y += 5;

    // Draw grid table for rates
    const gridRows = [
      { label: 'Shortlist Rate', val: `${rates.shortlistRate ?? 0}%`, desc: 'Percentage of applicants moved to shortlisted stage' },
      { label: 'Interview Conversion', val: `${rates.interviewRate ?? 0}%`, desc: 'Percentage of shortlisted applicants invited to interview' },
      { label: 'Hiring Success Rate', val: `${rates.hiringSuccessRate ?? 0}%`, desc: 'Percentage of total applications resulting in hired status' },
      { label: 'Rejection Rate', val: `${rates.rejectionRate ?? 0}%`, desc: 'Percentage of finalized applicants who were rejected' },
      { label: 'Average Time to Hire', val: `${rates.avgHiringTime ?? 'N/A'} Days`, desc: 'Average calendar days from application receipt to offer accept' }
    ];

    gridRows.forEach((r, idx) => {
      // Alternating row bg
      if (idx % 2 === 0) {
        doc.setFillColor(242, 246, 244);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, y, contentWidth, 7.5, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(r.label, margin + 4, y + 5);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text(r.val, margin + 45, y + 5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(r.desc, margin + 68, y + 5);

      y += 7.5;
    });

    drawPageHeaderAndFooter(1, 3, 'Overview & Conversion Metrics');

    // ==========================================
    // PAGE 2: DEMOGRAPHICS, SKILLS & AI INSIGHTS
    // ==========================================
    doc.addPage();
    y = 20;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('CANDIDATE PROFILE & INTELLIGENCE BREAKDOWN', margin, y);
    y += 8;

    // Split page into Left Column (Demographics) and Right Column (AI Insights)
    const colW = (contentWidth - 8) / 2; // ~86mm each

    // LEFT COLUMN: Experience, Education, Skills, Cities
    let colY = y;

    // Section: Experience Level
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(secondaryGreen[0], secondaryGreen[1], secondaryGreen[2]);
    doc.text('Experience Distribution', margin, colY);
    colY += 4;

    const expDist = overview?.experienceDistribution || [];
    if (expDist.length === 0) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('No experience metrics available', margin, colY + 3);
      colY += 8;
    } else {
      expDist.forEach((item: any) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(item.name || 'Unspecified', margin, colY + 4);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(String(item.value), margin + 40, colY + 4);

        // mini progress bar
        const barW = 32;
        const totalVal = expDist.reduce((acc: number, cur: any) => acc + (cur.value || 0), 0) || 1;
        const widthPct = (item.value / totalVal) * barW;
        doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(margin + 50, colY + 1.5, barW, 2.5, 'F');
        doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        doc.rect(margin + 50, colY + 1.5, widthPct, 2.5, 'F');

        colY += 6;
      });
      colY += 3;
    }

    // Section: Education Level
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(secondaryGreen[0], secondaryGreen[1], secondaryGreen[2]);
    doc.text('Education Distribution', margin, colY);
    colY += 4;

    const eduDist = overview?.educationDistribution || [];
    if (eduDist.length === 0) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('No education metrics available', margin, colY + 3);
      colY += 8;
    } else {
      eduDist.forEach((item: any) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(item.name || 'Unspecified', margin, colY + 4);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(String(item.value), margin + 40, colY + 4);

        const barW = 32;
        const totalVal = eduDist.reduce((acc: number, cur: any) => acc + (cur.value || 0), 0) || 1;
        const widthPct = (item.value / totalVal) * barW;
        doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(margin + 50, colY + 1.5, barW, 2.5, 'F');
        doc.setFillColor(accentGreen[0], accentGreen[1], accentGreen[2]);
        doc.rect(margin + 50, colY + 1.5, widthPct, 2.5, 'F');

        colY += 6;
      });
      colY += 3;
    }

    // Section: Top Skills Needed
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(secondaryGreen[0], secondaryGreen[1], secondaryGreen[2]);
    doc.text('Top Required Skills (Candidates)', margin, colY);
    colY += 4;

    const skills = overview?.topSkills || [];
    if (skills.length === 0) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('No skill distribution recorded', margin, colY + 3);
      colY += 8;
    } else {
      skills.slice(0, 6).forEach((item: any) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(item.name, margin, colY + 4);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`${item.count} Candidates`, margin + 45, colY + 4);
        colY += 5.5;
      });
      colY += 3;
    }

    // Section: Top Cities
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(secondaryGreen[0], secondaryGreen[1], secondaryGreen[2]);
    doc.text('Top Candidate Locations', margin, colY);
    colY += 4;

    const cities = overview?.locations?.cities || [];
    if (cities.length === 0) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('No geographical distribution available', margin, colY + 3);
      colY += 8;
    } else {
      cities.slice(0, 5).forEach((item: any) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(item.name, margin, colY + 4);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`${item.count} Candidates`, margin + 45, colY + 4);
        colY += 5.5;
      });
    }

    // RIGHT COLUMN: AI INSIGHTS & RECOMMENDATIONS
    let rightColX = margin + colW + 8;
    let rightY = y;

    doc.setFillColor(lightMint[0], lightMint[1], lightMint[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(rightColX - 3, rightY, colW - 2, 230, 3, 3, 'FD');

    rightY += 8;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('AI RECRUITING INTELLIGENCE', rightColX, rightY);
    rightY += 5;

    // Draw decorative line
    doc.setDrawColor(accentGreen[0], accentGreen[1], accentGreen[2]);
    doc.setLineWidth(0.8);
    doc.line(rightColX, rightY, rightColX + 35, rightY);
    rightY += 8;

    // AI Insights
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(secondaryGreen[0], secondaryGreen[1], secondaryGreen[2]);
    doc.text('Performance Insights', rightColX, rightY);
    rightY += 5;

    const insights = overview?.aiInsights || [
      'Application volume has remained steady over the tracking period.',
      'Average conversion rate to interview is within normal industry ranges.',
      'Hires success rate indicates a strong profile alignment with candidate sources.',
      'Software Engineering applications represent the highest density skillset.'
    ];

    insights.forEach((insight: string) => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
      doc.text('•', rightColX, rightY + 0.5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      
      const splitText = doc.splitTextToSize(insight, colW - 12);
      doc.text(splitText, rightColX + 4, rightY);
      rightY += (splitText.length * 3.5) + 3;
    });

    rightY += 4;

    // AI Recommendations
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(secondaryGreen[0], secondaryGreen[1], secondaryGreen[2]);
    doc.text('Actionable Recommendations', rightColX, rightY);
    rightY += 5;

    const recs = overview?.aiRecommendations || [
      'Shorten response times for high-volume positions to prevent candidate churn.',
      'Optimize the interview stage length to reduce overall average Time-to-Hire.',
      'Enhance recruitment efforts in cities indicating high candidate yields.',
      'Focus skills screening on top performing criteria identified in active roles.'
    ];

    recs.forEach((rec: string) => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(accentGreen[0], accentGreen[1], accentGreen[2]);
      doc.text('•', rightColX, rightY + 0.5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      
      const splitText = doc.splitTextToSize(rec, colW - 12);
      doc.text(splitText, rightColX + 4, rightY);
      rightY += (splitText.length * 3.5) + 3;
    });

    drawPageHeaderAndFooter(2, 3, 'Candidate Distribution & Intelligence');

    // ==========================================
    // PAGE 3: JOB-BY-JOB PERFORMANCE DETAILS
    // ==========================================
    doc.addPage();
    y = 20;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text('INDIVIDUAL JOB PERFORMANCE METRICS', margin, y);
    y += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Comprehensive statistics for all jobs posted by the employer, including total pipelines and hiring conversion rates.', margin, y);
    y += 8;

    const jobs = overview?.jobsPerformance || [];
    if (jobs.length === 0) {
      doc.setFillColor(lightMint[0], lightMint[1], lightMint[2]);
      doc.rect(margin, y, contentWidth, 25, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('No job performance details recorded.', margin + 10, y + 14);
    } else {
      // Draw Table Header
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.rect(margin, y, contentWidth, 8, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      
      const headers = ['Job Title', 'Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected', 'Success Rate'];
      const xPositions = [
        margin + 3,
        margin + 75,
        margin + 95,
        margin + 115,
        margin + 135,
        margin + 155,
        margin + 168
      ];

      headers.forEach((h, i) => {
        doc.text(h, xPositions[i], y + 5.5);
      });
      y += 8;

      // Draw Table Rows
      jobs.forEach((job: any, idx: number) => {
        // Page break if too low
        if (y + 10 > pageHeight - 20) {
          drawPageHeaderAndFooter(3, 4, 'Job Performance Records'); // adjust page count if dynamic
          doc.addPage();
          y = 20;

          // Redraw header on new page
          doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
          doc.rect(margin, y, contentWidth, 8, 'F');
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(255, 255, 255);
          headers.forEach((h, i) => {
            doc.text(h, xPositions[i], y + 5.5);
          });
          y += 8;
        }

        // Alternating row background
        if (idx % 2 === 0) {
          doc.setFillColor(lightMint[0], lightMint[1], lightMint[2]);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(margin, y, contentWidth, 7.5, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        const shortTitle = String(job.title || 'Untitled Job').substring(0, 36);
        doc.text(shortTitle, xPositions[0], y + 4.8);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(String(job.applications ?? 0), xPositions[1], y + 4.8);
        doc.text(String(job.shortlisted ?? 0), xPositions[2], y + 4.8);
        doc.text(String(job.interview ?? 0), xPositions[3], y + 4.8);
        doc.text(String(job.hired ?? 0), xPositions[4], y + 4.8);
        doc.text(String(job.rejected ?? 0), xPositions[5], y + 4.8);

        // Success Rate
        const totalApps = job.applications || 0;
        const successRate = totalApps > 0 ? Math.round(((job.hired || 0) / totalApps) * 100) : 0;
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
        doc.text(`${successRate}%`, xPositions[6], y + 4.8);

        y += 7.5;
      });
    }

    drawPageHeaderAndFooter(3, 3, 'Job Performance Records');

    // Save and finish
    doc.save(`${profile?.companyName ? profile.companyName.replace(/\s+/g, '_') : 'WorkWave'}_Analytics_Report.pdf`);
    toast.success('Professional PDF report exported successfully!');
  } catch (err) {
    console.error(err);
    toast.error('Failed to generate professional PDF report');
  }
}
