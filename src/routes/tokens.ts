import { Router } from 'express';

export const tokenRoutes = Router();

// Get token info for an agent
tokenRoutes.get('/:agentName', async (req, res) => {
  const { agentName } = req.params;
  // TODO: fetch bonding curve state from Solana
  res.json({
    agent: agentName,
    price: 0,
    totalSold: 0,
    solCollected: 0,
    status: 'not_implemented',
  });
});

// Buy tokens
tokenRoutes.post('/:agentName/buy', async (req, res) => {
  const { agentName } = req.params;
  const { amountSol, buyerWallet } = req.body;
  if (!amountSol || !buyerWallet) {
    return res.status(400).json({ error: 'amountSol, buyerWallet required' });
  }
  // TODO: build buy_token tx, return for client signing
  res.json({ status: 'pending', agent: agentName, amountSol });
});

// Sell tokens
tokenRoutes.post('/:agentName/sell', async (req, res) => {
  const { agentName } = req.params;
  const { amountToken, sellerWallet } = req.body;
  if (!amountToken || !sellerWallet) {
    return res.status(400).json({ error: 'amountToken, sellerWallet required' });
  }
  // TODO: build sell_token tx, return for client signing
  res.json({ status: 'pending', agent: agentName, amountToken });
});
