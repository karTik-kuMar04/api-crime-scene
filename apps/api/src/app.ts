import Fastify from "fastify";
import cors from "@fastify/cors";

export function buildApp() {
  const app = Fastify({
    logger: true,
    bodyLimit: 1 * 1024 * 1024
  });

  const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());

  app.register(cors, {
    origin: allowedOrigins,
    credentials: false
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "api-crime-scene-api",
    timestamp: new Date().toISOString()
  }));

  app.get("/api/v1/health", async () => ({
    status: "ok",
    version: "v1"
  }));

  return app;
}
