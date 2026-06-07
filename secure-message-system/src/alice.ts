// src/alice.ts

import { readFileSync } from "fs";
import readline from "readline";
import { createEnvelope } from "./shared/envelope";
import {
  encryptAES,
  generateAESKey,
  generateIV,
  createSHA256Hash,
  createDigitalSignature,
} from "./shared/crypto";
import { saveMessageToFile } from "./shared/messageFile";
import { SecureMessage } from "./shared/types";
import { create } from "domain";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  const bobPublicKey = readFileSync("keys/bob-public.pem", "utf-8");
  const alicePrivateKey = readFileSync("keys/alice-private.pem", "utf-8");

  const plainText = await askQuestion("Bob에게 보낼 메시지를 입력하세요: ");

  const aesKey = generateAESKey();
  const iv = generateIV();

  const encryptedMessage = encryptAES(plainText, aesKey, iv);
  const encryptedAESKey = createEnvelope(aesKey, bobPublicKey);
  const messageHash = createSHA256Hash(plainText);
  const signature = createDigitalSignature(messageHash, alicePrivateKey);

  const secureMessage: SecureMessage = {
    sender: "alice",
    receiver: "bob",
    encryptedMessage,
    encryptedAESKey,
    iv: iv.toString("base64"),
    messageHash,
    signature,
    createdAt: new Date().toISOString(),
  };

  saveMessageToFile("messages/alice-to-bob.json", secureMessage);

  console.log("\n메시지 전송 완료");
  console.log("저장 위치: messages/alice-to-bob.json");
  console.log("\n암호화된 메시지:");
  console.log(encryptedMessage);
  console.log("\n메시지 해시: ");
  console.log(messageHash);
  console.log("\n전자서명: ")
  console.log(signature);

  rl.close();
}

main();