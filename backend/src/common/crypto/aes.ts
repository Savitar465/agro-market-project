import * as crypto from 'crypto';

/**
 * Derive a 32-byte key from a string or buffer using SHA-256.
 * If a Buffer of length 32 is provided, it is returned as-is.
 */
function deriveKey(key: string | Buffer): Buffer {
  if (Buffer.isBuffer(key)) {
    if (key.length === 32) return key;
    return crypto.createHash('sha256').update(key).digest();
  }
  return crypto.createHash('sha256').update(String(key)).digest();
}

/**
 * Encrypt plaintext using AES-256-CTR.
 * Returns a base64 string containing IV (16 bytes) + ciphertext.
 */
export function encryptAES256CTR(plaintext: string | Buffer, key: string | Buffer): string {
  const derivedKey = deriveKey(key);
  const iv = crypto.randomBytes(16); // 128-bit IV for CTR
  const cipher = crypto.createCipheriv('aes-256-ctr', derivedKey, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString('base64');
}

/**
 * Decrypt a base64 string produced by encryptAES256CTR.
 * Accepts the same key used to encrypt.
 */
export function decryptAES256CTR(dataB64: string, key: string | Buffer): string {
  const buf = Buffer.from(dataB64, 'base64');
  if (buf.length < 17) throw new Error('Invalid data');
  const iv = buf.slice(0, 16);
  const ciphertext = buf.slice(16);
  const derivedKey = deriveKey(key);
  const decipher = crypto.createDecipheriv('aes-256-ctr', derivedKey, iv);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString();
}

export default {
  encryptAES256CTR,
  decryptAES256CTR,
};

