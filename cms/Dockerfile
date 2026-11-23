FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV STRAPI_TELEMETRY_DISABLED=true
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production STRAPI_TELEMETRY_DISABLED=true HOST=0.0.0.0 PORT=1337
COPY --from=build /app ./
RUN mkdir -p public/uploads
EXPOSE 1337
CMD ["npm", "start"]
