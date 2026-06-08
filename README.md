# Secure Message System

전자봉투(Electronic Envelope)를 활용한 보안 메시지 전송 시스템

---

## 프로젝트 소개

본 프로젝트는 공개키 암호화와 대칭키 암호화를 결합한 전자봉투(Electronic Envelope) 기법을 활용하여 사용자 간 메시지를 안전하게 주고받는 과정을 구현한 프로그램입니다.

실제 메신저 서버를 구축하는 대신 Alice와 Bob이라는 두 사용자를 가정하여 메시지 송수신 과정을 시뮬레이션하였으며, 전자봉투의 동작 원리와 주요 보안 기술을 학습하는 것을 목표로 합니다.

---

## 주요 기능

* RSA 공개키/개인키 생성
* AES 기반 메시지 암호화 및 복호화
* RSA 기반 전자봉투 생성 및 복호화
* SHA-256 기반 메시지 무결성 검증
* 전자서명 기반 송신자 인증
* Alice ↔ Bob 양방향 메시지 송수신
* 콘솔 메뉴 기반 인터페이스

---

## 사용된 보안 기술

### AES (대칭키 암호화)

메시지 본문을 암호화하기 위해 사용합니다.

빠른 암호화가 가능하며 실제 데이터 보호를 담당합니다.

### RSA (공개키 암호화)

AES 세션 키를 안전하게 전달하기 위해 사용합니다.

수신자의 공개키로 AES 키를 암호화하여 전자봉투를 생성하고, 수신자는 자신의 개인키로 이를 복호화합니다.

### SHA-256

메시지의 해시값을 생성하여 메시지 위변조 여부를 검증합니다.

### Digital Signature

송신자의 개인키를 이용해 전자서명을 생성하고, 수신자는 공개키를 이용하여 서명을 검증함으로써 송신자를 확인합니다.

---

## 프로젝트 구조

```text
src
├── alice.ts          # Alice 사용자 프로그램
├── bob.ts            # Bob 사용자 프로그램
├── keygen.ts         # RSA 키 생성
│
└── shared
    ├── constants.ts  # 반복 사용되는 상수 집합
    ├── crypto.ts     # AES, SHA-256, 전자서명
    ├── envelope.ts   # 전자봉투 생성 및 복호화
    ├── messageFile.ts# 메시지 저장 및 읽기
    └── types.ts      # 메시지 타입 정의

keys/                 # RSA 공개키/개인키 저장
messages/             # 전송된 메시지 저장
```

---

## 주요 파일 설명

| 파일             | 역할                              |
| -------------- | ------------------------------- |
| alice.ts       | Alice 사용자의 메시지 송신 및 Bob의 메시지 확인 |
| bob.ts         | Bob 사용자의 메시지 송신 및 Alice의 메시지 확인 |
| keygen.ts      | RSA 공개키/개인키 생성                  |
| crypto.ts      | AES 암호화, SHA-256 해시, 전자서명 기능    |
| envelope.ts    | 전자봉투 생성 및 복호화                   |
| messageFile.ts | 메시지 파일 저장 및 읽기                  |
| types.ts       | 메시지 타입 정의                       |

---

## 메시지 전송 과정

1. Alice가 메시지를 입력한다.
2. AES 세션 키를 생성한다.
3. 메시지를 AES로 암호화한다.
4. AES 키를 Bob의 공개키로 암호화한다.
5. 전자봉투를 생성한다.
6. Alice는 메시지 해시에 전자서명을 생성한다.
7. 암호화된 메시지와 전자봉투를 파일 형태로 저장한다.
8. Bob은 자신의 개인키로 AES 키를 복호화한다.
9. AES 키를 이용해 메시지를 복호화한다.
10. SHA-256 해시와 전자서명을 검증한다.

---

## 실행 방법

### 1. 패키지 설치

```bash
pnpm install
```

### 2. RSA 키 생성

```bash
pnpm run keygen
```

생성 결과

```text
keys/
├── alice-private.pem
├── alice-public.pem
├── bob-private.pem
└── bob-public.pem
```

### 3. Alice 실행

```bash
pnpm run alice
```

메뉴

```text
1. Bob 메시지 확인하기
2. Bob에게 메시지 보내기
3. 프로그램 종료
```

### 4. Bob 실행

```bash
pnpm run bob
```

메뉴

```text
1. Alice 메시지 확인하기
2. Alice에게 메시지 보내기
3. 프로그램 종료
```

---

## 향후 개선 사항

* 메시지 로그 관리 기능
* 새로운 메시지 알림 기능
* 다중 사용자(3인 이상) 채팅 지원
* GUI 기반 인터페이스
* 서버 기반 메시지 전달 구조 확장

---

## 개발 환경

* Node.js
* TypeScript
* pnpm
* Node.js Crypto Module
