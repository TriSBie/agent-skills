# Design tokens — Vercel dashboard (CRM recipe)

Source date: 11/11/2026, live at `vercel.com/trisbies-projects`, 1919×998.
Verification: ✅ verified live from rendered page · ⚠️ sampled from screenshot pixels, NOT computed CSS — treat as evidence, check live before shipping · ❓ unverified / proposed — a design decision, never an observed Vercel token.

## Colour

| Token | Value | Verification |
|---|---|---|
| Canvas / page / sidebar / top bar | `#fafafa` | ⚠️ sampled |
| Card / surface / input | `#ffffff` | ⚠️ sampled |
| Zebra row alt | `#fafafa` / `#ffffff` | ⚠️ sampled |
| Sidebar active item | `#ebebeb` | ⚠️ sampled |
| Primary text / black button | `#171717` (near-black, not pure `#000`) | ⚠️ sampled |
| Secondary / muted text | mid-grey | ❓ exact hex not sampled — pick a grey passing contrast on white/`#fafafa` and name it in the handover |
| Border / hairline | ~`#eaeaea` visually | ⚠️ exact hex not successfully sampled |
| Link / accent blue | `#1f68d6` (first blue pixel; anti-aliased up to `#60a1e5`) | ⚠️ sampled |
| Progress-ring light blue | `#afd8ff` | ⚠️ sampled |
| Availability green dot | `#30a43b` | ⚠️ sampled |
| Amber count pill text | `#b6762f` on pale amber background | ⚠️ sampled |
| Vercel blue `#0070f3` | — | ❓ NOT verified as the token on this page. Do not claim it. |
| Success / error / warning (CRM) | proposed: success `#30a43b` (reuse observed green), error `#e5484d`, warning `#b6762f` (reuse observed amber), neutral grey | ❓ proposed — a CRM needs these, Vercel's page showed none. Label them proposed in every handover. |

Rules: monochrome first, one blue accent, used only for links and progress. Never use two accents for chrome. Never use a coloured border. Primary CTA is black, not blue.

## Typography

| Element | Size / weight | Verification |
|---|---|---|
| Page / section heading ("Usage", "Projects", "Alerts") | ~14px semibold | ⚠️ estimated from pixel heights, not computed CSS |
| Project / customer name | ~14px semibold | ⚠️ estimated |
| Body / activity / commit | 13–14px regular/semibold | ⚠️ estimated |
| Domain / repo / date meta | 12–13px regular, muted grey | ⚠️ estimated |
| Sidebar nav / top bar | ~14px regular, active semibold | ⚠️ estimated |
| Buttons | 13–14px medium | ⚠️ estimated |
| Pills / badges | ~12px | ⚠️ estimated |
| Commit hash / id | mono, ~13px | ⚠️ estimated |

- Family: clean geometric sans throughout, Geist Sans / Geist Mono by appearance only — font-family NOT confirmed from computed styles ❓.
- Implement with Geist Sans + Geist Mono (OFL, free) or Inter + JetBrains Mono. Line-height tight/compact; whitespace lives between cards, not inside rows. Mono only for hashes/ids.
- Type scale for a CRM detail page (proposed, ❓): detail title 20px semibold, section heading 14px semibold, body 14px, meta 12–13px. Do not import landing-page hero sizes (48–72px) into a dashboard.

## Spacing, radius, layout

