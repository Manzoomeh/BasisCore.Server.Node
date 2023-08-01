# First stage: Builder
FROM node:18-alpine3.17 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx esbuild index.js --platform=node --bundle --outfile=bundle.js
# Copy test-cert and config directories to the builder stage
COPY config/ ./config/

#Second stage : Production
FROM node:18-alpine3.17
WORKDIR /app
COPY --from=builder /app/bundle.js .
COPY --from=builder /app/config/ ./config/
EXPOSE 1563 1564 1565
CMD ["node", "bundle.js"]

