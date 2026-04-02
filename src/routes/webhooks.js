const express = require("express");

function createWebhooksRouter() {
  const router = express.Router();

  router.post("/balance-changes", async (_req, res) => {
    // Update all purchases to have status "PAYMENT_RECIEVED"
    await prisma.purchase.update({
      where: { status: "PAYMENT_PENDING" },
      data: { status: "PAYMENT_RECIEVED" },
    });
    res.status(202).json({ received: true });
  });

  return router;
}

module.exports = createWebhooksRouter;
