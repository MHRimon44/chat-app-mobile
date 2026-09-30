import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { v4 as uuid } from 'uuid';
import { ChatHeader } from '../../components/ChatHeader/ChatHeader';
import { MessageBubble } from '../../components/MessageBubble/MessageBubble';
import { MessageComposer } from '../../components/MessageComposer/MessageComposer';
import { MessageActionsModal } from '../../components/MessageActionsModal/MessageActionsModal';
import { useToast } from '../../components/Toast/ToastProvider';
import { Screen } from '../../components/Screen/Screen';
import {
  useDeleteMessageForEveryoneMutation,
  useDeleteMessageForMeMutation,
  useLazyMessageHistoryQuery,
  useSendMessageRestMutation,
  useSetMessageReactionMutation,
  useAdvanceReceiptMutation,
} from '../../services/api/messageApi';
import {
  authoritativeUpserted,
  historyMerged,
  optimisticAdded,
  reactionApplied,
  removedForMe,
  selectConversationMessages,
  sendFailed,
} from '../../store/slices/messageSlice';
import type {
  Message,
  PresenceChange,
  ReactionChange,
  ReceiptChange,
  TypingChange,
} from '../../@types/message';
import type { RootStackParamList } from '../../navigation/types';
import { useGetUserQuery } from '../../services/api/chatApi';
import { socketManager, type ConnectionStatus } from '../../services/realtime/socketManager';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ navigation, route }: Props): React.JSX.Element {
  const { conversationId, counterpartId, title } = route.params;
  const dispatch = useAppDispatch();
  const { colors, spacing } = useAppTheme();
  const { showToast } = useToast();
  const counterpart = useGetUserQuery(counterpartId);
  const actorId = useAppSelector((state) => state.session.user?.id);
  const messages = useAppSelector((state) => selectConversationMessages(state, conversationId));
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>(socketManager.connectionStatus());
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const [counterpartPresence, setCounterpartPresence] = useState<'online' | 'offline' | 'unknown'>(
    'unknown',
  );
  const [counterpartLastSeenAt, setCounterpartLastSeenAt] = useState<string | undefined>();
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
      socketManager.onStatus((status) => {
        setConnection(status);
        if (status === 'connected') {
          void socketManager.emitWithAck<PresenceChange>('presence:get', { userId: counterpartId })
            .then((presence) => {
              setCounterpartPresence(presence.status);
              setCounterpartLastSeenAt(presence.lastSeenAt);
            }).catch(() => setCounterpartPresence('unknown'));
        } else {
          setCounterpartPresence('unknown');
          setCounterpartLastSeenAt(undefined);
        }
      }),
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
        if (presence.userId === counterpartId) {
          setCounterpartPresence(presence.status);
          setCounterpartLastSeenAt(presence.lastSeenAt);
        }
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
      showToast({ type: 'error', title: 'Could not delete message', message: 'Please try again.' });
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
      showToast({ type: 'warning', title: 'Delete unavailable', message: 'This message can no longer be deleted for everyone.' });
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
      showToast({ type: 'error', title: 'Reaction failed', message: 'Could not update this reaction.' });
    }
  };
  const menu = (message: Message): void => setActionMessage(message);

  return (
    <Screen
      padded={false}
      keyboardAvoiding
      header={false}
    >
      <ChatHeader
        userId={counterpartId}
        avatarUrl={counterpart.data?.avatarUrl}
        connected={connection === 'connected'}
        lastSeenAt={counterpartLastSeenAt}
        onBackPress={() => navigation.goBack()}
        onProfilePress={() => navigation.navigate('UserProfile', { userId: counterpartId })}
        presence={counterpartPresence}
        title={counterpart.data?.displayName ?? title}
        typing={counterpartTyping}
      />
      <View style={[styles.messages, { paddingHorizontal: spacing.md }]}>
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
            onSwipeLeft={() => setReplyTo(item)}
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
            <Text style={[styles.error, { color: colors.danger }]}>Could not load messages.</Text>
          ) : (
            <Text style={[styles.empty, { color: colors.textMuted }]}>No messages yet. Say hello.</Text>
          )
        }
        ListFooterComponent={
          history.isFetching && messages.length > 0 ? <ActivityIndicator /> : undefined
        }
      />
      </View>
      <MessageActionsModal
        actorId={actorId}
        message={actionMessage}
        onClose={() => setActionMessage(null)}
        onDeleteEveryone={(message) => void deleteForEveryone(message)}
        onDeleteMe={(message) => void deleteForMe(message)}
        onReact={(message, emoji, active) => void toggleReaction(message, emoji, active)}
      />
      <View style={{ paddingHorizontal: spacing.md }}>
        <MessageComposer
        onCancelReply={() => setReplyTo(null)}
        onSend={send}
        onTyping={publishTyping}
        replyTo={replyTo}
        />
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  messages: { flex: 1 },
  error: { padding: 8, textAlign: 'center' },
  empty: { padding: 24, textAlign: 'center' },
});
