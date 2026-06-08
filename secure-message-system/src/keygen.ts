// src/keygen.ts

import { generateRSAKeyPair, saveKeyToFile } from "./shared/crypto";
import {
  ALICE,
  BOB,
  ALICE_PUBLIC_KEY_PATH,
  ALICE_PRIVATE_KEY_PATH,
  BOB_PUBLIC_KEY_PATH,
  BOB_PRIVATE_KEY_PATH,
} from "./shared/constants";

function createUserKeys(
  username: string,
  publicKeyPath: string,
  privateKeyPath: string
): void {
  const { publicKey, privateKey } = generateRSAKeyPair();

  const savedPublicKeyPath = saveKeyToFile(publicKeyPath, publicKey);
  const savedPrivateKeyPath = saveKeyToFile(privateKeyPath, privateKey);

  console.log(`${username} 공개키 생성 완료: ${savedPublicKeyPath}`);
  console.log(`${username} 개인키 생성 완료: ${savedPrivateKeyPath}`);
}

function main(): void {
  createUserKeys(ALICE, ALICE_PUBLIC_KEY_PATH, ALICE_PRIVATE_KEY_PATH);
  createUserKeys(BOB, BOB_PUBLIC_KEY_PATH, BOB_PRIVATE_KEY_PATH);

  console.log("모든 RSA 키 생성 완료");
}

main();