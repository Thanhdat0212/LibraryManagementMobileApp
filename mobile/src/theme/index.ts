export const colors = {
  primary: "#2563EB",
  primaryPressed: "#1D4ED8",
  primaryTint: "#EFF6FF",

  textStrong: "#111827",
  textBody: "#374151",
  textMuted: "#6B7280",
  textPlaceholder: "#9CA3AF",

  border: "#E5E7EB",
  divider: "#F3F4F6",
  surface: "#F9FAFB",
  background: "#FFFFFF",
  white: "#FFFFFF",

  success: "#16A34A",
  successTint: "#F0FDF4",
  warning: "#D97706",
  warningTint: "#FFFBEB",
  danger: "#DC2626",
  dangerTint: "#FEF2F2",

  disabledBg: "#E5E7EB",
  disabledText: "#9CA3AF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  display: { fontSize: 24, fontWeight: "700" as const },
  title: { fontSize: 20, fontWeight: "700" as const },
  subtitle: { fontSize: 16, fontWeight: "600" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  bodyMedium: { fontSize: 14, fontWeight: "500" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
  overline: { fontSize: 11, fontWeight: "600" as const },
};

export const shadow = {
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
