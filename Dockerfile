# syntax=docker/dockerfile:1
# Vite 7 / React 19 (package-lock.json 기준) — Vite 7 은 Node 20.19+ / 22.12+ 필요
FROM node:22.21.1-alpine3.22 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .

# Linux 는 파일명 대소문자를 구분한다: 레포에는 1.1.PNG 로 커밋되어 있으나 코드는 1.1.png 를 import 한다.
RUN cd src/assets/sections/cardnews && for f in *.PNG; do [ -e "$f" ] && mv "$f" "${f%.PNG}.png"; done || true

# 브라우저가 호출하는 백엔드 주소. 빈 값이면 같은 도메인 (nginx 가 /api/, /files/ 를 백엔드로 전달)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.28.1-alpine
# 공식 nginx 이미지의 템플릿 기능: ${BACKEND_HOST} 등 환경변수만 envsubst 로 치환된다
# nginx 는 백엔드만 바라본다 (AI 서버는 백엔드가 호출)
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV BACKEND_HOST=backend BACKEND_PORT=8081
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
