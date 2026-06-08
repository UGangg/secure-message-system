// src/alice.ts

import { existsSync, readFileSync } from "fs";
import readline from "readline";
import { createEnvelope, openEnvelope } from "./shared/envelope";
import {
  encryptAES,
  generateAESKey,
  generateIV,
  createDigitalSignature,
  createSHA256Hash,
  decryptAES,
  verifyDigitalSignature,
} from "./shared/crypto";
import { saveMessageToFile, readMessageFromFile } from "./shared/messageFile";
import { SecureMessage } from "./shared/types";
import {
  ALICE,
  BOB,
  ENCODING,
  ALICE_PRIVATE_KEY_PATH,
  BOB_PUBLIC_KEY_PATH,
  ALICE_TO_BOB_MESSAGE_PATH,
  BOB_TO_ALICE_MESSAGE_PATH,
} from "./shared/constants";

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

function readMessageFromBob(): void {
  if (!existsSync(BOB_TO_ALICE_MESSAGE_PATH)) {
    console.log("\n확인할 Bob의 메시지가 없습니다.");
    return;
  }

  try {
    const alicePrivateKey = readFileSync(ALICE_PRIVATE_KEY_PATH, ENCODING);
    const bobPublicKey = readFileSync(BOB_PUBLIC_KEY_PATH, ENCODING);
    const secureMessage = readMessageFromFile(BOB_TO_ALICE_MESSAGE_PATH);

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
  } catch (error) {
    console.log("\n메시지를 확인하는 중 오류가 발생했습니다.");
    console.log(error instanceof Error ? error.message : error);
  }
}

async function sendMessageToBob(): Promise<void> {
  const plainText = await askQuestion("\nBob에게 보낼 메시지를 입력하세요: ");

  const bobPublicKey = readFileSync(BOB_PUBLIC_KEY_PATH, ENCODING);
  const alicePrivateKey = readFileSync(ALICE_PRIVATE_KEY_PATH, ENCODING);

  const aesKey = generateAESKey();
  const iv = generateIV();

  const encryptedMessage = encryptAES(plainText, aesKey, iv);
  const encryptedAESKey = createEnvelope(aesKey, bobPublicKey);
  const messageHash = createSHA256Hash(plainText);
  const signature = createDigitalSignature(messageHash, alicePrivateKey);

  const secureMessage: SecureMessage = {
    sender: ALICE,
    receiver: BOB,
    encryptedMessage,
    encryptedAESKey,
    iv: iv.toString("base64"),
    messageHash,
    signature,
    createdAt: new Date().toISOString(),
  };

  const savedPath = saveMessageToFile(ALICE_TO_BOB_MESSAGE_PATH, secureMessage);

  console.log("\n메시지 전송 완료");
  console.log(`저장 위치: ${savedPath}`);
}

async function showMenu(): Promise<void> {
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