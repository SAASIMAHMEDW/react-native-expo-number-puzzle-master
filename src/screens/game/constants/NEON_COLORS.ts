// ============================================
// NEON COLOR SYSTEM - Each tile gets random color
// ============================================

export const NEON_COLORS = [
  "#00FFF0", // Cyan
  "#FF00FF", // Magenta/Pink
  "#00FF00", // Lime
  "#FFFF00", // Yellow
  "#9D00FF", // Purple
  "#00FFFF", // Teal
  "#FF8800", // Orange
  "#FF0088", // Hot Pink
  "#88FF00", // Yellow-Green
  "#0088FF", // Sky Blue
];

export const getRandomNeonColor = (): string => {
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
};
