// These references are replaced with .env literals by Babel during bundling.
declare const process: {
  env: { APP_ENV: string; API_BASE_URL: string; SOCKET_BASE_URL: string };
};

export const environment = {
  name: process.env.APP_ENV,
  apiBaseUrl: process.env.API_BASE_URL,
  socketBaseUrl: process.env.SOCKET_BASE_URL,
} as const;

export function assertSecureProductionTransport(url: string): void {
  if ((environment.name === 'production' || !__DEV__) && !url.startsWith('https://')) {
    throw new Error('Production transport must use HTTPS/WSS');
  }
}
