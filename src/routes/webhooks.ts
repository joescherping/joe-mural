import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { getTransaction } from "../lib/muralApi";
import type { MuralTransaction } from "../types/mural";
import { runWithdrawTask } from "../tasks/withdraw";

function isMuralTransaction(value: unknown): value is MuralTransaction {
  return typeof value === "object" && value !== null;
}

export function createWebhooksRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.post("/balance-changes", async (req, res) => {
    try {
      const { transactionId } = (req.body ?? {}) as {
        transactionId?: string;
      };
      if (!transactionId) {
        return res.status(400).json({ error: "transactionId is required" });
      }

      const purchases = await prisma.purchase.findMany();
      const pendingPurchases = purchases.filter(
        (purchase) => purchase.status === "PAYMENT_PENDING",
      );
      const paidPurchases = purchases.filter(
        (purchase) => purchase.status === "PAYMENT_RECIEVED",
      );
      const burnedTransactionIds = paidPurchases
        .map((purchase) => purchase.transactionId)
        .filter((id): id is string => id != null);

      if (burnedTransactionIds.includes(transactionId)) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      let transaction: unknown;
      try {
        transaction = await getTransaction(transactionId);
      } catch (err) {
        console.error(err);
        return res.status(202).json({ received: true, updated: 0 });
      }

      if (!isMuralTransaction(transaction)) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      const tokenAmount = Number(transaction.amount?.tokenAmount);
      if (Number.isNaN(tokenAmount)) {
        return res.status(202).json({ received: true, updated: 0 });
      }
      const matchingPurchases = pendingPurchases.filter(
        (purchase) => purchase.price === tokenAmount,
      );

      const executionRaw = transaction.transactionExecutionDate;
      if (executionRaw === undefined) {
        return res.status(202).json({ received: true, updated: 0 });
      }
      const executionDate = new Date(executionRaw);
      if (Number.isNaN(executionDate.getTime())) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      const nearestPurchase = matchingPurchases
        .filter((purchase) => purchase.createdAt < executionDate)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      if (!nearestPurchase) {
        return res.status(202).json({ received: true, updated: 0 });
      }

      await prisma.purchase.update({
        where: { id: nearestPurchase.id },
        data: { status: "PAYMENT_RECIEVED", transactionId },
      });

      // Queue the withdrawal task and don't await
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
