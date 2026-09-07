import { io, type Socket } from 'socket.io-client';
import { environment } from '../config/environment';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type EventListener = (payload: unknown) => void;
type Ack<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; retryable: boolean; requestId: string } };

class SocketManager {
  private socket: Socket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private readonly eventListeners = new Map<string, Set<EventListener>>();
  private readonly statusListeners = new Set<(status: ConnectionStatus) => void>();

  connect(accessToken: string): Socket {
    this.disconnect();
    this.setStatus('connecting');
    const socket = io(environment.socketBaseUrl, {
      auth: { accessToken },
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],
    });
    this.socket = socket;
    socket.on('connect', () => this.setStatus('connected'));
    socket.on('disconnect', () => this.setStatus('disconnected'));
    socket.on('connect_error', () => this.setStatus('disconnected'));
    for (const [event, listeners] of this.eventListeners)
      for (const listener of listeners) socket.on(event, listener);
    return socket;
  }

  disconnect(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.setStatus('disconnected');
  }

  connectionStatus(): ConnectionStatus {
    return this.status;
  }

  onStatus(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  on<T>(event: string, listener: (payload: T) => void): () => void {
    const wrapped: EventListener = (payload) => listener(payload as T);
    const listeners = this.eventListeners.get(event) ?? new Set<EventListener>();
    listeners.add(wrapped);
    this.eventListeners.set(event, listeners);
    this.socket?.on(event, wrapped);
    return () => {
      listeners.delete(wrapped);
      this.socket?.off(event, wrapped);
      if (listeners.size === 0) this.eventListeners.delete(event);
    };
  }

  emitWithAck<T>(event: string, payload: unknown, timeoutMilliseconds = 8_000): Promise<T> {
    const socket = this.socket;
    if (socket?.connected !== true) return Promise.reject(new Error('SOCKET_DISCONNECTED'));
    return new Promise<T>((resolve, reject) => {
      socket
        .timeout(timeoutMilliseconds)
        .emit(event, payload, (timeoutError: Error | null, response: Ack<T> | undefined) => {
          if (timeoutError || response === undefined) {
            reject(new Error('SOCKET_ACK_TIMEOUT'));
            return;
          }
          if (!response.ok) {
            reject(new Error(response.error.code));
            return;
          }
          resolve(response.data);
        });
    });
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return;
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }
}
export const socketManager = new SocketManager();
