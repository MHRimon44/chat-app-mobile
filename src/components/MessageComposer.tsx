import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Message } from '../messages/types';
import { colors, radii, spacing } from '../theme/tokens';

export function MessageComposer({
  onCancelReply,
  onSend,
  onTyping,
  replyTo,
}: {
  onCancelReply: () => void;
  onSend: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  replyTo: Message | null;
}): React.JSX.Element {
  const [text, setText] = useState('');
  const hasText = text.trim().length > 0;
  useEffect(() => {
    if (!hasText) return;
    onTyping(true);
    const heartbeat = setInterval(() => onTyping(true), 3_000);
    return () => {
      clearInterval(heartbeat);
      onTyping(false);
    };
  }, [hasText, onTyping]);
  const submit = (): void => {
    const value = text.trim();
    if (value.length === 0) return;
    setText('');
    onSend(value);
  };
  return (
    <View style={styles.wrapper}>
      {replyTo === null ? null : (
        <View style={styles.reply}>
          <Text numberOfLines={1} style={styles.replyText}>
            Replying to: {replyTo.text ?? 'Deleted message'}
          </Text>
          <Pressable accessibilityRole="button" onPress={onCancelReply}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.row}>
        <TextInput
          accessibilityLabel="Message"
          maxLength={4000}
          multiline
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder="Message"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={text}
        />
        <Pressable
          accessibilityRole="button"
          disabled={text.trim().length === 0}
          onPress={submit}
          style={styles.send}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  reply: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  replyText: { color: colors.textMuted, flex: 1 },
  cancel: { color: colors.primary, padding: spacing.xs },
  row: { alignItems: 'flex-end', flexDirection: 'row', gap: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    maxHeight: 120,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  send: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  sendText: { color: colors.surface, fontWeight: '700' },
});
