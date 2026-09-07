import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store/store';
import type { Message, ReactionChange } from './types';

type State = { byConversation: Record<string, Message[]>; reactionStates: Record<string, boolean> };
const initialState: State = { byConversation: {}, reactionStates: {} };

function reactionKey(messageId: string, userId: string, emoji: string): string {
  return `${messageId}:${userId}:${emoji}`;
}

function upsert(messages: Message[], incoming: Message): Message[] {
  const filtered = messages.filter(
    (value) => value.id !== incoming.id && value.clientMessageId !== incoming.clientMessageId,
  );
  return [...filtered, incoming].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

const slice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    historyMerged(
      state,
      action: PayloadAction<{
        actorId?: string;
        conversationId: string;
        messages: readonly Message[];
      }>,
    ) {
      let current = state.byConversation[action.payload.conversationId] ?? [];
      for (const message of action.payload.messages) {
        current = upsert(current, message);
        if (action.payload.actorId)
          for (const reaction of message.reactions)
            if (reaction.reactedByMe)
              state.reactionStates[
                reactionKey(message.id, action.payload.actorId, reaction.emoji)
              ] = true;
      }
      state.byConversation[action.payload.conversationId] = current;
    },
    optimisticAdded(state, action: PayloadAction<Message>) {
      const message = action.payload;
      state.byConversation[message.conversationId] = upsert(
        state.byConversation[message.conversationId] ?? [],
        message,
      );
    },
    authoritativeUpserted(state, action: PayloadAction<Message>) {
      const message = action.payload;
      const { localStatus: _localStatus, ...authoritative } = message;
      state.byConversation[message.conversationId] = upsert(
        state.byConversation[message.conversationId] ?? [],
        authoritative,
      );
    },
    sendFailed(state, action: PayloadAction<{ conversationId: string; clientMessageId: string }>) {
      const message = state.byConversation[action.payload.conversationId]?.find(
        (value) => value.clientMessageId === action.payload.clientMessageId,
      );
      if (message) message.localStatus = 'failed';
    },
    removedForMe(state, action: PayloadAction<{ conversationId: string; messageId: string }>) {
      const current = state.byConversation[action.payload.conversationId] ?? [];
      state.byConversation[action.payload.conversationId] = current.filter(
        (message) => message.id !== action.payload.messageId,
      );
    },
    reactionApplied(state, action: PayloadAction<{ actorId: string; reaction: ReactionChange }>) {
      const { actorId, reaction } = action.payload;
      const key = reactionKey(reaction.messageId, reaction.userId, reaction.emoji);
      const previous = state.reactionStates[key];
      if (previous === reaction.active) return;
      state.reactionStates[key] = reaction.active;
      const message = state.byConversation[reaction.conversationId]?.find(
        (value) => value.id === reaction.messageId,
      );
      if (!message) return;
      const existing = message.reactions.find((value) => value.emoji === reaction.emoji);
      const delta = reaction.active ? 1 : previous === false ? 1 : -1;
      const count = Math.max(0, (existing?.count ?? 0) + delta);
      message.reactions = [
        ...message.reactions.filter((value) => value.emoji !== reaction.emoji),
        ...(count === 0
          ? []
          : [
              {
                emoji: reaction.emoji,
                count,
                reactedByMe:
                  reaction.userId === actorId ? reaction.active : (existing?.reactedByMe ?? false),
              },
            ]),
      ];
    },
  },
});

export const {
  authoritativeUpserted,
  historyMerged,
  optimisticAdded,
  reactionApplied,
  removedForMe,
  sendFailed,
} = slice.actions;
export const messageReducer = slice.reducer;
export const selectConversationMessages = (
  state: RootState,
  conversationId: string,
): readonly Message[] => state.messages.byConversation[conversationId] ?? [];
