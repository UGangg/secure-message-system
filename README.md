# Secure Message System

전자봉투를 활용한 메시지 보안 프로그램

## 프로젝트 소개
본 프로젝트는 전자봉투 기반 암호화 기법을 활용하여 사용자 간 메시지를 안전하게 주고받을 수 있는 보안 메시징 시스템을 구현하는 것을 목표로 합니다.

실제 메신저 서버를 구현하는 것이 아니라, Alice와 Bob이란 가상의 두 사용자가 메시지를 주고받는 과정을 시뮬레이션하여 전자봉투의 동작 원리를 학습하는 데 목적이 있습니다.

---

## 주요 기능

- AES 기반 메시지 암호화
- RSA 기반 전자봉투 생성
- 메시지 복호화
- SHA-256 기반 무결성 검증
- 전자서명 기반 송신자 인증 (예정)

---

## 기술 스택

- TypeScript
- Node.js
- Node.js Crypto Module

---

## 프로젝트 구조

```text
src
|-- alice.ts
|-- bob.ts
|__ shared
    |-- crypto.ts
    |-- envelope.ts
    |-- messageFile.ts
    |__ types.ts

messages
keys
```

---

## 메시지 전송 흐름

1. Alice가 메시지 입력
2. AES 세션 키 생성
3. 메시지 AES 암호화
4. AES 키를 Bob 공개키로 암호화
5. 전자봉투 생성
6. Bob이 개인키로 AES 키 복호화
7. 메시지 복호화 및 검증

---

## 실행 방법

```bash
pnpm install

pnpm alice
pnpm bob
```
