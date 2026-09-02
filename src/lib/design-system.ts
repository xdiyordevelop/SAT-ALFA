/**
 * SAT-ALFA Design System
 * Complete design tokens va color palette
 * Barcha UI komponentlarni consistency bilan qurish uchun
 */

export const designSystem = {
  // ============================================
  // COLORS - RANG TIZIMI
  // ============================================
  colors: {
    // Primary Brand Color - Asosiy Brand Rangi
    primary: '#EBFF00', // Neon Yellow - Yangi rang
    primaryHover: '#d4e600',
    primaryDisabled: '#a8c600',

    // Success - Muvaffaqiyat
    success: '#10b981',
    successLight: '#d1fae5',
    successDark: '#047857',

    // Warning - Ogohlantirish
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    warningDark: '#d97706',

    // Error - Xato
    error: '#ef4444',
    errorLight: '#fee2e2',
    errorDark: '#dc2626',

    // Info - Ma'lumot
    info: '#3b82f6',
    infoLight: '#dbeafe',
    infoDark: '#1d4ed8',

    // Light Mode Palette - Yorug' Rejim Ranglari
    light: {
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      text: '#1e293b',
      textSecondary: '#64748b',
      textTertiary: '#94a3b8',
      icon: '#475569',
    },

    // Dark Mode Palette - Qorong'u Rejim Ranglari
    dark: {
      background: '#0a0a0a', // Main background
      surface: '#131313', // Cards, modals
      surfaceHover: '#1c1b1b', // Hover states
      border: 'rgba(255,255,255,0.08)',
      borderLight: 'rgba(255,255,255,0.12)',
      text: '#ffffff',
      textSecondary: '#b4b4b4',
      textTertiary: '#808080',
      icon: '#e0e0e0',
    },
  },

  // ============================================
  // TYPOGRAPHY - YOZUV TIZIMI
  // ============================================
  typography: {
    // Headings - Sarlavhalar
    h1: {
      fontSize: '32px',
      fontWeight: 900,
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: '1.4',
    },
    h4: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '1.4',
    },

    // Body - Asosiy Matn
    bodyLarge: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '1.6',
    },
    body: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.6',
    },
    bodySmall: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '1.5',
    },

    // Labels - Teglar
    label: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '1.5',
      textTransform: 'none',
    },

    // Button Text - Tugma Matni
    button: {
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: '1.5',
    },

    // Caption - Kichik Matn
    caption: {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '1.4',
    },
  },

  // ============================================
  // SPACING - JOYLAR ORASIDAGI MASOFALAR
  // ============================================
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  // ============================================
  // BORDER RADIUS - BURCHAKLARNING AYLANISHI
  // ============================================
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },

  // ============================================
  // SHADOWS - SOYALAR
  // ============================================
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    glow: '0 0 20px rgba(235, 255, 0, 0.3)',
  },

  // ============================================
  // TRANSITIONS - ANIMATSIYALAR
  // ============================================
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  // ============================================
  // Z-INDEX - QATLAMA TARTIBOTASI
  // ============================================
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 40,
    sticky: 50,
    fixed: 60,
    overlay: 70,
    modal: 80,
    popover: 90,
    tooltip: 100,
  },

  // ============================================
  // BREAKPOINTS - RESPONSIVE NUQTALARI
  // ============================================
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// CSS Variables ga o'tkazish uchun
export const getCSSVariables = () => {
  const vars: Record<string, string> = {};

  // Colors
  Object.entries(designSystem.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars[`--color-${key}`] = value;
    } else {
      Object.entries(value).forEach(([subKey, subValue]) => {
        vars[`--color-${key}-${subKey}`] = subValue;
      });
    }
  });

  // Spacing
  Object.entries(designSystem.spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });

  // Shadows
  Object.entries(designSystem.shadows).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value;
  });

  return vars;
};
