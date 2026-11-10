---
name: Editorial High-Contrast
colors:
  surface: '#FFFFFF'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#45464c'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#575e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2b'
  on-primary-container: '#7d8497'
  inverse-primary: '#c0c6db'
  secondary: '#005cba'
  on-secondary: '#ffffff'
  secondary-container: '#5095fe'
  on-secondary-container: '#002d61'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#410002'
  on-tertiary-container: '#f63a35'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#d7e3ff'
  secondary-fixed-dim: '#aac7ff'
  on-secondary-fixed: '#001b3e'
  on-secondary-fixed-variant: '#00458e'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
  surface-subtle: '#F9FAFB'
  border-hairline: '#E5E7EB'
  border-dark: '#111827'
  live-red: '#E11D48'
  ticker-bg: '#0F172A'
typography:
  masthead:
    fontFamily: Rubik
    fontSize: 2.75rem
    fontWeight: '900'
    lineHeight: '1'
    letterSpacing: -0.04em
  headline-lead:
    fontFamily: Rubik
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lead-mobile:
    fontFamily: Rubik
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.125rem
    letterSpacing: -0.01em
  headline-primary:
    fontFamily: Rubik
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 1.875rem
    letterSpacing: -0.015em
  headline-secondary:
    fontFamily: Rubik
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.625rem
  headline-compact:
    fontFamily: Rubik
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.375rem
  editorial-quote:
    fontFamily: Libre Caslon Text
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-lead:
    fontFamily: Rubik
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
  body-regular:
    fontFamily: Rubik
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
  body-compact:
    fontFamily: Rubik
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  eyebrow-category:
    fontFamily: Rubik
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.08em
  timestamp:
    fontFamily: Rubik
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers an authoritative, high-density digital broadsheet experience tailored for investigative and independent European journalism. Built on the tenets of modern editorial minimalism and high-contrast structural discipline, the interface prioritizes truth, readability, and structural hierarchy over decorative embellishment.

The visual mood draws inspiration from classic European and international broadsheets (The Guardian, Reuters, Politico Europe, and The New York Times), juxtaposing uncompromising ink-black type with crisp structural rules and deliberate whitespace. The emotional tone is urgent, analytical, objective, and intellectually rigorous.

Key design attributes:
- **Architectural Rules:** Crisp 1px hairline dividers separate stories, sections, and briefs, replacing drop shadows with disciplined editorial geometry.
- **Editorial Contrast:** Heavy sans-serif display headers paired with literary serifs for long-read analyses and analytical excerpts.
- **High Information Density:** Balanced multi-tier news grids, tight live briefing tickers, and modular cards that facilitate rapid scanning without visual noise.

## Colors

The palette embraces a disciplined monochrome foundation rooted in ink and paper, punctuated by focused journalistic accents:

- **Primary (`#111827`):** Deep editorial charcoal/black used for the iconic masthead, primary headlines, strong dividers, and core navigation text.
- **Secondary (`#0066CC`):** Crisp investigative blue applied to hyperlink transitions, active section markers, interactive states, and analytical story tags.
- **Tertiary (`#DC2626`):** Urgent breaking news red reserved strictly for flash alerts, live updates, and urgent bulletin badges.
- **Neutral (`#6B7280`):** Neutral slate used for metadata, timestamps, read times, photo credits, and secondary body copy.

All layout containers sit on a stark white canvas (`#FFFFFF`) with subtle cool-tinted framing (`#F9FAFB`) for sidebars and background panels. Structural separators alternate between subtle borders (`#E5E7EB`) for standard content division and solid dark ink (`#111827`) for section anchor tops.

## Typography

The typographic hierarchy is grounded in high-contrast dual-font interplay:

- **Primary Headline & UI Engine (Rubik):** Engineered for impactful, immediate legibility in Bulgarian Cyrillic and Latin alphabets. Used in weights from 500 (body/meta) through 700/900 for striking, condensed headlines and the masthead.
- **Editorial Voice & Pull Quotes (Libre Caslon Text):** Introduces traditional broadsheet gravitas. Reserved exclusively for direct political quotations, editorial lead commentary, analytical asides, and italicized pull quotes.
- **Eyebrow Meta & Badges:** Rendered in uppercase bold `Rubik` with wide tracking (`0.08em`) to delineate categorical taxonomy (e.g., `САЩ • 2 МИН ЧЕТЕНЕ`, `БЪЛГАРИЯ`, `ПОЛИТИКА • ЯПОНИЯ`).

