/**
 * Common action verbs recommended for high-impact resume bullet points
 */
const ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'administered', 'advised', 'analyzed', 'architected',
  'automated', 'built', 'championed', 'collaborated', 'constructed', 'coordinated',
  'created', 'decreased', 'delivered', 'deployed', 'designed', 'developed',
  'devised', 'directed', 'documented', 'drove', 'engineered', 'enhanced',
  'established', 'executed', 'expanded', 'expedited', 'facilitated', 'formulated',
  'founded', 'generated', 'guided', 'headed', 'implemented', 'improved',
  'increased', 'initiated', 'inspected', 'instituted', 'integrated', 'introduced',
  'launched', 'lead', 'led', 'leveraged', 'managed', 'maximized', 'mentored',
  'migrated', 'minimized', 'modernized', 'negotiated', 'optimized', 'orchestrated',
  'overhauled', 'oversaw', 'partnered', 'pioneered', 'planned', 'programmed',
  'published', 're-architected', 'rebuilt', 'redesigned', 'reduced', 'refactored',
  'reorganized', 'resolved', 'restructured', 'revitalized', 'saved', 'scaled',
  'spearheaded', 'standardized', 'streamlined', 'strengthened', 'supervised',
  'trained', 'transformed', 'upgraded', 'validated'
]);

/**
 * Validates ISO date strings (YYYY, YYYY-MM, or YYYY-MM-DD)
 */
function isValidDate(dateStr) {
  if (!dateStr) return false;
  return /^\d{4}(-\d{2})?(-\d{2})?$/.test(String(dateStr).trim());
}

/**
 * Audits a JSON Resume object for completeness, quality, and ATS readiness.
 *
 * @param {object} resume JSON Resume data
 * @param {object} effectiveLayout Active column layout { main: [], sidebar: [] }
 * @returns {object} Audit report with overall score, metrics, and checklist items
 */
