export const colors = {
  primary: {
    DEFAULT: "#d9fd53",
    dim: "#cbee45",
    container: "#9fc00f",
    fixed: "#d6fa50",
    fixedDim: "#c8eb42",
  },
  onPrimary: "#4e5f00",
  onPrimaryContainer: "#2c3700",
  onPrimaryFixed: "#3c4a00",

  secondary: {
    DEFAULT: "#e1e3e5",
    dim: "#d3d4d7",
    container: "#444749",
    fixed: "#e1e3e5",
    fixedDim: "#d3d4d7",
  },
  onSecondary: "#4f5254",
  onSecondaryContainer: "#cfd0d3",

  tertiary: {
    DEFAULT: "#ffeead",
    dim: "#f0d038",
    container: "#ffdf46",
    fixed: "#ffdf46",
    fixedDim: "#f0d038",
  },
  onTertiary: "#675800",
  onTertiaryContainer: "#5e4f00",

  error: { DEFAULT: "#ff7351", dim: "#d53d18", container: "#b92902" },
  onError: "#450900",
  onErrorContainer: "#ffd2c8",

  surface: {
    DEFAULT: "#0c0e10",
    dim: "#0c0e10",
    bright: "#292c30",
    containerLowest: "#000000",
    containerLow: "#111416",
    container: "#171a1c",
    containerHigh: "#1d2023",
    containerHighest: "#232629",
    tint: "#d9fd53",
    variant: "#232629",
  },
  onSurface: "#eeeef0",
  onSurfaceVariant: "#aaabad",
  onBackground: "#eeeef0",
  background: "#0c0e10",

  outline: { DEFAULT: "#747578", variant: "#46484a" },

  inverseSurface: "#f9f9fc",
  inverseOnSurface: "#545557",
  inversePrimary: "#536600",
} as const;

export const spacing = {
  section: "2rem",
  card: "1.5rem",
  cardInner: "1.3rem",
  module: "1rem",
  element: "0.75rem",
  tight: "0.5rem",
  micro: "0.25rem",
} as const;

export const typography = {
  display: { size: "3rem", weight: "900", letterSpacing: "-0.02em" },
  headlineLg: { size: "2.25rem", weight: "900", letterSpacing: "-0.02em" },
  headlineMd: { size: "1.875rem", weight: "900", letterSpacing: "-0.01em" },
  headlineSm: { size: "1.5rem", weight: "700", letterSpacing: "-0.01em" },
  bodyLg: { size: "1rem", weight: "400", letterSpacing: "0" },
  bodyMd: { size: "0.875rem", weight: "400", letterSpacing: "0" },
  bodySm: { size: "0.75rem", weight: "400", letterSpacing: "0" },
  labelLg: { size: "0.875rem", weight: "700", letterSpacing: "0.05em" },
  labelMd: { size: "0.75rem", weight: "700", letterSpacing: "0.1em" },
  labelSm: { size: "0.625rem", weight: "700", letterSpacing: "0.15em" },
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.125rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
} as const;

export const shadows = {
  card: "0 1px 3px rgba(0,0,0,0.3)",
  elevated: "0 4px 12px rgba(0,0,0,0.4)",
  glow: "0 0 20px -5px rgba(217, 253, 83, 0.2)",
  glowStrong: "0 0 40px rgba(217, 253, 83, 0.06)",
  ambient: "0 0 40px rgba(0,0,0,0.06)",
} as const;

/**
 * Neumorphism tokens (NEUMORPHISM-SPEC).
 * Coexists with M3 tokens during migration — do not replace existing exports.
 */
export const neumorphism = {
  shadow: {
    light: "rgb(255, 255, 255)",
    dark: "rgb(209, 217, 230)",
    insetLight: "rgb(255, 255, 255)",
    insetDark: "rgb(209, 217, 230)",
    soft: "-6px -6px 12px rgb(255, 255, 255), 6px 6px 12px rgb(209, 217, 230)",
    strong:
      "-10px -10px 20px rgb(255, 255, 255), 10px 10px 20px rgb(209, 217, 230)",
    insetSoft:
      "inset -6px -6px 12px rgb(255, 255, 255), inset 6px 6px 12px rgb(209, 217, 230)",
    insetStrong:
      "inset -10px -10px 20px rgb(255, 255, 255), inset 10px 10px 20px rgb(209, 217, 230)",
  },
  text: {
    muted: "#4a5565",
    faint: "#6b7280",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
  },
  motion: {
    durationPress: "100ms",
    durationHover: "200ms",
    durationModal: "300ms",
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  fontDisplay: '"Space Mono", "JetBrains Mono", ui-monospace, monospace',
} as const;