## Layout & Spacing

The portal is structured around a rigorous 12-column desktop grid with a maximum content canvas of 1280px, balancing extreme density with rhythmic whitespace.

- **Desktop (1024px+):** 12 columns with 24px (`1.5rem`) gutters. The lead package organizes into an asymmetrical 8-column main package (major investigative lead + dual sub-leads) flanked by a 4-column secondary analysis or breaking news column.
- **Tablet (768px - 1023px):** 8 columns with 20px gutters. Analysis columns stack below the primary lead story, while the news digest transforms into a 2-column modular grid.
- **Mobile (< 768px):** 4 columns with 16px (`1rem`) margins. Stacks sequentially from Lead Headline -> Image -> Digest -> Live Feed to ensure instant top-of-funnel orientation.
- **Column Separators:** Grid divisions are reinforced by vertical 1px hairline rules (`border-hairline`) running continuously between main content and sidebars.

## Elevation & Depth

True to broadsheet tradition, this system avoids atmospheric drop shadows and blurred depth planes. Depth and layer hierarchy are communicated strictly through:

- **Hairline Rules:** 1px borders in `#E5E7EB` delineate cards, feed items, and column bounds.
- **Ink Anchors:** 2px to 3px solid `#111827` top rules establish section boundaries (e.g., above "БРИФИНГ" and "ДЪЛГО ЧЕТЕНЕ"), guiding the reader's vertical cadence.
- **Tonal Contrast:** Subtle container fills (`#F9FAFB`) delineate callouts, long-read special packages, and market data modules.
- **Direct Layering:** Floating alert banners (e.g., breaking news) sit directly atop the masthead using solid `#0F172A` or `#DC2626` backgrounds with crisp 1px borders rather than diffuse drop shadows.

## Shapes

The design system strictly adheres to **Sharp (`roundedness: 0`)** geometry:
- All cards, image containers, badges, input fields, and action buttons have 0px border radius.
- Rectilinear discipline reflects print newspaper sheets, reinforcing journalistic rigor, structural strength, and institutional credibility.
- Subtle badge highlights use solid rectangular bounding boxes or pure unboxed text with bullet separators.

## Components

### Masthead & Navigation
- **Primary Brand Bar:** Centered or left-aligned `DAILYBG` logo in ultra-bold Rubik uppercase with tight tracking. A 1px bottom border spans the full viewport width.
- **Utility Nav:** Monospaced or compact Rubik labels (`За нас`, `Контакти`, `Архив`, `Кариери`) set in `#6B7280` that shift to `#111827` on hover.

### Story Cards & Lead Packages
- **Hero Lead Package:** Full-width hero image with an aspect ratio of 16:9 or 3:2, followed immediately by uppercase category tag, 2.25rem bold headline, two-paragraph summary, and a discrete publication date.
- **Secondary Story Columns:** Side-by-side thumbnail format or vertical image-over-headline cards separated by vertical hairline borders.
- **Opinion & Long-Read Cards:** Distinctive block with editorial serif pull quote (`Libre Caslon Text`), framed by a left 3px accent line, accompanied by the author's portrait in monochrome.

### Live Briefing Feed
- **Timestamp Ticker:** Vertical stream with solid `#111827` or `#0066CC` time markers (`18:46`, `18:42`).
- **Interactive Links:** High-contrast blue headline links (`#0066CC`) that underline on hover, followed by a one-sentence synopsis.
- **Live Indicator:** Glowing or pulsing red pill with uppercase bold `LIVE` text.

### Category Badges & Metadata
- **Format:** Uncontained uppercase micro-copy (e.g., `САЩ • 2 МИН ЧЕТЕНЕ`) with generous letter spacing, positioned strictly above headlines.
- **Color Coding:** Category names inherit `#111827` or `#6B7280`, while breaking or exclusive flags utilize `#DC2626`.

### Buttons & Interactive Controls
- **Primary Button:** Solid `#111827` background, sharp corners, white bold text, 0.75rem padding inline.
- **Text Link Button:** Bold label followed by a directional glyph (`Прочетете специалния доклад →`) in `#0066CC`.
- **Search & Input Fields:** Minimalist rectangular box with 1px `#E5E7EB` border, focusing to a solid 1px `#111827` ring without rounded corners.