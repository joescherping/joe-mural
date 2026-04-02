/** Minimal shape used by webhooks when reading GET /transactions/:id */
export interface MuralTransactionAmount {
  tokenAmount?: number | string;
}

export interface MuralTransaction {
  amount?: MuralTransactionAmount;
  transactionExecutionDate?: string;
}
