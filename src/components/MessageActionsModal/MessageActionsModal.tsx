import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Message } from '../../@types/message';
import { useAppTheme } from '../../theme/ThemeProvider';
import { AppIcon } from '../AppIcon/AppIcon';

const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

export function MessageActionsModal({
  actorId,
  message,
  onClose,
  onDeleteEveryone,
  onDeleteMe,
  onReact,
}: {
  actorId?: string | undefined;
  message: Message | null;
  onClose: () => void;
  onDeleteEveryone: (message: Message) => void;
  onDeleteMe: (message: Message) => void;
  onReact: (message: Message, emoji: string, active: boolean) => void;
}): React.JSX.Element {
  const { colors, radii, shadows, spacing, typography } = useAppTheme();
  const ready = message !== null && !message.id.startsWith('local:');

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={message !== null}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            shadows.lg,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              padding: spacing.lg,
            },
          ]}
          onPress={() => undefined}
        >
          <View style={[styles.handle, { backgroundColor: colors.divider }]} />

          {ready && message ? (
            <>
              {message.text === null ? null : (
                <View
                  style={[
                    styles.reactions,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderRadius: radii.lg,
                      padding: spacing.sm,
                    },
                  ]}
                >
                  {reactions.map((emoji) => (
                    <Pressable
                      accessibilityLabel={`React ${emoji}`}
                      accessibilityRole="button"
                      key={emoji}
                      onPress={() => {
                        const active = !(
                          message.reactions.find((item) => item.emoji === emoji)?.reactedByMe ??
                          false
                        );
                        onReact(message, emoji, active);
                        onClose();
                      }}
                      style={styles.emojiButton}
                    >
                      <Text style={styles.emoji}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={[styles.actions, { marginTop: spacing.md }]}>
                <Action
                  icon="delete-outline"
                  label="Delete for me"
                  danger
                  onPress={() => {
                    onDeleteMe(message);
                    onClose();
                  }}
                />
                {message.senderId === actorId ? (
                  <Action
                    icon="delete-forever-outline"
                    label="Delete for everyone"
                    danger
                    onPress={() => {
                      onDeleteEveryone(message);
                      onClose();
                    }}
                  />
                ) : null}
                <Action icon="close" label="Cancel" onPress={onClose} />
              </View>
            </>
          ) : (
            <View style={styles.pending}>
              <AppIcon type="icon" name="clock-outline" size={28} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textMuted }]}>
                Wait for this message to finish sending.
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );

  function Action({
    icon,
    label,
    onPress,
    danger = false,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    danger?: boolean;
  }): React.JSX.Element {
    const color = danger ? colors.danger : colors.text;
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[
          styles.action,
          { backgroundColor: colors.surfaceElevated, borderRadius: radii.md, padding: spacing.md },
        ]}
      >
        <AppIcon type="icon" name={icon} size={22} color={color} />
        <Text style={[typography.bodyMedium, { color }]}>{label}</Text>
        <AppIcon type="icon" name="chevron-right" size={20} color={colors.textMuted} />
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { gap: 16 },
  handle: { alignSelf: 'center', borderRadius: 2, height: 4, width: 42 },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  reactions: { flexDirection: 'row', justifyContent: 'space-between' },
  emojiButton: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingVertical: 8 },
  emoji: { fontSize: 25 },
  actions: { gap: 8 },
  action: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  pending: { alignItems: 'center', gap: 10, paddingVertical: 20 },
});
