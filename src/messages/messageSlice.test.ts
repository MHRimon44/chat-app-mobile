import {
  authoritativeUpserted,
  messageReducer,
  optimisticAdded,
  reactionApplied,
  sendFailed,
} from './messageSlice';
import type { Message, ReactionChange } from './types';

const optimistic: Message = {
  id: 'local:client-1',
  conversationId: 'conversation-1',
  senderId: 'user-1',
  clientMessageId: 'client-1',
  kind: 'text',
  text: 'Hello',
  createdAt: '2026-08-27T12:00:00.000Z',
  reactions: [],
  localStatus: 'sending',
};
const { localStatus: _localStatus, ...authoritative } = optimistic;

describe('messageReducer', () => {
  it('reconciles an optimistic message by client ID without duplicates', () => {
    const pending = messageReducer(undefined, optimisticAdded(optimistic));
    const reconciled = messageReducer(
      pending,
      authoritativeUpserted({ ...authoritative, id: 'message-1' }),
    );
    expect(reconciled.byConversation['conversation-1']).toEqual([
      { ...authoritative, id: 'message-1' },
    ]);
  });

  it('marks an uncertain send failed for same-ID retry', () => {
    const pending = messageReducer(undefined, optimisticAdded(optimistic));
    const failed = messageReducer(
      pending,
      sendFailed({ conversationId: 'conversation-1', clientMessageId: 'client-1' }),
    );
    expect(failed.byConversation['conversation-1']?.[0]?.localStatus).toBe('failed');
  });

  it('applies duplicate reaction events idempotently', () => {
    const loaded = messageReducer(
      undefined,
      authoritativeUpserted({ ...authoritative, id: 'message-1' }),
    );
    const reaction: ReactionChange = {
      active: true,
      conversationId: 'conversation-1',
      emoji: '👍',
      messageId: 'message-1',
      updatedAt: '2026-08-27T12:01:00.000Z',
      userId: 'user-2',
    };
    const once = messageReducer(loaded, reactionApplied({ actorId: 'user-1', reaction }));
    const twice = messageReducer(once, reactionApplied({ actorId: 'user-1', reaction }));
    expect(twice.byConversation['conversation-1']?.[0]?.reactions).toEqual([
      { count: 1, emoji: '👍', reactedByMe: false },
    ]);
  });
});
