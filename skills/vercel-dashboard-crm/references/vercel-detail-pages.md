# Vercel detail pages — live observation (pass 2)

Source: live logged-in pages, 11/11/2026, 10:59–11:03, signed in as trisbie. Read-only; nothing created, changed or deleted. Team overview from pass 1 was not repeated.

Verification: (a) published on the page / right-click raw value · (b) sampled from screenshot pixels · (c) estimated from screenshot geometry. Computed CSS was NOT accessible.

## 1. Project detail — kriss-trending-dashboard

Route: `vercel.com/trisbies-projects/kriss-trending-dashboard`. Framework: Next.js (a).

- **Nav:** no horizontal top tabs in the current UI — navigation is the left sidebar (28 items): Overview, Deployments, CI, Logs, Traces, Analytics, Speed Insights, Observability, Firewall, CDN, Environment Variables, Domains, Connect, Integrations, Storage, Flags, Agent, Vulnerabilities, AI Gateway, Sandboxes, Workflows, Images, Daemons, Usage, Support, Settings. This is the same sidebar as the team page, with "Overview" first instead of "Projects".
- **Header:** team "trisbies-projects" (Hobby), project title + Visit link, "Visit" and "Deploy" buttons, "AI" badge, "Main Branch". A dismissible "Enable 2FA" banner sits bottom-left.
- **Overview layout:** left column = production card ("Production … 7.2 KB", black-dot "Main Branch", "AI … 1.1 K", "No source set up in Production."), then "Active Branches — Newest First" with one row: Production `a169a37`, commit message truncated with "…" ("(follow-up) feat(web): Brief follow-up – 7-day Worth-reading age cap + 24-48h priority, narrow AI preset to AI d…"), Ready, Oct 31, `main`, Visit button. A "Failed 1" label also appears in the Active Branches panel, but no failed row was visible.
- **Right rail:** "Monitoring — Vercel Analytics / Price", "Spend Management" cards, "Storage usage", "Project Activity" (Oct 31: "Activity 2", "Security 1", "Optimized 1").
- **CRM mapping:** a CRM detail page copies this exactly — left column = main record card + "Active" list (deals / activities, newest first), right rail = monitoring-style panels (value, spend/usage, storage, activity counts). The "Failed 1" pattern is a count label without a visible row — in a CRM, a stale-deal count label with no row is a bug, not a pattern; always show the rows behind a count.

## 2. Deployments list

Route: `/deployments`, 7 rows, no column-header row. Columns left to right: commit message (truncated link) · status dot + "Ready" + build duration · env pill · 7-char commit SHA (mono link, full SHA behind "Filter by Commit") · branch (link; `brief-batch-1` truncates to "bri…") · short date ("Oct 31"; full timestamp "Oct 31, 2026, 1:35:24 PM GMT+7" in row metadata) · avatar (github/TriSBie) · "•••" Deployment Actions.

Rows observed: 5 GitHub — Production `main` a169a37 (29s, Oct 31), Preview `brief-batch-1` 8c93d1b (31s, Oct 31), Production `main` ba29ef5 (27s, Oct 30), Preview `brief-batch-1` 3ecb610 (26s, Oct 30), Production `main` 230a797 (52s, Oct 30) — plus 2 CLI deploys APeE93rw1 (36s) and BQSKM5bAV (28s), both Production, Oct 22, showing "View code" + "vercel deploy" instead of SHA/branch, trisbie avatar. All 7 are Ready.

- **Row metrics (b/c):** row pitch 48px between 1-px dividers sampled `#E6E6E6` (b) (Geist Gray-300); single bordered card on a `#FAFAFA` page background.
- **Env pills:** Current-Production pill = solid blue fill sampled `#0072F5` (b) with white text + Globe icon. Other Production/Preview pills are white with a grey border and black text (+ Eye icon for Preview). CRM mapping: the "current / primary" pill is the only solid-blue pill on the page; every other env/stage pill is white with a grey border.
- **Filters:** "Add Filter" button (menu: Branch, Commit, Author, Environment, Status, Created) plus dashed-outline suggestion chips "Author trisbie", "Environment Production", "Status Error" — these look inactive: the list still shows all 7 Ready rows including Preview, so they are not applied filters. CRM mapping: suggestion chips must reflect the applied filter state; a chip that looks applied while the list is unfiltered is a defect to avoid.
- **Footer:** "Deployment Retention is enabled…" + "View Recently Deleted".
- **Status colours:** Ready dot sampled `#50E3C2` (b, mint/teal; edge-influenced pixel, approximate). No failed or building deployment exists on this project, so no red/amber status hex could be sampled; the Geist token equivalents are Red-700 `#E5484D` and Amber-700 `#FFB224` (b, see `geist-tokens.md`).

## 3. Domains

Direct `/domains` 404s; the real route is `/settings/domains`. 1 domain: kriss-trending-dashboard.vercel.app, "Production" button, "Refresh" (greyed), "Edit"; "Search any domain", "Add Existing", "Buy" (black button), "Filter domains". CRM mapping: a settings sub-page keeps the same shell and swaps only the sidebar (see below); a greyed-out action stays visible and disabled, never hidden.

## 4. Settings nav

Clicking Settings swaps the sidebar to 16 items: General, Build and Deployment, Environments, Git, Deployment Protection, Passport, Functions, Sandboxes, Microfrontends, Project Members, Drains, Alerts, Tracing, Security, Networking, Activity, Advanced. Its content was still loading (skeleton bars) at capture — content values from Settings were NOT observed. CRM mapping: settings is a sidebar swap, not a new page design; keep the top bar, the 254px sidebar width, and the card language identical.

## 5. What remains unverified

- Computed CSS, line-height/letter-spacing/font-weight of the Geist type classes, and numeric box-shadow values (absent from the published docs as visited).
- Any failed/building status hex from a live row (no such deployment existed on this project).
- Settings page content (skeleton at capture).
- Mobile ~390px (same as pass 1 — not verified).
