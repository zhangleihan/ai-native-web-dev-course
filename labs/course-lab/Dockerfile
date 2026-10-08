FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY client ./client
COPY scripts/build.mjs ./scripts/build.mjs
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
COPY server ./server
COPY sql ./sql
COPY scripts/migrate.mjs scripts/seed.mjs ./scripts/
USER node
EXPOSE 3001
CMD ["node", "server/start.mjs"]
