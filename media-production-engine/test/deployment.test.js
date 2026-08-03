import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';
import { createCallbackHeaders } from '../src/callbacks.js';

test('requires an API token in production', () => assert.throws(() => loadConfig({ MPE_ENV: 'production' }), /MPE_API_TOKEN/));
test('uses the hosting platform port when MPE_PORT is not set', () => assert.equal(loadConfig({ PORT: '10000' }).port, 10000));
test('requires complete callback authentication when callback URL is configured', () => assert.throws(() => loadConfig({ MPE_CALLBACK_URL: 'https://example.test/callback' }), /MPE_CALLBACK_TOKEN/));
test('creates signed authenticated callback headers', () => {
  const headers = createCallbackHeaders({ callbackToken: 'token', callbackSigningSecret: 'secret' }, { eventId: 'event_1' }, '2026-08-03T00:00:00.000Z');
  assert.equal(headers.authorization, 'Bearer token'); assert.match(headers['x-mpe-signature'], /^[a-f0-9]{64}$/);
});
