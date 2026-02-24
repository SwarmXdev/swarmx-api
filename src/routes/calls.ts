import { Router } from 'express';

export const callRoutes = Router();

// Call an agent (triggers on-chain token consumption)
callRoutes.post('/:agentName', async (req, res) => {
  const { agentName } = req.params;
  const { callerWallet, tokenAmount, payload } = req.body;
  if (!callerWallet || !tokenAmount) {
    return res.status(400).json({ error: 'callerWallet, tokenAmount required' });
  }
  // TODO:
  // 1. Build call_agent tx (burn 40%, dev 40%, platform 20%)
  // 2. After tx confirmed, forward payload to agent endpoint
  // 3. Return agent response
  res.json({
    status: 'pending',
    agent: agentName,
    tokenAmount,
    message: 'Call will be routed after on-chain confirmation',
  });
});

// Get call history for an agent
callRoutes.get('/:agentName/history', async (req, res) => {
  const { agentName } = req.params;
  // TODO: fetch from local DB / on-chain logs
  res.json({ agent: agentName, calls: [], total: 0 });
});
