// src/bob.ts

import { readFileSync, existsSync } from "fs";
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

function readMessageFromAlice() {
  const messagePath = "messages/alice-to-bob.json";

  if (!existsSync(messagePath)) {
    console.log("\n확인할 Alice의 메시지가 없습니다.");
    return;
  }

  const bobPrivateKey = readFileSync("keys/bob-private.pem", "utf-8");
  const alicePublicKey = readFileSync("keys/alice-public.pem", "utf-8");

  const secureMessage = readMessageFromFile(messagePath);

  const aesKey = openEnvelope(secureMessage.encryptedAESKey, bobPrivateKey);
  const iv = Buffer.from(secureMessage.iv, "base64");

  const decryptedMessage = decryptAES(secureMessage.encryptedMessage, aesKey, iv);

  const messageHash = createSHA256Hash(decryptedMessage);
  const isMessageValid = messageHash === secureMessage.messageHash;

  const isSignatureValid = verifyDigitalSignature(
    secureMessage.messageHash,
    secureMessage.signature,
    alicePublicKey
  );

  console.log("\n메시지 수신 완료");
  console.log(`보낸 사람: ${secureMessage.sender}`);
  console.log(`받는 사람: ${secureMessage.receiver}`);
  console.log(`전송 시간: ${secureMessage.createdAt}`);

  console.log("\n복호화된 메시지:");
  console.log(decryptedMessage);

  console.log("\n무결성 검증 결과:");
  console.log(isMessageValid ? "위변조 없음" : "위변조 의심");

  console.log("\n전자서명 검증 결과:");
  console.log(isSignatureValid ? "송신자 인증 성공" : "송신자 인증 실패");
}

async function sendMessageToAlice() {
  const alicePublicKey = readFileSync("keys/alice-public.pem", "utf-8");
  const bobPrivateKey = readFileSync("keys/bob-private.pem", "utf-8");

  const plainText = await askQuestion("\nAlice에게 보낼 메시지를 입력하세요: ");

  const aesKey = generateAESKey();
  const iv = generateIV();

  const encryptedMessage = encryptAES(plainText, aesKey, iv);
  const encryptedAESKey = createEnvelope(aesKey, alicePublicKey);
  const messageHash = createSHA256Hash(plainText);
  const signature = createDigitalSignature(messageHash, bobPrivateKey);

  const secureMessage: SecureMessage = {
    sender: "bob",
    receiver: "alice",
    encryptedMessage,
    encryptedAESKey,
    iv: iv.toString("base64"),
    messageHash,
    signature,
    createdAt: new Date().toISOString(),
  };

  saveMessageToFile("messages/bob-to-alice.json", secureMessage);

  console.log("\n메시지 전송 완료");
  console.log("저장 위치: messages/bob-to-alice.json");
}

async function showMenu() {
  while (true) {
    console.log("\n===== Bob 메뉴 =====");
    console.log("1. Alice 메시지 확인하기");
    console.log("2. Alice에게 메시지 보내기");
    console.log("3. 프로그램 종료");

    const choice = await askQuestion("선택: ");

    if (choice === "1") {
      readMessageFromAlice();
    } else if (choice === "2") {
      await sendMessageToAlice();
    } else if (choice === "3") {
      console.log("\nBob 프로그램을 종료합니다.");
      rl.close();
      break;
    } else {
      console.log("\n잘못된 선택입니다. 다시 선택해주세요.");
    }
  }
}

showMenu();