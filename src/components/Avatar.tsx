import { StyleSheet, Text, View } from 'react-native';
import { initials } from '../chat/listHelpers';
import { colors, radii } from '../theme/tokens';

export function Avatar({ displayName }: { displayName: string }): React.JSX.Element {
  return (
    <View accessibilityLabel={`${displayName} avatar`} style={styles.avatar}>
      <Text style={styles.text}>{initials(displayName)}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  text: { color: colors.surface, fontSize: 17, fontWeight: '700' },
});
