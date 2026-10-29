// 사용법: PASSWORD='비번' node tools/encrypt.mjs   → data.enc.json 생성 (data/data.json 은 업로드 금지)
// 복호화: PASSWORD='비번' node tools/encrypt.mjs --decrypt  → data/data.json 복원
import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pw = process.env.PASSWORD;
if (!pw) { console.error('PASSWORD 환경변수가 필요합니다'); process.exit(1); }
const ITER = 250000;
const enc = new TextEncoder();
const b64 = (u8) => Buffer.from(u8).toString('base64');
const ub64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));

async function key(salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

if (process.argv.includes('--decrypt')) {
  const box = JSON.parse(fs.readFileSync(path.join(root, 'data.enc.json'), 'utf8'));
  const k = await key(ub64(box.salt));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub64(box.iv) }, k, ub64(box.ct));
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data', 'data.json'), Buffer.from(pt));
  console.log('data/data.json 복원 완료');
} else {
  const plain = fs.readFileSync(path.join(root, 'data', 'data.json'));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await key(salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, plain));
  fs.writeFileSync(path.join(root, 'data.enc.json'), JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
  console.log('data.enc.json 생성 완료', ct.length, 'bytes');
}
