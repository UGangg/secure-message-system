// src/shared/messageFile.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { SecureMessage } from "./types";
import { ENCODING } from "./constants";

function ensureDirectoryExists(filePath: string): void {
  const dirPath = dirname(filePath);

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function saveMessageToFile(
  filePath: string,
  message: SecureMessage
): string {
  ensureDirectoryExists(filePath);

  writeFileSync(filePath, JSON.stringify(message, null, 2), ENCODING);

  return filePath;
}

export function readMessageFromFile(filePath: string): SecureMessage {
  if (!existsSync(filePath)) {
    throw new Error(`${filePath} 파일이 존재하지 않습니다.`);
  }

  try {
    const fileContent = readFileSync(filePath, ENCODING);
    return JSON.parse(fileContent) as SecureMessage;
  } catch {
    throw new Error(`${filePath} 파일을 읽거나 해석할 수 없습니다.`);
  }
}