| Token | Value | Verification |
|---|---|---|
| Top bar height | ~56px | ✅ verified live |
| Sidebar width | ~254px | ✅ verified live |
| Main gutter from sidebar | ~24px | ✅ verified live |
| Two-column gap | ~24px | ✅ verified live |
| Left column width (1919px) | ~403px | ✅ verified live |
| Right column width (1919px) | ~1187px | ✅ verified live |
| Toolbar height | ~38px | ✅ verified live |
| Card size (grid) | ~376×124px, gap ~24px | ✅ verified live |
| List row height | ~75px | ✅ verified live |
| Card radius | ~8px | ⚠️ sampled |
| Input / button radius | ~6–8px | ⚠️ sampled |
| Pill radius | 9999px | ✅ verified live |
| Avatar | circular | ✅ verified live |
| Icon size (nav) | 16px; general icons 16–20px | ✅ verified live |
| Project / customer icon | 32–40px (card), 40px in grid | ✅ verified live |
| Base spacing | 4px scale: 4/8/12/16/24/32px | ❓ proposed, consistent with observed 24px gaps |
| Mobile ~390px | — | ❓ NOT verified live. Proposed collapse (below) is a decision, not an observation. |

Proposed mobile collapse (❓, label as proposed): sidebar becomes a drawer / bottom nav, two columns stack (main list first, Usage/Alerts below), grid becomes 1 column, cards keep ~124px height, toolbar search stays full width with Filter + toggle on a second row. Verify on a real 390px render before shipping.

## Motion

- Restraint only: transform + opacity, 150–250ms. Hover = border/background shift, not a lift. No blur reveal, no `transition: all`, no layout animation.
- Dropdowns are the one place a soft shadow is allowed; cards have no shadow at rest.
- Respect `prefers-reduced-motion`: show full content, no animation.
- Tooltip on hover for dates/ids (observed: "20 days, 1 hour, 3 minutes ago / UTC … / GMT+7 …") — keep this pattern for CRM timestamps: relative time visible, absolute time in tooltip.

## Trí variant (optional, name it when used)

Strict Vercel conflicts with Trí's standing taste in two places. Default strict; use this only on request.

- Radius: card 16px, panel 24px, pill 9999px, input 10px.
- Separation: keep the hairline, add a soft surface step (`#f5f5f5` on `#fafafa`) instead of a shadow.
- Everything else stays Vercel: 254px sidebar, 56px top bar, 13–14px dense type, black primary, one blue accent, grid/list toggle.

## Pass 2 addendum — Geist published + detail pages (11/11/2026)

Full tables live in `references/geist-tokens.md` and `references/vercel-detail-pages.md`. Headlines:

- Geist Blue-700 sampled `#0072F5` (b) — use this as the accent to implement with. Pass 1's team-page link sample `#1f68d6` (b) remains on record; the difference is likely a Display P3 / sRGB render artefact, not two tokens. Do not hard-code both.
- Geist scales (b): Gray 100 `#F2F2F2` → 1000 `#171717` (200/400 both rendered `#EBEBEB` — verify raw); Red-700 `#E5484D`, Amber-700 `#FFB224`, Green-700 `#45A557`, Teal-700 `#12A594`. These replace the proposed-only status tokens from pass 1.
- Ready dot sampled `#50E3C2` (b, approximate). Deployments row pitch 48px, dividers `#E6E6E6` (Gray-300). Current-Production pill: solid `#0072F5` fill, white text; other env pills white + grey border.
- Materials (a): base/small radius 6px, medium/large 12px, tooltip 6px, menu/modal 12px, fullscreen 16px. No numeric shadows are published — do not invent them. Cards keep the observed ~8px dashboard radius; menus/modals use 12px.
- Type classes (a): headings text-heading-72…14, buttons text-button-16/14/12, labels text-label-20…14 (+ mono 14/13/12), copy text-copy-24…13 (+ mono 13). Sizes are in the class names; line-height/letter-spacing/weight are NOT printed on the page — do not invent them.
- Detail page: no top tabs — the left sidebar (28 items) is the nav; left column = record card + "Active … newest first" list, right rail = monitoring/spend/storage/activity panels. Settings swaps the sidebar to 16 items, same shell. Deployments list has no column-header row.

## What NOT to copy

Vercel triangle, wordmark, brand name, original headlines/copy, project names, screenshots, proprietary fonts. Change the accent hue slightly if the blue is kept, rename tokens, write fresh copy.
