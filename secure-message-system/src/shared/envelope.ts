// src/shared/envelope.ts

import { decryptWithPrivateKey, encryptWithPublicKey } from "./crypto";

export function createEnvelope(
  aesKey: Buffer,
  receiverPublicKey: string
): string {
  return encryptWithPublicKey(aesKey, receiverPublicKey);
}

export function openEnvelope(
  encryptedAESKey: string,
  receiverPrivateKey: string
): Buffer {
  return decryptWithPrivateKey(encryptedAESKey, receiverPrivateKey);
}