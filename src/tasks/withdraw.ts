import { createPayout, executePayout } from "../lib/muralApi";
import { prisma } from "../prisma";
import { Purchase } from "@prisma/client";

export async function runWithdrawTask() {
  // Wrap task in a try/catch since it will be run asynchronously and not awaited
  // To avoid crashing the app if the task fails
  try {
    // Get the sum value of all purchases that were received, so we know how much to withdraw
    const purchases: Purchase[] = await prisma.purchase.findMany({
      where: {
        status: "PAYMENT_RECIEVED",
      },
    });
    const totalSum = purchases.reduce((sum, current) => {
      sum += current.price;
      return sum
    }, 0);

    // Create a payout request in Mural
    const payoutRequest = await createPayout(totalSum);

    // Update status
    for (const purchase of purchases) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "WITHDRAW_INITIATED" },
      });
    }

    // Execute the payout request in Mural
    await executePayout(payoutRequest.id);

    // Update status
    for (const purchase of purchases) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "WITHDRAW_PENDING" },
      });
    }
  } catch (error) {
    console.error(error);
  }
}