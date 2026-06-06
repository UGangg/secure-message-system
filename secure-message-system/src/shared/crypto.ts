// src/shared/crypto.ts
import { generateKeyPairSync } from "crypto";
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
