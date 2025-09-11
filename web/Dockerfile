FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV SKIP_ENV_VALIDATION=1
ARG BACKEND_ORIGIN=http://backend:1111
ENV BACKEND_ORIGIN=${BACKEND_ORIGIN}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
ARG BACKEND_ORIGIN=http://backend:1111
ENV BACKEND_ORIGIN=${BACKEND_ORIGIN}

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules
RUN mkdir -p ./src
COPY --from=builder /app/src/env.js ./src/env.js

EXPOSE 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
