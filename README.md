# 그룹 투두 앱 (Group Todo App)

그룹별 할일 관리를 위한 React + TypeScript 애플리케이션입니다.

## 🎯 주요 기능

### 1. **메인 페이지 (3단 레이아웃)**

- **왼쪽**: 내가 속한 그룹 목록
- **가운데**: 오늘의 할일 관리
- **오른쪽**: 추천 할일 (그룹 지정 또는 자주 사용하는 할일)

### 2. **그룹 상세 페이지**

- 그룹 정보 및 멤버 목록
- 할일 상태별 분류 (대기, 진행중, 완료, 미완료)
- 할일 추가/수정/삭제 기능
- 담당자 지정 및 우선순위 설정

### 3. **그룹 탐색 페이지**

- 공개 그룹 검색
- 카테고리별 필터링 (취미, 학습, 운동, 문학)
- 그룹 참여 기능

### 4. **유저 프로필 페이지**

- 할일 통계 (완료율, 진행 현황)
- 연속 완료 일수 추적
- 참여 그룹 목록
- 최근 활동 내역
- 성취 시스템

## 🛠️ 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **React Router** - 클라이언트 사이드 라우팅
- **SCSS Modules** - 스타일링
- **React Query** - 서버 상태 관리
- **Vite** - 빌드 도구
- **Zustand** - 상태 관리 (준비됨)

## 📦 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 린트 검사
pnpm lint
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── common/           # 공통 UI 컴포넌트
│   │   ├── button/
│   │   ├── card/
│   │   ├── badge/
│   │   ├── avatar/
│   │   ├── input/
│   │   ├── textarea/
│   │   ├── dialog/
│   │   └── dropdown/
│   ├── main/             # 메인 페이지 전용 컴포넌트
│   ├── team/             # 팀 페이지 전용 컴포넌트
│   └── user/             # 유저 페이지 전용 컴포넌트
├── pages/
│   ├── main/             # 메인 페이지
│   ├── team/             # 팀 상세 페이지
│   └── user/             # 유저 프로필 & 검색 페이지
├── apis/                 # API 호출 함수
├── types/                # TypeScript 타입 정의
├── hooks/                # 커스텀 훅
├── utils/                # 유틸리티 함수
├── contexts/             # React Context
├── styles/               # 전역 스타일
├── routes.tsx            # 라우팅 설정
└── App.tsx               # 앱 진입점
```

## 🎨 컴포넌트 사용 예시

### Button

```tsx
import Button from "@/components/common/button/Button";

<Button variant="default" size="md">
  클릭하세요
</Button>;
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/card/Card";

<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>내용</CardContent>
</Card>;
```

### Dialog

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/common/dialog/Dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>열기</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>다이얼로그 제목</DialogTitle>
    </DialogHeader>
    <p>내용</p>
  </DialogContent>
</Dialog>;
```

## 🔌 백엔드 연동

현재는 Mock 데이터를 사용하고 있습니다. Spring Boot 백엔드를 연동하려면:

1. `src/apis/` 폴더에 API 호출 함수 작성
2. React Query를 사용한 데이터 페칭
3. 환경변수로 API URL 설정

```typescript
// .env
VITE_API_URL=http://localhost:8080/api
```

## 🎯 다음 단계

- [ ] Spring Boot 백엔드 API 연동
- [ ] 실시간 할일 업데이트 (WebSocket)
- [ ] 알림 기능
- [ ] 드래그 앤 드롭으로 할일 정렬
- [ ] 달력 뷰
- [ ] 그룹 채팅

## 📝 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.
