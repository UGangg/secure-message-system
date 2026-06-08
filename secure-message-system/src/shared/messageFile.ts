// src/shared/messageFile.ts

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { SecureMessage } from "./types";

function ensureDirectoryExists(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function saveMessageToFile(filePath: string, message: SecureMessage) {
  const dirPath = dirname(filePath);
  ensureDirectoryExists(dirPath);

  writeFileSync(filePath, JSON.stringify(message, null, 2), "utf-8");
}

export function saveMessageToDirectory(
  dirPath: string,
  message: SecureMessage
) {
  ensureDirectoryExists(dirPath);

  const fileName = `${message.createdAt.replace(/[:.]/g, "-")}.json`;
  const filePath = join(dirPath, fileName);

  writeFileSync(filePath, JSON.stringify(message, null, 2), "utf-8");

  return filePath;
}

export function readMessageFromFile(filePath: string): SecureMessage {
  if (!existsSync(filePath)) {
    throw new Error(`${filePath} 파일이 존재하지 않습니다.`);
  }

  const fileContent = readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent) as SecureMessage;
}

export function readMessagesFromDirectory(dirPath: string): SecureMessage[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  const fileNames = readdirSync(dirPath).filter((fileName) =>
    fileName.endsWith(".json")
  );

  return fileNames.map((fileName) => {
    const filePath = join(dirPath, fileName);
    return readMessageFromFile(filePath);
  });
}