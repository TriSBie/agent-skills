# Vercel Dashboard CRM

Build a CRM or dashboard-management website in the design language of the live Vercel team dashboard — the system observed at `vercel.com/trisbies-projects` on 11/11/2026, signed in as trisbie, team `trisbies-projects` (Hobby), 1919×998 viewport, 12 projects. Learn the system, do not copy the brand.

- Read `references/vercel-dashboard.md` before building, and `references/design-tokens.md` for the token tables with verification levels. Read `references/crm-patterns.md` for how each Vercel pattern maps to a CRM entity. Read `references/geist-tokens.md` for the published Geist colour scales and materials, and `references/vercel-detail-pages.md` for the project-detail, Deployments-list and Settings patterns from pass 2 (11/11/2026). Read `references/vercel-interactions.md` for the full interaction spec from pass 3 (11/11/2026): hover is a light-grey wash only, actions live in ••• menus, Cmd+K palette, notifications, team switcher, dialogs, skeletons, disabled states, and everything not yet verified.
- Treat every hex marked sampled (⚠️) as evidence from a rendered screenshot, not a computed CSS token. Never present a sampled hex as a verified design token.
- Never copy the Vercel triangle, wordmark, brand name, original copy, project names, or screenshots. Write all copy fresh for the user's own product, and change the accent hue slightly if the blue is kept.

## When to use this skill

- The user asks for a CRM, customer / lead / deal / pipeline manager, admin panel, or any dashboard-management website and names Vercel, or says "like Vercel dashboard".
- The product is data-dense: lists, tables, filters, usage/limits, statuses, and detail pages matter more than marketing story.
- Do NOT use this skill for a marketing landing page. For that, use `saas-landing-clone` instead. A CRM may still have a short landing, but it is not this recipe.

## The one rule

Density over decoration. One screen holds a sidebar, a toolbar, and a full grid or table. No hero, no large illustration, no coloured borders, no heavy shadow. Separation comes from a hairline border and white-on-`#fafafa`, not from elevation.

No shell controls, ever (lesson from the CRM build, 11/11/2026): every menu item, button and nav entry must lead to a real screen, a real external link, or a real stored action — or be disabled with a stated reason. Never fill a cloned menu with a one-sentence info popup or a toast that pretends success (no fake "connected", no fake checkout, no fake sign-out). If the product has no blog, changelog, legal page or support desk, build the real equivalent from the product's own data (its own change log, its own help pages, its own status) or remove the item — never a placeholder popup.

## Build the layout (verified live)

- App shell: top bar ~56px, full width, background `#fafafa` ⚠️, no footer. Left sidebar ~254px, full height, background `#fafafa` ⚠️, one hairline vertical divider. Main content starts ~24px from the sidebar and runs to the right edge.
- Top bar, left to right: workspace switcher / breadcrumb ("All Projects" with chevron, centre "Team Overview"), then right side "+ Create New" (ghost/black text) and "Agent". In a CRM this becomes: workspace name left, current section centre, "+ New lead / deal / customer" right.
- Sidebar, top to bottom: team/workspace switcher + plan pill (grey "Hobby") + green availability dot `#30a43b` ⚠️ + chevron; a "Find" search box (white, rounded); then the long nav, ~14px, one item per row, 16px thin-line outline icon at left, chevron `>` on expandable items; at the bottom a promo/upgrade card, then a user row (avatar + name + `…` + bell with blue dot).
- Sidebar nav order on Vercel (adapt, do not copy verbatim): Projects (active), Deployments, CI, Logs, Traces, Analytics, Speed Insights, Observability, Firewall, CDN, Environment Variables (amber count pill), Domains, Connect, Integrations, Storage, Flags, Agent, Vulnerabilities, AI Gateway, Sandboxes, Workflows, Images, Daemons, Usage, Support, Settings. A CRM nav keeps the same shape with its own sections — see `references/crm-patterns.md`.
- Main content is two columns: left ~403px, right ~1187px, gap ~24px (at 1919px wide). Left holds the slow-changing panels (Usage, Alerts, Recent activity); right holds the main list (Projects heading + grid). A CRM keeps this split: left = KPIs / usage / alerts / recent activity, right = customers / deals / leads.
- Toolbar row under the top bar, ~38px high: a "Search Projects" input taking most of the width (white, rounded, magnifier left, `/` shortcut pill right), then Filter/Sort (sliders icon), a segmented grid/list toggle, and a ghost "Onboard Your Agent" button at the far right. In a CRM: "Search customers…", Filter/Sort, grid/list toggle, ghost secondary action.
- No page footer was present on the live dashboard. Do not add one to the app shell.

