---
name: High-Contrast Tech Performance
colors:
  surface: '#ffffff'
  surface-dim: '#f5f5f5'
  surface-bright: '#fcfae4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f5df'
  surface-container: '#fafafa'
  surface-container-high: '#eae9d4'
  surface-container-highest: '#e5e4ce'
  on-surface: '#000000'
  on-surface-variant: '#404040'
  inverse-surface: '#313123'
  inverse-on-surface: '#f3f2dc'
  outline: '#78795f'
  outline-variant: '#c8c8ab'
  surface-tint: '#5c6300'
  primary: '#5c6300'
  on-primary: '#ffffff'
  primary-container: '#efff00'
  on-primary-container: '#6d7400'
  inverse-primary: '#c3d000'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#436468'
  on-tertiary: '#ffffff'
  tertiary-container: '#d6faff'
  on-tertiary-container: '#537479'
  error: '#ff0000'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#deed00'
  primary-fixed-dim: '#c3d000'
  on-primary-fixed: '#1b1d00'
  on-primary-fixed-variant: '#454a00'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#c5e9ee'
  tertiary-fixed-dim: '#aacdd2'
  on-tertiary-fixed: '#001f23'
  on-tertiary-fixed-variant: '#2b4c50'
  background: '#fcfae4'
  on-background: '#1c1c0f'
  surface-variant: '#e5e4ce'
  border-heavy: '#000000'
  border-muted: '#e5e5e5'
  neon-yellow: '#efff00'
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
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
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

This design system translates a high-energy, dark-themed tech aesthetic into a clean, **Light Mode** workspace that retains its "high-performance" edge. The brand personality is authoritative, precise, and technical, moving away from soft academic norms toward a **High-Contrast / Bold** aesthetic.

The visual identity is defined by the tension between a stark, bright workspace and aggressive, structured technical elements. It prioritizes:
- **Structural Rigor:** Heavy black borders and sharp lines that mimic technical schematics and blueprints.
- **Urgent Precision:** The signature neon yellow acts as a functional beacon, used sparingly but powerfully to direct attention to progress, success, and primary actions.
- **Industrial Clarity:** A "Safe" translation of dark-tech visuals into a light environment, ensuring maximum readability for data-heavy analytics and testing interfaces without losing the brand's distinctive tech-forward energy.

## Colors

The color palette is optimized for high-contrast visibility and a "high-performance" feel. It utilizes a neutral base punctuated by a single, high-visibility accent.

- **Primary (#efff00):** The core brand signal. In light mode, it is used for primary buttons (with black text), progress fills, and active indicators. 
- **The "Tech" Contrast:** Deep blacks (`#000000`) are used for primary text, iconography, and structural borders. This provides the "tech" structure against the white background.
- **Surface Strategy:** The main background is pure white (`#ffffff`). Secondary containers use `#fafafa` or `#f5f5f5` to create subtle hierarchy without sacrificing the "bright" aesthetic.
- **Functional States:** Red is reserved for critical errors. Success is handled by the primary neon yellow, treated as the "success" state in this specific brand context.

## Typography

This system uses **Manrope** exclusively to maintain a geometric, technical feel that remains legible during long sessions.

- **Headlines:** Use ExtraBold (800) for high-level anchors. The heavy weight creates a "stamped" look that reinforces the high-performance brand identity.
- **Body:** Regular (400) weight is used for all instructional and passage-based text to ensure eye comfort against the white background.
- **Labels:** Technical data and metadata are styled in Bold (700) with increased letter spacing and are often set in uppercase to differentiate them from narrative text.
- **Contrast:** Text should almost always be Pure Black (#000000) on white surfaces for maximum accessible contrast.

## Layout & Spacing

The layout is built on a **Rigid Grid** model, emphasizing mathematical precision.

- **Grid:** A 12-column desktop system with 16px gutters and 24px side margins.
- **Rhythm:** An 8px base unit drives all layout decisions. 
- **Information Density:** For analytic dashboards, use tighter spacing (`md`). For testing interfaces where focus is paramount, use expanded spacing (`xl`) to allow content to "breathe" within the high-contrast frame.
- **Responsive:** On mobile, margins reduce to 16px. Complex components reflow into vertical stacks, but the 8px rhythm remains constant.

## Elevation & Depth

In this light-mode variant, depth is achieved through **Bold Borders** and **Tonal Layering** rather than traditional shadows.

- **Structural Borders:** Hierarchy is defined by 1px and 2px black borders. Elements do not "float" with soft shadows; they are "built" into the grid with sharp outlines.
- **Surface Tiers:**
    - **Base:** White (#ffffff).
    - **Container:** Light Gray (#fafafa) with a 1px muted border (#e5e5e5).
    - **Active/Elevated:** White (#ffffff) with a 2px heavy black border (#000000).
- **Glassmorphism:** Navigation and persistent overlays use a white translucent effect (`rgba(255, 255, 255, 0.8)`) with a 20px backdrop blur and a thin black bottom-border.

## Shapes

The shape language is sharp, echoing industrial design and digital precision.

- **Core Radius:** A "Soft" (0.25rem) radius is the default for buttons and inputs. This prevents the UI from feeling overly aggressive while maintaining a professional, engineered look.
- **Interactive Elements:** Focus states use sharp corners or 2px black borders to signify "active engagement."
- **Progress Elements:** Rectangular shapes are preferred for progress bars and gauges to maintain a "digital dashboard" aesthetic.

## Components

### Buttons
- **Primary:** Solid Neon Yellow (#efff00) with Pure Black text. 2px black border. Bold weight.
- **Secondary:** White background with a 2px black border. Black text.
- **Ghost:** Transparent background with black text and an underline or neon yellow icon.

### Input Fields
- White background with a 1px black border.
- **Focus State:** 2px black border with a subtle neon yellow outer glow or a solid neon yellow "focus ring" (offset 2px).

### Cards
- White background with a 1px black border. 
- Headers within cards should be separated by a 1px horizontal black line.

### Chips & Badges
- **Status:** Neon Yellow background with black text for success or "active."
- **Categorical:** Light Gray (#f5f5f5) background with 1px black borders.

### Lists
- Items separated by 1px muted gray lines (#e5e5e5).
- Hover states utilize a subtle Neon Yellow left-edge border (4px wide).

### Progress Bars
- **Track:** Light Gray (#eeeeee).
- **Fill:** Solid Neon Yellow (#efff00).
- **Shape:** Strictly rectangular for a technical, gauge-like appearance.