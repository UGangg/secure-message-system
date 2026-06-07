// src/testEnvelope.ts

import { readFileSync } from "fs";
import { generateAESKey } from "./shared/crypto";
import { createEnvelope, openEnvelope } from "./shared/envelope";

function main() {
  const bobPublicKey = readFileSync("keys/bob-public.pem", "utf-8");
  const bobPrivateKey = readFileSync("keys/bob-private.pem", "utf-8");

  //대칭키 생성
  const aesKey = generateAESKey();

  //전자봉투 생성
  const encryptedAESKey = createEnvelope(aesKey, bobPublicKey);
  const decryptedAESKey = openEnvelope(encryptedAESKey, bobPrivateKey);

  console.log("원본 AES 키:");
  console.log(aesKey.toString("base64"));

  console.log("\n전자봉투:");
  console.log(encryptedAESKey);

  console.log("\n복호화된 AES 키:");
  console.log(decryptedAESKey.toString("base64"));

  console.log("\n검증 결과:");
  console.log(aesKey.equals(decryptedAESKey) ? "성공" : "실패");
}

main();