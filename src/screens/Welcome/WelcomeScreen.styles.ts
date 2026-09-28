import { StyleSheet } from 'react-native';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  glowTop: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -145,
    right: -120,
    opacity: 0.13,
  },
  glowBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: -130,
    left: -120,
    opacity: 0.09,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  brandArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xl },
  logoHalo: {
    width: 218,
    height: 218,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logo: { width: 184, height: 184, borderRadius: 48 },
  name: { ...typography.display, letterSpacing: -1.2, marginBottom: spacing.sm },
  tagline: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.25,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: spacing.sm,
  },
  actions: { gap: 12, paddingBottom: spacing.sm },
  button: {
    minHeight: 56,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondary: { borderWidth: 1.5 },
  secondaryLabel: { fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: spacing.md },
});
