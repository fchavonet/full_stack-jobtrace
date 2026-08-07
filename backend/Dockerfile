FROM node:22-alpine

WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node prisma ./prisma

RUN npm ci
RUN npx prisma generate

COPY --chown=node:node src ./src
COPY --chown=node:node docs ./docs
COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p uploads/documents && chown -R node:node uploads && chmod +x ./docker-entrypoint.sh

USER node

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
