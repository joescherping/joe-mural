const express = require("express");

function createStoreRouter(prisma) {
  const router = express.Router();

  router.get("/products", async (_req, res) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: { id: "asc" },
      });
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load products" });
    }
  });

  router.post("/purchases", async (req, res) => {
    const { price } = req.body ?? {};
    if (typeof price !== "number" || Number.isNaN(price)) {
      return res.status(400).json({ error: "body.price must be a number" });
    }

    try {
      const purchase = await prisma.purchase.create({
        data: { price, status: "PAYMENT_PENDING" },
      });
      res.status(201).json(purchase);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create purchase" });
    }
  });

  return router;
}

module.exports = createStoreRouter;
