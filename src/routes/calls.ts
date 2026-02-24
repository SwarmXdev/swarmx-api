import { Router } from 'express';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { getProgram, getAgentPDA, getMintPDA, connection } from '../lib/solana';
import { AgentAccountData, ok, fail, parsePublicKey, parsePositiveAmount } from '../lib/types';

export const callRoutes = Router();

function getPlatformFeeWallet(): PublicKey | null {
  const raw = process.env.PLATFORM_FEE_WALLET;
  if (!raw) return null;
  return parsePublicKey(raw);
}

// Call an agent — build unsigned tx
callRoutes.post('/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { callerWallet, tokenAmount } = req.body;
    if (!callerWallet || !tokenAmount) {
      return res.status(400).json(fail('callerWallet, tokenAmount required'));
    }

    const parsedAmount = parsePositiveAmount(tokenAmount);
    if (parsedAmount === null) {
      return res.status(400).json(fail('tokenAmount must be a positive number'));
    }

    const caller = parsePublicKey(callerWallet);
    if (!caller) {
      return res.status(400).json(fail('Invalid callerWallet address'));
    }

    const platformFeeWallet = getPlatformFeeWallet();
    if (!platformFeeWallet) {
      return res.status(500).json(fail('PLATFORM_FEE_WALLET not configured'));
    }

    const program = getProgram();
    const [agentPDA] = getAgentPDA(agentName);
    const [mintPDA] = getMintPDA(agentPDA);

    // Fetch agent to get authority for devTokenAccount derivation
    const agent = await (program.account as Record<string, { fetch: (key: PublicKey) => Promise<AgentAccountData> }>).agentAccount.fetch(agentPDA);

    const callerATA = getAssociatedTokenAddressSync(mintPDA, caller);
    const devTokenAccount = getAssociatedTokenAddressSync(mintPDA, agent.authority);
    const platformTokenAccount = getAssociatedTokenAddressSync(mintPDA, platformFeeWallet);

    const ix = await program.methods
      .callAgent(new BN(parsedAmount))
      .accounts({
        caller,
        agent: agentPDA,
        token_mint: mintPDA,
        caller_token_account: callerATA,
        dev_token_account: devTokenAccount,
        platform_token_account: platformTokenAccount,
        token_program: TOKEN_PROGRAM_ID,
      } as Record<string, PublicKey>)
      .instruction();

    const tx = new Transaction().add(ix);
    tx.feePayer = caller;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    res.json(ok({
      transaction: serialized.toString('base64'),
      agent: agentName,
      tokenAmount: parsedAmount,
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Account does not exist')) {
      return res.status(404).json(fail('Agent not found'));
    }
    res.status(500).json(fail(message));
  }
});

// Get call stats for an agent (on-chain state)
callRoutes.get('/:agentName/history', async (req, res) => {
  try {
    const { agentName } = req.params;
    const program = getProgram();
    const [agentPDA] = getAgentPDA(agentName);
    const agent = await (program.account as Record<string, { fetch: (key: PublicKey) => Promise<AgentAccountData> }>).agentAccount.fetch(agentPDA);

    res.json(ok({
      agent: agentName,
      callCount: agent.callCount.toString(),
      tokensBurned: agent.tokensBurned.toString(),
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Account does not exist')) {
      return res.status(404).json(fail('Agent not found'));
    }
    res.status(500).json(fail(message));
  }
});
