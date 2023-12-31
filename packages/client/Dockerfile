FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.6.7 --activate
RUN pnpm add turbo@^1.10.7
RUN apk add --no-cache libc6-compat
RUN apk update

FROM base AS pruner
COPY . .
RUN pnpm turbo prune --scope=client --docker

FROM base AS builder
COPY --from=pruner /app/out/pnpm-lock.yaml .
RUN pnpm fetch
COPY --from=pruner /app/out/json/ .
RUN pnpm install --offline -r

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=client
 
FROM nginx:alpine AS runner
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html
