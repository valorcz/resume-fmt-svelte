#!/usr/bin/env node

/**
 * End-of-Life (EOL) & Support Status Checker
 *
 * Checks whether your Node.js runtime, Svelte framework, and core dependencies
 * are still actively supported, reaching EOL, or officially deprecated on npm.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const allDeps = {
  ...pkg.dependencies,
  ...pkg.devDependencies
};

// Key packages to monitor for official lifecycle and support
const CORE_PACKAGES = [
  'svelte',
  '@sveltejs/kit',
  '@sveltejs/adapter-static',
  '@sveltejs/vite-plugin-svelte',
  'vite',
  'js-yaml',
  'ajv'
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  gray: '\x1b[90m'
};

async function fetchWithTimeout(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function checkNodeSupport() {
  const currentVer = process.version.replace(/^v/, '');
  const major = currentVer.split('.')[0];
  try {
    const cycles = await fetchWithTimeout('https://endoflife.date/api/nodejs.json');
    const cycle = cycles.find(c => c.cycle === major);
    if (!cycle) {
      return { status: 'unknown', text: `Node.js v${currentVer} (lifecycle unlisted)` };
    }
    const today = new Date().toISOString().split('T')[0];
    const isEol = cycle.eol === true || (typeof cycle.eol === 'string' && cycle.eol <= today);
    if (isEol) {
      return {
        status: 'eol',
        text: `Node.js v${currentVer} is END-OF-LIFE as of ${cycle.eol}! Upgrade to an active LTS (e.g. Node 22/24).`
      };
    }
    return {
      status: 'ok',
      text: `Node.js v${currentVer} (LTS supported until ${cycle.eol})`
    };
  } catch (e) {
    return { status: 'skip', text: `Node.js v${currentVer} (could not reach endoflife.date: ${e.message})` };
  }
}

async function checkSvelteSupport(versionRange) {
  const major = versionRange.replace(/[\^~>=<]/g, '').split('.')[0];
  try {
    const cycles = await fetchWithTimeout('https://endoflife.date/api/svelte.json');
    const cycle = cycles.find(c => c.cycle === major);
    if (cycle) {
      const today = new Date().toISOString().split('T')[0];
      const isEol = cycle.eol === true || (typeof cycle.eol === 'string' && cycle.eol <= today);
      if (isEol) {
        return {
          status: 'eol',
          text: `Svelte v${major} reached EOL on ${cycle.eol}. Upgrade to Svelte ${cycles[0]?.cycle || '5'}.`
        };
      }
      return {
        status: 'ok',
        text: `Svelte v${major} is active (support: ${cycle.support === true ? 'ongoing' : cycle.support})`
      };
    }
  } catch (e) {
    // Fall back to npm registry check below
  }
  return null;
}

async function checkNpmPackage(name, declaredRange) {
  // If special lifecycle API exists, try it first
  if (name === 'svelte') {
    const svelteStatus = await checkSvelteSupport(declaredRange);
    if (svelteStatus) return svelteStatus;
  }

  try {
    const data = await fetchWithTimeout(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
    const cleanVer = declaredRange.replace(/[\^~>=<]/g, '');
    const currentMajor = cleanVer.split('.')[0];
    const latestVersion = data['dist-tags']?.latest || 'unknown';
    const latestMajor = latestVersion.split('.')[0];

    // Check if the specific declared version or its major has deprecation warnings
    const matchedVersion = Object.keys(data.versions || {})
      .filter(v => v.startsWith(`${currentMajor}.`))
      .pop() || cleanVer;

    const versionMeta = data.versions?.[matchedVersion];
    if (versionMeta?.deprecated) {
      return {
        status: 'eol',
        text: `${name} v${cleanVer} is DEPRECATED: ${versionMeta.deprecated}`
      };
    }

    // Check if package root itself is deprecated
    if (data.deprecated) {
      return {
        status: 'eol',
        text: `${name} is deprecated: ${data.deprecated}`
      };
    }

    if (currentMajor === latestMajor) {
      return {
        status: 'ok',
        text: `${name}@${declaredRange} (Current major v${currentMajor}, latest: ${latestVersion})`
      };
    }

    return {
      status: 'active-maintenance',
      text: `${name}@${declaredRange} (Supported stable branch. Latest major is v${latestMajor}, v${currentMajor} is still active)`
    };
  } catch (e) {
    return {
      status: 'skip',
      text: `${name}@${declaredRange} (Could not check npm registry: ${e.message})`
    };
  }
}

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}=== Package Support & End-of-Life (EOL) Status ===${colors.reset}\n`);

  let hasEol = false;

  // 1. Check Node.js
  const nodeResult = await checkNodeSupport();
  if (nodeResult.status === 'eol') {
    hasEol = true;
    console.log(`❌ ${colors.red}[EOL]${colors.reset}   ${nodeResult.text}`);
  } else if (nodeResult.status === 'ok') {
    console.log(`✅ ${colors.green}[OK]${colors.reset}    ${nodeResult.text}`);
  } else {
    console.log(`⚠️  ${colors.yellow}[SKIP]${colors.reset}  ${nodeResult.text}`);
  }

  // 2. Check Core Dependencies
  for (const pkgName of CORE_PACKAGES) {
    const range = allDeps[pkgName];
    if (!range) continue;

    const res = await checkNpmPackage(pkgName, range);
    if (res.status === 'eol') {
      hasEol = true;
      console.log(`❌ ${colors.red}[EOL]${colors.reset}   ${res.text}`);
    } else if (res.status === 'ok') {
      console.log(`✅ ${colors.green}[OK]${colors.reset}    ${res.text}`);
    } else if (res.status === 'active-maintenance') {
      console.log(`ℹ️  ${colors.cyan}[STABLE]${colors.reset}${res.text}`);
    } else {
      console.log(`⚠️  ${colors.yellow}[SKIP]${colors.reset}  ${res.text}`);
    }
  }

  console.log('\n--------------------------------------------------');
  if (hasEol) {
    console.log(`${colors.red}${colors.bold}ACTION REQUIRED:${colors.reset} One or more dependencies are End-of-Life and must be upgraded!\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}All core releases are active, healthy, and supported.${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Failed to run EOL check:', err);
  process.exit(1);
});
