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

module.exports = {
  getTransaction,
};
