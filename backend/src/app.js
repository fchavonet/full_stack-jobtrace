import { readFileSync } from "node:fs";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";

import env from "./config/env.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import originProtectionMiddleware from "./middlewares/originProtection.middleware.js";

import achievementRoutes from "./routes/achievement.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import documentRoutes from "./routes/document.routes.js";
import healthRoutes from "./routes/health.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import tagRoutes from "./routes/tag.routes.js";

const JSON_BODY_LIMIT = "100kb";
const CORS_MAX_AGE_SECONDS = 600;
const PRODUCTION_PROXY_HOPS = 2;

function createHelmetOptions() {
  const options = {};

  if (env.nodeEnv !== "production") {
    options.contentSecurityPolicy = false;
    options.strictTransportSecurity = false;
  }

  return options;
}

function validateCorsOrigin(origin, callback) {
  if (!origin || origin === env.frontendUrl) {
    callback(null, true);
    return;
  }

  callback(null, false);
}

const corsOptions = {
  origin: validateCorsOrigin,
  credentials: true,
  methods: [
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],
  maxAge: CORS_MAX_AGE_SECONDS
};

const app = express();

if (env.nodeEnv === "production") {
  app.set("trust proxy", PRODUCTION_PROXY_HOPS);
}

app.disable("x-powered-by");

app.use(helmet(createHelmetOptions()));
app.use(cors(corsOptions));
app.use(originProtectionMiddleware);

if (env.nodeEnv !== "production") {
  const openApiPath = new URL(
    "../docs/openapi.yaml",
    import.meta.url
  );
  const openApiContent = readFileSync(openApiPath, "utf8");
  const swaggerDocument = parse(openApiContent);

  app.use(
    "/api/doc",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "JobTrace - Backend: documentation",
      swaggerOptions: {
        docExpansion: "list",
        defaultModelsExpandDepth: -1
      },
      customCss: `
        .swagger-ui .info .title small,
        .swagger-ui .info .title .version-stamp,
        .swagger-ui .info .title .version,
        .swagger-ui .info .title small pre {
          display: none !important;
        }
      `
    })
  );
}

app.use(
  express.json({
    limit: JSON_BODY_LIMIT
  })
);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/applications", applicationRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/achievements", achievementRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
