import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { SwarmXIDL } from './idl';

export const PROGRAM_ID = new PublicKey('Duf2CX5ZGUgLddKffADWc6RygEEYawmqZxzpKGHzfMVE');

export const connection = new Connection(
  process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'),
  'confirmed'
);

/**
 * Returns a read-only Program instance (no wallet needed for reads).
 * For building unsigned transactions we only need the IDL + connection.
 */
export function getProgram(): Program {
  // Dummy keypair — we never sign server-side
  const dummyKeypair = Keypair.generate();
  const dummyWallet = {
    publicKey: dummyKeypair.publicKey,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };
  const provider = new AnchorProvider(
    connection,
    dummyWallet as any,
    { commitment: 'confirmed' }
  );
  return new Program(SwarmXIDL, provider);
}

/** Derive the agent PDA from a name */
export function getAgentPDA(name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('agent'), Buffer.from(name)],
    PROGRAM_ID
  );
}

/** Derive the token mint PDA from an agent PDA */
export function getMintPDA(agentPDA: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('mint'), agentPDA.toBuffer()],
    PROGRAM_ID
  );
}

/** Derive the vault PDA from an agent PDA */
export function getVaultPDA(agentPDA: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), agentPDA.toBuffer()],
    PROGRAM_ID
  );
}
