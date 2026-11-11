# Geist tokens — published design system (pass 2)

Source: `vercel.com/geist` → `/geist/introduction`, `/geist/colors`, `/geist/typography`, `/geist/materials`, visited live 11/11/2026, 10:59–11:03. Read-only; one swatch click copied a token name, no other side effect.

Verification: (a) published on the page / right-click raw value · (b) sampled from screenshot pixels, NOT a token definition · (c) estimated. Computed CSS was NOT accessible in this browser view — no computed-CSS values are claimed anywhere. "All raw colors use Display P3" (a) — sRGB screenshots can shift values, so re-verify (b) values against right-click raw values before hard-coding, especially Gray 200/400, Blue 800/900, Purple 900.

## Colour model (a)

- Token model: 10 steps 100–1000 per scale. Steps 1–3 are text/backgrounds, 4–6 borders, 7–8 interactive, 9–10 text/foregrounds. Dark mode inverts the scale.
- Clicking a swatch copies `--ds-<color>-<step>`; right-clicking copies the raw value.
- Background 1 `#FFFFFF`, Background 2 `#FAFAFA` (a, right-click raw values). Page background `#FAFAFA` (sampled).

## Scales (b unless marked a)

Update 11/11/2026 ~11:35: right-click "Copy HEX" on vercel.com/geist/colors verified these raw values (a), each confirmed by the page's "Copied …" toast — Blue 700 #0072F5, Red 700 #E5484D, Amber 700 #FFB224, Green 700 #45A557, Gray 1000 #171717, Gray 300 #E6E6E6, Gray 200 #EBEBEB, Teal 700 #12A594. All eight match the CRM tokens exactly. The remaining scale steps stay (b) until verified the same way. This also settles the pass 1 vs pass 2 accent question: the published Blue-700 raw value is #0072F5, so the team-page sample #1f68d6 was a render artefact, not a second token.

Gray: 100 `#F2F2F2`, 200 `#EBEBEB`, 300 `#E6E6E6`, 400 `#EBEBEB`*, 500 `#C9C9C9`, 600 `#A8A8A8`, 700 `#8F8F8F`, 800 `#7D7D7D`, 900 `#4D4D4D`, 1000 `#171717`. *200/400 rendered identically — verify raw. Gray-alpha renders visually identical to Gray on white.

Blue: 100 `#F0F7FF`, 200 `#EBF5FF`, 300 `#E0F0FF`, 400 `#CCE6FF`, 500 `#99CEFF`, 600 `#52AEFF`, 700 `#0072F5`, 800 `#0062D1`*, 900 `#0068D6`*, 1000 `#00254D` (a, verified by right-click, matched the pixel sample exactly). *800/900 non-monotonic in the sRGB render — P3 artefact, verify raw.

Red (error): 100 `#FFF0F0`, 200 `#FFEBEB`, 300 `#FFE6E6`, 400 `#FDD8D8`, 500 `#F8B9B9`, 600 `#F87275`, 700 `#E5484D`, 800 `#DA2F35`, 900 `#CB2A2F`, 1000 `#391417`.

Amber (warning): 100 `#FFF6E6`, 200 `#FFF4D6`, 300 `#FEF0CD`, 400 `#FFDD8F`, 500 `#FFC96B`, 600 `#F5B047`, 700 `#FFB224`, 800 `#FF990A`, 900 `#A35200`, 1000 `#4E2009`.

Green (success): 100 `#EFFBEF`, 200 `#EBFAEB`, 300 `#DAF6DA`, 400 `#C6F1C7`, 500 `#99E69E`, 600 `#6CDA75`, 700 `#45A557`, 800 `#398E4A`, 900 `#297A3A`, 1000 `#1B311E`.

Teal: 100 `#EEFCF9`, 200 `#E5FAF6`, 300 `#D4F7F0`, 400 `#BEF4EB`, 500 `#86EAD9`, 600 `#45DEC5`, 700 `#12A594`, 800 `#0D8C7D`, 900 `#067A6E`, 1000 `#073C34`.

