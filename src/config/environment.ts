export function resolveDevelopmentHost(scriptUrl: unknown, platform: string): string {
  if (typeof scriptUrl === 'string') {
    try {
      const hostname = new URL(scriptUrl).hostname;
      if (hostname) return hostname;
    } catch {
      // Fall through to a platform-safe development default.
    }
  }
  return platform === 'android' ? '10.0.2.2' : 'localhost';
}

const localHost = '127.0.0.1';
export const environment = {
  apiBaseUrl: `http://${localHost}:4000`,
  socketBaseUrl: `http://${localHost}:4000`,
} as const;

export function assertSecureProductionTransport(url: string): void {
  if (!__DEV__ && !url.startsWith('https://')) {
    throw new Error('Production transport must use HTTPS/WSS');
  }
}