## Build the list: grid and table are the same data

- Grid view (default on Vercel): 3 columns × 4 rows at 1919px, cards ~376×124px, gap ~24px, white, 1px light-grey hairline border, ~8px radius, no visible drop shadow at rest. Hover produced no dramatic colour change.
- Each card, top to bottom: row 1 — 40px icon/thumbnail + bold name (~14px semibold, truncated with `…`) + muted domain/meta below it (truncated); top-right a small circular "Select" button (check in a ring, thin blue progress arc on some cards) and a project menu chevron. Row 2 — latest commit / last activity, semibold, truncated (or a blue link such as "Connect Git Repository" when something is missing). Row 3 — source icon + `owner/repo` + `·` + date ("Oct 31"). A full-width white "Show More" button sits below the grid.
- List view (`?view=list`): single-column table-like rows ~75px tall, separated by hairline dividers, no card borders. Columns: 32–40px icon, name/domain left, activity + source + date centre (truncated), right-aligned count and menu buttons. Same content, denser.
- CRM rule: build grid AND list from the same component and the same data. The toggle only changes density, never the fields. Every card/row must carry: identity (icon + name + secondary id/domain), last activity (one line, truncated), source + date. Never show a card with only a name.
- Empty / missing state is plain grey text, not a pill — Vercel shows "No Production Deployment" as plain grey text. Missing repo is a blue link, not a red error.

## Apply colour, type and motion

- Canvas: `#fafafa` ⚠️ everywhere (page, sidebar, top bar). Surface/card/input: `#ffffff`. Zebra rows alternate `#fafafa` / `#ffffff`.
- Text: primary near-black `#171717` ⚠️ (not pure `#000`); secondary/muted is mid-grey (exact hex not sampled — pick a grey that passes contrast on white and name it in the handover). Sidebar active item background: `#ebebeb` ⚠️.
- Accent: exactly one blue, used only for links and progress. Geist Blue-700 sampled `#0072F5` ⚠️ (pass 2, also the Current-Production pill fill); the team-page link sample was `#1f68d6` ⚠️ (pass 1, likely a Display P3 / sRGB render artefact — do not hard-code both). Progress-ring light blue `#afd8ff` ⚠️. The familiar `#0070f3` was NOT verified as a token — do not claim it. Pick `#0072F5` or shift its hue slightly for the user's own product.
- Status: only one status colour was observed — green dot `#30a43b` ⚠️ for availability. Amber count pill: text `#b6762f` ⚠️ on a pale amber background. No red/green success/error colours were visible on this page (no failed deployment was shown). For a CRM you still need success / error / warning / neutral statuses — define them in `references/design-tokens.md` as proposed tokens, clearly labelled proposed, never as observed Vercel tokens.
- Borders: very light grey hairlines, visually ~`#eaeaea` ⚠️ (exact hex not successfully sampled). Use hairlines, never coloured borders.
- Buttons: primary = solid black `#171717` ⚠️, white text, rounded-full/rounded-lg ("Upgrade", "Enable 2FA"); secondary = white with hairline border and black text ("Show More", "Upgrade to Pro"); ghost/text = black text, no border ("Create New", "Onboard Your Agent"); icon buttons = small circular/rounded-square with hairline border. One black primary per panel, never two side by side.
- Badges/pills: grey plan pill, amber count pill, `/` shortcut pill — all ~12px, fully rounded. Keep pills for counts and plans only; do not pill every status.
- Typography (estimated from screenshot pixel heights, NOT computed CSS — font family unverified from CSS): clean geometric sans throughout, Geist Sans / Geist Mono by appearance only. Page/section headings ("Usage", "Projects", "Alerts", "Recent Previews"): ~14px semibold. Project/customer name: ~14px semibold. Body/activity: 13–14px regular/semibold. Domain/repo/date meta: 12–13px regular, muted grey. Sidebar nav and top bar: ~14px regular, active item semibold. Buttons: 13–14px medium. Pills: ~12px. Line-height is tight/compact; whitespace lives between cards, not inside rows. Mono is used only for commit hashes / ids.
- Free font to implement with: Geist Sans + Geist Mono (OFL, free) or Inter + JetBrains Mono. Never use a proprietary font.
- Radius: cards ~8px, inputs/buttons ~6–8px, pills 9999px, avatars circular.
- Motion: restrained, transform + opacity only, 150–250ms. No blur reveal, no `transition: all`, no layout animation. Hover is a border/background shift, not a lift. Pass 3 sharpens this: hover is a light-grey wash only (no shadow/border change, no actions appearing on hover); actions live in the ••• menus. Tooltips are LIGHT (white, bordered, dark text, may contain a Learn more link) — never a dark pill. Loading is grey rounded skeleton bars everywhere, never a spinner except inside Build Logs. Esc closes menus/dialogs. Cmd+K opens a small left-anchored palette under the top bar, not a centred modal. Respect `prefers-reduced-motion` by showing full content with no animation. Dropdowns are the one place a soft shadow is allowed.
- Inputs/search: white, rounded ~8px, hairline border, magnifier icon, placeholder text, `/` kbd on the right. Sidebar "Find" is the same pattern, smaller.
- Dropdowns/menus: white, ~200px wide (Create New ~400px, two columns), rounded ~8px, soft shadow, hairline border, 14px items with 16px icons and dividers. Filter menu has "Filter by" (checkbox/checkmark, e.g. "Activity" ticked) and "Sort by" ("Last deployed", "Name", "Recently Viewed", "Popularity"). Project menu: Add Favorite, Visit, View Logs, Manage Domains, Transfer, Settings, divider, Import, View Repository. Map these to CRM menus in `references/crm-patterns.md` — same shape, CRM actions.
- Icons: 16–20px thin-line outline icons throughout, never filled. Project/customer icons 32–40px. Avatars circular.
- Usage panel: header "Last 30 days" + black "Upgrade" button; rows are metric name + right-aligned "used / limit" (e.g. "15K / 1M", "74.45 MB / 10 GB"), with a tiny blue progress ring. Initially 4–5 rows visible, "Show More Usage" reveals 10. A CRM usage panel copies this exactly: quota name left, used/limit right, ring for the headline metric.

