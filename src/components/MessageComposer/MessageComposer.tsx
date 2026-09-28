import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Message } from '../../@types/message';
import { useAppTheme } from '../../theme/ThemeProvider';
import { AppIcon } from '../AppIcon/AppIcon';

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
  const { colors, radii, spacing, typography } = useAppTheme();
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
    <View
      style={[
        styles.wrapper,
        { borderTopColor: colors.divider, paddingBottom: spacing.sm, paddingTop: spacing.sm },
      ]}
    >
      {replyTo === null ? null : (
        <View
          style={[
            styles.reply,
            {
              backgroundColor: colors.surfaceElevated,
              borderLeftColor: colors.primary,
              borderRadius: radii.md,
              padding: spacing.sm,
            },
          ]}
        >
          <View style={styles.replyCopy}>
            <Text style={[typography.caption, { color: colors.primary }]}>Replying to</Text>
            <Text numberOfLines={1} style={[typography.caption, { color: colors.textSecondary }]}>
              {replyTo.text ?? 'Deleted message'}
            </Text>
          </View>
          <Pressable accessibilityLabel="Cancel reply" accessibilityRole="button" onPress={onCancelReply}>
            <AppIcon type="icon" name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      <View style={[styles.row, { gap: spacing.sm }]}>
        <View
          style={[
            styles.inputShell,
            { backgroundColor: colors.surfaceElevated, borderRadius: radii.xl },
          ]}
        >
          <TextInput
            accessibilityLabel="Message"
            maxLength={4000}
            multiline
            onChangeText={setText}
            onSubmitEditing={submit}
            placeholder="Message…"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, typography.body, { color: colors.text, paddingHorizontal: spacing.md }]}
            value={text}
          />
        </View>

        <Pressable
          accessibilityLabel="Send message"
          accessibilityRole="button"
          disabled={!hasText}
          onPress={submit}
          style={({ pressed }) => [
            styles.send,
            {
              backgroundColor: hasText ? colors.primary : colors.surfaceElevated,
              borderRadius: radii.pill,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <AppIcon
            type="icon"
            name="send"
            size={21}
            color={hasText ? colors.onPrimary : colors.textDisabled}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  reply: { alignItems: 'center', borderLeftWidth: 3, flexDirection: 'row' },
  replyCopy: { flex: 1, minWidth: 0 },
  row: { alignItems: 'flex-end', flexDirection: 'row' },
  inputShell: { flex: 1, minHeight: 46 },
  input: { maxHeight: 120, minHeight: 46, paddingVertical: 11 },
  send: { alignItems: 'center', height: 46, justifyContent: 'center', width: 46 },
});
