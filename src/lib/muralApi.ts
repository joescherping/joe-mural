import axios, { type AxiosInstance } from "axios";

const muralApi: AxiosInstance = axios.create({
  baseURL: "https://api-staging.muralpay.com/api/",
  timeout: 10000,
});

function getAuthHeaders(): Record<string, string> {
  const token = process.env.MURAL_API_BEARER_TOKEN;
  if (!token) {
    throw new Error("Missing MURAL_API_BEARER_TOKEN");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getTransaction(
  transactionId: string,
): Promise<unknown> {
  const response = await muralApi.get(
    `transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
}

/** POST /api/payouts/payout */
export async function createPayout(payload: unknown): Promise<unknown> {
  const response = await muralApi.post("payouts/payout", payload, {
    headers: getAuthHeaders(),
  });

  return response.data;
}

/** POST /api/payouts/payout/{payout-request-id}/execute */
export async function executePayout(
  payoutRequestId: string,
  body: Record<string, unknown> = {},
): Promise<unknown> {
  const response = await muralApi.post(
    `payouts/payout/${encodeURIComponent(payoutRequestId)}/execute`,
    body,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
