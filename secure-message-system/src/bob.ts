// src/bob.ts

import { readFileSync } from "fs";
import { decryptAES } from "./shared/crypto";
import { openEnvelope } from "./shared/envelope";
import { readMessageFromFile } from "./shared/messageFile";

function main() {
  const bobPrivateKey = readFileSync("keys/bob-private.pem", "utf-8");

  const secureMessage = readMessageFromFile("messages/alice-to-bob.json");

  const aesKey = openEnvelope(
    secureMessage.encryptedAESKey,
    bobPrivateKey
  );

  const iv = Buffer.from(secureMessage.iv, "base64");

  const decryptedMessage = decryptAES(
    secureMessage.encryptedMessage,
    aesKey,
    iv
  );

  console.log("메시지 수신 완료");
  console.log(`보낸 사람: ${secureMessage.sender}`);
  console.log(`받는 사람: ${secureMessage.receiver}`);
  console.log(`전송 시간: ${secureMessage.createdAt}`);

  console.log("\n복호화된 메시지:");
  console.log(decryptedMessage);
}

main();