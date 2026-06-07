// src/shared/messageFile.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { SecureMessage } from "./types";

export function saveMessageToFile(filePath: string, message: SecureMessage) {
  const dirPath = dirname(filePath);

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  writeFileSync(filePath, JSON.stringify(message, null, 2), "utf-8");
}

export function readMessageFromFile(filePath: string): SecureMessage {
  if (!existsSync(filePath)) {
    throw new Error(`${filePath} 파일이 존재하지 않습니다.`);
  }

  const fileContent = readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent) as SecureMessage;
}