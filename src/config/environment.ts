export function resolveDevelopmentHost(scriptUrl: unknown, platform: string): string {
  if (typeof scriptUrl === 'string') {
    try {
      const hostname = new URL(scriptUrl).hostname;

      if (hostname) {
        return hostname;
      }
    } catch {
      // Fall through to a platform-safe development default.
    }
  }

  return platform === 'android' ? '10.0.2.2' : 'localhost';
}

const PRODUCTION_API_URL = 'https://chat-app-backend-2s97.onrender.com';

export const environment = {
  apiBaseUrl: PRODUCTION_API_URL,
  socketBaseUrl: PRODUCTION_API_URL,
} as const;

export function assertSecureProductionTransport(url: string): void {
  if (!__DEV__ && !url.startsWith('https://')) {
    throw new Error('Production transport must use HTTPS/WSS');
  }
}
