export interface ICryptoService {
  /**
   * Encrypts the provided text
   * @param text The plaintext to encrypt.
   * @returns The encrypted text as a string
   */
  encrypt(text: string): Promise<string>;

  /**
   * Decrypts the provided text
   * @param text The encrypted text to decrypt.
   * @returns The decrypted text as a string.
   */
  decrypt(text: string): Promise<string>;

  /**
   * Hash the provided text
   * @param text The plaintext to hash.
   * @returns The hashed text as a string
   */
  hash(text: string): Promise<string>;
}
