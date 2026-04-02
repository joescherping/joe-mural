const axios = require("axios");

const muralApi = axios.create({
  baseURL: "https://api-staging.muralpay.com/api/",
  timeout: 10000,
});

function getAuthHeaders() {
  const token = process.env.MURAL_API_BEARER_TOKEN;
  if (!token) {
    throw new Error("Missing MURAL_API_BEARER_TOKEN");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function getTransaction(transactionId) {
  const response = await muralApi.get(
    `transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
}

/**
 * POST /api/payouts/payout (base URL already includes /api/)
 * @param {object} payload - e.g. { sourceAccountId, payouts: [...] }
 */
async function createPayout(payload) {
  const response = await muralApi.post("payouts/payout", payload, {
    headers: getAuthHeaders(),
  });

  return response.data;
}

/**
 * POST /api/payouts/payout/{payout-request-id}/execute
 * @param {string} payoutRequestId
 * @param {object} [body] - defaults to {} if the API accepts an empty JSON body
 */
async function executePayout(payoutRequestId, body = {}) {
  const response = await muralApi.post(
    `payouts/payout/${encodeURIComponent(payoutRequestId)}/execute`,
    null,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
}

module.exports = {
  getTransaction,
  createPayout,
  executePayout,
};
