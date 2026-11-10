# Landing, pricing and customers pages

Measured at 1280px, Nov 2026.

## Homepage anatomy (~9,600px tall)

1. **Sticky header**:
   - 72px, transparent, `backdrop-filter: blur(20px)`, bottom border `1px rgba(255,255,255,.08)`.
   - Logo on the left. On the right: 13px/400 `#8a8f98` menu, a vertical divider, Docs, then the "Open app" button: 32px pill, background `#e5e5e6`, text `#08090a`, weight 510. It is the only light-filled button on the page.
   - Mega menu on hover over "Product":
     - ~860px wide, `#0f1011`, radius 12, 1px border.
     - Three columns split by hairlines: two of "title 13/500 + two-line `--ink-3` description" and one of plain links.
     - Bottom strip: "New · feature name … Learn more →".
2. **Hero**:
   - Left-aligned at a 40px gutter; no badge and no CTA button in the hero.
   - H1 64px/510, line-height 1.0, letter-spacing -1.4px, broken into 2 lines.
   - Sub 16px/400, two short sentences on two lines.
   - On the right, level with the sub: a small "**New** feature →" link.
   - Directly below: a **screenshot of the product itself**, full width, bleeding off the right edge, fading out at the bottom. No laptop mockup. This is the most worthwhile idea: the real product is the illustration.
3. **Logo band**: 7 single-color white logos in one row, then a mono eyebrow `POWERING THE COMPANIES…` (12px, `#8a8f98`).
4. **Manifesto**: one 40px H2 paragraph. First sentence in white `--ink`, the rest in `#8a8f98`. Two tones in one paragraph carry emphasis without bold. Then 3 thin-line isometric figures labeled in mono `FIG 0.1/0.2/0.3`, split by vertical hairlines.
5. **Four feature sections** on one template (128px top/bottom padding, horizontal hairlines between):
   - Two-column grid: H2 48px/510 (ls -1px) on 2 lines on the left; on the right a 24px/400 lead (lh 1.33, `#d0d6e0`, max ~566px), then "Learn more →" 16px.
   - Below: a **real, interactive UI demo** (draggable board, chat thread, editable diff), not a static image.
   - Section ends with a "Features" row of `Name +` items, 15px `--ink-3`, in 2 columns split by a vertical hairline. Clicking one slides a **"Tech specs" drawer in from the right** (640px, `#0f1011`, radius 8, page dims): mono eyebrow, 48px heading, 16px/1.5 `--ink-3` body, thin-line figure on a grid, sub-items, a spec table at the end.
6. **Changelog**: horizontal timeline of 3 dots (newest dot in an accent color) joined by a hairline. Each entry: 15/500 title, description clamped to 2 lines, uppercase mono date `NOV 4, 2026`. Ends with "View all →".
7. **Testimonials**: 2 large cards, radius 8, **saturated backgrounds** (pastel blue–purple gradient, lime `#e4f222`), black text. 30px quote with hanging quotation mark, logo + name + title at the bottom. The only strong color on the page, so it stands out.
8. **Prefooter CTA**: centered, 40px H2 on 2 lines, two 44px pills: "Open app" (light) and "Download" (`rgba(255,255,255,.05)`).
9. **Footer**: top border `#23252a`. Logo column, then 5 link columns: 13/510 white headings, 13px `#8a8f98` links, 30px line height. 13px legal line at the bottom.

## Pricing page (~6,100px)

- H1 48/510. Four plan columns split by vertical hairlines (no cards): plan name 24/590, bold price + gray unit ("per user/month"), hairline, condition line (accent "Billed yearly" toggle or "Free for everyone"), feature list with round ✓ icons; later plans start with "All Free features +". "Get started" 40px pill, `rgba(255,255,255,.05)`, 13px; Enterprise uses "Contact sales".
- Logo band, then "Customer stories →".
- **Comparison table**: a 56px plan-name row at 16px that **sticks** under the site header; 44px rows with no horizontal lines, only vertical hairlines between columns; round ✓ vs gray ✕, or text values ("15 pipelines", "Unlimited"); groups split by H2; last row repeats the CTAs.

## Customers page

- H1, then a row of text tabs (selected white, others gray): Featured, SaaS, AI, Fintech…
- Three-column grid split by vertical hairlines. Card: 16:9 image, radius 4 (black-and-white photo with a white logo on top, or a pastel gradient), 20px white 2-line title, gray "Read story →" / "Watch video →".
- Logo card grid: logo, name, one-line story, tags "SaaS, Enterprise", "Visit site ↗". The last card is "Your company — Make the switch" (a CTA disguised as a card).

## Responsive

Main breakpoint `max-width: 640px` (secondary 768, 1024, 1280; `min-width: 1536`), plus `any-hover` and `prefers-reduced-motion`. At ≤640: hero H1 38px, max width 360px; subpage H1 lh 36, ls -.69; prefooter H2 38px centered; 2–4 column grids collapse to 1; menu becomes ☰.

## Marketing tokens

- Background `#08090a`; steps `#0f1011`, `#1c1c1f`, `#232326`.
- Text `#f7f8f8`, `#d0d6e0`, `#8a8f98`, `#62666d`.
- Borders `#23252a`, `#34343a`.
- Accent `#7170ff`, brand `#5e6ad2`, almost unused on the landing page.
- Content width 1024px (hero and demos up to 1200px), 24px side padding.
- Fonts: a sans (source: Inter Variable `cv01 ss03`) for text, **a 12px monospace** for eyebrows, FIG labels and dates.
- Easing `cubic-bezier(.25,.46,.45,.94)`.

## Landing rules

- The page is almost **monochrome**. Color appears only inside product demos and testimonial cards.
- Hierarchy from two text tones, not gradient text, glows or 3D icons.
- One light CTA, repeated in header and prefooter. No button in the hero.
- Even sections (128px padding, hairline separators), two-column "heading | lead" grid.
- Technical detail lives in drawers, so the page stays short while specs remain one click away.
- Mono labels (FIG, dates, eyebrows) make the page read like technical documentation.
