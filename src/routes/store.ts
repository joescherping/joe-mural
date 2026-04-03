import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { vendorCryptoAddress } from "../constants";

export function createStoreRouter(prisma: PrismaClient): Router {
  const router = Router();

  // List all products
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

  // Create a new purchase with a total price specified
  router.post("/purchases", async (req, res) => {
    const { price } = (req.body ?? {}) as { price?: unknown };
    if (typeof price !== "number" || Number.isNaN(price)) {
      return res.status(400).json({ error: "body.price must be a number" });
    }

    try {
      const purchase = await prisma.purchase.create({
        data: { price, status: "PAYMENT_PENDING" },
      });
      res.status(201).json({
        purchase,
        instructions: "Please pay the required price to the crypto address given",
        address: vendorCryptoAddress,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create purchase" });
    }
  });

  return router;
}
