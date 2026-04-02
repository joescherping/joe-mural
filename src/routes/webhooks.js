const express = require("express");
const { getTransaction } = require("../lib/muralApi");

function createWebhooksRouter(prisma) {
  const router = express.Router();

  router.post("/balance-changes", async (req, res) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ error: "transactionId is required" });
      }

      // Get all purchases, pending and paid
      const purchases = await prisma.purchase.findMany();
      const pendingPurchases = purchases.filter(purchase => purchase.status === "PAYMENT_PENDING");
      const paidPurchases = purchases.filter(purchase => purchase.status === "PAYMENT_RECIEVED");
      const burnedTransactionIds = paidPurchases.map(purchase => purchase.transactionId);

      if (burnedTransactionIds.includes(transactionId)) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      let transaction;
      try {
        // Fetch transaction from Mural API
        transaction = await getTransaction(transactionId);
      } catch (err) {
        console.error(err);
        return res.status(202).json({ received: true, updated: 0 });
      }

      // Find matching purchases based on token amount
      const tokenAmount = Number(transaction?.amount?.tokenAmount);
      if (Number.isNaN(tokenAmount)) {
        return res.status(202).json({ received: true, updated: 0 });
      }
      const matchingPurchases = pendingPurchases.filter(
        (purchase) => purchase.price === tokenAmount,
      );

      // Get the matching purchase which was soonest before the transaction execution date
      const executionDate = new Date(transaction.transactionExecutionDate);
      if (Number.isNaN(executionDate.getTime())) {
        return res.status(202).json({ received: true, updated: 0 });
      }
      const nearestPurchase = matchingPurchases
        // .filter((purchase) => purchase.createdAt < executionDate)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      if (!nearestPurchase) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      // Update the purchase to have status "PAYMENT_RECIEVED"
      await prisma.purchase.update({
        where: { id: nearestPurchase.id },
        data: { status: "PAYMENT_RECIEVED", transactionId: transactionId },
      });

      res.status(202).json({
        received: true,
        updated: 1,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update purchases" });
    }
  });

  return router;
}

module.exports = createWebhooksRouter;