export function auditResume(resume, effectiveLayout = { main: [], sidebar: [] }) {
  if (!resume) {
    return {
      score: 0,
      grade: 'Incomplete',
      gradeColor: '#dc2626',
      checks: [],
      stats: { totalChecks: 0, passed: 0, warnings: 0 }
    };
  }

  const checks = [];

  // =========================================================================
  // CATEGORY 1: CONTACT & BASIC INFO (Max 25 pts)
  // =========================================================================
  const basics = resume.basics || {};

  // 1. Name
  const hasName = Boolean(basics.name?.trim());
  checks.push({
    id: 'name',
    category: 'Contact',
    title: 'Full Name',
    passed: hasName,
    points: 5,
    message: hasName ? `Full name provided: "${basics.name}"` : 'Missing full candidate name in basics.'
  });

  // 2. Email
  const hasEmail = Boolean(basics.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basics.email));
  checks.push({
    id: 'email',
    category: 'Contact',
    title: 'Professional Email',
    passed: hasEmail,
    points: 5,
    message: hasEmail ? `Valid email format (${basics.email})` : 'Missing or invalid email address.'
  });

  // 3. Phone
  const hasPhone = Boolean(basics.phone?.trim());
  checks.push({
    id: 'phone',
    category: 'Contact',
    title: 'Phone Number',
    passed: hasPhone,
    points: 5,
    message: hasPhone ? `Phone number provided (${basics.phone})` : 'Missing phone number.'
  });

  // 4. Location (City / Country)
  const loc = basics.location || {};
  const hasLocation = Boolean(loc.city && (loc.countryCode || loc.region || loc.address));
  checks.push({
    id: 'location',
    category: 'Contact',
    title: 'Location (City, Country)',
    passed: hasLocation,
    points: 5,
    message: hasLocation
      ? `Location specified: ${[loc.city, loc.region, loc.countryCode].filter(Boolean).join(', ')}`
      : 'Location should include at least a city and country/region.'
  });

  // 5. Professional Profiles (LinkedIn / GitHub / Portfolio)
  const profiles = basics.profiles || [];
  const hasProfiles = profiles.length > 0;
  checks.push({
    id: 'profiles',
    category: 'Contact',
    title: 'Professional Profiles',
    passed: hasProfiles,
    points: 5,
    message: hasProfiles
      ? `${profiles.length} profile link(s) detected (${profiles.map(p => p.network || 'profile').join(', ')})`
      : 'No LinkedIn, GitHub, or portfolio links found.'
  });

  // =========================================================================
  // CATEGORY 2: SUMMARY & PROFESSIONAL NARRATIVE (Max 15 pts)
  // =========================================================================
  const summary = (basics.summary || '').trim();
  const wordCount = summary ? summary.split(/\s+/).length : 0;
  const summaryGoodLength = wordCount >= 20 && wordCount <= 160;

  checks.push({
    id: 'summary',
    category: 'Summary',
    title: 'Executive Summary',
    passed: summaryGoodLength,
    points: 15,
    message: summaryGoodLength
      ? `Summary is well-proportioned (${wordCount} words, optimal: 25–150 words)`
      : wordCount === 0
        ? 'Missing summary statement. A 2–3 sentence executive summary improves ATS keyword rank.'
        : wordCount < 20
          ? `Summary is too short (${wordCount} words). Aim for at least 25 words.`
          : `Summary is quite lengthy (${wordCount} words). Consider condensing under 150 words.`
  });

  // =========================================================================
  // CATEGORY 3: WORK EXPERIENCE & HIGHLIGHTS (Max 35 pts)
  // =========================================================================
  const work = resume.work || [];
  const hasWork = Array.isArray(work) && work.length > 0;

  checks.push({
    id: 'work_presence',
    category: 'Experience',
    title: 'Work Experience Entries',
    passed: hasWork,
    points: 10,
    message: hasWork ? `${work.length} job position(s) documented` : 'No work experience entries found.'
  });

  if (hasWork) {
    // Check measurable bullet points / highlights
    let rolesWithHighlights = 0;
    let rolesWithActionVerbs = 0;
    let datesValid = true;

    work.forEach(job => {
      const highlights = Array.isArray(job.highlights) ? job.highlights : [];
      if (highlights.length >= 2) rolesWithHighlights++;

      // Check first words of highlights
      const hasVerb = highlights.some(hl => {
        const firstWord = hl.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
        return ACTION_VERBS.has(firstWord);
      });
      if (hasVerb) rolesWithActionVerbs++;

      if (!isValidDate(job.startDate)) datesValid = false;
    });

    const highlightsPassing = rolesWithHighlights >= Math.ceil(work.length * 0.7);
    checks.push({
      id: 'work_highlights',
      category: 'Experience',
      title: 'Measurable Highlights',
      passed: highlightsPassing,
      points: 10,
      message: highlightsPassing
        ? `${rolesWithHighlights}/${work.length} roles have at least 2 bullet point highlights`
        : `Only ${rolesWithHighlights}/${work.length} roles have bullet highlights. Add at least 2 measurable achievements per role.`
    });

    const verbsPassing = rolesWithActionVerbs >= Math.ceil(work.length * 0.6);
    checks.push({
      id: 'work_action_verbs',
      category: 'Experience',
      title: 'Action-Oriented Verbs',
      passed: verbsPassing,
      points: 10,
      message: verbsPassing
        ? 'Highlights effectively use strong action verbs (e.g. Architected, Led, Optimized)'
        : 'Begin bullet points with strong action verbs (e.g. Spearheaded, Engineered, Reduced, Built) to pass ATS scans.'
    });

    checks.push({
      id: 'work_dates',
      category: 'Experience',
      title: 'Chronological Dates',
      passed: datesValid,
      points: 5,
      message: datesValid
        ? 'Standard ISO date formats used (YYYY-MM)'
        : 'Some work experience entries have non-standard date formats (use YYYY-MM).'
    });
  }

  // =========================================================================
  // CATEGORY 4: SKILLS & EDUCATION (Max 25 pts)
  // =========================================================================
  const skills = resume.skills || [];
  let totalKeywords = 0;
  skills.forEach(s => {
    if (Array.isArray(s.keywords)) totalKeywords += s.keywords.length;
  });
  const hasSkillsKeywords = totalKeywords >= 5;

  checks.push({
    id: 'skills_keywords',
    category: 'Skills',
    title: 'Skills & Tech Keywords',
    passed: hasSkillsKeywords,
    points: 15,
    message: hasSkillsKeywords
      ? `${totalKeywords} skill keyword(s) across ${skills.length} categories found`
      : 'Include at least 5-10 specific skills/technology keywords for ATS match rate.'
  });

  const education = resume.education || [];
  const hasEducation = Array.isArray(education) && education.length > 0;
  checks.push({
    id: 'education',
    category: 'Education',
    title: 'Education Record',
    passed: hasEducation,
    points: 10,
    message: hasEducation
      ? `${education.length} education credential(s) listed`
      : 'No education entries found.'
  });

  // =========================================================================
  // CATEGORY 5: ATS READINESS & LAYOUT PARSEABILITY (Informational Tip)
  // =========================================================================
  const sidebarCount = effectiveLayout?.sidebar?.length || 0;
  const isSingleColumn = sidebarCount === 0;

  checks.push({
    id: 'ats_layout',
    category: 'ATS',
    title: 'Document Flow & Layout',
    passed: true,
    isInfo: !isSingleColumn,
    points: 0,
    message: isSingleColumn
      ? 'Single-column linear layout active. Optimal for automated ATS resume parsers.'
      : `Two-column layout active (${sidebarCount} section(s) in sidebar). HTML DOM renders main sections before sidebar for sequential PDF print stream; older legacy corporate portals (Taleo) prefer single-column.`
  });

  // =========================================================================
  // OVERALL SCORE CALCULATION
  // =========================================================================
  const totalPoints = checks.reduce((sum, c) => sum + (c.points || 0), 0);
  const earnedPoints = checks.reduce((sum, c) => sum + (c.passed ? (c.points || 0) : 0), 0);
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  let grade = 'Needs Work';
  let gradeColor = '#dc2626';

  if (score >= 90) {
    grade = 'Strong (ATS Ready)';
    gradeColor = '#16a34a';
  } else if (score >= 75) {
    grade = 'Good';
    gradeColor = '#2563eb';
  } else if (score >= 55) {
    grade = 'Moderate';
    gradeColor = '#d97706';
  }

  const passedCount = checks.filter(c => c.passed && !c.isInfo).length;
  const warningCount = checks.filter(c => !c.passed && !c.isInfo).length;
  const infoCount = checks.filter(c => c.isInfo).length;

  return {
    score,
    grade,
    gradeColor,
    checks,
    stats: {
      totalChecks: checks.length,
      passed: passedCount,
      warnings: warningCount,
      info: infoCount
    }
  };
}