## Trí variant (when he wants his own taste, not strict Vercel)

Strict Vercel conflicts with Trí's standing taste in two places: Vercel uses small 8px radii + hairline borders, while Trí prefers large rounded corners and separation by surface/soft shadow with no coloured borders. Default to strict Vercel for this skill. Offer the Trí variant only when he asks, and name it in the reply:

- Radius: card 16px, panel 24px, pill 9999px, input 10px.
- Separation: keep the hairline, add a soft surface step (`#f5f5f5` on `#fafafa`) instead of a shadow.
- Keep everything else Vercel: 254px sidebar, 56px top bar, 13–14px dense type, black primary, one blue accent, grid/list toggle.

## Build order for a CRM

1. App shell first: top bar + sidebar + two-column main. Get the widths right before any data.
2. Toolbar: search + Filter/Sort + grid/list toggle. The toggle must work (`?view=grid` / `?view=list`).
3. Main list: grid cards, then the same data as list rows. Add "Show More".
4. Left panels: Usage (used/limit + ring), Alerts (bell + one line + ghost/secondary CTA), Recent activity (each item: Preview / Source / View links + mono id pill).
5. Detail view: same shell, same toolbar pattern, same card language — a detail page is a card opened up, not a new design.
6. Filters, sorting, search, and the item menu (favorite, view, edit, transfer, settings, delete behind a divider).

## Verify and ship

- Render at desktop (1919px) and check: sidebar 254px, top bar 56px, left column ~403px, right column ~1187px, gap 24px, grid 3 columns, cards ~376×124px, no overflow, no footer.
- Check grid AND list show the same fields, truncated the same way, with the same menu.
- Check contrast of muted grey on white and on `#fafafa`; check keyboard navigation through sidebar, search, filter, toggle, and menus.
- Check with motion reduced: full content, no animation.
- Compare the finished page against `references/vercel-dashboard.md` and name any token that differs, rather than silently drifting.
- State in the handover: strict Vercel or Trí variant, the accent hex actually used, and what is still unverified (mobile ~390px was NOT verified live — see references; do not claim a mobile layout was observed).
- Deliver through the artifact tools when the user asked for a page, and name the recipe in the handover message.

## Available connectors

- [Vercel](/opt/hatch/connectors/vercel/CONNECTOR.md) for deploying a Next.js site and checking its deployment status.
- [GitHub](/opt/hatch/connectors/github/CONNECTOR.md) for keeping the site code in a repository the user owns.
- Use `muse.connector_search` to find other connectors and `muse.skill_search` to find related skills.
- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

## Websites

- Use `browser.browse` to check the live site when a token is marked sampled/unverified, and carry the recipe name, the token in doubt, and the exact page into that browser task.
- [Vercel team dashboard](https://vercel.com/trisbies-projects) for the live reference this skill was built from (login required; 12 projects on 11/11/2026).
- [Vercel Geist design system](https://vercel.com/geist) for the public Geist tokens — check live before treating any public token as the dashboard token.
