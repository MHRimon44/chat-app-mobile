import { useEffect, useState } from 'react';
import type { PresenceChange } from '../@types/message';
import { socketManager } from '../services/realtime/socketManager';

// Every user avatar uses the same privacy-aware presence endpoint.
// The server returns "unknown" when the viewer is not allowed to see presence.
const cache = new Map<string, PresenceChange>();
const subscribers = new Map<string, Set<(presence: PresenceChange | undefined) => void>>();
let stopEvents: (() => void) | undefined;
let stopStatus: (() => void) | undefined;
let refreshTimer: ReturnType<typeof setInterval> | undefined;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let generation = 0;

function notify(userId: string): void {
  for (const callback of subscribers.get(userId) ?? []) callback(cache.get(userId));
}

async function refresh(userId: string, epoch: number): Promise<void> {
  if (socketManager.connectionStatus() !== 'connected') return;
  try {
    const presence = await socketManager.emitWithAck<PresenceChange>('presence:get', { userId });
    if (epoch !== generation || !subscribers.has(userId)) return;
    cache.set(userId, presence);
    notify(userId);
  } catch {
    // The socket can report connected before the server has registered its
    // async presence handlers. A scheduled refresh retries the initial lookup.
  }
}

function refreshAll(): void {
  const epoch = generation;
  for (const userId of subscribers.keys()) void refresh(userId, epoch);
}

function start(): void {
  stopEvents = socketManager.on<PresenceChange>('presence:changed', (presence) => {
    cache.set(presence.userId, presence);
    notify(presence.userId);
  });
  stopStatus = socketManager.onStatus((status) => {
    generation += 1;
    if (retryTimer) clearTimeout(retryTimer);
    if (status === 'connected') {
      refreshAll();
      retryTimer = setTimeout(refreshAll, 1800);
    } else {
      cache.clear();
      for (const userId of subscribers.keys()) notify(userId);
    }
  });
  refreshTimer = setInterval(refreshAll, 45_000);
}

function stop(): void {
  stopEvents?.();
  stopStatus?.();
  if (refreshTimer) clearInterval(refreshTimer);
  if (retryTimer) clearTimeout(retryTimer);
  stopEvents = undefined;
  stopStatus = undefined;
  refreshTimer = undefined;
  retryTimer = undefined;
  generation += 1;
  cache.clear();
}

export function useAvatarPresence(userId?: string): boolean {
  const [presence, setPresence] = useState<PresenceChange | undefined>(() =>
    userId ? cache.get(userId) : undefined,
  );
  useEffect(() => {
    if (!userId) {
      setPresence(undefined);
      return;
    }
    const first = subscribers.size === 0;
    const listeners = subscribers.get(userId) ?? new Set();
    listeners.add(setPresence);
    subscribers.set(userId, listeners);
    setPresence(cache.get(userId));
    if (first) start();
    // The list may mount after the socket is already connected.
    void refresh(userId, generation);
    return () => {
      listeners.delete(setPresence);
      if (listeners.size === 0) subscribers.delete(userId);
      if (subscribers.size === 0) stop();
    };
  }, [userId]);
  return presence?.status === 'online' && socketManager.connectionStatus() === 'connected';
}
