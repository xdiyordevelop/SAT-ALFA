---
name: Elite Performance Education
colors:
  surface: '#131408'
  surface-dim: '#131408'
  surface-bright: '#393a2b'
  surface-container-lowest: '#0e0f04'
  surface-container-low: '#1c1c0f'
  surface-container: '#202013'
  surface-container-high: '#2a2b1d'
  surface-container-highest: '#353627'
  on-surface: '#e5e4ce'
  on-surface-variant: '#c8c8ab'
  inverse-surface: '#e5e4ce'
  inverse-on-surface: '#313123'
  outline: '#929277'
  outline-variant: '#474832'
  surface-tint: '#c3d000'
  primary: '#ffffff'
  on-primary: '#2f3300'
  primary-container: '#deed00'
  on-primary-container: '#626900'
  inverse-primary: '#5c6300'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#123539'
  tertiary-container: '#c5e9ee'
  on-tertiary-container: '#496a6e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#deed00'
  primary-fixed-dim: '#c3d000'
  on-primary-fixed: '#1b1d00'
  on-primary-fixed-variant: '#454a00'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#c5e9ee'
  tertiary-fixed-dim: '#aacdd2'
  on-tertiary-fixed: '#001f23'
  on-tertiary-fixed-variant: '#2b4c50'
  background: '#131408'
  on-background: '#e5e4ce'
  surface-variant: '#353627'
  rich-black: '#0a0a0a'
  deep-gray: '#1a1a1a'
  border-subtle: '#262626'
  glass-surface: rgba(26, 26, 26, 0.6)
  neon-glow: rgba(239, 255, 0, 0.15)
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 32px
  gutter: 24px
  section-gap: 64px
---

## Brand & Style

This design system targets an "Elite High-Performance Education Platform" aesthetic. It moves away from the casual "Neon Tech" tropes toward a more disciplined, professional evolution. The visual narrative is built on the concept of "Digital Precision"—where every pixel serves a functional purpose and the UI evokes the focused intensity of a professional flight simulator or high-frequency trading terminal.

The core style is a sophisticated hybrid of **High-Contrast Dark Mode** and **Deep Glassmorphism**. It prioritizes extreme legibility and data density for high-stakes environments. The brand personality is authoritative, innovative, and uncompromising. By shifting the neon yellow from a primary fill to a surgical highlight, the system creates a sense of "active status" and "high-priority intelligence" rather than mere decoration. Subdued tech-inspired geometric patterns and grid overlays provide a subtle structural depth that anchors the content.

## Colors

The palette is engineered for high-performance dark mode, utilizing deep, ink-like blacks and layered grays to minimize eye strain during intense sessions.

- **Primary (#efff00):** Reserved for surgical application. It denotes critical utility, high-priority progress, and active interactive states. It is rarely used as a background fill, instead appearing as 1px borders, status indicators, or "glow" accents.
- **Surface Strategy:** The canvas begins at a "Rich Black" (`#0a0a0a`). Structural containers utilize "Deep Gray" (`#1a1a1a`) to establish hierarchy without relying on heavy shadows.
- **Neutral/Secondary:** Pure white is used for high-contrast typography, while mid-tones are strictly controlled to maintain the system's "Elite" visual discipline.
- **Glassmorphism:** Surfaces use a layered alpha channel (`rgba(26, 26, 26, 0.6)`) combined with a heavy backdrop blur (32px+) to create a sense of physical depth and premium material construction.

## Typography

This system employs a dual-font strategy to balance technical authority with utilitarian clarity.

- **Manrope (Headlines):** Used for all display and headline levels. Its geometric structure provides the "tech-forward" feel. We utilize weights from 600 (SemiBold) to 800 (ExtraBold) to create a commanding hierarchy.
- **Inter (Body & Labels):** The industry standard for data-heavy interfaces. It is used for all prose, data tables, and interface controls. Its neutral character ensures that long-form educational content remains the focus.
- **Hierarchical Play:** Technical metadata and "overlines" use `label-caps` (Inter Bold, Uppercase, tracked out) to distinguish system information from user content.
- **Readability:** Body text uses a generous 1.6x line height to ensure comfortable scanning of complex educational passages.

## Layout & Spacing

The layout is governed by a **Fixed Grid** philosophy that mimics technical blueprints.

- **Grid Model:** A 12-column desktop layout with 24px gutters. Content is centered within a 1440px maximum width to maintain professional composition.
- **Background Patterns:** A subtle 24px square dot-grid pattern is overlaid on the `#0a0a0a` background at 5% opacity, reinforcing the "precision education" theme.
- **Scaling:**
    - **Desktop:** Generous section gaps (64px) to allow the glassmorphic layers to "breathe."
    - **Tablet:** Margins reduce to 24px; gutters remain 24px to maintain readability.
    - **Mobile:** Margins shrink to 16px. Grid columns reflow to a 4-column system. Headlines scale down using the `headline-lg-mobile` token.

## Elevation & Depth

Visual hierarchy is established through a system of **Tonal Layers** and **Reflective Outlines** rather than soft ambient shadows.

- **The Stack:**
    - **Level 0 (Floor):** Rich Black (`#0a0a0a`) with the subtle grid pattern.
    - **Level 1 (Cards):** Deep Gray (`#1a1a1a`) with a 1px `border-subtle` (`#262626`).
    - **Level 2 (Active/Overlays):** Glassmorphic surfaces with a 32px backdrop blur and a secondary top-down gradient stroke (White at 10% to White at 2%).
- **Interactive Depth:** When a card is hovered, it does not "lift" with a shadow; instead, its 1px border transitions from `#262626` to `#efff00` (Neon Yellow), and a faint neon glow (`rgba(239, 255, 0, 0.05)`) appears behind the element.

## Shapes

The shape language is "Soft" yet disciplined, favoring precision over friendliness.

- **Standard Radius:** 4px (0.25rem) is used for all functional elements (buttons, inputs, chips). This creates a "machined" look.
- **Large Surfaces:** Cards and main content areas use 8px (0.5rem) to provide just enough definition to feel premium and contemporary.
- **Interactive Indicators:** Success states and progress indicators use 0px (Sharp) or 2px (Small) radii to emphasize a "digital gauge" aesthetic.

## Components

### Buttons
- **Primary:** High-contrast execution. White background with Rich Black text (Bold). A 1px Neon Yellow outer "halo" (2px offset) is added only on hover or focus.
- **Action:** Deep Gray background with 1px Neon Yellow border. Neon Yellow text.
- **Tertiary:** Ghost style. White text with 1px `border-subtle`.

### Glass Containers
- Navigation bars and sidebars must use the `glass-surface` token with a minimum 40px backdrop blur. They are capped with a 1px solid border on the side facing the main content.

### Input Fields
- Background: `#1a1a1a`. Border: 1px `#262626`.
- **Focus State:** The border sharpens to Neon Yellow, and the label (using `label-caps`) shifts color to the primary neon.

### Progress & Performance
- Progress bars are strictly 4px tall. 
- Background: `#262626`. 
- Fill: Neon Yellow. 
- **Premium Detail:** A small vertical "needle" or "tick" marks the 50% or 100% goals using a 1px White line.

### Data Chips
- Small, technical badges. Dark background, 1px white border at 20% opacity. Text is Inter Bold 10px, uppercase. Status-specific chips use a 4px solid Neon Yellow circle icon to the left of the text.