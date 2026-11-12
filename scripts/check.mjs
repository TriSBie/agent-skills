// Repo check: token contrast (WCAG AA) + every template's ?selftest in headless Chrome.
// Run: node scripts/check.mjs   (set CHROME=/path/to/chrome if it is not found)
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

let fail = 0;
const bad = m => { fail++; console.log('FAIL', m); };

// 1) Contrast: every text ink on every background, both themes; accent-ink on accent.
const lum = hex => hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255)
  .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const f of readdirSync('skills', { recursive: true }).filter(f => f.endsWith('tokens.json'))) {
  const c = JSON.parse(readFileSync(resolve('skills', f), 'utf8')).color;
  for (const theme of ['dark', 'light']) {
    const t = c[theme], bgs = Object.keys(t).filter(k => k.startsWith('bg-'));
    for (const ink of ['ink', 'ink-2', 'ink-3']) for (const bg of bgs) {
      const r = ratio(t[ink].$value, t[bg].$value);
      if (r < 4.5) bad(`${f} ${theme} ${ink} on ${bg}: ${r.toFixed(2)}:1 < 4.5`);
    }
  }
  const r = ratio(c['accent-ink'].$value, c.accent.$value);
  if (r < 4.5) bad(`${f} accent-ink on accent: ${r.toFixed(2)}:1 < 4.5`);
  console.log('contrast checked:', f);
}

// 2) Selftests: open each template with ?selftest, expect <title>SELFTEST OK n</title>.
const chrome = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => p && existsSync(p));
if (!chrome) bad('no Chrome found; set CHROME');
else for (const f of readdirSync('skills', { recursive: true }).filter(f => f.endsWith('-template.html'))) {
  const url = pathToFileURL(resolve('skills', f)).href + '?selftest';
  const dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-sandbox', '--window-size=1280,720',
    '--virtual-time-budget=3000', '--dump-dom', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const title = (dom.match(/<title>([^<]*)/) || [])[1] || '(no title)';
  if (title.startsWith('SELFTEST OK')) console.log(title, '·', f); else bad(`${f}: ${title}`);
}

process.exit(fail ? 1 : 0);
