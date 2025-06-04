import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-min-32-chars!!'; // 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts an API key using AES-256-CBC encryption
 * @param text The API key to encrypt
 * @returns The encrypted API key
 */
export async function encryptApiKey(text: string): Promise<string> {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypts an encrypted API key
 * @param text The encrypted API key
 * @returns The decrypted API key
 */
export async function decryptApiKey(text: string): Promise<string> {
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Validates that the encryption key meets minimum security requirements
 */
export function validateEncryptionKey() {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('WARNING: Using fallback encryption key. Set ENCRYPTION_KEY environment variable in production!');
  }
  
  if (Buffer.from(ENCRYPTION_KEY, 'utf8').length < 32) {
    throw new Error('Encryption key must be at least 32 bytes long');
  }
}

// Run validation on startup
validateEncryptionKey(); 