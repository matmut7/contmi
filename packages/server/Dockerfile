FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.6.7 --activate
RUN apk add --no-cache libc6-compat
RUN apk update

FROM base AS pruner
RUN pnpm add turbo
COPY . .
RUN pnpm turbo prune --scope=server --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .
RUN pnpm install

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=server
 
FROM base AS runner
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app .
USER app
 
COPY --from=pruner --chown=app:app /app/out/json/ .
COPY --from=pruner --chown=app:app /app/out/pnpm-lock.yaml .
RUN pnpm install --prod
COPY --from=builder --chown=app:app /app/packages/server/dist/main.js ./packages/server/main.mjs
 
WORKDIR /app/packages/server
RUN mkdir dbs
CMD node main.mjs
