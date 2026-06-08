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
import { saveMessageToDirectory, readMessagesFromDirectory  } from "./shared/messageFile";
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

function readMessageFromBob() {
  const messageDir = "messages/bob-to-alice";

  const messages = readMessagesFromDirectory(messageDir);

  if (messages.length === 0) {
    console.log("\n확인할 Bob의 메시지가 없습니다.");
    return;
  }

  const alicePrivateKey = readFileSync("keys/alice-private.pem", "utf-8");
  const bobPublicKey = readFileSync("keys/bob-public.pem", "utf-8");

  const sortedMessages = messages.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  console.log("\n===== Bob이 보낸 메시지 목록 =====");

  sortedMessages.forEach((secureMessage, index) => {
    const aesKey = openEnvelope(secureMessage.encryptedAESKey, alicePrivateKey);
    const iv = Buffer.from(secureMessage.iv, "base64");

    const decryptedMessage = decryptAES(
      secureMessage.encryptedMessage,
      aesKey,
      iv
    );

    const messageHash = createSHA256Hash(decryptedMessage);
    const isMessageValid = messageHash === secureMessage.messageHash;

    const isSignatureValid = verifyDigitalSignature(
      secureMessage.messageHash,
      secureMessage.signature,
      bobPublicKey
    );

    console.log(`\n[${index + 1}] ${secureMessage.sender}: ${decryptedMessage}`);
    console.log(`시간: ${secureMessage.createdAt}`);
    console.log(`무결성: ${isMessageValid ? "정상" : "위변조 의심"}`);
    console.log(`서명: ${isSignatureValid ? "인증 성공" : "인증 실패"}`);
  });
}

async function sendMessageToBob() {
  const bobPublicKey = readFileSync("keys/bob-public.pem", "utf-8");
  const alicePrivateKey = readFileSync("keys/alice-private.pem", "utf-8");

  const plainText = await askQuestion("\nBob에게 보낼 메시지를 입력하세요: ");

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

  const savedPath = saveMessageToDirectory("messages/alice-to-bob", secureMessage);

  console.log("\n메시지 전송 완료");
  console.log("저장 위치: messages/alice-to-bob.json");
}

async function showMenu() {
  while (true) {
    console.log("\n===== Alice 메뉴 =====");
    console.log("1. Bob 메시지 확인하기");
    console.log("2. Bob에게 메시지 보내기");
    console.log("3. 프로그램 종료");

    const choice = await askQuestion("선택: ");

    if (choice === "1") {
      readMessageFromBob();
    } else if (choice === "2") {
      await sendMessageToBob();
    } else if (choice === "3") {
      console.log("\nAlice 프로그램을 종료합니다.");
      rl.close();
      break;
    } else {
      console.log("\n잘못된 선택입니다. 다시 선택해주세요.");
    }
  }
}

showMenu();