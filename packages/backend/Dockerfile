FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY packages/shared packages/shared
COPY packages/backend packages/backend
COPY package.json pnpm-workspace.yaml ./
RUN pnpm --filter shared build
RUN cd packages/backend && npx prisma generate
RUN pnpm --filter backend build

FROM base AS runner
WORKDIR /app/packages/backend
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/shared /app/packages/shared
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/prisma ./prisma
COPY --from=builder /app/packages/backend/node_modules ./node_modules
COPY --from=builder /app/packages/backend/package.json ./package.json
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml

COPY --from=builder /app/packages/backend/start.sh ./start.sh
RUN chmod +x start.sh

ENV PORT=10000
EXPOSE 10000

CMD ["node", "-e", "try{console.log('Loading config...');const c=require('./dist/config');console.log('Config loaded, PORT:',c.config.PORT);console.log('Loading prisma...');const p=require('./dist/prisma');console.log('Prisma loaded');console.log('Loading index...');require('./dist/index');console.log('Index loaded')}catch(e){console.error('CRASH:',e.message,e.stack);const http=require('http');http.createServer((q,r)=>{r.writeHead(500);r.end(JSON.stringify({error:e.message}))}).listen(process.env.PORT||10000,()=>console.log('Error server on '+(process.env.PORT||10000)))}"]
