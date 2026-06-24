#!/usr/bin/env node

const crypto = require('crypto');

const DEFAULT_BASE64_SECRET =
  'NGUwNTlhNDNhOWQ2ZGJlMmEzODczOWJjYWM2MWY4NDAwOTM4YTBmNGFjM2UxNjczZDU2YWZjZjc3MjdkNmU4YjVhZmIwYzI1NDhjMDFkZThiYmE5Mjc5MjM0MGVhODU5MGFhMTAyOTE0M2I3ODA1MGUzZWFhYWUwNWY2ZDgyNjQ=';

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find(v => v.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

function toB64Url(json) {
  return Buffer.from(JSON.stringify(json)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const subject = getArg('sub', 'local-user');
const roles = getArg('roles', 'ROLE_USER,ROLE_ADMIN');
const ttlSeconds = Number(getArg('ttl', '31536000'));
const secretB64 = process.env.JWT_BASE64_SECRET || DEFAULT_BASE64_SECRET;

if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
  process.stderr.write('Invalid --ttl value. Use a positive number of seconds.\n');
  process.exit(1);
}

const key = Buffer.from(secretB64, 'base64');

const header = { alg: 'HS512', typ: 'JWT' };
const payload = {
  sub: subject,
  auth: roles,
  exp: Math.floor(Date.now() / 1000) + ttlSeconds,
};

const headerB64 = toB64Url(header);
const payloadB64 = toB64Url(payload);
const data = `${headerB64}.${payloadB64}`;

const signature = crypto.createHmac('sha512', key).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

process.stdout.write(`${data}.${signature}\n`);
