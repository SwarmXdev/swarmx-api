import { Router } from 'express';
import { PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getProgram, getAgentPDA, getMintPDA, connection } from '../lib/solana';
import { AgentAccountData, ok, fail, parsePublicKey } from '../lib/types';

export const agentRoutes = Router();

// List all agents
agentRoutes.get('/', async (_req, res) => {
  try {
    const program = getProgram();
    const agents = await (program.account as Record<string, { all: () => Promise<Array<{ publicKey: PublicKey; account: AgentAccountData }>> }>).agentAccount.all();
    const result = agents.map((a) => ({
      publicKey: a.publicKey.toBase58(),
      ...serializeAgent(a.account),
    }));
    res.json(ok({ agents: result, total: result.length }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail(message));
  }
});

// Get agent by name
agentRoutes.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const program = getProgram();
    const [agentPDA] = getAgentPDA(name);
    const agent = await (program.account as Record<string, { fetch: (key: PublicKey) => Promise<AgentAccountData> }>).agentAccount.fetch(agentPDA);
    res.json(ok({
      publicKey: agentPDA.toBase58(),
      ...serializeAgent(agent),
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Account does not exist')) {
      return res.status(404).json(fail('Agent not found'));
    }
    res.status(500).json(fail(message));
  }
});

// Register agent — build unsigned tx for frontend to sign
agentRoutes.post('/register', async (req, res) => {
  try {
    const { name, description, endpoint, walletAddress } = req.body;
    if (!name || !description || !endpoint || !walletAddress) {
      return res.status(400).json(fail('name, description, endpoint, walletAddress required'));
    }

    const authority = parsePublicKey(walletAddress);
    if (!authority) {
      return res.status(400).json(fail('Invalid walletAddress'));
    }

    const program = getProgram();
    const [agentPDA] = getAgentPDA(name);
    const [mintPDA] = getMintPDA(agentPDA);

    const ix = await program.methods
      .registerAgent(name, description, endpoint)
      .accounts({
        authority,
        agent: agentPDA,
        token_mint: mintPDA,
        token_program: TOKEN_PROGRAM_ID,
        system_program: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as Record<string, PublicKey>)
      .instruction();

    const tx = new Transaction().add(ix);
    tx.feePayer = authority;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    res.json(ok({
      transaction: serialized.toString('base64'),
      agentPDA: agentPDA.toBase58(),
      mintPDA: mintPDA.toBase58(),
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail(message));
  }
});

function serializeAgent(account: AgentAccountData) {
  return {
    authority: account.authority.toBase58(),
    name: account.name,
    description: account.description,
    endpoint: account.endpoint,
    tokenMint: account.tokenMint.toBase58(),
    tokensSold: account.tokensSold.toString(),
    solCollected: account.solCollected.toString(),
    callCount: account.callCount.toString(),
    tokensBurned: account.tokensBurned.toString(),
    bump: account.bump,
  };
}
