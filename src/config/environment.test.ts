import { assertSecureProductionTransport, environment } from './environment';

const runtime = globalThis as typeof globalThis & { __DEV__: boolean };

describe('mobile environment transport', () => {
  const originalDev = runtime.__DEV__;
  const originalName = environment.name;

  afterEach(() => {
    runtime.__DEV__ = originalDev;
    Object.assign(environment, { name: originalName });
  });

  it('allows local HTTP in development', () => {
    runtime.__DEV__ = true;
    Object.assign(environment, { name: 'development' });
    expect(() => assertSecureProductionTransport('http://127.0.0.1:4000')).not.toThrow();
  });

  it('rejects HTTP when the production section is selected', () => {
    runtime.__DEV__ = true;
    Object.assign(environment, { name: 'production' });
    expect(() => assertSecureProductionTransport('http://example.com')).toThrow('HTTPS');
  });

  it('rejects HTTP in release builds even with the development section selected', () => {
    runtime.__DEV__ = false;
    Object.assign(environment, { name: 'development' });
    expect(() => assertSecureProductionTransport('http://127.0.0.1:4000')).toThrow('HTTPS');
    expect(() => assertSecureProductionTransport('https://example.com')).not.toThrow();
  });
});
