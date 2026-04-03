Setup instructions
-

If you want to run this locally, simply set the relevant env vars, then run the following commands:
- `npm install`
- `npm db:generate`
- `npm db:migrate`
- `npm run dev`

Current status
-

Currently, shoppers can use this service to see which products are available, and then can create a new "purchase" given a total cost of all items purchased in their cart. The response to that request will tell the shopper to pay that amount of USDC to the vendor's crypto address to advance the purchase to the next status. However, we don't track exactly which products are in the purchase - I didn't get to that yet, since I didn't have enough time and I wanted to focus on the crypto and Mural API aspects of the solution.

Once the shopper sends the USDC onchain to the vendor's crypto address, this service tries to match the latest "transaction" with the latest purchase that is the for the same token amount. As mentioned in the spec, this matching process is not perfect.

Once the "purchase" gets marked as "PAYMENT_RECEIVED", then we fire off an asynchronous task to initiatiate the "payout" or withdrawal. This will call "create payout request" and update the purchase status, then it will call "execute payout request" and again update the purchase status accordingly. One current limitation is that I was getting a 500 Internal Server Error whenever I hit the "create payout request" endpoint, so I was never able to test out that task fully.

The vendor can use the "get purchases" endpoint to get the latest statuses of shoppers' purchases. This includes statuses which tell the vendor which purchase payments have been received, and which purchases have started to be withdrawn to their bank accounts. I didn't have time to implement the webhook that updates the status when the payout is fully processed.

Future work
-

The biggest area of improvement is to make these flows more robust - right now, they really only carry out the "happy path", and if there are errors in this service or dependent services, we could get into undesireable states. Firstly, it would be important to use idempotency keys to make sure no payment is processed twice. Also, to structure these purchases' statuses with a strict state machine would be a way to make sure no illegal state transitions are made, rather than just setting the new status willy-nilly. And if this service is running parallel with other distributed services, we would need to solve the problem of race conditions.

As I mentioned before, I didn't define a way that Purchases could be linked to specific Products, since I didn't have enough time to flesh that out in three hours. That would need to be implemented for the store to be complete.

Lastly, I still need to implement the webhook that updates the status of a purchase when the payout is fully processed.
