FROM node:23-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY package*.json .
COPY pnpm-lock.yaml .
RUN pnpm install
COPY . .

# Generates the oss.txt license file for used software
RUN pnpm run license
RUN pnpm run build
RUN pnpm prune --production


FROM node:23-alpine
RUN npm install -g pnpm
WORKDIR /app

COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/build build/
COPY package.json .
COPY pnpm-lock.yaml .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "run", "deploy"]