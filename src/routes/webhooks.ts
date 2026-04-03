import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { getTransaction, TransactionResponse } from "../lib/muralApi";
import { runWithdrawTask } from "../tasks/withdraw";

export function createWebhooksRouter(prisma: PrismaClient): Router {
  const router = Router();

  // Webhook that gets called when crypto account balance changes
  router.post("/balance-changes", async (req, res) => {
    try {
      // Get transactionId from request
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ error: "transactionId is required" });
      }

      // Retrieve all purchases
      const purchases = await prisma.purchase.findMany();
      const pendingPurchases = purchases.filter(
        (purchase) => purchase.status === "PAYMENT_PENDING",
      );
      const paidPurchases = purchases.filter(
        (purchase) => purchase.status === "PAYMENT_RECIEVED",
      );

      // Determine which transactions were already matched to a payment
      const burnedTransactionIds = paidPurchases
        .map((purchase) => purchase.transactionId)
        .filter((id): id is string => id != null);
      if (burnedTransactionIds.includes(transactionId)) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      // Get transaction from Mural API
      let transaction: TransactionResponse
      try {
        transaction = await getTransaction(transactionId);
      } catch (err) {
        console.error(err);
        return res.status(202).json({ received: true, updated: 0 });
      }
      if (!transaction) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      const tokenAmount = Number(transaction.amount?.tokenAmount);
      if (Number.isNaN(tokenAmount)) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      // Find all purchases with a matching token amount
      const matchingPurchases = pendingPurchases.filter(
        (purchase) => purchase.price === tokenAmount,
      );

      // Get the execution date of the transaction from Mural
      const executionDateRaw = transaction.transactionExecutionDate;
      if (executionDateRaw === undefined) {
        return res.status(202).json({ received: true, updated: 0 });
      }
      const executionDate = new Date(executionDateRaw);
      if (Number.isNaN(executionDate.getTime())) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      // The purchase soonest before before the transaction is probably the match
      const nearestPurchase = matchingPurchases
        .filter((purchase) => purchase.createdAt < executionDate)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      if (!nearestPurchase) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      // Update that purchase to denote payment was received
      await prisma.purchase.update({
        where: { id: nearestPurchase.id },
        data: { status: "PAYMENT_RECIEVED", transactionId },
      });

      // Queue the withdrawal task to withdraw and don't await
      runWithdrawTask();

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
