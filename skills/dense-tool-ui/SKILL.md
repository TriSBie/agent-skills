---
name: dense-tool-ui
description: Layout, interaction and color reference for dense, keyboard-first work tools (Linear-style issue trackers) and their dark marketing landing pages, measured from a real product in Nov 2026, with two runnable HTML templates. Use when building a web app, dashboard, admin panel or backoffice for issues, tasks, tickets, queues or reviews, or a SaaS/dev-tool landing page, or when the user asks for a "Linear-like" UI.
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

## Workflow

1. Copy the matching template into the project. Never edit the originals.
2. Rebrand: set `--accent-h` (e.g. teal 190, orange 50, green 150) and `--font`, then product name, data and copy. Rename the `app-theme` localStorage key.
3. Replace the sample data. Keep the DOM shapes: `.grp > .row`, `.col > .card`, `.detail > .doc + .props`.
4. Add commands to `CMDS` as `[label, [keys], fn]`. Single-key shortcuts go in the `keydown` listener, which already ignores typing in inputs.
5. Read the relevant `references/` file before adding a screen the template does not have.
6. Verify: open `file.html?selftest` and expect the tab title `SELFTEST OK <n>`. Then look at 1280px and 390px, dark and light.

## Rules

1. **Density first**: 13px body, 44px rows, no row dividers, no decorative icons. Color only for status, labels and one primary button per screen.
2. **Depth from background steps**, not gradients, glows or blur (not even behind ⌘K). Borders are 1px low-alpha ring shadows.
3. **Every action has a shortcut, and the shortcut is visible** in buttons, menus and tooltips. Context-aware ⌘K. `Ctrl/⌘+Enter` submits.
4. **Edit in place, save instantly**: no Save buttons. Properties are buttons that open pickers. Creation ends in a toast with a link.
5. **Empty states act**: thin line illustration, one sentence, a primary button showing its shortcut.
6. **Delete is soft**: confirm, keep it restorable, state the retention period.
7. List and board are the same data. "Display options" lets users pick grouping, ordering and visible columns.
8. Landing: almost monochrome, two text tones for emphasis, one light CTA repeated in header and prefooter, the real product as the hero image.

## Do not copy

Logos, product names, illustrations, icon sets, marketing images or copy from the source product. Take measurements, structure and behavior only.
