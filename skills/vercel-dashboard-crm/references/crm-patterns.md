# CRM patterns — Vercel dashboard mapped to a CRM

Every Vercel element on the left, its CRM equivalent on the right. Same shape, same density, CRM data. Do not invent a new component when a Vercel one already fits.

## Shell mapping

| Vercel (observed) | CRM |
|---|---|
| Team switcher "trisbie's projects" + Hobby pill + green dot | Workspace switcher "Acme Sales" + plan pill ("Free" / "Pro") + online dot |
| Sidebar nav: Projects, Deployments, CI, Logs, Analytics, … | Dashboard, Customers, Leads, Deals / Pipeline, Activities, Tasks, Reports, Usage, Settings — keep the same one-item-per-row, 16px icon, chevron on expandable groups |
| Environment Variables with amber count pill "52" | Any section with a count: Leads "18", Deals "7", Tasks "12" — amber pill only for counts that need attention, grey otherwise |
| Top bar: All Projects ⌄ / Team Overview / + Create New / Agent | All Customers ⌄ / Customers (breadcrumb) / + New lead (ghost) / AI assistant |
| Enable 2FA promo card at sidebar bottom | Upgrade / onboarding promo card at sidebar bottom — one black button + one ghost action, closable |
| User row: avatar + name + … + bell (57 unseen) | Same: avatar + name + … + bell with blue dot and count |

## List mapping — the card is the CRM record

Vercel project card → CRM customer / lead / deal card. Keep all three rows, in order:

| Card row | Vercel | CRM customer | CRM deal |
|---|---|---|---|
| Row 1 | 40px icon + name (bold, truncated) + domain below | 40px avatar/initials + company or person name + email / company domain below | 40px company avatar + deal title + account name below |
| Row 2 | Latest commit message, semibold, truncated — or blue link "Connect Git Repository" | Last activity, semibold, truncated ("Emailed proposal · 2h ago") — or blue link "Add first note" / "Connect email" when empty | Last activity ("Call logged · yesterday") — or blue link "Log first activity" when empty |
| Row 3 | GitHub icon + `TriSBie/<repo>` + `·` + date | Source icon + source (`Website`, `Referral`, `LinkedIn`) + `·` + date | Source icon + stage + `·` + close date |
| Top-right | Select widget (check ring + blue progress arc) + menu chevron | Select checkbox ring + progress arc = pipeline progress / profile completeness + menu chevron | Same: progress arc = deal progress through stages |
| Missing state | "No Production Deployment" as plain grey text | "No deals yet" / "No activity yet" as plain grey text — never a red pill | Same |

List view is the same data as rows ~75px tall, hairline dividers, no card borders. The grid/list toggle (`?view=grid` / `?view=list`) must work and must not change the fields.

## Left panels mapping

| Vercel panel | CRM panel |
|---|---|
| Usage — "Last 30 days", metric + "used / limit" right, tiny blue ring, "Show More Usage" reveals 10 rows | Quotas / KPIs — "This month": Leads contacted 84 / 100, Deals closed 12 / 20, Storage / seats used, same used/limit + ring pattern |
| Alerts — bell, "Get notified when usage or errors spike…", "Upgrade to Pro" | Alerts — bell, "Get notified when a deal goes stale or a lead replies…", secondary CTA "Set up alerts" |
| Recent Previews — item + Preview / Source / View Deployment links + mono id pill | Recent activity — item + View / Source / Open links + mono id pill (e.g. `lead_9f31`) |

## Toolbar, filter, sort, menus

- Search: "Search customers…" — white, rounded ~8px, magnifier left, `/` shortcut pill right. Same for sidebar "Find".
- Filter menu: "Filter by" (checkboxes: Stage, Owner, Source, Activity) + "Sort by" ("Last activity", "Name", "Recently viewed", "Deal value"). Mirrors Vercel's Filter by "Activity" + Sort by "Last deployed / Name / Recently Viewed / Popularity".
- Create New menu (~400px, two columns): New lead, New customer, New deal, New task / Import CSV, New pipeline, Invite teammate. Mirrors Vercel's Project / Domain / Integration / Sandbox / Agent / Store / AI Gateway Key / Team Member.
- Item menu (per card/row): Add to favorites, View, Log activity, Edit, Manage tags, Transfer owner, Settings, divider, Import, View source. Mirrors Vercel's Add Favorite / Visit / View Logs / Manage Domains / Transfer Project / Settings / Import Directory / View Git Repository. Delete, if present, goes behind the divider, never as the primary action.

## Pages a CRM needs, all in the same language

1. **Dashboard (Team Overview):** the observed two-column page. Left: Usage/KPIs, Alerts, Recent activity. Right: main list heading + grid + Show More. No footer.
2. **Customers / Leads / Deals list:** same shell, same toolbar, same grid/list toggle. One list per entity; do not merge entities into one mixed grid.
3. **Detail page:** same shell; the card opened up. Header = Row 1 enlarged (avatar + name + meta), then Row 2 activity as a timeline, Row 3 source/date as a meta strip, left column = Usage-style panels (deal value, stage progress, tasks), right column = activity + notes + files. No new visual language.
4. **Pipeline (optional):** if the user asks for kanban, keep Vercel density — columns are lists, cards are the same ~124px cards, drag changes stage only, no colour per column. Colour is reserved for status dots and the one blue accent.
5. **Settings / Usage:** the Usage panel expanded to a full page — same rows, same used/limit, same ring.

## Data rules

- Every record shows identity + last activity + source + date. A record with only a name is incomplete.
- Truncate with `…` at one line for name/activity; never wrap a card row to two lines.
- Dates: relative in the row ("Oct 31", "2h ago"), absolute in a hover tooltip (relative + UTC + GMT+7, as Vercel does).
- Counts in pills are real counts from the data, never hardcoded.
- Search, filter, sort and the grid/list toggle must work on real data before shipping — a static mock with dead controls is not a CRM.
