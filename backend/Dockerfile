FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate

COPY src ./src
COPY docs ./docs
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p uploads/documents
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
