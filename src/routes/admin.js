const express = require("express");

function createAdminRouter(prisma) {
  const router = express.Router();

  router.get("/purchases", async (_req, res) => {
    try {
      const purchases = await prisma.purchase.findMany({
        orderBy: { id: "asc" },
      });
      res.json(purchases);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load purchases" });
    }
  });

  return router;
}

module.exports = createAdminRouter;
