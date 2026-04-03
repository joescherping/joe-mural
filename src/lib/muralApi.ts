import axios, { type AxiosInstance } from "axios";
import { vendorRecipientInfo, vendorSourceAccountId, vendorPayoutDetails } from "../constants";

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

interface TransactionResponse {
  "id": string;
  "hash": string;
  "transactionExecutionDate": string;
  "memo": string;
  "blockchain": string;
  "amount": {
    "tokenAmount": number;
    "tokenSymbol": string;
  },
  "accountId": string;
  "counterpartyInfo": {
    "type": string;
  },
  "transactionDetails": {
    "type": string;
    "payoutRequestId": string;
    "payoutId": string;
  }
};
export async function getTransaction(
  transactionId: string,
): Promise<TransactionResponse> {
  const response = await muralApi.get(
    `transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data;
}

export interface PayoutRequest {
  "sourceAccountId": string;
  "payouts": {
    "amount": {
      "tokenAmount": number;
      "tokenSymbol": string;
    },
    "payoutDetails": {
      "type": string;
      "fiatAndRailDetails": {
        "type": string;
        "symbol": string;
        "accountType": string;
        "bankAccountNumber": string;
        "phoneNumber": string;
        "documentNumber": string;
        "documentType": string;
      },
      "bankName": string;
      "bankAccountOwner": string;
    },
    "recipientInfo": {
      "type": string;
      "firstName": string;
      "lastName": string;
      "email": string;
      "physicalAddress": {
          "country": string;
          "subdivision": string;
          "address1": string;
          "state": string;
          "city": string;
          "zip": string;
      }
    }
  }[]
}
interface PayoutRequestResponse {
  "id": string;
  "createdAt": string;
  "counterpartyId": string;
  "alias": string;
  "payoutMethod": {
    "type": string;
    "details": {
      "type": string;
      "symbol": string;
      "accountType": string;
      "transferType": string;
      "bankName": string;
      "bankAccountNumberTruncated": string;
      "bankRoutingNumberTruncated": string;
    }
  }
}

/** POST /api/payouts/payout */
export async function createPayout(totalSum: number): Promise<PayoutRequestResponse> {
  const payload: PayoutRequest = {
    sourceAccountId: vendorSourceAccountId,
    payouts: [
      {
        "amount": {
          "tokenAmount": totalSum,
          "tokenSymbol": "USDC"
        },
        recipientInfo: vendorRecipientInfo,
        payoutDetails: vendorPayoutDetails
      }
    ]
  }
  const response = await muralApi.post("payouts/payout", payload, {
    headers: getAuthHeaders(),
  });

  return response.data;
}

/** POST /api/payouts/payout/{payout-request-id}/execute */
export async function executePayout(
  payoutRequestId: string,
): Promise<unknown> {
  const response = await muralApi.post(
    `payouts/payout/${encodeURIComponent(payoutRequestId)}/execute`,
    null,
    {
      headers: {
        ...getAuthHeaders(),
        "transfer-api-key": process.env.MURAL_TRANSFER_API_KEY,
      },
    },
  );

  return response.data;
}