/**
 * Extracts a clean, linear, ATS-compliant plain-text version of the resume.
 * This simulates "What the Robot Sees" when a scanner parses the CV.
 *
 * @param {object} resume JSON Resume data
 * @param {object} i18n Section title overrides
 * @returns {string} Plain-text linear resume
 */
export function generateAtsPlainText(resume, i18n = {}) {
  if (!resume) return '';

  const lines = [];
  const basics = resume.basics || {};

  // 1. Header
  if (basics.name) lines.push(basics.name.toUpperCase());
  if (basics.label) lines.push(basics.label);

  const contactParts = [];
  if (basics.email) contactParts.push(basics.email);
  if (basics.phone) contactParts.push(basics.phone);
  if (basics.location) {
    const loc = [basics.location.city, basics.location.region, basics.location.countryCode].filter(Boolean).join(', ');
    if (loc) contactParts.push(loc);
  }
  if (basics.url) contactParts.push(basics.url);
  if (basics.profiles && basics.profiles.length > 0) {
    basics.profiles.forEach(p => p.url && contactParts.push(p.url));
  }
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' | '));
  }
  lines.push('');

  // 2. Summary
  if (basics.summary) {
    lines.push('--- PROFESSIONAL SUMMARY ---');
    lines.push(basics.summary.trim());
    lines.push('');
  }

  // 3. Work Experience
  if (resume.work && resume.work.length > 0) {
    lines.push(`--- ${i18n.work || 'WORK EXPERIENCE'} ---`.toUpperCase());
    resume.work.forEach(job => {
      const headerParts = [job.position, job.name].filter(Boolean).join(' at ');
      lines.push(headerParts);

      const metaParts = [];
      const dateStr = [job.startDate, job.endDate || 'Present'].filter(Boolean).join(' – ');
      if (dateStr) metaParts.push(dateStr);
      if (job.location) metaParts.push(job.location);
      if (metaParts.length > 0) lines.push(metaParts.join(' | '));

      if (job.summary) lines.push(job.summary);
      if (Array.isArray(job.highlights) && job.highlights.length > 0) {
        job.highlights.forEach(h => lines.push(`• ${h}`));
      }
      lines.push('');
    });
  }

  // 4. Education
  if (resume.education && resume.education.length > 0) {
    lines.push(`--- ${i18n.education || 'EDUCATION'} ---`.toUpperCase());
    resume.education.forEach(edu => {
      const degree = [edu.studyType, edu.area].filter(Boolean).join(' in ');
      lines.push([degree, edu.institution].filter(Boolean).join(' – '));

      const dateStr = [edu.startDate, edu.endDate || 'Present'].filter(Boolean).join(' – ');
      if (dateStr) lines.push(dateStr);
      if (edu.score) lines.push(`GPA / Score: ${edu.score}`);
      lines.push('');
    });
  }

  // 5. Skills
  if (resume.skills && resume.skills.length > 0) {
    lines.push(`--- ${i18n.skills || 'SKILLS'} ---`.toUpperCase());
    resume.skills.forEach(s => {
      const kw = Array.isArray(s.keywords) ? s.keywords.join(', ') : '';
      if (s.name && kw) {
        lines.push(`${s.name}: ${kw}`);
      } else if (kw) {
        lines.push(kw);
      }
    });
    lines.push('');
  }

  // 6. Projects
  if (resume.projects && resume.projects.length > 0) {
    lines.push(`--- ${i18n.projects || 'PROJECTS'} ---`.toUpperCase());
    resume.projects.forEach(p => {
      lines.push(p.name);
      if (p.description) lines.push(p.description);
      if (Array.isArray(p.highlights)) {
        p.highlights.forEach(h => lines.push(`• ${h}`));
      }
      lines.push('');
    });
  }

  // 7. Certificates
  if (resume.certificates && resume.certificates.length > 0) {
    lines.push(`--- ${i18n.certificates || 'CERTIFICATIONS'} ---`.toUpperCase());
    resume.certificates.forEach(c => {
      lines.push([c.name, c.issuer, c.date].filter(Boolean).join(' | '));
    });
    lines.push('');
  }

  return lines.join('\n').trim();
}
