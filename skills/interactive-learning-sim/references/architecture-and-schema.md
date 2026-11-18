# Application Architecture & Lesson Schema

This document defines the data contract between the **UI Shell**, the **Stage Engine** and the **Lesson Data**. Adding a lesson must mean adding plain data only, with no UI code changes.

## Table of contents
1. [Overall architecture](#1-overall-architecture)
2. [Schema for Course, Module, Lesson and Step](#2-schema-for-course-module-lesson-and-step)
3. [Schema for Practice and Sandbox](#3-schema-for-practice-and-sandbox)
4. [Router, localStorage state & shortcuts](#4-router-localstorage-state--shortcuts)
5. [Multi-language (i18n) & narration (TTS)](#5-multi-language-i18n--narration-tts)
6. [Wrapping the engine in React / Next.js](#6-wrapping-the-engine-in-react--nextjs)

---

## 1. Overall architecture

```text
┌───────────────────────────────────────────────────────────────────┐
│                         Course Data (Pure JS/JSON)                │
│   modules[] ─▶ lessons[] ─▶ steps[] { metrics, guide, scene }     │
└───────────────────┬───────────────────────────────┬───────────────┘
                    │                               │
                    ▼                               ▼
┌───────────────────────────────────┐ ┌─────────────────────────────┐
│            UI Shell               │ │        Stage Engine         │
│ - Topbar (Modes, Search, Theme)   │ │ - IsoStage (Stage2D: write  │
│ - Sidebar (Module/Lesson Tree)    │ │   it yourself)              │
│ - Metric Strip (Animated numbers) │ │ - 6 SVG Layers              │
│ - Timeline & Guide Card + Diffs   │ │ - Smooth viewBox fit & pan  │
│                                   │ │ - 60fps Packet Flow Loop    │
└───────────────────────────────────┘ └─────────────────────────────┘
```

Invariants:
- `Course Data` **does not import the DOM and holds no event listeners**.
- `Stage Engine` only receives the `scene` of the current step (`stage.setScene(step.scene, options)`). It knows nothing about the sidebar or the router.

---

## 2. Schema for Course, Module, Lesson and Step

```js
/**
 * @typedef {Object} CourseSpec
 * @property {string} title           - Course name shown in the topbar
 * @property {string} subtitle        - Short course description
 * @property {string} storagePrefix   - localStorage prefix (e.g. 'sim:')
 * @property {ModuleSpec[]} modules   - List of modules
 * @property {PracticeItem[]} [practices]   - List of scenario practice items
 * @property {CheatsheetCard[]} [cheatsheets] - Quick-reference summary cards
 */

/**
 * @typedef {Object} ModuleSpec
 * @property {string} id              - Module identifier (e.g. 'foundations', 'scaling')
 * @property {string} num             - Display order number ('01', '02'...)
 * @property {string} title           - Module name
 * @property {'green'|'violet'|'orange'|'blue'|'rust'|'mint'} color - Folder label color
 * @property {LessonSpec[]} lessons
 */

/**
 * @typedef {Object} MetricDef
 * @property {string} id              - Key that matches step.metrics[id]
 * @property {string} label           - Label shown above the stage (e.g. 'p99 Latency')
 * @property {string} [unit]          - Unit ('ms', 'req/s', '%', '')
 * @property {(val: any) => 'ok'|'warn'|'bad'|'neutral'} [tone] - Rule that sets the metric chip color
 */

/**
 * @typedef {Object} LessonSpec
 * @property {string} id              - Unique slug in the URL (#/<id>/<step>)
 * @property {string} title           - Lesson title
 * @property {string} summary         - One-sentence summary under the title
 * @property {number} minutes         - Estimated reading and interaction time (minutes)
 * @property {'Basic'|'Intermediate'|'Advanced'|string} level
 * @property {'iso'|'2d'} [renderer='iso'] - Picks the stage engine (the starter only has 'iso')
 * @property {MetricDef[]} metrics    - Quantitative metric strip above the stage (3–5 chips is ideal)
 * @property {StepSpec[]} steps       - Storyboard steps (usually 5–9)
 */

/**
 * @typedef {Object} StepSpec
 * @property {string} short           - Short label (2–4 words) on the timeline bar
 * @property {'problem'|'baseline'|'bottleneck'|'technique'|'tradeoff'} chapter
 * @property {string} title           - Title of the current step
 * @property {string[]} body          - Short explanation paragraphs (inline <code>, <strong>, <em> allowed)
 * @property {{ kind: 'tip'|'insight'|'warn'|'next', title?: string, text: string }} [callout]
 * @property {string[]} [changes]     - Diff against the previous step: each starts with '+ ', '- ', or '~ '
 * @property {Record<string, number|string|null>} metrics - Metric values at this step (null = show '—')
 * @property {SceneSpec} scene        - Graphic state on the stage
 */
```

### `SceneSpec` structure for the Isometric Engine

```js
/**
 * @typedef {Object} SceneSpec
 * @property {Record<string, EntitySpec>} entities - Entity map keyed by ID
 * @property {Record<string, LinkSpec>} [links]    - Connections between two entities
 * @property {FlowSpec[]} [flows]                  - Packet flows moving along links
 */

/**
 * @typedef {Object} EntitySpec
 * @property {'block'|'db'|'queue'|'device'|'crowd'|'zone'|'ghost'|'panel'|'ring'} kind - 'panel'/'ring' are not in the starter
 * @property {[number, number, number?]} pos       - Grid coordinates [x, y, z=0]
 * @property {string} [label]                      - Main name of the entity
 * @property {string} [sub]                        - Secondary label (e.g. '8 GB RAM', 'Primary')
 * @property {'paper'|'green'|'violet'|'orange'|'blue'|'danger'} [tone='paper']
 * @property {number} [w=2.2]                      - Width along the grid X axis (for block/zone)
 * @property {number} [d=2.2]                      - Depth along the grid Y axis (for block/zone)
 * @property {number} [h=22]                       - Height in pixels along the Z axis
 * @property {number} [cpu]                        - Load 0..1 (draws a load bar on top of the block; < 0 turns it off)
 * @property {boolean|number} [heat]               - Overloaded: paints the edge/faces in a hot red warning tone
 * @property {boolean|number} [dead]               - Out of service: dims the entity and adds a cross/DOWN label
 * @property {{ text: string, tone?: 'green'|'amber'|'red'|'violet'|'blue' }[]} [tags] - Floating badges above the entity
 */

/**
 * @typedef {Object} LinkSpec
 * @property {string} from                         - Source entity ID
 * @property {string} to                           - Target entity ID
 * @property {[number, number, number?][]} [via]   - Intermediate bend points on the grid (if the link is not straight)
 * @property {'solid'|'dashed'|'cut'|'off'} [style='solid']
 * @property {'end'|'both'|'none'} [heads='end']   - Arrow heads
 * @property {string} [label]                      - Label on the middle of the link (e.g. 'SQL', 'gRPC', '20 ms')
 */

/**
 * @typedef {Object} FlowSpec
 * @property {string} link                         - ID of a link in scene.links
 * @property {'req'|'res'|'write'|'slow'|'heavy'|'drop'|'ping'} [kind='req']
 * @property {number} [rate=1.2]                   - Particles spawned per second
 * @property {number} [speed=0.55]                 - Speed along the link (path length per second)
 * @property {boolean} [reverse=false]             - Run backwards from `to` to `from` (use for responses)
 */
```

---

## 3. Schema for Practice and Sandbox

### Practice Mode (fix an incident on a real diagram)
Each Practice question ships a prebuilt `scene` that has a problem (for example: the DB is at 98% load during a flash sale) and 3–4 intervention choices. When the learner picks a choice, the stage switches to that choice's `resultScene`. The learner **sees the consequence** and not only a Correct/Wrong text:

```js
/**
 * @typedef {Object} PracticeItem
 * @property {string} id
 * @property {string} title
 * @property {string} prompt                - Description of the situation and constraints
 * @property {MetricDef[]} metrics
 * @property {Record<string, number|string|null>} initialMetrics
 * @property {SceneSpec} initialScene       - Diagram while the problem is happening
 * @property {Array<{
 *   id: string,
 *   label: string,
 *   correct: boolean,
 *   explanation: string,
 *   afterMetrics?: Record<string, number|string|null>,
 *   afterScene?: SceneSpec
 * }>} choices
 */
```

### Design Lab / Sandbox Mode
> The starter does not include this mode. The section below is a spec to implement yourself.

Instead of fixed `steps[]`, a Sandbox defines a pure function `(params) => ({ metrics, scene, notes })`:
- `controls[]`: list of sliders (`range`), switches (`toggle`) or selectors (`select`). Examples: `rps` (100 → 50,000), `cacheEnabled` (false/true), `cacheHitRatio` (0.5 → 0.99), `dbReplicas` (0 → 4).
- Each time the learner moves a control, call the function again to update `metrics` and `stage.setScene(scene, { preserveView: true })`.

---

## 4. Router, localStorage state & shortcuts

- **Lightweight hash router (no server rewrite needed):**
  - `#/` or `#/learn/<lesson-id>/<step-index>` (1-indexed or 0-indexed, but be consistent; recommended: `1..N` in the URL for readers and `0..N-1` internally).
  - `#/practice` or `#/practice/<id>`
  - `#/lab`
  - `#/cheatsheets`
- **Safe `localStorage` use (always wrap in `try/catch` for Safari Private Mode):**
  - `<prefix>theme`: `'light' | 'dark'`
  - `<prefix>done`: array of lesson IDs where the learner reached the last step
  - `<prefix>last`: path of the lesson currently in progress
- **Standard shortcuts:**
  - `ArrowRight` / `ArrowLeft`: next step / previous step (ignore while typing in `<input>`/`<textarea>`).
  - `Ctrl+K` / `Meta+K`: open the quick search for lessons and terms; `Escape` closes it.
  - `Fit` button in the stage corner: call `stage.fit(true)` to re-center the diagram in the viewport after the learner drags or zooms by hand.

---

## 5. Multi-language (i18n) & narration (TTS)

- **Single language only:** write the strings directly in the lesson data. Do not add a dictionary layer that is not needed.
- **Multiple languages:** use lazy-loaded dictionary chunks with the `import.meta.glob('./locales/*/*.js')` pattern so the first load does not carry every language. Put a script that sets `data-start-lang` in `<head>` to avoid a text flash.
- **If the course content is in another language,** write natural sentences in that language and keep standard technical terms in English.
- **Lesson narration (optional TTS):** use the browser's built-in `window.speechSynthesis` and `SpeechSynthesisUtterance`. Join `step.title + '. ' + step.body.join(' ')` (with HTML tags stripped). Always call `speechSynthesis.cancel()` when the learner changes step or lesson.

---

## 6. Wrapping the engine in React / Next.js

When integrating into an existing React/Next.js project, **do not** draw each packet particle through React state (`useState` 60 times per second lags the whole page). Keep the `IsoStage` class and let it drive the SVG directly through a `ref`:

```tsx
import { useEffect, useRef } from 'react';
import { IsoStage } from '../engine/iso-stage';
import type { SceneSpec } from '../types/lesson';

export function SimulationStage({ scene, theme }: { scene: SceneSpec; theme: 'light' | 'dark' }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<IsoStage | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const stage = new IsoStage(hostRef.current);
    stageRef.current = stage;
    return () => stage.destroy();
  }, []);

  useEffect(() => {
    stageRef.current?.setScene(scene);
  }, [scene]);

  useEffect(() => {
    stageRef.current?.retheme();
  }, [theme]);

  return <div ref={hostRef} className="stage-canvas" />;
}
```
