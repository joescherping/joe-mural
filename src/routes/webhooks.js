const express = require("express");

function createWebhooksRouter(prisma) {
  const router = express.Router();

  router.post("/balance-changes", async (_req, res) => {
    try {
    // Update all purchases to have status "PAYMENT_RECIEVED"
      await prisma.purchase.update({
        where: { status: "PAYMENT_PENDING" },
        data: { status: "PAYMENT_RECIEVED" },
      });
      res.status(202).json({ received: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update purchases" });
    }
  });

  return router;
}

module.exports = createWebhooksRouter;
