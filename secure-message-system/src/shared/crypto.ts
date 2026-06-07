// src/shared/crypto.ts

import {
  generateKeyPairSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  publicEncrypt,
  privateDecrypt,
  createHash,
} from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

export function generateRSAKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
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

export function saveKeyToFile(filePath: string, key: string) {
  const dirPath = dirname(filePath);

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  writeFileSync(filePath, key, "utf-8");
}

export function generateAESKey() {
  return randomBytes(32);
}

export function generateIV() {
  return randomBytes(16);
}

export function encryptAES(plainText: string, key: Buffer, iv: Buffer) {
  const cipher = createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(plainText, "utf-8", "base64");
  encrypted += cipher.final("base64");

  return encrypted;
}

export function decryptAES(encryptedText: string, key: Buffer, iv: Buffer) {
  const decipher = createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(encryptedText, "base64", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

export function encryptWithPublicKey(data: Buffer, publicKey: string) {
  const encryptedData = publicEncrypt(publicKey, data);
  return encryptedData.toString("base64");
}

export function decryptWithPrivateKey(encryptedData: string, privateKey: string) {
  const decryptedData = privateDecrypt(
    privateKey,
    Buffer.from(encryptedData, "base64")
  );

  return decryptedData;
}

export function createSHA256Hash(data: string) {
  return createHash("sha256").update(data, "utf-8").digest("hex");
}