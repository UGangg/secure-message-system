// src/shared/envelope.ts

import { decryptWithPrivateKey, encryptWithPublicKey } from "./crypto";

export function createEnvelope(aesKey: Buffer, receiverPublicKey: string) {
  const encryptedAESKey = encryptWithPublicKey(aesKey, receiverPublicKey);

  return encryptedAESKey;
}

export function openEnvelope(
  encryptedAESKey: string,
  receiverPrivateKey: string
) {
  const aesKey = decryptWithPrivateKey(encryptedAESKey, receiverPrivateKey);

  return aesKey;
}