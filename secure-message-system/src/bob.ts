// src/bob.ts

import { readFileSync } from "fs";
import { 
    createSHA256Hash, 
    decryptAES, 
    verifyDigitalSignature 
} from "./shared/crypto";
import { openEnvelope } from "./shared/envelope";
import { readMessageFromFile } from "./shared/messageFile";

function main() {
  const bobPrivateKey = readFileSync("keys/bob-private.pem", "utf-8");
  const alicePublicKey = readFileSync("keys/alice-public.pem", "utf-8");

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

  const decryptedMessageHash = createSHA256Hash(decryptedMessage);
  const isMessageValid = decryptedMessageHash === secureMessage.messageHash;
  const isSignatureValid = verifyDigitalSignature(
    secureMessage.messageHash,
    secureMessage.signature,
    alicePublicKey
  );

  console.log("메시지 수신 완료");
  console.log(`보낸 사람: ${secureMessage.sender}`);
  console.log(`받는 사람: ${secureMessage.receiver}`);
  console.log(`전송 시간: ${secureMessage.createdAt}`);

  console.log("\n복호화된 메시지:");
  console.log(decryptedMessage);

  console.log("\n무결성 검증 결과: ");
  console.log(isMessageValid ? "위변조 없음" : "위변조 의심");

  console.log("\n전자서명 검증 결과: ");
  console.log(isSignatureValid ? "송신자 인증 성공" : "송신자 인증 실패");
}

main();