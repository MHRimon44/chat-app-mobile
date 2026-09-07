import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { v4 as uuid } from 'uuid';
import { MessageBubble } from '../components/MessageBubble';
import { MessageComposer } from '../components/MessageComposer';
import { Screen } from '../components/Screen';
import {
  useDeleteMessageForEveryoneMutation,
  useDeleteMessageForMeMutation,
  useLazyMessageHistoryQuery,
  useSendMessageRestMutation,
  useSetMessageReactionMutation,
  useAdvanceReceiptMutation,
} from '../messages/messageApi';
import {
  authoritativeUpserted,
  historyMerged,
  optimisticAdded,
  reactionApplied,
  removedForMe,
  selectConversationMessages,
  sendFailed,
} from '../messages/messageSlice';
import type {
  Message,
  PresenceChange,
  ReactionChange,
  ReceiptChange,
  TypingChange,
} from '../messages/types';
import type { RootStackParamList } from '../navigation/types';
import { socketManager, type ConnectionStatus } from '../realtime/socketManager';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { colors, spacing, typography } from '../theme/tokens';

const reactionOptions = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;
type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route }: Props): React.JSX.Element {
  const { conversationId, counterpartId, title } = route.params;
  const dispatch = useAppDispatch();
  const actorId = useAppSelector((state) => state.session.user?.id);
  const messages = useAppSelector((state) => selectConversationMessages(state, conversationId));
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>(socketManager.connectionStatus());
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const [counterpartPresence, setCounterpartPresence] = useState<'online' | 'offline' | 'unknown'>(
    'unknown',
  );
  const [counterpartTyping, setCounterpartTyping] = useState(false);
  const [counterpartReceipt, setCounterpartReceipt] = useState<ReceiptChange | null>(null);
  const [loadHistory, history] = useLazyMessageHistoryQuery();
  const [sendRest] = useSendMessageRestMutation();
  const [deleteMeRest] = useDeleteMessageForMeMutation();
  const [deleteEveryoneRest] = useDeleteMessageForEveryoneMutation();
  const [reactionRest] = useSetMessageReactionMutation();
  const [advanceReceiptRest] = useAdvanceReceiptMutation();
  const visible = useMemo(() => [...messages].reverse(), [messages]);

  const sendReceipt = useCallback(
    async (type: 'delivered' | 'seen', messageId: string): Promise<void> => {
      const payload = { conversationId, messageId };
      try {
        await socketManager.emitWithAck<ReceiptChange>(`receipt:${type}`, payload);
      } catch {
        try {
          await advanceReceiptRest({ ...payload, type }).unwrap();
        } catch {
          return;
        }
      }
    },
    [advanceReceiptRest, conversationId],
  );

  const loadPage = async (older: boolean): Promise<void> => {
    try {
      const page = await loadHistory(
        { conversationId, ...(older && cursor !== null ? { before: cursor } : {}) },
        false,
      ).unwrap();
      dispatch(
        historyMerged({
          ...(actorId === undefined ? {} : { actorId }),
          conversationId,
          messages: page.data,
        }),
      );
      setCursor(page.page.nextCursor);
      setHasMore(page.page.hasMore);
      if (!older) {
        const latestIncoming = page.data.find((message) => message.senderId === counterpartId);
        if (latestIncoming) void sendReceipt('seen', latestIncoming.id);
      }
    } catch {
      /* rendered from query state */
    }
  };

  const publishTyping = useCallback(
    (isTyping: boolean): void => {
      void socketManager
        .emitWithAck('typing:set', { conversationId, isTyping }, 3_000)
        .catch(() => undefined);
    },
    [conversationId],
  );

  useEffect(() => {
    void loadPage(false);
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    const cleanups = [
      socketManager.onStatus(setConnection),
      socketManager.on<Message>('message:created', (message) => {
        if (message.conversationId === conversationId) dispatch(authoritativeUpserted(message));
        if (message.conversationId === conversationId && message.senderId === counterpartId) {
          void sendReceipt('seen', message.id);
        }
      }),
      socketManager.on<Message>('message:deletedEveryone', (message) => {
        if (message.conversationId === conversationId) dispatch(authoritativeUpserted(message));
      }),
      socketManager.on<ReactionChange>('reaction:changed', (reaction) => {
        if (reaction.conversationId === conversationId && actorId !== undefined)
          dispatch(reactionApplied({ actorId, reaction }));
      }),
      socketManager.on<TypingChange>('typing:changed', (typing) => {
        if (typing.conversationId !== conversationId || typing.userId !== counterpartId) return;
        if (typingTimer) clearTimeout(typingTimer);
        setCounterpartTyping(typing.isTyping);
        if (typing.isTyping)
          typingTimer = setTimeout(
            () => setCounterpartTyping(false),
            Math.max(0, new Date(typing.expiresAt).getTime() - Date.now()),
          );
      }),
      socketManager.on<PresenceChange>('presence:changed', (presence) => {
        if (presence.userId === counterpartId) setCounterpartPresence(presence.status);
      }),
      socketManager.on<ReceiptChange>('receipt:changed', (receipt) => {
        if (receipt.conversationId === conversationId && receipt.userId === counterpartId)
          setCounterpartReceipt(receipt);
      }),
    ];
    return () => {
      if (typingTimer) clearTimeout(typingTimer);
      for (const cleanup of cleanups) cleanup();
    };
  }, [actorId, conversationId, counterpartId, dispatch, sendReceipt]);

  const deliver = async (message: Message): Promise<void> => {
    const payload = {
      conversationId,
      clientMessageId: message.clientMessageId,
      kind: 'text' as const,
      text: message.text ?? '',
      ...(message.replyToMessageId === undefined
        ? {}
        : { replyToMessageId: message.replyToMessageId }),
    };
    try {
      const authoritative = await socketManager.emitWithAck<Message>('message:send', payload);
      dispatch(authoritativeUpserted(authoritative));
    } catch {
      try {
        const authoritative = await sendRest(payload).unwrap();
        dispatch(authoritativeUpserted(authoritative));
      } catch {
        dispatch(sendFailed({ conversationId, clientMessageId: message.clientMessageId }));
      }
    }
  };
  const send = (text: string): void => {
    if (actorId === undefined) return;
    const clientMessageId = uuid();
    const message: Message = {
      id: `local:${clientMessageId}`,
      conversationId,
      senderId: actorId,
      clientMessageId,
      kind: 'text',
      text,
      ...(replyTo === null ? {} : { replyToMessageId: replyTo.id }),
      createdAt: new Date().toISOString(),
      reactions: [],
      localStatus: 'sending',
    };
    dispatch(optimisticAdded(message));
    setReplyTo(null);
    void deliver(message);
  };
  const retry = (message: Message): void => {
    dispatch(optimisticAdded({ ...message, localStatus: 'sending' }));
    void deliver(message);
  };

  useEffect(() => {
    if (connection !== 'connected') return;
    for (const message of messages) if (message.localStatus === 'failed') retry(message);
  }, [connection]);

  const deleteForMe = async (message: Message): Promise<void> => {
    try {
      try {
        await socketManager.emitWithAck('message:deleteMe', { messageId: message.id });
      } catch {
        await deleteMeRest(message.id).unwrap();
      }
      dispatch(removedForMe({ conversationId, messageId: message.id }));
    } catch {
      setActionError('Message could not be removed.');
    }
  };
  const deleteForEveryone = async (message: Message): Promise<void> => {
    try {
      try {
        await socketManager.emitWithAck<Message>('message:deleteEveryone', {
          messageId: message.id,
        });
      } catch {
        dispatch(authoritativeUpserted(await deleteEveryoneRest(message.id).unwrap()));
      }
    } catch {
      setActionError('Message can no longer be deleted for everyone.');
    }
  };
  const toggleReaction = async (
    message: Message,
    emoji: string,
    active: boolean,
  ): Promise<void> => {
    try {
      try {
        await socketManager.emitWithAck<ReactionChange>('reaction:set', {
          messageId: message.id,
          emoji,
          active,
        });
      } catch {
        const reaction = await reactionRest({ messageId: message.id, emoji, active }).unwrap();
        if (actorId !== undefined) dispatch(reactionApplied({ actorId, reaction }));
      }
    } catch {
      setActionError('Reaction could not be updated.');
    }
  };
  const menu = (message: Message): void => setActionMessage(message);

  return (
    <Screen>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.connection, connection === 'connected' ? styles.online : styles.offline]}
        >
          {connection === 'connected'
            ? counterpartTyping
              ? 'Typing…'
              : counterpartPresence === 'online'
                ? 'Online'
                : counterpartPresence === 'offline'
                  ? 'Offline'
                  : 'Connected'
            : connection === 'connecting'
              ? 'Connecting…'
              : 'Offline — sends will retry with REST'}
        </Text>
      </View>
      {actionError === null ? null : (
        <Pressable accessibilityRole="button" onPress={() => setActionError(null)}>
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {actionError} Tap to dismiss.
          </Text>
        </Pressable>
      )}
      <FlatList
        data={visible}
        inverted
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasMore && !history.isFetching) void loadPage(true);
        }}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            own={item.senderId === actorId}
            receiptLabel={
              item.senderId === actorId && counterpartReceipt?.messageId === item.id
                ? counterpartReceipt.type === 'seen'
                  ? 'Seen'
                  : 'Delivered'
                : undefined
            }
            onLongPress={() => menu(item)}
            onRetry={() => retry(item)}
            onToggleReaction={(emoji, active) => {
              void toggleReaction(item, emoji, active);
            }}
          />
        )}
        ListEmptyComponent={
          history.isFetching ? (
            <ActivityIndicator accessibilityLabel="Loading messages" />
          ) : history.isError ? (
            <Text style={styles.error}>Could not load messages.</Text>
          ) : (
            <Text style={styles.empty}>No messages yet. Say hello.</Text>
          )
        }
        ListFooterComponent={
          history.isFetching && messages.length > 0 ? <ActivityIndicator /> : undefined
        }
      />
      <Modal
        animationType="fade"
        onRequestClose={() => setActionMessage(null)}
        transparent
        visible={actionMessage !== null}
      >
        <Pressable style={styles.backdrop} onPress={() => setActionMessage(null)}>
          <View style={styles.sheet}>
            <Text accessibilityRole="header" style={styles.sheetTitle}>
              Message actions
            </Text>
            {actionMessage !== null && !actionMessage.id.startsWith('local:') ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setReplyTo(actionMessage);
                    setActionMessage(null);
                  }}
                >
                  <Text style={styles.sheetAction}>Reply</Text>
                </Pressable>
                {actionMessage.text === null ? null : (
                  <View style={styles.reactionChoices}>
                    {reactionOptions.map((emoji) => (
                      <Pressable
                        accessibilityLabel={`React ${emoji}`}
                        accessibilityRole="button"
                        key={emoji}
                        onPress={() => {
                          const active = !(
                            actionMessage.reactions.find((value) => value.emoji === emoji)
                              ?.reactedByMe ?? false
                          );
                          void toggleReaction(actionMessage, emoji, active);
                          setActionMessage(null);
                        }}
                        style={styles.reactionChoice}
                      >
                        <Text>{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void deleteForMe(actionMessage);
                    setActionMessage(null);
                  }}
                >
                  <Text style={styles.destructive}>Delete for me</Text>
                </Pressable>
                {actionMessage.senderId === actorId ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      void deleteForEveryone(actionMessage);
                      setActionMessage(null);
                    }}
                  >
                    <Text style={styles.destructive}>Delete for everyone</Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <Text style={styles.empty}>Wait for this message to finish sending.</Text>
            )}
            <Pressable accessibilityRole="button" onPress={() => setActionMessage(null)}>
              <Text style={styles.sheetAction}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <MessageComposer
        onCancelReply={() => setReplyTo(null)}
        onSend={send}
        onTyping={publishTyping}
        replyTo={replyTo}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: spacing.sm },
  title: { ...typography.body, color: colors.text, fontWeight: '700', textAlign: 'center' },
  connection: { fontSize: 12, textAlign: 'center' },
  online: { color: colors.success },
  offline: { color: colors.textMuted },
  error: { color: colors.danger, padding: spacing.sm, textAlign: 'center' },
  empty: { color: colors.textMuted, padding: spacing.xl, textAlign: 'center' },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.45)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, gap: spacing.sm, padding: spacing.lg },
  sheetTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  sheetAction: { color: colors.primary, fontSize: 16, paddingVertical: spacing.sm },
  destructive: { color: colors.danger, fontSize: 16, paddingVertical: spacing.sm },
  reactionChoices: { flexDirection: 'row', justifyContent: 'space-between' },
  reactionChoice: { padding: spacing.sm },
});
