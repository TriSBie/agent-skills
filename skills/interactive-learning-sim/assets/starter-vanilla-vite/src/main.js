import { IsoStage } from './engine/iso-stage.js';
import { COURSE } from './lessons/course-data.js';

const ALL_LESSONS = COURSE.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m })));

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(COURSE.storagePrefix + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, val) {
  try {
    localStorage.setItem(COURSE.storagePrefix + key, JSON.stringify(val));
  } catch {}
}

function updateLayoutAttr() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  document.documentElement.dataset.layout =
    w >= 1200 && h >= 560 ? 'desktop' : w >= 960 && h >= 600 ? 'tablet' : 'stack';
}

const CALLOUT_LABELS = {
  tip: 'Tip',
  insight: 'Key idea',
  warn: 'Watch out',
  next: 'Next',
};

// No numbers here: several steps may share a phase, and numbers clashed with the step counter.
const CHAPTER_LABELS = {
  problem: 'Problem',
  baseline: 'Baseline',
  bottleneck: 'Bottleneck',
  technique: 'Technique',
  tradeoff: 'Trade-off',
};

class App {
  constructor(root) {
    this.root = root;
    this.doneIds = new Set(readStorage('done', []));
    this.mode = null; // null until first mount; then 'learn' | 'practice' | 'cheatsheets'
    this.lesson = ALL_LESSONS[0];
    this.stepIdx = 0;
    this.prevMetrics = {};
    this.stage = null;
    this.practiceStage = null;
    this.selectedChoiceId = null;
    this.searchOpen = false;

    this._renderShell();
    this._bindGlobalEvents();
    this._syncFromHash();
  }

