# 🎮 Word Survival

> **타이핑으로 몬스터를 처치하며 생존하라!**

[![Deploy to GitHub Pages](https://github.com/dev-yunseong/word-survival-game/actions/workflows/deploy.yml/badge.svg)](https://github.com/dev-yunseong/word-survival-game/actions/workflows/deploy.yml)
[![CI Pipeline](https://github.com/dev-yunseong/word-survival-game/actions/workflows/ci.yml/badge.svg)](https://github.com/dev-yunseong/word-survival-game/actions/workflows/ci.yml)

🌐 **[Play Now](https://dev-yunseong.github.io/word-survival-game)**

---

## 📋 게임 소개

**Word Survival**은 타이핑과 로그라이크 서바이벌 장르를 결합한 웹 게임입니다.

플레이어는 화면 중앙에 위치하고, 사방에서 단어를 달고 다가오는 몬스터들을 타이핑으로 처치합니다. 웨이브가 진행될수록 난이도가 상승하며, 처치 시 경험치와 점수를 획득합니다.

### ✨ 주요 특징

- ⌨️ **타이핑 기반 전투**: 몬스터의 단어를 정확히 입력하여 처치
- 🌊 **웨이브 시스템**: 점점 어려워지는 웨이브를 생존
- 🔥 **콤보 시스템**: 연속 처치로 높은 점수 획득
- ⚡ **스킬 시스템**: 레벨업 시 다양한 스킬 선택 (개발 예정)
- 🎨 **React 기반**: 모던 웹 기술로 구현

---

## 🕹️ 조작법

| 키 | 동작 |
|---|---|
| `A-Z`, `a-z` | 단어 입력 |
| `Enter` | 입력 확인 및 몬스터 처치 |
| `Backspace` | 입력 수정 |

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | React 19 + TypeScript |
| **상태관리** | Zustand |
| **스타일링** | CSS (Tailwind 예정) |
| **빌드** | Vite |
| **배포** | GitHub Pages |
| **CI/CD** | GitHub Actions |

---

## 🚀 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/dev-yunseong/word-survival-game.git
cd word-survival-game

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview
```

---

## 📁 프로젝트 구조

```
src/
├── components/
│   └── Game/
│       ├── GameBoard.tsx    # 메인 게임 영역
│       ├── Player.tsx       # 플레이어 캐릭터
│       ├── Monster.tsx      # 몬스터 컴포넌트
│       ├── WordInput.tsx    # 타이핑 입력창
│       └── GameHUD.tsx      # HP, 레벨, 웨이브 표시
├── hooks/
│   └── useGameLoop.ts       # 게임 루프 관리
├── store/
│   └── gameStore.ts         # Zustand 상태 관리
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

---

## 📅 개발 로드맵

### Phase 1: 기본 시스템 ✅
- [x] 프로젝트 셋업 (Vite + React + TypeScript)
- [x] 게임 보드 & 플레이어 구현
- [x] 몬스터 스폰 & 이동
- [x] 기본 타이핑 시스템
- [x] GitHub Pages 배포

### Phase 2: 핵심 기능 (진행 중)
- [ ] HP & 데미지 시스템 개선
- [ ] 웨이브 시스템 구현
- [ ] 레벨업 & 스킬 시스템
- [ ] 게임오버 & 재시작 개선

### Phase 3: 폴리싱
- [ ] UI/UX 개선
- [ ] 사운드 & 이펙트 추가
- [ ] 밸런싱 조정

### Phase 4: 확장
- [ ] 리더보드
- [ ] 캐릭터 선택
- [ ] 도전 모드 (한글만, 프로그래밍 용어만 등)

---

## 🤝 기여

이슈 및 PR 환영합니다!

---

## 📜 라이선스

MIT License

---

Made with ❤️ and ⌨️
