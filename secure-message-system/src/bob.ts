// src/bob.ts

import { readFileSync } from "fs";
import readline from "readline";
import {
  encryptAES,
  generateAESKey,
  generateIV,
  createDigitalSignature,
  createSHA256Hash,
  decryptAES,
  verifyDigitalSignature,
} from "./shared/crypto";
import { openEnvelope, createEnvelope } from "./shared/envelope";
import { readMessageFromFile, saveMessageToFile } from "./shared/messageFile";
import { SecureMessage } from "./shared/types";

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
  const bobPrivateKey = readFileSync("keys/bob-private.pem", "utf-8");
  const bobPublicKey = readFileSync("keys/bob-public.pem", "utf-8");
  const alicePublicKey = readFileSync("keys/alice-public.pem", "utf-8");
  const alicePrivateKey = readFileSync("keys/alice-private.pem", "utf-8");

  const receivedMessage = readMessageFromFile("messages/alice-to-bob.json");

  const aesKey = openEnvelope(receivedMessage.encryptedAESKey, bobPrivateKey);
  const iv = Buffer.from(receivedMessage.iv, "base64");

  const decryptedMessage = decryptAES(
    receivedMessage.encryptedMessage,
    aesKey,
    iv,
  );

  const decryptedMessageHash = createSHA256Hash(decryptedMessage);
  const isMessageValid = decryptedMessageHash === receivedMessage.messageHash;
  const isSignatureValid = verifyDigitalSignature(
    receivedMessage.messageHash,
    receivedMessage.signature,
    alicePublicKey,
  );

  console.log("메시지 수신 완료");
  console.log(`보낸 사람: ${receivedMessage.sender}`);
  console.log(`받는 사람: ${receivedMessage.receiver}`);
  console.log(`전송 시간: ${receivedMessage.createdAt}`);

  console.log("\n복호화된 메시지:");
  console.log(decryptedMessage);

  console.log("\n무결성 검증 결과: ");
  console.log(isMessageValid ? "위변조 없음" : "위변조 의심");

  console.log("\n전자서명 검증 결과: ");
  console.log(isSignatureValid ? "송신자 인증 성공" : "송신자 인증 실패");

  const replyText = await askQuestion(
    "\nAlice에게 답장할 메시지를 입력하세요: ",
  );

  const replyAESKey = generateAESKey();
  const replyIV = generateIV();

  const encryptedReplyMessage = encryptAES(replyText, replyAESKey, replyIV);
  const encryptedReplyAESKey = createEnvelope(replyAESKey, alicePublicKey);
  const replyHash = createSHA256Hash(replyText);
  const replySignature = createDigitalSignature(replyHash, bobPrivateKey);

  const replyMessage: SecureMessage = {
    sender: "bob",
    receiver: "alice",
    encryptedMessage: encryptedReplyMessage,
    encryptedAESKey: encryptedReplyAESKey,
    iv: replyIV.toString("base64"),
    messageHash: replyHash,
    signature: replySignature,
    createdAt: new Date().toISOString(),
  };

  saveMessageToFile("messages/bob-to-alice.json", replyMessage);

  console.log("\n답장 전송 완료");
  console.log("저장 위치: messages/bob-to-alice.json");

  rl.close();
}

main();