  _renderShell() {
    const shortcut = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K';
    this.root.innerHTML = `
      <div class="window">
        <header class="topbar">
          <button class="btn-ghost menu-btn" id="menu-toggle" type="button" aria-label="Open lesson list">☰ Lessons</button>
          <a class="brand" href="#/">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 11V16M8 20V16H24V19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <rect x="9" y="3" width="14" height="8" rx="2.5" fill="#f6dabd" stroke="currentColor" stroke-width="1.8"/>
              <rect x="3" y="20" width="11" height="8.5" rx="2.5" fill="#d2e7c3" stroke="currentColor" stroke-width="1.8"/>
              <rect x="18" y="20" width="11" height="8.5" rx="2.5" fill="#e0dcf5" stroke="currentColor" stroke-width="1.8"/>
            </svg>
            <span>${COURSE.title}</span>
          </a>
          <nav class="nav" id="top-nav">
            <button class="nav__item is-active" data-mode="learn" type="button">Learn</button>
            <button class="nav__item" data-mode="practice" type="button">Practice</button>
            <button class="nav__item" data-mode="cheatsheets" type="button">Cheatsheets</button>
          </nav>
          <div class="topbar__spacer"></div>
          <button class="search-btn" id="open-search" type="button">
            <span>Search lessons…</span>
            <kbd>${shortcut}</kbd>
          </button>
          <button class="btn-ghost" id="theme-toggle" type="button" aria-label="Toggle light/dark theme">◐ Theme</button>
        </header>
        <main class="workspace" id="workspace"></main>
      </div>
      <div id="modal-host"></div>
    `;

    this.workspaceEl = this.root.querySelector('#workspace');
    this.modalHost = this.root.querySelector('#modal-host');

    this.root.querySelector('#top-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mode]');
      if (!btn) return;
      const mode = btn.dataset.mode;
      location.hash = mode === 'learn' ? `#/learn/${this.lesson.id}/${this.stepIdx + 1}` : `#/${mode}`;
    });

    this.root.querySelector('#theme-toggle').addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      if (isDark) delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = 'dark';
      // Raw string under a fixed key: the anti-FOUC script in index.html reads it before COURSE loads.
      try {
        localStorage.setItem('sim:theme', isDark ? 'light' : 'dark');
      } catch {}
      this.stage?.retheme();
      this.practiceStage?.retheme();
    });

    this.root.querySelector('#open-search').addEventListener('click', () => this._openSearch());
    this.root.querySelector('#menu-toggle').addEventListener('click', () => {
      this.workspaceEl.querySelector('.sidebar')?.classList.toggle('is-open');
    });
  }

  _bindGlobalEvents() {
    window.addEventListener('resize', updateLayoutAttr);
    window.addEventListener('hashchange', () => this._syncFromHash());
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this._openSearch();
        return;
      }
      if (e.key === 'Escape' && this.searchOpen) {
        this._closeSearch();
        return;
      }
      if (this.searchOpen || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (this.mode === 'learn') {
        if (e.key === 'ArrowRight') this._goStep(this.stepIdx + 1);
        else if (e.key === 'ArrowLeft') this._goStep(this.stepIdx - 1);
      }
    });
  }

  _syncFromHash() {
    const hash = location.hash || `#/learn/${ALL_LESSONS[0].id}/1`;
    if (hash.startsWith('#/practice')) {
      this._setMode('practice');
      return;
    }
    if (hash.startsWith('#/cheatsheets')) {
      this._setMode('cheatsheets');
      return;
    }
    const m = hash.match(/^#\/(?:learn\/)?([\w-]+)(?:\/(\d+))?/);
    const lesson = ALL_LESSONS.find((l) => l.id === m?.[1]) || ALL_LESSONS[0];
    const stepOneBased = Math.max(1, Math.min(lesson.steps.length, Number(m?.[2] || 1)));
    const lessonChanged = this.lesson.id !== lesson.id || this.mode !== 'learn';
    this.lesson = lesson;
    this.stepIdx = stepOneBased - 1;

    if (this.mode !== 'learn') {
      this._setMode('learn');
    } else {
      this._updateLearnView(lessonChanged);
    }
  }

  _setMode(mode) {
    this.mode = mode;
    this.stage?.destroy();
    this.stage = null;
    this.practiceStage?.destroy();
    this.practiceStage = null;

    this.root.querySelectorAll('#top-nav .nav__item').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.mode === mode);
    });

    if (mode === 'learn') {
      this._mountLearnLayout();
      this._updateLearnView(true);
    } else if (mode === 'practice') {
      this._mountPracticeView();
    } else {
      this._mountCheatsheetsView();
    }
  }

  _mountLearnLayout() {
    this.workspaceEl.style.display = 'grid';
    this.workspaceEl.innerHTML = `
      <aside class="sidebar" id="sidebar"></aside>
      <section class="center-col">
        <div class="lesson-head" id="lesson-head"></div>
        <div class="sx" id="metric-strip"></div>
        <div class="stage" id="stage-host">
          <div class="legend">
            <span><i class="legend__dot" style="background:#2b7bbf"></i>Request</span>
            <span><i class="legend__dot" style="background:#2d8a4e"></i>Response</span>
            <span><i class="legend__dot" style="background:#6d5ac8"></i>Write/Event</span>
            <span><i class="legend__dot" style="background:#c0392f"></i>Timeout/Drop</span>
          </div>
          <div class="stage__tools">
            <button class="stage__tool" id="btn-pause" type="button">Pause</button>
            <button class="stage__tool" id="btn-fit" type="button">Fit</button>
          </div>
        </div>
      </section>
      <section class="guide-col">
        <div class="timeline" id="timeline"></div>
        <div id="guide-card-host"></div>
        <div class="guide__nav" id="guide-nav"></div>
      </section>
    `;

    const stageHost = this.workspaceEl.querySelector('#stage-host');
    this.stage = new IsoStage(stageHost);

    this.workspaceEl.querySelector('#btn-fit').addEventListener('click', () => this.stage.fit(true));
    const pauseBtn = this.workspaceEl.querySelector('#btn-pause');
    pauseBtn.addEventListener('click', () => {
      const next = !this.stage.paused;
      this.stage.setPaused(next);
      pauseBtn.textContent = next ? 'Resume' : 'Pause';
    });
  }

  _updateLearnView(lessonChanged) {
    const lesson = this.lesson;
    const step = lesson.steps[this.stepIdx];

    if (this.stepIdx === lesson.steps.length - 1 && !this.doneIds.has(lesson.id)) {
      this.doneIds.add(lesson.id);
      writeStorage('done', [...this.doneIds]);
    }

    // Sidebar
    const sidebar = this.workspaceEl.querySelector('#sidebar');
    sidebar.innerHTML = COURSE.modules
      .map(
        (mod) => `
        <div class="mod">
          <div class="mod__head">
            <span class="mod__dot mod__dot--${mod.color}"></span>
            <span>${mod.num} · ${mod.title}</span>
          </div>
          <ul class="mod__list">
            ${mod.lessons
              .map(
                (l) => `
                <li>
                  <button class="lesson-link ${l.id === lesson.id ? 'is-active' : ''}" data-lesson="${l.id}" type="button">
                    <span>${l.title}</span>
                    ${this.doneIds.has(l.id) ? '<span class="lesson-link__done">✓</span>' : ''}
                  </button>
                </li>
              `
              )
              .join('')}
          </ul>
        </div>
      `
      )
      .join('');

    sidebar.querySelectorAll('[data-lesson]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sidebar.classList.remove('is-open');
        location.hash = `#/learn/${btn.dataset.lesson}/1`;
      });
    });

    // Header
    this.workspaceEl.querySelector('#lesson-head').innerHTML = `
      <div>
        <h1 class="lesson-head__title">${lesson.title}</h1>
        <p class="lesson-head__summary">${lesson.summary}</p>
      </div>
      <div class="tags">
        <span class="tag tag--mint">${lesson.minutes} min</span>
        <span class="tag tag--violet">${lesson.level}</span>
        <span class="tag tag--orange">${lesson.steps.length} steps</span>
      </div>
    `;

    // Metrics
    if (lessonChanged) this.prevMetrics = {};
    this.workspaceEl.querySelector('#metric-strip').innerHTML = (lesson.metrics || [])
      .map((m) => {
        const raw = step.metrics?.[m.id];
        const display = raw === null || raw === undefined ? '—' : `${raw}${m.unit || ''}`;
        const tone = raw !== null && raw !== undefined && m.tone ? m.tone(raw) : 'neutral';
        const changed = this.prevMetrics[m.id] !== undefined && this.prevMetrics[m.id] !== raw;
        return `
          <div class="chip chip--${tone} ${changed ? 'is-changed' : ''}">
            <div class="chip__label">${m.label}</div>
            <div class="chip__val">${display}</div>
          </div>
        `;
      })
      .join('');
    this.prevMetrics = { ...(step.metrics || {}) };

    // Stage
    this.stage.setScene(step.scene, { animate: !lessonChanged });

    // Timeline
    const timeline = this.workspaceEl.querySelector('#timeline');
    timeline.innerHTML = `
      <div class="timeline__steps">
        ${lesson.steps
          .map(
            (s, i) => `
            <button class="step-pill ${i === this.stepIdx ? 'is-active' : i < this.stepIdx ? 'is-done' : ''}" data-step="${i}" type="button">
              ${i + 1}. ${s.short}
            </button>
          `
          )
          .join('')}
      </div>
    `;
    timeline.querySelectorAll('[data-step]').forEach((btn) => {
      btn.addEventListener('click', () => this._goStep(Number(btn.dataset.step)));
    });

    // Guide Card
    const changesHtml =
      step.changes && step.changes.length
        ? `<div class="changes">
            ${step.changes
              .map((line) => {
                const cls = line.startsWith('+') ? 'chg--add' : line.startsWith('-') ? 'chg--del' : 'chg--mod';
                return `<div class="chg ${cls}">${line}</div>`;
              })
              .join('')}
          </div>`
        : '';

    const calloutHtml = step.callout
      ? `<div class="callout callout--${step.callout.kind}">
          <div class="callout__head">${step.callout.title || CALLOUT_LABELS[step.callout.kind] || 'Note'}</div>
          <div>${step.callout.text}</div>
        </div>`
      : '';

    this.workspaceEl.querySelector('#guide-card-host').innerHTML = `
      <article class="guide__card">
        <span class="guide__chapter">${CHAPTER_LABELS[step.chapter] || step.chapter}</span>
        <h2 class="guide__title">${step.title}</h2>
        <div class="guide__body">
          ${step.body.map((p) => `<p>${p}</p>`).join('')}
        </div>
        ${changesHtml}
        ${calloutHtml}
      </article>
    `;

    // Prev / Next Nav
    const navEl = this.workspaceEl.querySelector('#guide-nav');
    const hasPrev = this.stepIdx > 0;
    const nextLesson = ALL_LESSONS[ALL_LESSONS.findIndex((l) => l.id === lesson.id) + 1];
    navEl.innerHTML = `
      <button class="btn-ghost" id="prev-step" type="button" ${hasPrev ? '' : 'disabled'}>← Previous</button>
      <span style="font-family:var(--font-mono);font-size:12px;color:var(--muted)">${this.stepIdx + 1} / ${lesson.steps.length}</span>
      ${
        this.stepIdx < lesson.steps.length - 1
          ? '<button class="btn-pop" id="next-step" type="button">Next →</button>'
          : nextLesson
            ? `<button class="btn-pop" id="next-lesson" type="button">Next lesson: ${nextLesson.title} →</button>`
            : '<button class="btn-pop" id="go-practice" type="button">Go to Practice →</button>'
      }
    `;
    navEl.querySelector('#prev-step')?.addEventListener('click', () => this._goStep(this.stepIdx - 1));
    navEl.querySelector('#next-step')?.addEventListener('click', () => this._goStep(this.stepIdx + 1));
    navEl.querySelector('#next-lesson')?.addEventListener('click', () => {
      location.hash = `#/learn/${nextLesson.id}/1`;
    });
    navEl.querySelector('#go-practice')?.addEventListener('click', () => {
      location.hash = '#/practice';
    });
  }

  _goStep(idx) {
    if (idx < 0 || idx >= this.lesson.steps.length) return;
    location.hash = `#/learn/${this.lesson.id}/${idx + 1}`;
  }

  _mountPracticeView() {
    this.workspaceEl.style.display = 'block';
    const item = COURSE.practices[0];
    this.selectedChoiceId = null;

    this.workspaceEl.innerHTML = `
      <div class="full-pane">
        <h1 class="lesson-head__title">${item.title}</h1>
        <p class="lesson-head__summary" style="margin-bottom:14px">${item.prompt}</p>
        <div class="sx" id="prac-metrics" style="margin-bottom:12px"></div>
        <div class="stage" id="prac-stage" style="height:320px;margin-bottom:16px"></div>
        <div class="choice-list" id="prac-choices"></div>
        <div id="prac-feedback"></div>
      </div>
    `;

    this.practiceStage = new IsoStage(this.workspaceEl.querySelector('#prac-stage'));
    const renderState = (metrics, scene, pickedChoice) => {
      this.workspaceEl.querySelector('#prac-metrics').innerHTML = item.metrics
        .map((m) => {
          const val = metrics[m.id];
          const tone = m.tone ? m.tone(val) : 'neutral';
          return `<div class="chip chip--${tone}"><div class="chip__label">${m.label}</div><div class="chip__val">${val}${m.unit || ''}</div></div>`;
        })
        .join('');
      this.practiceStage.setScene(scene);

      this.workspaceEl.querySelector('#prac-choices').innerHTML = item.choices
        .map((c) => {
          const picked = pickedChoice?.id === c.id;
          const cls = picked ? (c.correct ? 'is-correct' : 'is-wrong') : '';
          return `<button class="choice-btn ${cls}" data-cid="${c.id}" type="button"><strong>${picked ? (c.correct ? '✓ ' : '✕ ') : ''}</strong>${c.label}</button>`;
        })
        .join('');

      this.workspaceEl.querySelectorAll('[data-cid]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const chosen = item.choices.find((c) => c.id === btn.dataset.cid);
          renderState(chosen.afterMetrics || item.initialMetrics, chosen.afterScene || item.initialScene, chosen);
        });
      });

      this.workspaceEl.querySelector('#prac-feedback').innerHTML = pickedChoice
        ? `<div class="callout callout--${pickedChoice.correct ? 'tip' : 'warn'}">
            <div class="callout__head">${pickedChoice.correct ? 'Correct' : 'Not quite — watch what happens on the diagram'}</div>
            <div>${pickedChoice.explanation}</div>
          </div>`
        : '';
    };

    renderState(item.initialMetrics, item.initialScene, null);
  }

  _mountCheatsheetsView() {
    this.workspaceEl.style.display = 'block';
    this.workspaceEl.innerHTML = `
      <div class="full-pane">
        <h1 class="lesson-head__title" style="margin-bottom:14px">Cheatsheets</h1>
        <div class="cheat-grid">
          ${COURSE.cheatsheets
            .map(
              (c) => `
              <article class="cheat-card">
                <h3>${c.title}</h3>
                <ul style="margin:0;padding-left:18px;font-size:13.8px;color:var(--ink-2)">
                  ${c.items.map((it) => `<li style="margin-bottom:6px">${it}</li>`).join('')}
                </ul>
              </article>
            `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  _openSearch() {
    this.searchOpen = true;
    this.modalHost.innerHTML = `
      <div class="modal-backdrop" id="search-backdrop">
        <div class="modal" role="dialog" aria-label="Search lessons">
          <input class="modal__input" id="search-input" type="search" placeholder="Lesson or concept (e.g. cache, queue, p99)…" />
          <div class="modal__results" id="search-results"></div>
        </div>
      </div>
    `;
    const input = this.modalHost.querySelector('#search-input');
    const resultsEl = this.modalHost.querySelector('#search-results');

    const renderList = (q) => {
      const kw = q.trim().toLowerCase();
      const hits = ALL_LESSONS.filter(
        (l) => !kw || l.title.toLowerCase().includes(kw) || l.summary.toLowerCase().includes(kw)
      );
      resultsEl.innerHTML = hits.length
        ? hits
            .map(
              (l) => `
              <button class="lesson-link" data-jump="${l.id}" type="button">
                <span><strong>${l.title}</strong><br><small style="color:var(--muted)">${l.summary}</small></span>
              </button>
            `
            )
            .join('')
        : `<div style="padding:12px;color:var(--muted);font-size:13px">No matching lesson.</div>`;

      resultsEl.querySelectorAll('[data-jump]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this._closeSearch();
          location.hash = `#/learn/${btn.dataset.jump}/1`;
        });
      });
    };

    renderList('');
    input.focus();
    input.addEventListener('input', () => renderList(input.value));
    this.modalHost.querySelector('#search-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'search-backdrop') this._closeSearch();
    });
  }

  _closeSearch() {
    this.searchOpen = false;
    this.modalHost.innerHTML = '';
  }
}

new App(document.getElementById('app'));
