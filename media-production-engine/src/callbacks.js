import crypto from 'node:crypto';

export function createCallbackHeaders({ callbackToken, callbackSigningSecret }, payload, timestamp = new Date().toISOString()) {
  const body = JSON.stringify(payload); const signature = crypto.createHmac('sha256', callbackSigningSecret).update(`${timestamp}.${body}`).digest('hex');
  return { 'content-type': 'application/json', authorization: `Bearer ${callbackToken}`, 'x-mpe-timestamp': timestamp, 'x-mpe-signature': signature };
}

export async function postAuthenticatedCallback(config, payload) {
  if (!config.callbackUrl) return { delivered: false, reason: 'callback_not_configured' };
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try { const response = await fetch(config.callbackUrl, { method: 'POST', headers: createCallbackHeaders(config, payload), body: JSON.stringify(payload), signal: controller.signal }); if (!response.ok) throw new Error(`Callback returned HTTP ${response.status}`); return { delivered: true, status: response.status }; } finally { clearTimeout(timer); }
}
