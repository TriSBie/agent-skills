---
name: dense-tool-ui
description: Design system v1 for dense, keyboard-first work tools (issue trackers, backoffice, admin, review queues) and their monochrome SaaS landing pages - layout, interaction, WCAG AA tokens and two runnable HTML templates with self-tests. Use when building a web app, dashboard, admin panel or backoffice for issues, tasks, tickets, queues or reviews, or a SaaS/dev-tool landing page, or when the user asks for a Linear-like or "calm dense tool" UI.
license: MIT
---

# dense-tool-ui

A measured reference for the "calm, dense, keyboard-first" tool UI: nested content panel, 44px rows with no dividers, ⌘K command palette, inline editing, LCH gray steps instead of shadows. Plus the matching monochrome landing page.

Copy the **structure and behavior**, never the brand. Dark + Inter + purple accent is exactly what AI generators produce by default: always change `--accent-h` and `--font` for the project.

## Files

| Path | Read when |
|---|---|
| `assets/app-template.html` | Building an app/dashboard/backoffice. Runnable shell: list/board, detail, ⌘K, create modal, toasts, dark/light, `?selftest`. |
| `assets/landing-template.html` | Building a landing page. Blur header, hero + product shot, manifesto, feature section + spec drawer, changelog, testimonials, pricing + compare table, footer. `?selftest`. |
| `references/app.md` | Exact sizes for shell, sidebar, list, board, issue/project detail, modals, ⌘K, filter menu, shortcuts. |
| `references/tokens.md` | Color steps (dark + light), type scale, radii, shadows, easing. |
| `references/landing.md` | Landing, pricing and customers page anatomy, responsive breakpoints, marketing tokens. |
| `assets/tokens.json` | The same tokens in W3C Design Tokens JSON, for Style Dictionary, Tailwind theme or Figma import. |
| `evals/prompts.md` | Test prompts with pass criteria. Run them after changing the skill. |

## Workflow

0. **Look for an existing design system first.** If the project already has tokens or a component library (Tailwind config, shadcn/ui, MUI, Ant Design, a company kit), keep its colors, fonts and components. Apply only this skill's layout, density and interaction rules on top, and map the token names in `tokens.json` onto theirs. Never overwrite a company palette.
1. Copy the matching template into the project. Never edit the originals.
2. Rebrand: set `--accent-h` (e.g. teal 190, orange 50, green 150) and `--font`, then product name, data and copy. Keep accent lightness at L44 or lower so white text on it passes AA. Rename the `app-theme` and `app-keys` localStorage keys. Set `<html lang>` to the product language; dates render through `Intl` from ISO strings.
3. Replace the sample data. Keep the DOM shapes: `.grp > .row`, `.col > .card`, `.detail > .doc + .props`. Pass **every** data field through `esc()` before it reaches `innerHTML`, attributes included, or build nodes with `textContent`. In a framework (React, Vue) use its normal binding and never `dangerouslySetInnerHTML` / `v-html` on data.
4. Add commands to `CMDS` as `[label, [keys], fn]`. Single-key shortcuts go in the `keydown` listener, which already ignores typing in inputs.
5. Read the relevant `references/` file before adding a screen the template does not have.
6. Verify: open `file.html?selftest` and expect the tab title `SELFTEST OK <n>`. Then look at 1280px and 390px, dark and light, and at 200% browser zoom. Keep the selftest passing when you change the template; add an assertion for each new screen.

## Rules

1. **Density first**: 13px body, 44px rows, no row dividers, no decorative icons. Color only for status, labels and one primary button per screen.
2. **Depth from background steps**, not gradients, glows or blur (not even behind ⌘K). Borders are 1px low-alpha ring shadows.
3. **Every action has a shortcut, and the shortcut is visible** in buttons, menus and tooltips. Context-aware ⌘K. `Ctrl/⌘+Enter` submits.
4. **Edit in place, save instantly**: no Save buttons. Properties are buttons that open pickers. Creation ends in a toast with a link.
5. **Empty states act**: thin line illustration, one sentence, a primary button showing its shortcut.
6. **Delete is soft**: confirm, keep it restorable, state the retention period.
7. List and board are the same data. "Display options" lets users pick grouping, ordering and visible columns.
8. Landing: almost monochrome, two text tones for emphasis, one light CTA repeated in header and prefooter, the real product as the hero image.
9. **WCAG 2.2 AA is the floor**: text tokens (`--ink` to `--ink-3`) are >= 4.5:1 on every background; `--ink-4` is for decoration and disabled states only. Every dialog traps focus (`inert` on the app) and returns it on close. Single-key shortcuts can be turned off (`toggleKeys`, WCAG 2.1.4). Never remove focus outlines.
10. **No third-party requests by default**: system font stack, no CDN fonts or scripts. Self-host a brand font with `@font-face` if needed, so the page works under a strict CSP and without sending visitor IPs to another company.

## Do not copy

Logos, product names, illustrations, icon sets, marketing images or copy from the source product. Take measurements, structure and behavior only.
