export const colors = {
  background: '#F7F8FC',
  surface: '#FFFFFF',
  text: '#172033',
  textMuted: '#667085',
  primary: '#5B5BD6',
  primaryPressed: '#4848B8',
  border: '#E4E7EC',
  danger: '#D92D20',
  success: '#039855',
} as const;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radii = { sm: 8, md: 12, pill: 999 } as const;
export const typography = {
  body: { fontSize: 16, lineHeight: 24 },
  heading: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
} as const;
