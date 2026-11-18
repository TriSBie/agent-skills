---
name: interactive-learning-sim
description: Build step-by-step interactive simulation learning websites - each concept is an animated isometric SVG diagram the learner steps through, with live metric chips, diff-style change lists, practice scenarios and cheatsheets. Ships a runnable Vite + vanilla JS starter and a lesson-data validator. Use when the user wants a visual, interactive technical course or explainer (system design, backend, databases, networking, queues, security, payments/loyalty flows), wants to add lessons to such a site, or asks for "web mô phỏng học", "khóa học tương tác", "interactive course", "animated system design diagrams". Do not use for plain Markdown docs or a single static chart.
license: MIT
---

# interactive-learning-sim

A learning site where **every concept is a live diagram the learner steps through**, instead of a long page of text. Each step changes three things together: the diagram (entities, links, moving packets), the metric chips (numbers that react), and the guide card (short explanation + `+ / − / ~` change list).

The engine and the lessons are separate. The engine projects coordinates, draws SVG entities, animates packets, pans/zooms and re-themes. A lesson is plain data (`steps[]`). Ten new lessons need zero new UI code.

## Files

| Path | Read when |
|---|---|
| `assets/starter-vanilla-vite/` | Starting a new site. Runnable: learn view, practice view, cheatsheets, ⌘K search, dark/light, hash router, keyboard nav. |
| `assets/tokens.json` | Rebranding or porting colors to Tailwind/Figma. Same values as `src/styles/main.css`, checked for WCAG AA by `scripts/check.mjs` at the repo root. |
| `scripts/validate-lessons.mjs` | After every edit to lesson data. |
| `references/architecture-and-schema.md` | Writing lesson data: `Course`, `Lesson`, `Step`, `Scene`, `PracticeItem` schema, router, storage, React/Next.js wrapper. |
| `references/stage-engines.md` | Changing the engine: isometric math, SVG layers, entity kinds, packets, fit/zoom, and the `Stage2D` spec. |
| `references/pedagogy-storyboard.md` | Planning a lesson: the 5-phase storyboard, causal metrics, callouts, practice questions. |
| `references/design-tokens-and-ui.md` | Styling: token roles, layout modes, BEM blocks, reduced motion. |

## What the starter has, and what it does not

- **Has**: `IsoStage` (isometric 2:1 SVG). Entity kinds `block`, `db`, `queue`, `device`, `crowd`, `zone`, `ghost`. Packet kinds `req`, `res`, `write`, `slow`, `drop`. Tones `paper`, `green`, `violet`, `orange`, `blue`, `danger`. Entity states `cpu`, `heat`, `dead`, `tags`. Learn, Practice (first item only), Cheatsheets.
- **Spec only, write it before use**: `Stage2D` (arrays, trees, call stacks, sequence diagrams) and `lesson.renderer: '2d'`; entity kinds `panel` and `ring`; Sandbox / Design Lab mode with sliders. The validator warns on unknown kinds.

## Workflow

1. **Scope.** Topic, audience, and modes: Learn (required), Practice (recommended), Cheatsheets (optional). Ask only if the answer changes the architecture.
2. **Pick the stage.** Infrastructure, services, data flow: isometric `IsoStage`. Algorithms, event loop, protocol sequences: a 2D stage (write `Stage2D` first, see `references/stage-engines.md` §6).
3. **Copy the starter** into the project; never edit the original. Rename `COURSE.title`, `storagePrefix`, the `sim:theme` key (in `index.html` and `main.js`), `<title>` and `<html lang>`. In React/Next.js, keep `IsoStage` as plain DOM and wrap it with `useRef` + `useEffect` calling `stage.setScene(step.scene)`; never push the 60fps packet loop into component state.
4. **Write lessons** in `src/lessons/course-data.js`, 5–8 steps each, following the 5 phases: `problem` → `baseline` → `bottleneck` (`heat`, `slow`/`drop` packets, red metrics) → `technique` (`changes: ['+ …', '~ …']`, metrics improve) → `tradeoff` (the cost). Several steps may share a phase.
5. **Verify**, in this order:
   1. `node <skill>/scripts/validate-lessons.mjs src/lessons/course-data.js` with **0 warnings**. It catches links to missing entities, flows on missing links, undeclared metric keys, unknown kinds, and entities whose labels would overlap on screen (it projects positions the same way the engine does).
   2. `npm run build`.
   3. Open the built site in a real browser **directly on a deep link** (`#/learn/<id>/<middle step>`, not from the home page). Console must be clean. Screenshot the step with the most entities, in light and dark.
   4. Arrow through every step: the view fits, no label is cut. Check `prefers-reduced-motion: reduce` still shows packet direction.

## Rules

1. **One cause, one effect per step.** The diagram, metrics and guide card change together and agree with each other. Numbers must be plausible and consistent across steps.
2. **Space entities 8–10 grid units apart** along the main axis. For a fork (cache + DB, two workers), offset the branches about ±5 on y *and* keep them a few units apart on x: the projection halves y, so a pure y offset stacks them vertically.
3. **Labels follow metrics.** When you copy a scene into the next step, update every `sub` that shows a number.
4. **Text contrast >= 4.5:1** in both themes. Change colors through `tokens.json` + `main.css` together and run `node scripts/check.mjs`.
5. **No third-party requests**: system and self-hosted fonts only, no CDN scripts.
6. **Content language**: write natural sentences in the course language; keep standard technical terms (latency, throughput, cache-aside, quorum, idempotency key) in English with a one-line explanation on first use.

## Known pitfalls (found on a real project)

- Deep links rendered a blank page because the app thought it was already in learn mode on first load. Fixed in the starter (`this.mode = null`); keep it if you refactor.
- Small scenes were zoomed 3–4x and labels overlapped. `fit()` now caps zoom at 1.6x; do not remove the cap.
- Link labels hid under the target box because the "middle point" of a 2-point line was its end. Fixed; labels sit at the true midpoint and size to their text.
- `Practice` shows only `COURSE.practices[0]`. Add a picker in `_mountPracticeView` for more.

## Do not copy

Names, logos, illustrations, copy or exact color palettes from any course site you use as inspiration. Take structure and behavior only.
