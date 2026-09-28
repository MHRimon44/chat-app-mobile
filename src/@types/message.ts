export type ReactionSummary = { emoji: string; count: number; reactedByMe: boolean };
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  kind: 'text';
  text: string | null;
  replyToMessageId?: string;
  deletedAt?: string;
  createdAt: string;
  reactions: ReactionSummary[];
  localStatus?: 'sending' | 'failed';
};
export type ReactionChange = Readonly<{
  messageId: string;
  conversationId: string;
  userId: string;
  emoji: string;
  active: boolean;
  updatedAt: string;
}>;
export type ReceiptChange = Readonly<{
  conversationId: string;
  userId: string;
  type: 'delivered' | 'seen';
  messageId: string;
  updatedAt: string;
}>;
export type TypingChange = Readonly<{
  conversationId: string;
  userId: string;
  isTyping: boolean;
  expiresAt: string;
}>;
export type PresenceChange = Readonly<{
  userId: string;
  status: 'online' | 'offline';
  updatedAt: string;
  lastSeenAt?: string;
}>;
export type MessagePage = Readonly<{
  data: readonly Message[];
  page: { hasMore: boolean; nextCursor: string | null };
}>;
