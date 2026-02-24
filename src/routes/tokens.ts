import { Router } from 'express';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { getProgram, getAgentPDA, getMintPDA, getVaultPDA, connection } from '../lib/solana';
import { AgentAccountData, ok, fail, parsePublicKey, parsePositiveAmount } from '../lib/types';

const BASE_PRICE = 1_000n;
const SLOPE = 10n;

export const tokenRoutes = Router();

// Get bonding curve state for an agent
tokenRoutes.get('/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params;
    const program = getProgram();
    const [agentPDA] = getAgentPDA(agentName);
    const agent = await (program.account as Record<string, { fetch: (key: PublicKey) => Promise<AgentAccountData> }>).agentAccount.fetch(agentPDA);

    const tokensSold = BigInt(agent.tokensSold.toString());
    const solCollected = BigInt(agent.solCollected.toString());
    const currentPrice = BASE_PRICE + SLOPE * tokensSold;

    res.json(ok({
      agent: agentName,
      tokenMint: agent.tokenMint.toBase58(),
      tokensSold: tokensSold.toString(),
      solCollected: solCollected.toString(),
      currentPriceLamports: currentPrice.toString(),
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Account does not exist')) {
      return res.status(404).json(fail('Agent not found'));
    }
    res.status(500).json(fail(message));
  }
});

// Buy tokens — build unsigned tx
tokenRoutes.post('/:agentName/buy', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { amountSol, buyerWallet } = req.body;
    if (!amountSol || !buyerWallet) {
      return res.status(400).json(fail('amountSol, buyerWallet required'));
    }

    const parsedAmount = parsePositiveAmount(amountSol);
    if (parsedAmount === null) {
      return res.status(400).json(fail('amountSol must be a positive number'));
    }

    const buyer = parsePublicKey(buyerWallet);
    if (!buyer) {
      return res.status(400).json(fail('Invalid buyerWallet address'));
    }

    const program = getProgram();
    const [agentPDA] = getAgentPDA(agentName);
    const [mintPDA] = getMintPDA(agentPDA);
    const [vaultPDA] = getVaultPDA(agentPDA);
    const buyerATA = getAssociatedTokenAddressSync(mintPDA, buyer);

    const ix = await program.methods
      .buyToken(new BN(parsedAmount))
      .accounts({
        buyer,
        agent: agentPDA,
        token_mint: mintPDA,
        buyer_token_account: buyerATA,
        vault: vaultPDA,
        token_program: TOKEN_PROGRAM_ID,
        associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
        system_program: SystemProgram.programId,
      } as Record<string, PublicKey>)
      .instruction();

    const tx = new Transaction().add(ix);
    tx.feePayer = buyer;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    res.json(ok({
      transaction: serialized.toString('base64'),
      agent: agentName,
      amountSol: parsedAmount,
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail(message));
  }
});

// Sell tokens — build unsigned tx
tokenRoutes.post('/:agentName/sell', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { amountToken, sellerWallet } = req.body;
    if (!amountToken || !sellerWallet) {
      return res.status(400).json(fail('amountToken, sellerWallet required'));
    }

    const parsedAmount = parsePositiveAmount(amountToken);
    if (parsedAmount === null) {
      return res.status(400).json(fail('amountToken must be a positive number'));
    }

    const seller = parsePublicKey(sellerWallet);
    if (!seller) {
      return res.status(400).json(fail('Invalid sellerWallet address'));
    }

    const program = getProgram();
    const [agentPDA] = getAgentPDA(agentName);
    const [mintPDA] = getMintPDA(agentPDA);
    const [vaultPDA] = getVaultPDA(agentPDA);
    const sellerATA = getAssociatedTokenAddressSync(mintPDA, seller);

    const ix = await program.methods
      .sellToken(new BN(parsedAmount))
      .accounts({
        seller,
        agent: agentPDA,
        token_mint: mintPDA,
        seller_token_account: sellerATA,
        vault: vaultPDA,
        token_program: TOKEN_PROGRAM_ID,
        system_program: SystemProgram.programId,
      } as Record<string, PublicKey>)
      .instruction();

    const tx = new Transaction().add(ix);
    tx.feePayer = seller;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    res.json(ok({
      transaction: serialized.toString('base64'),
      agent: agentName,
      amountToken: parsedAmount,
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(fail(message));
  }
});
