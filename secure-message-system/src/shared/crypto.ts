// src/shared/crypto.ts

import {
  generateKeyPairSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  publicEncrypt,
  privateDecrypt,
  createHash,
  sign,
  verify,
} from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { ENCODING } from "./constants";

const RSA_KEY_SIZE = 2048;
const AES_KEY_SIZE = 32;
const IV_SIZE = 16;
const AES_ALGORITHM = "aes-256-cbc";
const HASH_ALGORITHM = "sha256";
const BASE64 = "base64";
const HEX = "hex";

export function generateRSAKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: RSA_KEY_SIZE,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return {
    publicKey,
    privateKey,
  };
}

export function saveKeyToFile(filePath: string, key: string): string {
  const dirPath = dirname(filePath);

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  writeFileSync(filePath, key, ENCODING);

  return filePath;
}

export function generateAESKey(): Buffer {
  return randomBytes(AES_KEY_SIZE);
}

export function generateIV(): Buffer {
  return randomBytes(IV_SIZE);
}

export function encryptAES(plainText: string, key: Buffer, iv: Buffer): string {
  const cipher = createCipheriv(AES_ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, ENCODING, BASE64);
  encrypted += cipher.final(BASE64);

  return encrypted;
}

export function decryptAES(encryptedText: string, key: Buffer, iv: Buffer): string {
  const decipher = createDecipheriv(AES_ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedText, BASE64, ENCODING);
  decrypted += decipher.final(ENCODING);

  return decrypted;
}

export function encryptWithPublicKey(data: Buffer, publicKey: string): string {
  return publicEncrypt(publicKey, data).toString(BASE64);
}

export function decryptWithPrivateKey(
  encryptedData: string,
  privateKey: string
): Buffer {
  return privateDecrypt(privateKey, Buffer.from(encryptedData, BASE64));
}

export function createSHA256Hash(data: string): string {
  return createHash(HASH_ALGORITHM).update(data, ENCODING).digest(HEX);
}

export function createDigitalSignature(data: string, privateKey: string): string {
  return sign(HASH_ALGORITHM, Buffer.from(data, ENCODING), privateKey).toString(
    BASE64
  );
}

export function verifyDigitalSignature(
  data: string,
  signature: string,
  publicKey: string
): boolean {
  return verify(
    HASH_ALGORITHM,
    Buffer.from(data, ENCODING),
    publicKey,
    Buffer.from(signature, BASE64)
  );
}