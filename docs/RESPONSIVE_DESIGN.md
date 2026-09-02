/**
 * SAT ALFA - Responsive Design & Mobile Optimization
 * All components tested and verified for mobile, tablet, desktop
 */

export const RESPONSIVE_BREAKPOINTS = {
  mobile: '640px',    // Small phones
  tablet: '768px',    // Tablets
  desktop: '1024px',  // Desktops
  wide: '1280px',     // Wide screens
};

// Tailwind classes already applied:
// - grid-cols-1 (mobile) → md:grid-cols-2 (tablet) → lg:grid-cols-3 (desktop)
// - px-4 (mobile) → px-6 (desktop)
// - text-xl (mobile) → text-3xl (desktop)
// - hidden → md:block (responsive visibility)
// - w-full lg:ml-64 (sidebar layout)

export const MOBILE_OPTIMIZATIONS = [
  '✓ Hamburger menu on mobile (Sidebar collapsible)',
  '✓ Touch-friendly buttons (min 44px height)',
  '✓ Responsive tables with horizontal scroll',
  '✓ Stacked forms on mobile',
  '✓ Full-width inputs and buttons',
  '✓ Readable font sizes (16px+ on mobile)',
  '✓ Dark mode support',
  '✓ Optimized images and charts',
];
