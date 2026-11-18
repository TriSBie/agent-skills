# Design Tokens & UI System (warm paper theme)

A visual style that keeps a learning simulation readable for hours without eye strain: **a warm technical-paper background, sharp ink borders, light hard drop shadows like a technical graphics book, a monospace font for clear numbers, and a neutral charcoal dark mode**.

## Table of contents
1. [CSS variable table (`:root` and `[data-theme="dark"]`)](#1-css-variable-table-root-and-data-themedark)
2. [Anti-FOUC `<head>` script & layout selection](#2-anti-fouc-head-script--layout-selection)
3. [Paper surface (dot grid)](#3-paper-surface-dot-grid)
4. [Responsive rules with `data-layout`](#4-responsive-rules-with-data-layout)
5. [Standard UI block catalog (BEM blocks)](#5-standard-ui-block-catalog-bem-blocks)
6. [Motion & accessibility (`prefers-reduced-motion`)](#6-motion--accessibility-prefers-reduced-motion)

---

## 1. CSS variable table (`:root` and `[data-theme="dark"]`)

The source of truth is `assets/starter-vanilla-vite/src/styles/main.css` (CSS) and `assets/tokens.json` (W3C Design Tokens, checked by `node scripts/check.mjs`). Do not copy hex values from this page; it lists roles only.

| Token | Role | Light | Dark |
|---|---|---|---|
| `--paper`, `--paper-2`, `--sheet`, `--card`, `--card-2` | Surfaces, warm off-white to cool charcoal | `#f2eee5` … | `#1a1c1f` … |
| `--ink`, `--ink-2`, `--muted` | Text; all pass 4.5:1 on every surface | `#1f2328` / `#383d44` / `#5b6068` | `#ece8e1` / `#d3cfc7` / `#a6a29b` |
| `--muted-2` | Decoration only, never text | `#80858c` | `#8a867f` |
| `--line`, `--line-soft`, `--line-strong`, `--edge` | Borders; `--edge` is the "ink pen" border on pop buttons | | |
| `--green`/`--green-ink`, `--violet`/`--violet-ink`, `--orange`/`--orange-ink`, `--blue`/`--blue-ink` | Pastel fill + matching text color for tags, diffs, chips | | |
| `--rust`, `--danger`, `--danger-bg` | Warning text, error text, error background | | |
| `--radius` 12px, `--radius-sm` 8px, `--pop-shadow` `1.5px 2.5px 0 var(--drop)` | Shape | | |

Rebrand by changing the surfaces and the four accent pairs together, then run `node scripts/check.mjs` from the repo root: it fails on any text/background pair under 4.5:1.

> **Font note for accented scripts (e.g. Vietnamese):** `JetBrains Mono` works well for diagram labels, metric chips (`metrics`), badges, inline code and the timeline bar. For long explanation paragraphs (`guide__body`) in a language with stacked diacritics, use `var(--font-sans)`, or use `JetBrains Mono` only if it fully supports that language's diacritics, so tone marks stay sharp.

---

## 2. Anti-FOUC `<head>` script & layout selection

Put this very short synchronous script in the `<head>` of `index.html`, before the main module loads:

```html
<script>
  try {
    var savedTheme = localStorage.getItem('sim:theme');
    if (savedTheme === 'dark' || (!savedTheme && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.dataset.theme = 'dark';
    }
  } catch (e) {}
  var w = window.innerWidth, h = window.innerHeight;
  document.documentElement.dataset.layout =
    w >= 1200 && h >= 560 ? 'desktop' : w >= 960 && h >= 600 ? 'tablet' : 'stack';
</script>
```

In the runtime JS, listen to the `resize` event and update `document.documentElement.dataset.layout` with the same thresholds.

---

## 3. Paper surface (dot grid)

A faint dot grid on `body::before` gives the "graph paper" feel with no image and no filter cost:

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
  opacity: 0.5;
  background-image: radial-gradient(var(--line-soft) 0.8px, transparent 0.8px);
  background-size: 18px 18px;
}
```

---

## 4. Responsive rules with `data-layout`

Why use `data-layout`, which checks width and height, and not only `@media (min-width)`?
- A short laptop screen (`1280×520` with DevTools open) flattens the SVG stage if the layout splits vertically in the wrong way.
- Three standard layout modes:
  1. **`[data-layout="desktop"]` (`w >= 1200 && h >= 560`):** 3-column frame with a fixed `100dvh` height and no outer page scroll: `Sidebar (250px)` | `Stage + Metric Strip (1fr)` | `Guide column + Timeline (400px–430px, scrolls internally)`. The learner watches the live diagram and reads the explanation beside it.
  2. **`[data-layout="tablet"]` (`w >= 960 && h >= 600`):** Hide the Sidebar behind a slide-out Drawer button. Keep a two-way split: `Stage (1fr)` | `Guide column (380px)`.
  3. **`[data-layout="stack"]` (narrow screen / mobile):** Stack vertically: `Topbar` → `Lesson Header` → `Metric Strip` → `SVG Stage (~320px–380px high)` → `Timeline` → `Guide Card`.

---

## 5. Standard UI block catalog (BEM blocks)

- **`.topbar`**: Contains `.brand` (hand-drawn SVG logo + course name), `.nav` (tab buttons `Learn`, `Practice`, `Design Lab`, `Cheatsheets`, with `.btn-pop.is-active` raised by the hard shadow `--pop-shadow`), the `.search` button (`Ctrl+K`) and the theme toggle `.theme-btn`.
- **`.sidebar`**: Course tree split by `.mod` (module). Each module has a colored dot/folder `.folder--{green,violet,orange,blue}` and a lesson list with completion ticks.
- **`.sx` (Metric Strip)**: Row of `.chip` cards right above the stage. When a value changes from the previous step, add the class `.is-changed` to trigger the `chip-flash` animation.
- **`.stage`**: Container for `<svg class="stage-svg">`. The lower-right corner holds the floating `.stage__tools` buttons (`Fit`, `Pause/Play`) and the lower-left corner holds the packet color legend (`.legend`).
- **`.timeline`**: Row of step buttons `1..N` with the `step.short` label, the `.progress` bar and the `Prev` / `Next` buttons.
- **`.guide__card`**: Lesson card with the cognitive-phase badge (`chapter`), the step title, the `.guide__body` content, the `.callout--{tip,insight,warn,next}` note box, and the `.changes` frame that shows each row as `.chg--add` (`+`, light green background), `.chg--del` (`−`, light red background), `.chg--mod` (`~`, light orange background).

---

## 6. Motion & accessibility (`prefers-reduced-motion`)

Always respect the OS reduced-motion setting, at the end of the CSS file and in the Stage Engine:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In the Stage Engine: if `matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, place packet particles statically and evenly along the link (e.g. at `progress = 0.35` and `0.75`). The learner still sees the direction of data flow without continuous motion that causes dizziness.
