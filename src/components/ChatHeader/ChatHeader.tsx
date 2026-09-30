import { useEffect, useState } from 'react';
import { formatLastSeen } from '../../utils/presence';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar/Avatar';
import { IconButton } from '../IconButton/IconButton';
import { useAppTheme } from '../../theme/ThemeProvider';

type Presence = 'online' | 'offline' | 'unknown';

type Props = {
  title: string;
  userId?: string | undefined;
  avatarUrl?: string | undefined;
  presence: Presence;
  typing: boolean;
  lastSeenAt?: string | undefined;
  connected: boolean;
  onBackPress: () => void;
  onProfilePress: () => void;
};

function statusText({
  connected,
  lastSeenAt,
  presence,
  typing,
}: Pick<Props, 'connected' | 'lastSeenAt' | 'presence' | 'typing'>): string {
  if (!connected) return 'Connecting…';
  if (presence === 'unknown') return 'Active status hidden';
  if (typing) return 'typing…';
  if (presence === 'online') return 'Active now';
  if (presence === 'offline' && lastSeenAt) {
    return formatLastSeen(lastSeenAt) ?? 'Offline';
  }
  if (presence === 'offline') return 'Offline';
  return 'Active status unavailable';
}

export function ChatHeader(props: Props): React.JSX.Element {
  const { colors, spacing, typography } = useAppTheme();
  const online = props.connected && props.presence === 'online';
  const [, setClockTick] = useState(0);
  useEffect(() => {
    if (props.presence !== 'offline' || !props.lastSeenAt) return;
    const timer = setInterval(() => setClockTick((value) => value + 1), 30_000);
    return () => clearInterval(timer);
  }, [props.lastSeenAt, props.presence]);

  return (
    <View
      style={[
        styles.root,
        {
          borderBottomColor: colors.divider,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
      ]}
    >
      <IconButton
        accessibilityLabel="Go back"
        backgroundColor="transparent"
        icon="chevron-left"
        iconSize={28}
        onPress={props.onBackPress}
      />

      <Pressable
        accessibilityLabel={`Open ${props.title} profile`}
        accessibilityRole="button"
        onPress={props.onProfilePress}
        style={({ pressed }) => [styles.profile, pressed ? styles.pressed : undefined]}
      >
        <Avatar
          displayName={props.title}
          userId={props.userId}
          imageUrl={props.avatarUrl}
          online={online}
          size={42}
        />
        <View style={styles.copy}>
          <Text numberOfLines={1} style={[typography.title, { color: colors.text }]}>
            {props.title}
          </Text>
          <Text
            accessibilityLiveRegion="polite"
            numberOfLines={1}
            style={[
              typography.caption,
              { color: online || props.typing ? colors.success : colors.textMuted },
            ]}
          >
            {statusText({
              connected: props.connected,
              lastSeenAt: props.lastSeenAt,
              presence: props.presence,
              typing: props.typing,
            })}
          </Text>
        </View>
      </Pressable>

      <IconButton
        accessibilityLabel="Conversation info"
        backgroundColor="transparent"
        icon="information-outline"
        onPress={props.onProfilePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  profile: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 10, minWidth: 0 },
  pressed: { opacity: 0.7 },
  copy: { flex: 1, minWidth: 0 },
});
