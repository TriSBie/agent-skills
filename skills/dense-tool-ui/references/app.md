# App layout and screens

Measured at 1280×720 with computed styles, Nov 2026. The source UI changes over time, so treat the numbers as a strong starting point rather than a spec.

## Shell

- **Frame**: the app background (`--bg-app`) is near-black. A 244px sidebar sits directly on it, with no border and no card. Content lives in a **nested panel**: 8px margin (top, right, bottom), 12px radius, 1px `--line` border, shadow `0 .5px 1px 1px lch(0 0 0/.3)`. The panel is one step lighter than the background, so depth comes from the step, not from a big shadow.
- **Sidebar**, top to bottom:
  - Workspace switcher (22px avatar, name, ▾), with round Search and New buttons on the right.
  - Personal group: Inbox (count or dot), My issues, Reviews.
  - Group heading "Workspace ▾" (12px, `--ink-4`, collapsible): Projects, Views, More.
  - "Your teams ▾": team name, children indented 16px.
  - Bottom: a dismissible tip card and a Help button.
  - Items are 28px tall, padding `0 9px 0 8px`, radius 8px, 13px/500 `--ink-3`. Active item: `--bg-hover` background, `--ink` text.
- **Panel header**: 52px, 1px bottom border. Left: breadcrumb `Team › View` (13px/500), Favorite star, `···`. Right: bell, then a ghost pill "+ New issue".
- **View bar**, under the header:
  - Left: pill tabs (Active / Backlog / All issues), 28px, 12px/500. Selected tab has background `lch(16.7)`; others have a thin border. A "+ view" button ends the row.
  - Right: three 28px round icon buttons: Filter, Display options, Toggle details.
- **Empty state**: centered in the panel. Thin line illustration, 15px/600 title, 13px `--ink-3` description (max ~340px), then a primary accent button with a `kbd` inside ("Create new issue C") and a secondary "Documentation" button.
- **Settings**:
  - Own sidebar: "‹ Back to app", Search, groups Personal / Issues / Projects…
  - Centered 640px column. H1 ~24px, h2 groups 15px/500.
  - Each group is a card: radius 10px, `--bg-2`, border as ring shadow `0 0 0 1px lch(100 0 0/.048)`.
  - Rows ~60px: label 13px/500 plus 12px `--ink-3` description on the left, control on the right (30px select with radius 8, accent toggle). Hairlines between rows.

## Screens and flows

| Screen | Layout | UX worth copying |
|---|---|---|
| List | Status group headers (36px, `--bg-2`, radius 8, sticky) with count and a + on the right. Rows 44px, **no dividers** | Row order: `···` priority → ID (13px/450, `--ink-3`, tracking -.02em) → status icon → title 13px/500 → (flex) → avatar → date. Hover/selection only changes the background |
| Board | 340px columns. Cards `--bg-2`, radius 8, 1px ring shadow | Card: ID, status + title, property chips, "Created …". Empty statuses collapse into a "Hidden columns" block on the right |
| Display options | 302px popover, `lch(12.7)`, radius 12, border `lch(21)`, soft 3-layer shadow | List/Board segmented control, Grouping/Ordering selects, toggles, then **on/off chips for visible columns** (on = bright, off = dim) |
| Issue detail | Left: title 24px/600 (lh 32), inline description editor, "+ Add sub-issues", hairline, Activity (15px/600), 12px event lines, comment box radius 12. Right: Properties column | Properties are 28px buttons (Status, Priority, Assign) plus Labels and Project groups. **No Save button**: changes save instantly. Icon bar on top: copy link, copy ID, git branch, agent |
| Create issue (`C`) | ~750px modal placed high on screen. Breadcrumb chip `ACM › New issue`, expand and close buttons | Title 18px/600, description, 24px property chips (Backlog/Priority/Assignee/Labels/…), footer with attach, "Create more" toggle, primary "Create issue". **Ctrl+Enter creates** |
| After create | Toasts bottom-right, stacked, 340px wide, radius 12 | ✓ "Issue created", `ID – title`, "View issue" link. Delete asks for confirmation and only moves the item to "Recently deleted" (30 days) |
| ⌘K | 720px box placed high (~13vh), no blur | Inside an issue, a **context chip** "ACM-6 · title" sits on top (Backspace removes it). Input "Type a command or search…", "Ask AI [Tab]" on the right. 46px items, 15px/500, shortcuts on the right (A, I, S, P, ⇧P, L, ⇧D, Ctrl .). Typing filters; Navigation and "Quick results" groups |
| Projects | Header with "+ New project" on the right, "All projects" tab and a create-view button. With data it is a **table**: Name (icon + 13/600) · Health ("No updates", dashed ring) · Priority · Lead · Target date · Issues (number, right-aligned) · Status (progress ring + %). Column headers 13px `--ink-3`, no row lines | Empty state: thin line shape, primary "Create new project [N] then [P]" (sequence shortcut). A small bar at the panel bottom (agent, history). Sidebar "Try" group (Import, Invite, Connect GitHub) for onboarding |
| Create project (`N` then `P`) | ~920px modal, radius 16, placed high. Breadcrumb `Team › New project`, "Create with Agent" pill, × | Icon slot, large inline-editable name, "Add a short summary…", chips (Backlog, No priority, Lead, Members, Start, Target, Labels, Dependencies), hairline, description, "Milestones +" card, footer accent pill "Create project". Ctrl+Enter switches the button to "Creating…", then a "Project created · View project" toast |
| Project detail | Pill tabs Overview / Activity / Issues. Left: 36px icon slot, name 24/600, summary, inline "Properties" chips, "Resources + Add document or link…", dashed card "Write first project update" (radius 10, border `lch(14.2)`, transparent), Description, "+ Milestone". Right (386px): 3 stacked cards, radius 10, `lch(9.2)`, border `lch(13.6)`: **Properties** (label 12/450 `--ink-3` in a 96px column \| button values: Status, Priority, Lead, Members, Dates `Start → Target`, Teams, Labels), **Milestones +**, **Activity** + "See all" | The same property shows in two places (inline chip and right card), both editable in place. Empty cards carry a one-sentence hint + "Learn more". Card headers have ▾ collapse and + on the right |
| Team home | Tabs Overview / Documents / Loops / Members. Left: team icon + H1, "Add a description…", "Team resources" (+, add section). Right: Members (avatars), "Go to" (Team settings, Issues, Projects, Views) | The overview page is navigation, not fake metrics |
| Filter (`F`) | 238px popover, `lch(12.7)`, radius 12, 3-layer shadow. "Add Filter… [F]" input, "AI filter", "Advanced filter", then property groups split by hairlines (Status, Assignee, Creator, Priority, Labels, Relations, Dates \| Project… \| Subscribers…) | 32px items, 13/400, icon + label + ▸. → opens a **submenu** with its own "Filter…" input and checkbox rows with status icons. Fully keyboard-driven, Esc closes one level at a time |
| Inbox | Two panes: 400px list \| reading pane | Both panes have empty states |
| Agent (new default view) | Large centered chat box, integration suggestion chips | Banner "now your default view · Change / Keep" lets users decide |

## Shortcuts

- `C` create; `Ctrl/⌘K` command palette; `Ctrl+B` list/board; `Ctrl+Enter` submit/create.
- `G` then `I/A/…` to navigate; `J/K` or ↑/↓ to move; `Enter` to open; `Esc` to go back.
- On an issue: `A` assign, `I` assign to me, `S` status, `P` priority, `L` label.
- Shortcuts are always **shown** in buttons, menus and tooltips so users learn them.
