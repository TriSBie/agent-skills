# App tokens (dark is the default)

Colors are written in **LCH** on hue 272 with very low chroma (about 0.4 to 1.9), so the grays are slightly cool and evenly spaced. Background steps rise with L:

| Role | Dark | Light |
|---|---|---|
| App / sidebar background | `lch(2.6 .4 272)` | `#efeff0` |
| Panel | `lch(5.5 .4 272)` | `#f9f9fa`–`#fcfcfd` |
| Card / group header | `lch(9.2 .85 272)` | `#fff` |
| Popover / menu | `lch(12.7 .85 272)` | `#fff` |
| Chip, secondary button | `lch(17.6 1.6 272)` | `#ececee` |
| Hover / selected | `lch(16.7 1 272)` | `#e6e6e9` |
| Border 1/2/3 | `lch(9.8)`, `lch(14.2)`, `lch(21.4)` | `#e2e2e2`, `#dcdbdd`, `#d0d0d4` |
| Text 1/2/3 | `lch(100)`, `lch(90.5)`, `lch(61.8)`: all >= 4.8:1 on every background | `#1b1c20`, `#3c4149`, `#66656e` (>= 4.6:1) |
| Ink 4 (decoration, disabled) | `lch(37)`: 2.0-2.8:1, **never for text** | `#a3a2aa` (~2.2:1), same rule |
| Accent (primary button) | `lch(44 59 <hue>)`; text `lch(100 5 <hue>)`: >= 4.7:1 for any hue | same |
| Focus ring | `1px solid` accent | |
| Selection | `color-mix(accent 40%)` | |

The source product used `lch(48 59 288)` (its brand color, ~4.2:1 with white text). v1 drops lightness to 44 so every hue passes AA. Change the hue (`--accent-h`) for your project. The same values live in `assets/tokens.json`; `node scripts/check.mjs` fails if any text token drops below 4.5:1.

- **Status / label colors**: blue `#4ea7fc`, red `#eb5757`, green `#27a644`, orange `#fc7840`, yellow `#f0bf00` (In Progress), indigo `#5e6ad2` (Done), teal `#00b8cc`. Status icons are 14px circles: dashed = Backlog, empty = Todo, half = In Progress, filled + ✓ = Done, ✕ = Canceled.
- **Type**: source uses Inter Variable with `cv01`/`ss03` and odd weights 450 and 510. Pick your own font. Scale:
  - 12px: chips, buttons, meta.
  - 13px: app body, sidebar, rows.
  - 15px: editor (lh 1.6, weight 450), Activity heading.
  - 18px: modal title.
  - 24px: issue H1.
- **Radii**: 4px (kbd), 6px (editor blocks), 8px (controls, sidebar items, cards), 10px (settings cards), 12px (panel, popover, toast), 16px (modal), 9999px (buttons, tabs, chips). All in-app buttons are pills.
- **Shadows**:
  - Card: `0 0 0 1px lch(100 0 0/.048), 0 .5px 1px 1px lch(0 0 0/.3)`. Ring instead of border.
  - Popover: three layers of `lch(0 0 0/.125)` (`0 3px 8px`, `0 2px 5px`, `0 1px 1px`).
- **Sizes**: control 28px, row 44px, header 52px, sidebar 244px, scrollbar 10px.
- **Easing**: `cubic-bezier(.23,1,.32,1)` (out-quint). Popovers and modals pop in ~160ms.
