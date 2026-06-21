import cors from "cors";
import express from "express";

import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import tagRoutes from "./routes/tag.routes.js";
import documentRoutes from "./routes/document.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/achievements", achievementRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
