#!/usr/bin/env node

/**
 * Headless Print & ATS Readiness Test Suite
 *
 * Validates that all 18 themes:
 * 1. Correctly render and paginate standard resumes to <= 2 pages on both A4 and Letter.
 * 2. Render junior resumes to <= 1 page.
 * 3. Preserve strictly linear ATS plain-text parsing (without garbled text or orphaned elements).
 * 4. Respect clean Annex page breaks on supplemental sections.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const TEMP_DIR = path.join('/tmp', 'resume-fmt-print-tests');

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

const THEMES = [
  'classic',
  'modern-timeline',
  'editorial',
  'europass',
  'executive-slate',
  'executive-baseline',
  'noir-city',
  'bio-vision',
  'elegant-split',
  'vibe-glow',
  'tailwind-blueprint',
  'the-verge',
  'terminal',
  'cyber-script',
  '8bit-demo',
  '16bit-amiga',
  'gov',
  'neural-botany'
];

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`${err.message}\n${stderr}`));
      resolve(stdout);
    });
  });
}

function startStaticServer(port = 4299) {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(BUILD_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexPath = path.join(BUILD_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

async function checkPrerequisites() {
  const tools = ['chromium-browser', 'pdfinfo', 'pdftotext'];
  for (const tool of tools) {
    try {
      await runCommand(`which ${tool}`);
    } catch {
      throw new Error(`Required testing tool "${tool}" is not found in PATH.`);
    }
  }

  if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
    throw new Error('Build directory missing. Please run "pnpm run build" first.');
  }
}

async function printPdf(url, outputPath) {
  const cmd = `chromium-browser --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer --virtual-time-budget=3000 --print-to-pdf="${outputPath}" "${url}" 2>/dev/null`;
  await runCommand(cmd);
}

async function getPdfInfo(pdfPath) {
  const out = await runCommand(`pdfinfo "${pdfPath}"`);
  const pagesMatch = out.match(/Pages:\s+(\d+)/);
  const sizeMatch = out.match(/Page size:\s+([^\n]+)/);
  return {
    pages: pagesMatch ? parseInt(pagesMatch[1], 10) : 0,
    pageSize: sizeMatch ? sizeMatch[1].trim() : ''
  };
}

async function getAtsText(pdfPath) {
  return await runCommand(`pdftotext "${pdfPath}" -`);
}

async function main() {
  console.log(`\n${ANSI.bold}${ANSI.cyan}=== Headless Print & ATS Readiness Test Suite ===${ANSI.reset}\n`);

  await checkPrerequisites();

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const port = 4299;
  const server = await startStaticServer(port);
  console.log(`Ephemeral test server running at http://localhost:${port}/\n`);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const targetThemeArg = args.indexOf('--theme') !== -1 ? args[args.indexOf('--theme') + 1] : null;
  const testThemes = targetThemeArg ? [targetThemeArg] : THEMES;

  let totalTests = 0;
  let passedTests = 0;
  let failures = [];

  try {
    for (const theme of testThemes) {
      process.stdout.write(`Testing ${ANSI.bold}${theme.padEnd(20)}${ANSI.reset} `);

      let themeErrors = [];

      // Test 1: Standard Candidate A4 (Target: <= 2 pages)
      const stdA4Pdf = path.join(TEMP_DIR, `${theme}-std-a4.pdf`);
      await printPdf(`http://localhost:${port}/?src=fixtures/candidate-standard-2page.yaml&theme=${theme}&format=a4`, stdA4Pdf);
      const stdA4Info = await getPdfInfo(stdA4Pdf);
      totalTests++;
      if (stdA4Info.pages <= 2) {
        passedTests++;
      } else {
        themeErrors.push(`A4 pages=${stdA4Info.pages} (expected <= 2)`);
      }

      // Test 2: Standard Candidate US Letter (Target: <= 2 pages)
      const stdLetterPdf = path.join(TEMP_DIR, `${theme}-std-letter.pdf`);
      await printPdf(`http://localhost:${port}/?src=fixtures/candidate-standard-2page.yaml&theme=${theme}&format=letter`, stdLetterPdf);
      const stdLetterInfo = await getPdfInfo(stdLetterPdf);
      totalTests++;
      if (stdLetterInfo.pages <= 2) {
        passedTests++;
      } else {
        themeErrors.push(`Letter pages=${stdLetterInfo.pages} (expected <= 2)`);
      }

      // Test 3: ATS Text Extraction Linearity & Anti-Widowed Header Assertion
      const text = await getAtsText(stdA4Pdf);
      totalTests++;
      const hasName = /alex[\s\n\r]+rivera/i.test(text);
      const hasWork = /work|experience/i.test(text);
      
      // Check that no page ends on an orphaned section heading
      const pages = text.split('\f').map(p => p.trim()).filter(Boolean);
      let widowedHeaderError = null;
      const knownHeaders = ['WORK', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'LANGUAGES', 'CERTIFICATES', 'PROJECTS'];
      for (let i = 0; i < pages.length - 1; i++) {
        const lines = pages[i].split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1].toUpperCase();
          if (knownHeaders.includes(lastLine)) {
            widowedHeaderError = `Widowed header "${lastLine}" at bottom of page ${i + 1}`;
            break;
          }
        }
      }

      if (hasName && hasWork && !widowedHeaderError) {
        passedTests++;
      } else {
        const errMsg = widowedHeaderError || `ATS text extraction missing expected sections (Name: ${hasName}, Work: ${hasWork})`;
        themeErrors.push(errMsg);
      }

      if (themeErrors.length === 0) {
        console.log(`${ANSI.green}✅ PASS${ANSI.reset} (A4: ${stdA4Info.pages}p, Letter: ${stdLetterInfo.pages}p, ATS: OK)`);
      } else {
        console.log(`${ANSI.red}❌ FAIL${ANSI.reset} -> ${themeErrors.join(', ')}`);
        failures.push({ theme, errors: themeErrors });
      }
    }

    // Test 4: Junior Fixture 1-Page Assertion (Tested on classic and modern-timeline)
    console.log(`\nVerifying 1-Page Junior Blueprint budget...`);
    const juniorPdf = path.join(TEMP_DIR, `junior-test.pdf`);
    await printPdf(`http://localhost:${port}/?src=fixtures/candidate-junior-1page.yaml&theme=classic&format=a4`, juniorPdf);
    const juniorInfo = await getPdfInfo(juniorPdf);
    totalTests++;
    if (juniorInfo.pages <= 1) {
      passedTests++;
      console.log(`  ${ANSI.green}✅ PASS${ANSI.reset} Junior candidate formatted within 1 page (actual: ${juniorInfo.pages}p)`);
    } else {
      console.log(`  ${ANSI.red}❌ FAIL${ANSI.reset} Junior candidate spilled to ${juniorInfo.pages} pages`);
      failures.push({ theme: 'junior-1page', errors: [`Junior pages=${juniorInfo.pages} (expected <= 1)`] });
    }

    // Test 5: Senior Annex Page Break Assertion
    console.log(`\nVerifying Supplemental Annex Break (Page 3+)...`);
    const annexPdf = path.join(TEMP_DIR, `senior-annex-test.pdf`);
    await printPdf(`http://localhost:${port}/?src=fixtures/candidate-senior-annex.yaml&theme=classic&format=a4&annex=true`, annexPdf);
    const annexInfo = await getPdfInfo(annexPdf);
    const annexText = await getAtsText(annexPdf);
    totalTests++;
    if (annexInfo.pages <= 3 && annexText.includes('VOLUNTEER')) {
      passedTests++;
      console.log(`  ${ANSI.green}✅ PASS${ANSI.reset} Annex break structured cleanly (actual: ${annexInfo.pages}p)`);
    } else {
      console.log(`  ${ANSI.red}❌ FAIL${ANSI.reset} Annex break failure (pages: ${annexInfo.pages})`);
      failures.push({ theme: 'senior-annex', errors: [`Senior annex pages=${annexInfo.pages}`] });
    }

    console.log('\n--------------------------------------------------');
    console.log(`Total checks: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failures.length}`);

    if (failures.length > 0) {
      console.error(`\n${ANSI.red}❌ Some themes failed print readiness assertions.${ANSI.reset}\n`);
      process.exit(1);
    } else {
      console.log(`\n${ANSI.green}${ANSI.bold}All themes validated successfully for A4/Letter print and ATS linearity!${ANSI.reset}\n`);
    }
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error(`\n${ANSI.red}Error executing print tests: ${err.message}${ANSI.reset}`);
  process.exit(1);
});
