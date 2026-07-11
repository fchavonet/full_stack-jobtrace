import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import env from "./config/env.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";

import achievementRoutes from "./routes/achievement.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import documentRoutes from "./routes/document.routes.js";
import healthRoutes from "./routes/health.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import tagRoutes from "./routes/tag.routes.js";

const app = express();

app.disable("x-powered-by");
const swaggerDocument = YAML.load("docs/openapi.yaml");

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

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

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
