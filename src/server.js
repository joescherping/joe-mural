require("dotenv").config();

const express = require("express");
const prisma = require("./prisma");
const createStoreRouter = require("./routes/store");
const createWebhooksRouter = require("./routes/webhooks");
const createAdminRouter = require("./routes/admin");

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/store", createStoreRouter(prisma));
app.use("/webhooks", createWebhooksRouter(prisma));
app.use("/admin", createAdminRouter(prisma));

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

function shutdown() {
  prisma
    .$disconnect()
    .finally(() =>
      new Promise((resolve) => server.close(resolve)),
    )
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
