FROM node:24-alpine AS builder
RUN npm install -g pnpm@10.15.0
WORKDIR /app

COPY package*.json .
COPY pnpm-lock.yaml .
RUN pnpm install
COPY . .

# Set the commit hash as an environment variable
ARG PUBLIC_COMMIT_HASH
ENV PUBLIC_COMMIT_HASH=$PUBLIC_COMMIT_HASH

# Generates the oss.txt license file for used software
RUN pnpm run license
RUN pnpm run build
RUN pnpm prune --production


FROM node:24-alpine
RUN npm install -g pnpm@10.15.0
WORKDIR /app

ENV PUBLIC_COMMIT_HASH=$PUBLIC_COMMIT_HASH

COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/build build/
COPY package.json .
COPY pnpm-lock.yaml .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "run", "deploy"]