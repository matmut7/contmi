FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.6.7 --activate
RUN pnpm add turbo@^1.10.7
RUN apk add --no-cache libc6-compat
RUN apk update

FROM base AS pruner
COPY . .
RUN pnpm turbo prune --scope=server --docker

FROM base AS builder
COPY --from=pruner /app/out/pnpm-lock.yaml .
RUN pnpm fetch
COPY --from=pruner /app/out/json/ .
RUN pnpm install --offline -r

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=server

RUN pnpm prune --prod
 
FROM base AS runner
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
RUN chown -R app:app .
USER app
 
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=builder --chown=app:app /app/packages/server/dist/main.js ./packages/server/main.mjs
 
WORKDIR /app/packages/server
RUN mkdir dbs
CMD node main.mjs
