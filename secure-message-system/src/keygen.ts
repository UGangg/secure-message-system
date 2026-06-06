// src/keygen.ts

import { generateRSAKeyPair, saveKeyToFile } from "./shared/crypto";

function createUserKeys(username: string) {
  const { publicKey, privateKey } = generateRSAKeyPair();

  saveKeyToFile(`keys/${username}-public.pem`, publicKey);
  saveKeyToFile(`keys/${username}-private.pem`, privateKey);

  console.log(`${username} 키 생성 완료`);
}

function main() {
  createUserKeys("alice");
  createUserKeys("bob");

  console.log("모든 RSA 키 생성 완료");
}

main();