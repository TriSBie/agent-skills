# Vercel dashboard — live observation

Source: live logged-in page `https://vercel.com/trisbies-projects`, team `trisbies-projects`, Hobby plan, signed in as trisbie, 11/11/2026, viewport 1919×998. No sign-in was needed — the saved session was already active. Nothing was changed, created or deleted; only grid/list view was switched (returned to grid), Usage was expanded, and Filter / Create New / Project menus were opened and closed.

Verification key: ✅ verified live from the rendered page · ⚠️ sampled from screenshot pixels, NOT computed CSS · ❓ unverified, do not claim.

## 1. App shell — wireframe (1919px)

```
┌──────────────────────────────────────────────────────────────────┐
│ Top bar ~56px, #fafafa ⚠️                                        │
│ All Projects ⌄ │ Team Overview (centre) │ + Create New │ Agent  │
├──────────┬───────────────────────────────────────────────────────┤
│ Sidebar  │ Toolbar ~38px: Search Projects … / │ Filter │ ▦ ▤  │
│ ~254px   │ Onboard Your Agent (ghost, far right)                │
│ #fafafa  ├──────────────────────┬────────────────────────────────┤
│ hairline │ Left col ~403px      │ Right col ~1187px              │
│ divider  │ Usage card           │ Projects heading               │
│          │ Alerts card          │ 3-col grid, 12 cards           │
│          │ Recent Previews      │ Show More (full-width white)   │
│          │                      │                                │
│ 2FA promo│                      │                                │
│ User row │                      │                                │
└──────────┴──────────────────────┴────────────────────────────────┘
No footer. Main starts ~x=279 (24px gutter from sidebar), ends ~x=1895.
Two-column gap ~24px. Content background #fafafa ⚠️, cards white.
```

## 2. Sidebar (top to bottom)

- Team switcher: "trisbie's projects" + grey "Hobby" pill + green dot `#30a43b` ⚠️ + chevron.
- "Find F" search box: white, rounded.
- Nav, ~14px, one item per row, 16px icon left, chevron `>` on expandable items, in this order: Projects (active, background `#ebebeb` ⚠️), Deployments, CI, Logs >, Traces >, Analytics, Speed Insights, Observability >, Firewall >, CDN, Environment Variables (amber count pill "52"), Domains, Connect, Integrations, Storage, Flags, Agent >, Vulnerabilities, AI Gateway, Sandboxes, Workflows, Images, Daemons, Usage, Support, Settings.
- Bottom: "Enable 2FA" promo card (black "Enable 2FA" button, "Remind Me in 3 Days" ghost, close X), then user row: avatar + "trisbie", "…" and bell with blue dot ("57 unseen notifications").

## 3. Toolbar

- Row y≈77–115, ~38px high. "Search Projects" input (white, rounded, magnifier left, `/` shortcut pill right) takes most of the width.
- Filter/Sort button (sliders icon), segmented grid/list toggle (grid checked; switching adds `?view=list` / `?view=grid`), ghost "Onboard Your Agent" button at far right.
- Filter menu sections: "Filter by" (checkbox/checkmark, e.g. "Activity" ticked) and "Sort by" ("Last deployed", "Name", "Recently Viewed", "Popularity").
- Create New menu (~400px, two columns): Project, Domain, Integration, Sandbox / Agent, Store, AI Gateway Key, Team Member.

## 4. Project cards — grid view (default)

- 3 columns × 4 rows = 12 projects shown, the team's total. Cards ~376×124px, gap ~24px, white, 1px light-grey hairline border, ~8px radius, no visible drop shadow at rest. Hover produced no dramatic colour change in the screenshots.
- Each card, top to bottom:
  - Row 1: 40px icon/thumbnail (black "N" Next.js logo, teal "T", or grey triangle) + bold name (~14px semibold, e.g. "kriss-trending-dashboard", truncated with "…" if long) + muted domain below it (".vercel.app", truncated). Top-right: small circular "Select widget" button (check/tick in a ring, thin blue progress arc on some cards) and a "Project Menu" chevron. A small number (40/20/0) is also shown top-right on some cards.
  - Row 2: latest commit message, semibold, truncated with "…" — or blue link "Connect Git Repository" when no repo is connected.
  - Row 3: GitHub icon + "TriSBie/<repo>" + "·" + date ("Oct 31", "Oct 22").
