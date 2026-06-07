// src/shared/types.ts

export interface SecureMessage {
  sender: string;
  receiver: string;
  encryptedMessage: string;
  encryptedAESKey: string;
  iv: string;
  createdAt: string;
}