Purple: 100 `#F9F0FF`, 200 `#F9F1FE`, 300 `#F4E8FC`, 400 `#EDDCF9`, 500 `#D5B1F1`, 600 `#BF89EC`, 700 `#8E4EC6`, 800 `#763DA9`, 900 `#7820BC`*, 1000 `#2E004D`. *900 lighter than 800 in render.

Pink: 100 `#FFEBF5`, 200 `#FEECF2`, 300 `#FCE3EC`, 400 `#F9D7E2`, 500 `#F5B8CC`, 600 `#EE87A7`, 700 `#EA3E83`, 800 `#DF2670`, 900 `#BD2864`, 1000 `#430A23`.

### What this corrects in pass 1

- Pass 1 sampled the link blue as `#1f68d6` (b) on the team page and left `#0070f3` unverified. Pass 2 samples Geist Blue-700 as `#0072F5` (b) and the Current-Production pill fill as `#0072F5` (b). Treat `#0072F5` as the Geist blue to implement with; `#1f68d6` remains the team-page link sample — the difference is likely a P3/sRGB render artefact, not two tokens. Do not hard-code both.
- Pass 1 had no error/warning/success hexes. Pass 2 supplies them as Geist scales (b): error Red-700 `#E5484D`, warning Amber-700 `#FFB224`, success Green-700 `#45A557`. These are now the CRM status tokens — still (b), not computed CSS.
- Ready status dot on a deployment was sampled `#50E3C2` (b, mint/teal, edge-influenced pixel, approximate). It does not match Green-700; use it only as an observed dot, and use Green-700 for status text/pills.
- Divider on the Deployments list sampled `#E6E6E6` (b) = Gray-300. Use Gray-300 for hairline dividers, Gray-200 `#EBEBEB` for the sidebar active background (pass 1 sampled `#ebebeb`).

## Typography (a)

- Geist Sans. Classes — Headings: text-heading-72/64/56/48/40/32/24/20/16/14; Buttons: text-button-16/14/12; Labels: text-label-20/18/16/14 and text-label-mono-14/13/12; Copy: text-copy-24/20/18/16/14/13 and text-copy-mono-13.
- The number in each class name is the size in px. The page states each class pre-sets font-size, line-height, letter-spacing and font-weight, but those line-height/letter-spacing/weight numbers are NOT printed on the page, and clicking a row only copies the class name — so they are not reported here. Do not invent them.
- Font (a): Geist Sans, Serif, Mono and Pixel — variable fonts; 9 weights; 652 glyphs; 9 stylistic sets; Latin 387 + Cyrillic 39 languages. `npm i geist`; `import { GeistSans } from 'geist/font/sans'`, `{ GeistMono } from 'geist/font/mono'`. The sidebar "Font" link goes to vercel.com/font; `/geist/font` redirects to `/geist/introduction`.

## Materials — radius & shadows (a)

- Presets for radii, fills, strokes and shadows. Surface: material-base — radius 6px, everyday use; material-small — radius 6px, slightly raised; material-medium — radius 12px, further raised; material-large — radius 12px, further raised.
- Floating: material-tooltip — lightest shadow, corner 6px, the only floating element with a triangular stem; material-menu — radius 12px, lift from page; material-modal — radius 12px, further lift; material-fullscreen — radius 16px, biggest lift.
- Rules: use Material instead of hand-rolling radii/fills/strokes/shadows; don't stack two Materials on one element; align elevation with its z-index band; use the lowest elevation that still reads.
- No numeric box-shadow values are printed anywhere on the page. Do not invent them.
- Reconciliation with pass 1: pass 1 sampled card radius ~8px (b). Geist materials say 6px (base/small) and 12px (medium/large). For a CRM, use 8px for cards as observed on the live dashboard, 6px for tooltips, 12px for menus/modals — and name the 8px as the observed dashboard value, not a Geist material preset.

## What NOT to copy

Geist is Vercel's design system — learn its token model, do not ship Vercel's brand. Never copy the Vercel triangle, wordmark, brand name, original copy, or screenshots. Geist Sans/Mono are free (OFL via `npm i geist`); use them or Inter + JetBrains Mono as the free fallback.
