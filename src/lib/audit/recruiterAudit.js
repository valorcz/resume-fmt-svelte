/**
 * Evaluates the technical health and data quality of the Recruiter Executive Summary.
 * 
 * Verifies whether the underlying YAML/JSON data:
 * 1. Has an explicit executiveSummary specification (or relies on heuristic fallback)
 * 2. Formats headline concisely without text overload (30–180 chars)
 * 3. Provides 2–4 quantifiable impact metrics with numerical/scale data
 * 4. Curates 3–6 focused superpower chips without cognitive overload
 * 5. Provides clear target roles and availability
 * 6. Keeps top proof-point highlights punchy (2–3 bullets)
 *
 * @param {object} resume JSON Resume object
 * @returns {object} Diagnostic report and scoring
 */
export function evaluateRecruiterSummary(resume) {
  if (!resume) {
    return {
      isExplicit: false,
      status: 'missing',
      statusLabel: 'No Resume Data',
      score: 0,
      gradeColor: '#dc2626',
      checks: [],
      stats: { total: 0, passed: 0, warnings: 0, errors: 1 }
    };
  }

  const explicit = resume.executiveSummary || resume.meta?.executiveSummary || null;
  const isExplicit = Boolean(explicit);
  const checks = [];

  // -------------------------------------------------------------------------
  // 1. Data Source Presence
  // -------------------------------------------------------------------------
  if (!isExplicit) {
    checks.push({
      id: 'source_presence',
      category: 'Data Source',
      title: 'Explicit Specification',
      level: 'warn',
      passed: false,
      points: 20,
      earned: 5,
      message: 'No "executiveSummary" block defined in YAML/JSON. The recruiter view is running in automated heuristic fallback mode.'
    });
  } else {
    checks.push({
      id: 'source_presence',
      category: 'Data Source',
      title: 'Explicit Specification',
      level: 'pass',
      passed: true,
      points: 20,
      earned: 20,
      message: 'Dedicated "executiveSummary" block found in resume data.'
    });
  }

  // -------------------------------------------------------------------------
  // 2. Headline / Elevator Pitch Quality
  // -------------------------------------------------------------------------
  const headline = explicit?.headline || resume.basics?.headline || resume.basics?.label || '';
  const trimmedHeadline = String(headline).trim();
  const headlineLen = trimmedHeadline.length;

  if (!trimmedHeadline) {
    checks.push({
      id: 'headline',
      category: 'Headline',
      title: 'Elevator Statement',
      level: 'error',
      passed: false,
      points: 20,
      earned: 0,
      message: 'Missing headline. Recruiters require a 1–2 sentence positioning statement.'
    });
  } else if (headlineLen < 30) {
    checks.push({
      id: 'headline',
      category: 'Headline',
      title: 'Elevator Statement',
      level: 'warn',
      passed: false,
      points: 20,
      earned: 10,
      message: `Headline is too brief (${headlineLen} chars). Expand to 40–180 characters conveying specialization and value proposition.`
    });
  } else if (headlineLen > 210) {
    checks.push({
      id: 'headline',
      category: 'Headline',
      title: 'Elevator Statement',
      level: 'warn',
      passed: false,
      points: 20,
      earned: 10,
      message: `Headline is too verbose (${headlineLen} chars). Recruiters scan headlines in 3 seconds; keep under 190 characters.`
    });
  } else if (trimmedHeadline.includes('\n\n')) {
    checks.push({
      id: 'headline',
      category: 'Headline',
      title: 'Elevator Statement',
      level: 'warn',
      passed: false,
      points: 20,
      earned: 12,
      message: 'Headline contains multi-paragraph line breaks; format as a single punchy elevator statement.'
    });
  } else {
    checks.push({
      id: 'headline',
      category: 'Headline',
      title: 'Elevator Statement',
      level: 'pass',
      passed: true,
      points: 20,
      earned: 20,
      message: `Optimal headline length and focus (${headlineLen} characters).`
    });
  }

  // -------------------------------------------------------------------------
  // 3. Quantitative Key Metrics
  // -------------------------------------------------------------------------
  const metrics = explicit?.keyMetrics || [];
  const hasExplicitMetrics = Array.isArray(metrics) && metrics.length > 0;

  if (!hasExplicitMetrics) {
    checks.push({
      id: 'key_metrics',
      category: 'Key Metrics',
      title: 'Quantifiable Proof Points',
      level: 'warn',
      passed: false,
      points: 25,
      earned: 6,
      message: 'No keyMetrics array provided in executiveSummary. Using generic auto-calculated years/education fallback.'
    });
  } else {
    const count = metrics.length;
    let formatIssues = 0;
    let hasNumbersOrSymbols = false;

    metrics.forEach(m => {
      if (!m || typeof m !== 'object' || !m.label || !m.value) {
        formatIssues++;
      } else if (/[0-9%$+kMxX]/.test(String(m.value))) {
        hasNumbersOrSymbols = true;
      }
    });

    if (formatIssues > 0) {
      checks.push({
        id: 'key_metrics',
        category: 'Key Metrics',
        title: 'Quantifiable Proof Points',
        level: 'error',
        passed: false,
        points: 25,
        earned: 8,
        message: `${formatIssues} metric item(s) missing required "label" or "value" string properties.`
      });
    } else if (count > 5) {
      checks.push({
        id: 'key_metrics',
        category: 'Key Metrics',
        title: 'Quantifiable Proof Points',
        level: 'warn',
        passed: false,
        points: 25,
        earned: 15,
        message: `Too many metrics (${count}). More than 4 metrics causes card crowding and horizontal overflow on mobile.`
      });
    } else if (!hasNumbersOrSymbols) {
      checks.push({
        id: 'key_metrics',
        category: 'Key Metrics',
        title: 'Quantifiable Proof Points',
        level: 'warn',
        passed: false,
        points: 25,
        earned: 16,
        message: 'Metric values lack quantitative scale or symbols (e.g., "15+", "10M+", "$500K", "100%").'
      });
    } else {
      checks.push({
        id: 'key_metrics',
        category: 'Key Metrics',
        title: 'Quantifiable Proof Points',
        level: 'pass',
        passed: true,
        points: 25,
        earned: 25,
        message: `${count} quantitative metrics formatted properly with clear value-to-label pairing.`
      });
    }
  }

  // -------------------------------------------------------------------------
  // 4. Core Competencies / Superpower Chips
  // -------------------------------------------------------------------------
  const superpowers = explicit?.coreCompetencies || [];
  const hasSuperpowers = Array.isArray(superpowers) && superpowers.length > 0;

  if (!hasSuperpowers) {
    checks.push({
      id: 'superpowers',
      category: 'Competencies',
      title: 'Core Superpowers',
      level: 'warn',
      passed: false,
      points: 15,
      earned: 5,
      message: 'No coreCompetencies array provided. Falling back to the first general skills found.'
    });
  } else {
    const count = superpowers.length;
    const longChips = superpowers.filter(c => String(c).length > 32);

    if (count < 3) {
      checks.push({
        id: 'superpowers',
        category: 'Competencies',
        title: 'Core Superpowers',
        level: 'warn',
        passed: false,
        points: 15,
        earned: 8,
        message: `Only ${count} superpower chip(s). Recommend 4–6 core domains for recruiter indexing.`
      });
    } else if (count > 7) {
      checks.push({
        id: 'superpowers',
        category: 'Competencies',
        title: 'Core Superpowers',
        level: 'warn',
        passed: false,
        points: 15,
        earned: 10,
        message: `Too many superpower chips (${count}). Exceeding 6 tags creates cognitive clutter on an executive scan.`
      });
    } else if (longChips.length > 0) {
      checks.push({
        id: 'superpowers',
        category: 'Competencies',
        title: 'Core Superpowers',
        level: 'warn',
        passed: false,
        points: 15,
        earned: 11,
        message: `${longChips.length} chip(s) exceed 32 characters. Chips should be concise skills or domains.`
      });
    } else {
      checks.push({
        id: 'superpowers',
        category: 'Competencies',
        title: 'Core Superpowers',
        level: 'pass',
        passed: true,
        points: 15,
        earned: 15,
        message: `${count} focused competency chips curated cleanly.`
      });
    }
  }

  // -------------------------------------------------------------------------
  // 5. Target Roles & Availability
  // -------------------------------------------------------------------------
  const targetRoles = explicit?.targetRoles || [];
  const availability = explicit?.availability || null;
  const rolesCount = Array.isArray(targetRoles) ? targetRoles.length : (targetRoles ? 1 : 0);

  if (!rolesCount && !availability) {
    checks.push({
      id: 'targeting',
      category: 'Targeting',
      title: 'Target Roles & Availability',
      level: 'info',
      passed: false,
      points: 10,
      earned: 4,
      message: 'Target roles and timeline availability are unstated. Adding them clarifies mutual fit immediately.'
    });
  } else if (rolesCount > 4) {
    checks.push({
      id: 'targeting',
      category: 'Targeting',
      title: 'Target Roles & Availability',
      level: 'warn',
      passed: false,
      points: 10,
      earned: 7,
      message: `Too many target roles (${rolesCount}). Focus on 2–3 specific titles to avoid appearing unfocused.`
    });
  } else {
    checks.push({
      id: 'targeting',
      category: 'Targeting',
      title: 'Target Roles & Availability',
      level: 'pass',
      passed: true,
      points: 10,
      earned: 10,
      message: `Target roles (${rolesCount}) and availability (${availability || 'Flexible'}) communicated clearly.`
    });
  }

  // -------------------------------------------------------------------------
  // 6. Top Proof-Point Highlights
  // -------------------------------------------------------------------------
  const highlights = explicit?.topHighlights || [];
  const hasHighlights = Array.isArray(highlights) && highlights.length > 0;

  if (hasHighlights) {
    const hCount = highlights.length;
    const verboseCount = highlights.filter(h => String(h).length > 250).length;

    if (hCount > 4) {
      checks.push({
        id: 'top_highlights',
        category: 'Highlights',
        title: 'Curated Highlights',
        level: 'warn',
        passed: false,
        points: 10,
        earned: 6,
        message: `${hCount} executive highlights provided. Cap at 2–3 top career achievements.`
      });
    } else if (verboseCount > 0) {
      checks.push({
        id: 'top_highlights',
        category: 'Highlights',
        title: 'Curated Highlights',
        level: 'warn',
        passed: false,
        points: 10,
        earned: 7,
        message: `${verboseCount} highlight bullet(s) are overly verbose (> 250 characters).`
      });
    } else {
      checks.push({
        id: 'top_highlights',
        category: 'Highlights',
        title: 'Curated Highlights',
        level: 'pass',
        passed: true,
        points: 10,
        earned: 10,
        message: `${hCount} high-impact career proof points provided.`
      });
    }
  } else {
    checks.push({
      id: 'top_highlights',
      category: 'Highlights',
      title: 'Curated Highlights',
      level: 'info',
      passed: false,
      points: 10,
      earned: 4,
      message: 'No topHighlights defined. First bullet points from work experience will be displayed.'
    });
  }

  // -------------------------------------------------------------------------
  // Scoring & Grade Resolution
  // -------------------------------------------------------------------------
  const totalPoints = checks.reduce((sum, c) => sum + (c.points || 0), 0);
  const earnedPoints = checks.reduce((sum, c) => sum + (c.earned || 0), 0);
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  let status = 'needs-attention';
  let statusLabel = 'Needs Attention';
  let gradeColor = '#d97706';

  if (!isExplicit) {
    status = 'fallback';
    statusLabel = 'Heuristic Fallback';
    gradeColor = '#64748b';
  } else if (score >= 90) {
    status = 'optimal';
    statusLabel = 'Recruiter Ready';
    gradeColor = '#16a34a';
  } else if (score >= 70) {
    status = 'good';
    statusLabel = 'Good Quality';
    gradeColor = '#2563eb';
  } else {
    status = 'needs-attention';
    statusLabel = 'Needs Attention';
    gradeColor = '#d97706';
  }

  const passedCount = checks.filter(c => c.passed).length;
  const warningCount = checks.filter(c => c.level === 'warn').length;
  const errorCount = checks.filter(c => c.level === 'error').length;

  return {
    isExplicit,
    status,
    statusLabel,
    score,
    gradeColor,
    checks,
    stats: {
      total: checks.length,
      passed: passedCount,
      warnings: warningCount,
      errors: errorCount
    }
  };
}
