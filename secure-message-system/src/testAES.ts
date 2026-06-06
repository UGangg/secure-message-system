// src/testAES.ts

import {
  generateAESKey,
  generateIV,
  encryptAES,
  decryptAES,
} from "./shared/crypto";

function main() {
  const plainText = "안녕하세요 Bob, Alice입니다.";

  const aesKey = generateAESKey();
  const iv = generateIV();

  const encryptedText = encryptAES(plainText, aesKey, iv);
  const decryptedText = decryptAES(encryptedText, aesKey, iv);

  console.log("원문 메시지:");
  console.log(plainText);

  console.log("\nAES 키:");
  console.log(aesKey.toString("base64"));

  console.log("\nIV:");
  console.log(iv.toString("base64"));

  console.log("\n암호문:");
  console.log(encryptedText);

  console.log("\n복호화 결과:");
  console.log(decryptedText);
}

main();
