import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

/** On-chain AgentAccount data (deserialized by Anchor) */
export interface AgentAccountData {
  authority: PublicKey;
  name: string;
  description: string;
  endpoint: string;
  tokenMint: PublicKey;
  tokensSold: BN;
  solCollected: BN;
  callCount: BN;
  tokensBurned: BN;
  bump: number;
}

/** Standardized API success response */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/** Standardized API error response */
export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Helper: wrap success */
export function ok<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

/** Helper: wrap error */
export function fail(error: string): ApiErrorResponse {
  return { success: false, error };
}

/** Validate a base58 public key string. Returns PublicKey or null. */
export function parsePublicKey(value: string): PublicKey | null {
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

/** Validate a positive numeric amount (string or number). Returns number or null. */
export function parsePositiveAmount(value: unknown): number | null {
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0 || !Number.isFinite(n)) return null;
  return n;
}
