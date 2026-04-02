import "dotenv/config";
import express from "express";
import { prisma } from "./prisma";
import { createStoreRouter } from "./routes/store";
import { createWebhooksRouter } from "./routes/webhooks";
import { createAdminRouter } from "./routes/admin";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const listenPort = Number.isNaN(port) ? 3000 : port;

app.use(express.json());

app.use("/store", createStoreRouter(prisma));
app.use("/webhooks", createWebhooksRouter(prisma));
app.use("/admin", createAdminRouter(prisma));

const server = app.listen(listenPort, () => {
  console.log(`Server listening on http://localhost:${listenPort}`);
});

function shutdown(): void {
  prisma
    .$disconnect()
    .finally(
      () =>
        new Promise<void>((resolve) => {
          server.close(() => resolve());
        }),
    )
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
