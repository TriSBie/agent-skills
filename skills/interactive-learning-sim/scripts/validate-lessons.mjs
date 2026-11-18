#!/usr/bin/env node
/**
 * Validate interactive learning simulation course / lesson data files.
 * Usage:
 *   node validate-lessons.mjs <path-to-course-data.js-or-.json>
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';

const targetArg = process.argv[2];
if (!targetArg) {
  console.error('Usage: node validate-lessons.mjs <path-to-course-data.js|.json>');
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

// Kinds with dedicated drawing code in assets/starter-vanilla-vite/src/engine/iso-stage.js.
const STARTER_KINDS = new Set(['block', 'db', 'queue', 'device', 'crowd', 'zone', 'ghost']);
// Same projection as iso() in the engine (TILE_W 14, TILE_H 7), z ignored.
const screen = ([x, y]) => [14 * (x + y), 7 * (x - y)];
const LABEL_W = 90; // label text width
const LABEL_H = 100; // tag above the box down to the sub-label below it

const errors = [];
const warnings = [];

function err(ctx, msg) {
  errors.push(`[ERROR] ${ctx}: ${msg}`);
}
function warn(ctx, msg) {
  warnings.push(`[WARN]  ${ctx}: ${msg}`);
}

async function loadData(filePath) {
  if (filePath.endsWith('.json')) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  const mod = await import(pathToFileURL(filePath).href);
  return mod.COURSE || mod.default || mod.LESSONS || mod;
}

function validateScene(scene, ctx) {
  if (!scene || typeof scene !== 'object') {
    err(ctx, 'Missing `scene` object');
    return;
  }
  const entities = scene.entities || {};
  const entityIds = Object.keys(entities);
  if (entityIds.length === 0) {
    warn(ctx, 'Scene has 0 entities');
  }

  const occupied = new Map(); // id -> pos
  for (const [id, ent] of Object.entries(entities)) {
    if (!ent || typeof ent !== 'object') {
      err(`${ctx}.entities.${id}`, 'Entity must be an object');
      continue;
    }
    if (!ent.kind) {
      err(`${ctx}.entities.${id}`, 'Missing `kind` (e.g. block, db, queue, device, zone)');
    } else if (!STARTER_KINDS.has(ent.kind)) {
      warn(`${ctx}.entities.${id}`, `kind "${ent.kind}" is not drawn by the starter IsoStage (falls back to a plain box); implement it first`);
    }
    if (!Array.isArray(ent.pos) || ent.pos.length < 2 || typeof ent.pos[0] !== 'number' || typeof ent.pos[1] !== 'number') {
      err(`${ctx}.entities.${id}`, 'Invalid `pos`: expected [x, y] or [x, y, z] numbers');
    } else if (ent.kind !== 'zone' && ent.kind !== 'ring') {
      // Compare on screen, not on the grid: iso() halves the y axis, so grid distance misses vertical collisions.
      // Each entity's footprint (tag above, box, label + sub below) is roughly LABEL_W x LABEL_H px.
      const [sx, sy] = screen(ent.pos);
      for (const [otherId, [ox, oy]] of occupied) {
        if (Math.abs(sx - ox) < LABEL_W && Math.abs(sy - oy) < LABEL_H) {
          warn(`${ctx}.entities.${id}`, `Overlaps "${otherId}" on screen (dx ${Math.abs(sx - ox)}px, dy ${Math.abs(sy - oy)}px); move them further apart`);
        }
      }
      occupied.set(id, [sx, sy]);
    }
  }

  const links = scene.links || {};
  for (const [linkId, link] of Object.entries(links)) {
    if (!link.from || !entities[link.from]) {
      err(`${ctx}.links.${linkId}`, `Invalid \`from: "${link.from}"\` (entity does not exist in scene)`);
    }
    if (!link.to || !entities[link.to]) {
      err(`${ctx}.links.${linkId}`, `Invalid \`to: "${link.to}"\` (entity does not exist in scene)`);
    }
    if (link.from && link.from === link.to) {
      warn(`${ctx}.links.${linkId}`, 'Self-loop link (`from === to`)');
    }
  }

  const flows = scene.flows || [];
  if (!Array.isArray(flows)) {
    err(ctx, '`scene.flows` must be an array');
  } else {
    flows.forEach((flow, idx) => {
      if (!flow.link || !links[flow.link]) {
        err(`${ctx}.flows[${idx}]`, `Flow references unknown link "${flow.link}"`);
      }
    });
  }
}

function validateLesson(lesson, seenLessonIds, ctx) {
  if (!lesson.id || typeof lesson.id !== 'string') {
    err(ctx, 'Lesson is missing string `id`');
  } else if (seenLessonIds.has(lesson.id)) {
    err(ctx, `Duplicate lesson id "${lesson.id}"`);
  } else {
    seenLessonIds.add(lesson.id);
  }

  const lCtx = `${ctx}(${lesson.id || 'unnamed'})`;
  if (!lesson.title) err(lCtx, 'Missing `title`');
  if (!Array.isArray(lesson.steps) || lesson.steps.length === 0) {
    err(lCtx, 'Lesson must have a non-empty `steps` array');
    return;
  }

  const metricIds = new Set((lesson.metrics || []).map((m) => m.id));

  lesson.steps.forEach((step, idx) => {
    const sCtx = `${lCtx}.steps[${idx}]`;
    if (!step.short) err(sCtx, 'Missing `short` timeline label');
    if (!step.title) err(sCtx, 'Missing `title`');
    if (!Array.isArray(step.body) || step.body.length === 0) {
      err(sCtx, '`body` must be a non-empty array of paragraphs');
    }
    if (step.metrics && metricIds.size > 0) {
      for (const key of Object.keys(step.metrics)) {
        if (!metricIds.has(key)) {
          err(sCtx, `Step metric key "${key}" is not declared in lesson.metrics`);
        }
      }
    }
    validateScene(step.scene, sCtx);
  });
}

const raw = await loadData(resolvedPath);
const seenModuleIds = new Set();
const seenLessonIds = new Set();
let totalLessons = 0;
let totalSteps = 0;

if (Array.isArray(raw.modules)) {
  raw.modules.forEach((mod, mIdx) => {
    const mCtx = `modules[${mIdx}]`;
    if (!mod.id) err(mCtx, 'Missing module `id`');
    else if (seenModuleIds.has(mod.id)) err(mCtx, `Duplicate module id "${mod.id}"`);
    else seenModuleIds.add(mod.id);

    if (!Array.isArray(mod.lessons) || mod.lessons.length === 0) {
      warn(mCtx, `Module "${mod.id}" has 0 lessons`);
      return;
    }
    mod.lessons.forEach((lesson, lIdx) => {
      totalLessons++;
      totalSteps += Array.isArray(lesson.steps) ? lesson.steps.length : 0;
      validateLesson(lesson, seenLessonIds, `${mCtx}.lessons[${lIdx}]`);
    });
  });
} else if (Array.isArray(raw)) {
  raw.forEach((lesson, idx) => {
    totalLessons++;
    totalSteps += Array.isArray(lesson.steps) ? lesson.steps.length : 0;
    validateLesson(lesson, seenLessonIds, `lessons[${idx}]`);
  });
} else if (raw && Array.isArray(raw.steps)) {
  totalLessons = 1;
  totalSteps = raw.steps.length;
  validateLesson(raw, seenLessonIds, 'lesson');
} else {
  err('root', 'Unrecognized export structure: expected `{ modules: [...] }`, `Lesson[]`, or a single `Lesson` object');
}

if (Array.isArray(raw.practices)) {
  raw.practices.forEach((p, idx) => {
    const pCtx = `practices[${idx}](${p.id || 'unnamed'})`;
    if (!p.title || !p.prompt) err(pCtx, 'Practice item requires `title` and `prompt`');
    validateScene(p.initialScene, `${pCtx}.initialScene`);
    if (!Array.isArray(p.choices) || !p.choices.some((c) => c.correct)) {
      err(pCtx, 'Practice item must have `choices[]` with at least one `correct: true`');
    }
    (p.choices || []).forEach((c, cIdx) => {
      if (c.afterScene) validateScene(c.afterScene, `${pCtx}.choices[${cIdx}].afterScene`);
    });
  });
}

for (const w of warnings) console.warn(w);
for (const e of errors) console.error(e);

if (errors.length > 0) {
  console.error(`\nValidation FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`Validation PASSED: ${totalLessons} lesson(s), ${totalSteps} step(s), ${warnings.length} warning(s).`);
