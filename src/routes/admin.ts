import { Router } from "express";
import type { PrismaClient } from "@prisma/client";

export function createAdminRouter(prisma: PrismaClient): Router {
  const router = Router();

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
