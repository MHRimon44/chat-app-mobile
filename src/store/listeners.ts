import { createListenerMiddleware } from '@reduxjs/toolkit';
import { authoritativeUpserted } from '../messages/messageSlice';
import type { Message, ReceiptChange } from '../messages/types';
import { socketManager } from '../realtime/socketManager';
import { signedIn, signedOut } from './sessionSlice';
export const listenerMiddleware = createListenerMiddleware();
let removeMessageListener: (() => void) | null = null;
listenerMiddleware.startListening({
  actionCreator: signedIn,
  effect: (action, api) => {
    removeMessageListener?.();
    socketManager.connect(action.payload.accessToken);
    removeMessageListener = socketManager.on<Message>('message:created', (message) => {
      api.dispatch(authoritativeUpserted(message));
      if (message.senderId !== action.payload.user.id)
        void socketManager
          .emitWithAck<ReceiptChange>('receipt:delivered', {
            conversationId: message.conversationId,
            messageId: message.id,
          })
          .catch(() => undefined);
    });
  },
});
listenerMiddleware.startListening({
  actionCreator: signedOut,
  effect: () => {
    removeMessageListener?.();
    removeMessageListener = null;
    socketManager.disconnect();
  },
});
