---
name: Cyber-Performance Core
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
  pure-black: '#000000'
  surface-glass: rgba(10, 10, 10, 0.8)
  border-muted: '#262626'
  neon-glow: rgba(239, 255, 0, 0.3)
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
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
  label-bold:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-mono:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  gutter: 1rem
  margin-mobile: 1rem
  margin-desktop: 2rem
---

## Brand & Style

This design system is engineered for elite, high-stakes digital environments where performance and precision are paramount. The visual narrative is rooted in a **High-Contrast / Bold** aesthetic, utilizing a "Neon-on-Dark" motif that signals energy, intelligence, and cutting-edge technology.

The brand personality is clinical yet aggressive, designed to evoke a state of "flow" for users engaging with complex data or rigorous testing. By combining **Minimalism** with **Vaporwave-influenced high contrast**, the UI feels like a high-end terminal interface. Key stylistic pillars include:

- **Elite Digital-First:** Surfaces are optimized for pure black displays, reducing ocular strain while maximizing the vibrance of the neon accents.
- **Glassmorphism & Depth:** Strategic use of backdrop blurs creates a sense of sophisticated layering, mimicking a futuristic cockpit or heads-up display (HUD).
- **Subtle Grid Patterns:** Technical heritage is honored through low-opacity background grids that reinforce the precision of the layout.

## Colors

The color palette is strictly dark-mode by default, built upon a foundation of absolute blacks to ensure the primary neon yellow functions as a high-performance beacon.

- **Primary (#EFFF00):** The core "Neon Tech" hue. Reserved for high-priority actions, active states, and success indicators. It represents the "signal" within the noise.
- **Secondary (#FFFFFF):** Used for primary typography and iconography to ensure AAA accessibility and maximum legibility against dark surfaces.
- **Surface Hierarchy:** 
  - **Base:** `#000000` (Pure Black) for the deepest background layer.
  - **Container:** `#0A0A0A` for primary cards and sections.
  - **Elevated:** `#1A1A1A` for interactive elements and secondary containers.
- **Functional Accents:** Subtle border colors (`#262626`) are used to define structure without introducing visual clutter.

## Typography

This design system uses a dual-font strategy to balance aggressive branding with utilitarian function.

- **Manrope (Headlines & Labels):** Chosen for its geometric, modern structure. ExtraBold (800) weights are used for headlines to create a powerful, authoritative visual anchor. Uppercase styling and increased letter spacing are applied to labels for a "tech-spec" appearance.
- **Inter (Body):** Used for all long-form content and data entry. Its neutral, systematic nature ensures high readability in dense data views and testing environments.
- **Scaling:** Headlines utilize tight line-heights and negative letter-spacing to maintain a compact, "heavy" feel on desktop, scaling down for mobile to prevent overflow while maintaining weight.

## Layout & Spacing

The layout is built on a **Rigid Grid** philosophy, mirroring the structured nature of high-performance technical tools.

- **Grid System:** A 12-column desktop grid with 16px gutters. For mobile, the grid collapses to 4 columns with 16px side margins.
- **Vertical Rhythm:** An 8px base unit drives all spacing. For technical dashboards, "Compact" spacing (8px-16px) is preferred. For instructional or testing content, "Expansive" spacing (24px-40px) is used to minimize distraction.
- **Grid Pattern:** A subtle `1px` grid overlay (opacity: 0.05) can be applied to the background of hero sections or dashboard containers to emphasize the system's precision.

## Elevation & Depth

In a pure black environment, traditional drop shadows are ineffective. Instead, hierarchy is established through **Tonal Layering** and **Luminous Outlines**.

- **Surface Tiers:** Depth is communicated by increasing the lightness of the background hex code. High-priority modals sit on `#1A1A1A` surfaces, while the base content rests on `#0A0A0A`.
- **Luminous Outlines:** Interactive elements use a subtle `1px` border. In their active or focused state, these borders transition to the Primary Neon Yellow with a concentrated glow (outer glow radius: 4-8px).
- **Glassmorphism:** Navigation bars and floating sidebars utilize the `surface-glass` variable with a `20px` backdrop blur, allowing a ghost-like impression of the background grid or content to persist beneath the UI.

## Shapes

The shape language is sharp and disciplined, reflecting the "Sat-Alfa" logo's geometric precision.

- **Corner Radius:** A universal "Soft" (4px) radius is used for buttons and inputs. This provides just enough refinement to feel modern without losing the "tech" edge. 
- **Structural Elements:** Cards and major layout containers use `rounded-lg` (8px) to define larger areas of focus.
- **Pill Exceptions:** Success badges and status chips may use a full pill radius to contrast against the otherwise rigid, rectangular layout.

## Components

### Buttons
- **Primary:** Solid `#EFFF00` background with `#000000` text. Sharp `4px` corners. No shadow, but a subtle glow on hover.
- **Secondary:** Transparent background with a `1px` border of `#FFFFFF`. White text.
- **Ghost:** Transparent background with `#EFFF00` text for low-priority navigation.

### Input Fields
- Deep charcoal background (`#0A0A0A`) with a `#262626` border. 
- Text is `#FFFFFF`. On focus, the border shifts to the primary neon color with a `0 0 8px rgba(239, 255, 0, 0.3)` glow.

### Cards & Containers
- Containers use `#0A0A0A` with a `1px` border (`#262626`). 
- For "Featured" cards, the top border can be highlighted with a `2px` neon yellow stroke.

### Progress Indicators
- Linear progress bars use a pure black track with a solid neon yellow fill. 
- No rounded ends; ends are kept flush and rectangular to maintain the digital gauge aesthetic.

### Chips & Status
- **Success:** Solid primary yellow background, black text.
- **Neutral/Processing:** Semi-transparent white border, white text, and a shimmering "scanline" animation across the surface.