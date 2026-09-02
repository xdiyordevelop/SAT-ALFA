---
name: Neon Tech Performance
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c8c8ab'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
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
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
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
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  neon-yellow: '#EFFF00'
  pure-black: '#000000'
  surface-dark: '#0A0A0A'
  surface-glass: rgba(10, 10, 10, 0.8)
  border-muted: '#262626'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

This design system is built for high-performance educational environments, specifically tailored for digital testing and AI-driven analytics. The visual language moves away from soft, traditional academic palettes toward a **High-Contrast / Bold** aesthetic that feels technical, urgent, and precise.

The brand personality is authoritative yet innovative. By utilizing a "Neon-on-Black" theme, we evoke a sense of digital focus and high energy. The style leverages:
- **Digital Professionalism:** A clean, rigorous execution that prioritizes legibility and data density.
- **Glassmorphism:** Subdued dark glass overlays to provide depth without breaking the high-contrast color narrative.
- **Tech-Forward Energy:** Utilizing the neon yellow as a functional beacon for actions, progress, and success.

## Colors

The palette is strictly optimized for dark mode to reduce eye strain during long testing sessions while maintaining maximum visual impact.

- **Primary (#EFFF00):** Used for primary actions, success states, and progress indicators. This is the "high-energy" signal within the application.
- **Surface Colors:** The background is a pure black (`#000000`), with UI containers using a layered approach of `#0A0A0A` and `#1A1A1A` to create subtle hierarchy.
- **Contrast & Accents:** White is used exclusively for high-readability body text and iconography on dark surfaces.
- **Functional States:** While the primary neon yellow handles success, neutral grays are used for disabled states, and high-saturation reds are reserved for critical errors.

## Typography

This design system utilizes **Manrope** across all levels to ensure a modern, geometric feel that balances the "tech" aesthetic with readability.

- **Headlines:** We employ heavy weights (ExtraBold 800) for top-level headers to mimic the bold, geometric nature of the brand logo. This creates a strong visual anchor on the page.
- **Body Text:** Standard weights (Regular 400) are used for body copy to ensure comfortable reading during long-form SAT passages.
- **Labels:** Small labels and metadata use Bold (700) with slight letter spacing and uppercase styling to differentiate technical data from prose.
- **Responsive Scaling:** Headline sizes are aggressively reduced on mobile to maintain the high-contrast impact without breaking layout integrity.

## Layout & Spacing

The layout philosophy follows a **Rigid Grid** model, emphasizing the technical and structured nature of a testing platform.

- **Grid System:** A 12-column desktop grid with fixed 16px gutters.
- **Rhythm:** An 8px base unit drives all padding and margin decisions, ensuring a mathematical consistency across the UI.
- **Density:** High information density is encouraged for admin dashboards, while student testing interfaces utilize more generous whitespace (`xl` spacing) to foster focus and minimize distraction.
- **Adaptation:** On mobile devices, side margins shrink to 16px, and complex data tables reflow into stacked card layouts.

## Elevation & Depth

In this dark-centric system, depth is communicated through **Tonal Layering** and **Glassmorphism** rather than traditional soft shadows.

- **Surface Tiers:** 
    - Level 0: Pure Black (`#000000`) for the main background.
    - Level 1: Deep Gray (`#0A0A0A`) for primary containers and cards.
    - Level 2: Lighter Gray (`#1A1A1A`) for elevated elements like modals or popovers.
- **Glassmorphism:** To maintain a "digital" feel, overlays and navigation bars use a semi-transparent dark background (`rgba(10, 10, 10, 0.8)`) with a `20px` backdrop blur. 
- **Outlines:** Elevated elements use a `1px` solid border (`#262626`) to define their edges against the pure black background, ensuring structural clarity.

## Shapes

The shape language is sharp and disciplined. We avoid overly rounded or "friendly" organic shapes in favor of professional precision.

- **Core Radius:** A standard "Soft" (4px) radius is applied to buttons, input fields, and small UI components.
- **Large Components:** Cards and major sections utilize an 8px (`rounded-lg`) radius to provide a subtle distinction from the background without feeling "bubbly."
- **Interactive States:** Focus states and active selections utilize sharp, high-contrast borders in the primary neon yellow to provide unmistakable feedback.

## Components

### Buttons
- **Primary:** Solid Neon Yellow (`#EFFF00`) with Pure Black text. Bold weight. Minimal 4px rounding.
- **Secondary:** Transparent background with a 1px White or Neon Yellow border. White text.
- **Ghost:** Transparent background with Neon Yellow text for low-priority actions.

### Input Fields
- Dark backgrounds (`#0A0A0A`) with a subtle `1px` border (`#262626`).
- On focus: Border changes to Neon Yellow with a subtle glow effect (box-shadow: 0 0 8px rgba(239, 255, 0, 0.3)).

### Cards & Containers
- Built with Level 1 or Level 2 surface colors.
- Use `glass-dark` utility for sidebar and navigation elements to allow background content to subtly bleed through.

### Chips & Badges
- High-contrast indicators. Success chips use the Primary color background with black text.
- Categorization chips use dark backgrounds with neon yellow borders.

### Progress Bars
- Background: `#1A1A1A`.
- Fill: Neon Yellow (`#EFFF00`).
- No rounded ends; strictly rectangular or `rounded-sm` for a more "digital gauge" appearance.

### Specialized Components
- **KaTeX Blocks:** Mathematical formulas should be rendered in White for maximum contrast against the dark background, with key variables highlighted in Neon Yellow.
- **AI Job Status:** Uses a "Shimmer" animation effect using the primary neon color to indicate background processing.