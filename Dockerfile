# ------------------------- #
# Stage 0: Base 설정
# ------------------------- #
FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY . .

# ------------------------- #
# Stage 1: Production deps 설치
# ------------------------- #
FROM base AS prod-deps

ENV CI=true

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# ------------------------- #
# Stage 2: Build (Vite 빌드)
# ------------------------- #
FROM base AS build

ENV CI=true

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# ------------------------- #
# Stage 3: Final Image (실행용)
# ------------------------- #
FROM node:22-slim AS final

# ✅ pnpm 전역 경로 재설정 (이게 핵심!)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

EXPOSE 8000

# serve 설치
RUN pnpm add -g serve

# dist 폴더 실행
CMD ["serve", "-s", "dist", "-l", "8000"]
