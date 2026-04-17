FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/frontend/package.json packages/frontend/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/frontend/node_modules ./packages/frontend/node_modules
COPY packages/shared packages/shared
COPY packages/frontend packages/frontend
COPY package.json pnpm-workspace.yaml ./
RUN pnpm --filter shared build

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter frontend build

FROM base AS runner
WORKDIR /app/packages/frontend
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/packages/frontend/.next/standalone/app/packages/frontend ./
COPY --from=builder /app/packages/frontend/.next/static ./.next/static
RUN mkdir -p public
COPY --from=builder /app/packages/frontend/public ./public 2>/dev/null || true

EXPOSE 3000

CMD ["node", "server.js"]
