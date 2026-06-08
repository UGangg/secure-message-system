// src/alice.ts

import { readFileSync, existsSync } from "fs";
import readline from "readline";
import { createEnvelope, openEnvelope  } from "./shared/envelope";
import {
    encryptAES,
    generateAESKey,
    generateIV,
    createDigitalSignature,
    createSHA256Hash,
    decryptAES, 
    verifyDigitalSignature 
} from "./shared/crypto";
import { saveMessageToFile, readMessageFromFile  } from "./shared/messageFile";
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

function readReplyFromBob() {
  const replyPath = "messages/bob-to-alice.json";

  if (!existsSync(replyPath)) {
    console.log("\nBob의 답장 파일이 아직 없습니다.");
    return;
  }

  const alicePrivateKey = readFileSync("keys/alice-private.pem", "utf-8");
  const bobPublicKey = readFileSync("keys/bob-public.pem", "utf-8");

  const replyMessage = readMessageFromFile(replyPath);

  const aesKey = openEnvelope(replyMessage.encryptedAESKey, alicePrivateKey);
  const iv = Buffer.from(replyMessage.iv, "base64");

  const decryptedReply = decryptAES(replyMessage.encryptedMessage, aesKey, iv);

  const replyHash = createSHA256Hash(decryptedReply);
  const isMessageValid = replyHash === replyMessage.messageHash;

  const isSignatureValid = verifyDigitalSignature(
    replyMessage.messageHash,
    replyMessage.signature,
    bobPublicKey
  );

  console.log("\nBob의 답장 수신 완료");
  console.log(`보낸 사람: ${replyMessage.sender}`);
  console.log(`받는 사람: ${replyMessage.receiver}`);
  console.log(`전송 시간: ${replyMessage.createdAt}`);

  console.log("\n복호화된 답장:");
  console.log(decryptedReply);

  console.log("\n무결성 검증 결과:");
  console.log(isMessageValid ? "위변조 없음" : "위변조 의심");

  console.log("\n전자서명 검증 결과:");
  console.log(isSignatureValid ? "송신자 인증 성공" : "송신자 인증 실패");
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

  const shouldReadReply = await askQuestion(
    "\nBob의 답장을 확인할까요? (y/n): "
  );

  if (shouldReadReply.toLowerCase() === "y") {
    readReplyFromBob();
  }

  rl.close();
}

main();