import { encryptAES256CTR, decryptAES256CTR } from '../../../src/common/crypto/aes';

describe('AES-256-CTR', () => {
  const key = 'my-secret-passphrase';
  const plaintext = 'Hello, AES-256-CTR! 1234567890';

  test('encrypt then decrypt returns original plaintext', () => {
    const encrypted = encryptAES256CTR(plaintext, key);
    expect(typeof encrypted).toBe('string');
    const decrypted = decryptAES256CTR(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  test('multiple encryptions produce different ciphertext (due to random IV)', () => {
    const e1 = encryptAES256CTR(plaintext, key);
    const e2 = encryptAES256CTR(plaintext, key);
    expect(e1).not.toBe(e2);
    // both decrypt correctly
    expect(decryptAES256CTR(e1, key)).toBe(plaintext);
    expect(decryptAES256CTR(e2, key)).toBe(plaintext);
  });
});