- Hovering a date shows a tooltip: "20 days, 1 hour, 3 minutes ago / UTC Oct 22 2026 02:49:27 AM / GMT+7 Oct 22 2026 09:49:27 AM".
- "Show More" full-width white button below the grid.
- Verified project names visible: kriss-trending-dashboard, job-watcher-mvp, java-spring-learning-platform, tmp-deploy-probe-20261022, k8s-playground-team, so-tay-backend-teso, kafka-learning-platform, bui-duc-tri-engineer-dark, interview-prep, teso-vitadairy-site ("No Production Deployment"), qua-20-10-my-hanh, editorial-minimal-duplicate. Five of the 12 show "Connect Git Repository" instead of a commit.
- List view (`?view=list`): single-column table-like rows ~75px tall, separated by hairline dividers, no card borders. Columns: 32–40px icon, name/domain left, commit + "github TriSBie/<repo> · <date>" centre (truncated), right-aligned count and widget/menu buttons. Same content, denser.

## 5. Left column panels

- **Usage card:** header "Last 30 days" + black "Upgrade" button; 10 rows after "Show More Usage" (initially 4–5 visible), each row: small ring/progress icon + metric name ("CDN Requests", "Fluid Active CPU", "Deployment Storage", "Function Invocations", "ISR Reads", "Fast Origin Transfer", "CDN Request CPU Duration", "Fast Data Transfer", "Image Optimization – Transformations/Cache Reads") + right-aligned "used / limit" (e.g. "15K / 1M", "74.45 MB / 10 GB"), with a tiny blue progress ring at the right in the header area. Zebra rows alternate `#fafafa` / `#ffffff`.
- **Alerts card:** bell icon, "Get notified when usage or errors spike…", "Upgrade to Pro" (secondary).
- **Recent Previews:** items "brief-batch-1" and "motion-wave-0-1", each with Preview / Source / View Deployment links and a "3332dbsv" mono commit pill.

## 6. Components observed

- Buttons: primary solid black `#171717` ⚠️, white text, rounded-full/rounded-lg; secondary white + hairline border + black text; ghost black text, no border; icon buttons small circular/rounded-square, hairline border.
- Badges/pills: grey "Hobby", amber "52", shortcut "/" pill, ~12px, fully rounded. "No Production Deployment" is plain grey text, not a pill.
- Inputs: white, rounded ~8px, hairline border, magnifier icon, placeholder, `/` kbd right.
- Dropdowns/menus: white, ~200px wide (Create New ~400px, two columns), rounded ~8px, soft shadow, hairline border, 14px items with 16px icons and dividers.
- Project Menu: Add Favorite, Visit with Toolbar, View Logs, Manage Domains, Transfer Project, Settings, divider, Import Directory, View Git Repository.
- Segmented control: grid/list toggle — two icons in one bordered pill, active one on a light-grey (`#ebebeb`-like ⚠️) background.
- Avatars/icons: circular avatars, 16–20px thin-line outline icons (not filled), favicon-style project icons 32–40px. Shadows are minimal — cards rely on border + white on `#fafafa`; only dropdowns have a clear soft shadow.

## 7. What remains unverified ❓

- Exact computed hex tokens, font-family/size/weight from CSS, hover/shadow tokens.
- Status colours: no red/green success/error states were present on this page (no failed deployment shown); only the blue progress arcs and the green team dot were status-like.
- All behaviour at ~390px: this browser environment provides no viewport-resize control, so mobile was not tested. Do not assume the sidebar collapses or the grid becomes one column. A mobile layout in a build from this skill is a design decision, labelled as such — not an observed Vercel behaviour.
- No fallback to docs/marketing pages was needed, since live login succeeded.
