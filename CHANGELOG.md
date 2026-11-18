# Changelog

Versions follow semver. The version lives in `.claude-plugin/marketplace.json`.

## 0.4.0 (Unreleased)

- **New skill: rea-software-architecture.** Trace operations from authorized, redacted text artifacts, with a synthetic example and an evidence-based expected report. No target execution or network access to the target is required.

## 0.3.0 (2026-11-18)

- **New skill: interactive-learning-sim.** Step-by-step simulation courses: isometric SVG stage, lesson data schema, 5-phase storyboard method, runnable Vite starter (learn, practice, cheatsheets, ⌘K, dark/light), `tokens.json`, evals and a lesson-data validator.
- Fixed in the starter after a trial project: blank page on deep links, over-zoomed small scenes (zoom capped at 1.6x), link labels hidden under the target box, link label width now fits the text.
- Validator warns on unknown entity kinds and on entities whose labels would overlap on screen (checked in projected pixels, so vertical branches are caught too).
- `scripts/check.mjs` also runs each skill's lesson validator.

## 0.2.0 (2026-11-12)

dense-tool-ui becomes "design system v1": stable tokens that pass WCAG AA, instead of raw measurements that drift.

- **Existing design system first**: new workflow step 0. Keep a project's own tokens and component library, apply only layout and behavior.
- **Accessibility**: light `--ink-3` darkened to `#66656e` (4.4 to 4.6:1+); `--ink-4` is now decoration-only and every text use moved to `--ink-3`; accent lightness 48 to 44 so white text passes 4.5:1 for any hue; single-key shortcuts can be turned off (WCAG 2.1.4).
- **Security**: `esc()` now escapes `'`; IDs, label colors and dates are escaped too; the landing spec table is escaped; both selftests try an injection payload.
- **No third-party requests**: landing template uses the system font stack instead of Google Fonts; selftest fails on any external link or script.
- **i18n**: dates are ISO in data and formatted with `Intl` from `<html lang>`.
- Fixed: new issue IDs are computed from the highest existing ID.
- Added `assets/tokens.json` (W3C Design Tokens), `evals/prompts.md`, `scripts/check.mjs` and a GitHub Actions workflow.

## 0.1.0 (2026-11-10)

- dense-tool-ui: app and landing templates with selftests, references for app, tokens and landing.
- 2026-11-11: vercel-dashboard-crm added.
