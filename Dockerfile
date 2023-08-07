# First stage: Builder
FROM node:18 AS builder
WORKDIR /app
USER root
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 80
EXPOSE 443
CMD node --openssl-legacy-provider index.js

