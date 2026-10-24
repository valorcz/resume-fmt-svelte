#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const BUILD_DIR = path.resolve('build');
const OUTPUT_DIR = path.resolve('docs/assets');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'preview.png');

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

function startStaticServer(port = 4399) {
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

async function main() {
  if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
    console.error('Error: build/ directory not found. Please run "pnpm run build" first.');
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const port = 4399;
  const server = await startStaticServer(port);

  try {
    const url = `http://localhost:${port}/?src=fixtures/candidate-standard-2page.yaml&theme=modern-timeline`;
    const cmd = `chromium-browser --headless=new --disable-gpu --no-sandbox --window-size=1400,900 --virtual-time-budget=2000 --screenshot="${OUTPUT_PATH}" "${url}" 2>/dev/null`;
    await runCommand(cmd);

    if (fs.existsSync(OUTPUT_PATH)) {
      const stats = fs.statSync(OUTPUT_PATH);
      console.log(`✅ Generated preview screenshot at ${OUTPUT_PATH} (${Math.round(stats.size / 1024)} KB)`);
    } else {
      throw new Error('Screenshot was not generated.');
    }
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('Failed to generate preview:', err.message);
  process.exit(1);
});
