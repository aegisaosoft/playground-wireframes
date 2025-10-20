/**
 * Frontend Encryption Service
 * Provides client-side encryption/decryption for sensitive data like Stripe account IDs
 * Uses Web Crypto API for secure encryption
 */

export class EncryptionService {
  private static instance: EncryptionService;
  private cryptoKey: CryptoKey | null = null;
  private readonly keyName = 'stripe-encryption-key';

  private constructor() {}

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Initialize the encryption service with a key
   */
  public async initialize(): Promise<void> {
    try {
      // Try to get existing key from sessionStorage
      const existingKey = sessionStorage.getItem(this.keyName);
      
      if (existingKey) {
        // Import existing key
        const keyData = JSON.parse(existingKey);
        this.cryptoKey = await crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyData),
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      } else {
        // Generate new key
        this.cryptoKey = await crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256,
          },
          true,
          ['encrypt', 'decrypt']
        );

        // Export and store the key
        const exportedKey = await crypto.subtle.exportKey('raw', this.cryptoKey);
        const keyArray = Array.from(new Uint8Array(exportedKey));
        sessionStorage.setItem(this.keyName, JSON.stringify(keyArray));
      }
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      throw new Error('Encryption service initialization failed');
    }
  }

  /**
   * Encrypt a string
   */
  public async encrypt(plaintext: string): Promise<string> {
    if (!this.cryptoKey) {
      await this.initialize();
    }

    if (!this.cryptoKey) {
      throw new Error('Encryption key not available');
    }

    try {
      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the data
      const encodedText = new TextEncoder().encode(plaintext);
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.cryptoKey,
        encodedText
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Return base64 encoded result
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt a string
   */
  public async decrypt(ciphertext: string): Promise<string> {
    if (!this.cryptoKey) {
      await this.initialize();
    }

    if (!this.cryptoKey) {
      throw new Error('Encryption key not available');
    }

    try {
      // Check if the data is already decrypted (not encrypted)
      if (!this.isEncrypted(ciphertext)) {
        return ciphertext;
      }

      // Decode base64
      const combined = new Uint8Array(
        atob(ciphertext)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);

      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.cryptoKey,
        encryptedData
      );

      // Return decoded string
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      // If decryption fails, return the original string (might not be encrypted)
      return ciphertext;
    }
  }

  /**
   * Check if a string is encrypted
   */
  private isEncrypted(text: string): boolean {
    try {
      // Try to decode as base64 and check if it has the expected structure
      const decoded = atob(text);
      return decoded.length > 12; // Should have IV (12 bytes) + encrypted data
    } catch {
      return false;
    }
  }

  /**
   * Hash a string (one-way)
   */
  public async hash(input: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Clear the encryption key from session storage
   */
  public clearKey(): void {
    sessionStorage.removeItem(this.keyName);
    this.cryptoKey = null;
  }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance();
