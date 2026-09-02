---
name: High-Performance Kinetic
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5c6300'
  on-secondary: '#ffffff'
  secondary-container: '#dcea00'
  on-secondary-container: '#616800'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c1c'
  on-tertiary-container: '#858383'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#deed00'
  secondary-fixed-dim: '#c3d000'
  on-secondary-fixed: '#1b1d00'
  on-secondary-fixed-variant: '#454a00'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  neon-yellow: '#efff00'
  charcoal-black: '#0a0a0a'
  status-success: '#16a34a'
  status-error: '#dc2626'
typography:
  headline-xl:
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
    lineHeight: '1.4'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
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
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  2xl: 4rem
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
---

## Brand & Style

This design system embodies a **High-Performance Kinetic** aesthetic, merging technical precision with high-energy visuals. It is engineered for professional environments that demand speed, clarity, and a modern edge. The personality is unapologetically bold, utilizing high-contrast transitions and a clinical layout structure to evoke feelings of efficiency and cutting-edge innovation.

The visual style leans into **Minimalist Tech**, characterized by:
- **High-Contrast Functionalism:** Heavy charcoal typography set against stark, clean surfaces.
- **Strategic Luminance:** Neon yellow is used exclusively as a functional signifier for primary actions and critical data points.
- **Industrial Precision:** A rigid adherence to grid structures and utilitarian spacing, ensuring the interface feels like a high-end tool rather than a generic platform.

## Colors

The palette is anchored by a high-contrast relationship between **Deep Charcoal (#0a0a0a)** and **Neon Yellow (#efff00)**. 

- **Primary Canvas:** A near-white or very light gray background provides a clean, breathable foundation that maintains focus on content.
- **Primary Action & Accents:** Neon Yellow is reserved for strategic impact. It is the "kinetic" element of the UI, used for primary buttons, active states, and critical highlights. To ensure WCAG compliance, text on neon yellow should always be the deep charcoal primary color.
- **Typography & Structure:** Deep charcoal serves as the primary ink, providing maximum legibility and a sense of architectural stability.
- **Semantic States:** Success and Error states are handled with saturated, high-performance hues that maintain the punchy intensity of the brand.

## Typography

The typography strategy leverages **Manrope** for headlines to convey a modern, technical sophistication. Headlines utilize tight letter-spacing and heavy weights to create a commanding presence.

**Inter** is used for body and labels, providing a utilitarian and neutral counterpoint that ensures long-form readability. Labels are frequently styled in uppercase with increased letter-spacing to mimic technical instrumentation or architectural blueprints.

Hierarchy is established through extreme weight variance rather than color variance, keeping the "light mode" interface crisp and authoritative.

## Layout & Spacing

The design system employs a **Fixed Grid** philosophy on desktop to maintain a "dashboard" feel, transitioning to a fluid model for mobile devices.

- **Grid:** 12-column system with 24px (1.5rem) gutters for desktop layouts.
- **Rhythm:** A strictly enforced 4px baseline grid ensures vertical rhythm. Spacing between sections (2xl) is generous to allow the high-contrast elements room to breathe.
- **Mobile Reflow:** On mobile, margins reduce to 16px (1rem). Complex data-heavy components should transition to a vertically stacked format or horizontal scrolling containers to maintain the high-performance density without sacrificing usability.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layers** and **Bold Outlines**. Depth is communicated through structural layering rather than atmospheric effects.

- **Layering:** Backgrounds use a very light neutral, while cards and containers use pure white with a thin (1px) charcoal border. 
- **Active State Depth:** Instead of rising with shadows, active elements or selected cards may gain a 2px Neon Yellow border or a subtle shift in background tone.
- **Functional Overlays:** Modals and menus use a high-contrast charcoal backdrop blur (32px) to focus the user's attention entirely on the foreground task.

## Shapes

The shape language is **Soft (Level 1)**, using subtle 4px (0.25rem) corner radii for most components. This creates a technical, machined look that feels precise without being aggressive. 

- **Standard Elements:** 4px radius for inputs, buttons, and chips.
- **Large Containers:** 8px radius (rounded-lg) for cards and modals.
- **Dynamic Elements:** 12px (rounded-xl) reserved for specialized high-impact feature blocks.
- **Pills:** Full rounding is only used for status indicators and notification badges to distinguish them from actionable buttons.

## Components

- **Buttons:** Primary buttons are Neon Yellow with Charcoal text. Secondary buttons are Ghost-style with a Charcoal border and Charcoal text. On hover, the primary button gains a slight scale effect (1.02x) rather than a color change.
- **Input Fields:** Use 1px charcoal borders. On focus, the border thickness increases to 2px and the label turns Neon Yellow.
- **Chips/Tags:** Small, rectangular with a 1px border. Active tags utilize a solid Charcoal background with White text or Neon Yellow background for emphasis.
- **Cards:** White background, 1px border. Headers within cards should use the Bold Label typography style for a technical summary feel.
- **Checkboxes & Radios:** When selected, they fill with Neon Yellow and a Charcoal checkmark/dot. The high contrast ensures the state is unmistakable.
- **Data Tables:** Highly structured with thin horizontal dividers. Header rows should have a very light gray background to separate them from the data rows.