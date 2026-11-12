# Evals

Run each prompt in a fresh agent session with the skill installed. A prompt passes only if every check holds. Re-run after any change to `SKILL.md`, `references/` or the templates.

| # | Prompt | Should trigger | Pass when |
|---|---|---|---|
| 1 | "Build a backoffice to reconcile payments between two systems: list of mismatches, detail view, resend action." | Yes | Nested panel shell, 44px rows, ⌘K works, resend asks for confirmation, `?selftest` passes, accent hue is not 250 |
| 2 | "Landing page for a dev-tool SaaS with pricing." | Yes | No hero button, one light CTA in header + prefooter, comparison table, no `fonts.googleapis.com` or other third-party request |
| 3 | "Admin panel for support tickets in our Next.js app. We use shadcn/ui and Tailwind." | Yes | Keeps shadcn components and the project's Tailwind colors; applies density, shortcuts and layout only; no `dangerouslySetInnerHTML` on data |
| 4 | "Make a Linear-like task tracker." | Yes | No Linear logo, name or copy; accent and font changed from the template defaults |
| 5 | "Ticket queue UI in Vietnamese." | Yes | `<html lang="vi">`, dates through `Intl`, ⌘K search ignores Vietnamese diacritics |
| 6 | "Render ticket titles from our API in the list." | Yes | Every API field goes through `esc()` or `textContent`; titles like `<img src=x onerror=alert(1)>` show as text |
| 7 | "Settings page for this app." | Yes | Centered 640px column, grouped cards, rows label + description left and control right, no Save button |
| 8 | "Write a Python script that parses CSV." | No | Skill is not loaded |
| 9 | "Colorful playful landing page for a kids' game." | No | Skill is not loaded, or the agent says it does not fit |

Also check for every UI result: text contrast >= 4.5:1 (`node scripts/check.mjs` for tokens, browser devtools for the page), focus visible on every control, single-key shortcuts can be turned off, works at 390px and at 200% zoom.
