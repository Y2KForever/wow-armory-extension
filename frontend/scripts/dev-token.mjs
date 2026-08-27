#!/usr/bin/env node
/**
 * Mints a Twitch-shaped extension JWT for local development.
 *
 * The API verifies `X-Token` with HS256 against the base64 extension secret and
 * requires `user_id === channel_id`, so a token signed with the same secret is
 * accepted exactly like one Twitch handed out. Grab the secret from the Twitch
 * developer console under Extensions → your extension → Settings → Secret Keys.
 *
 *   yarn dev:token --secret <base64-secret> [--channel 72606078] [--hours 8]
 *
 * The secret may also come from the TWITCH_EXTENSION_SECRET env var. Prints a
 * ready-to-paste `.env.local` line.
 */
import crypto from 'crypto';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const secret = arg('secret', process.env.TWITCH_EXTENSION_SECRET);
const channelId = arg('channel', process.env.TWITCH_CHANNEL_ID ?? '72606078');
const hours = Number(arg('hours', '8'));

if (!secret) {
  console.error('Missing extension secret. Pass --secret <base64> or set TWITCH_EXTENSION_SECRET.');
  process.exit(1);
}

if (!Number.isFinite(hours) || hours <= 0) {
  console.error(`Invalid --hours value: ${arg('hours', '8')}`);
  process.exit(1);
}

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const payload = {
  exp: Math.floor(Date.now() / 1000) + Math.round(hours * 3600),
  opaque_user_id: `U${channelId}`,
  user_id: channelId,
  channel_id: channelId,
  role: 'broadcaster',
  is_unlinked: false,
  pubsub_perms: { listen: ['broadcast'], send: [] },
};

const signingInput = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
const signature = crypto
  .createHmac('sha256', Buffer.from(secret, 'base64'))
  .update(signingInput)
  .digest('base64url');

console.log(`VITE_DEV_TWITCH_TOKEN=${signingInput}.${signature}`);
console.error(`# channel ${channelId}, expires ${new Date(payload.exp * 1000).toISOString()}`);
