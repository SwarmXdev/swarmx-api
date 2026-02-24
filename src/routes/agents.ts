import { Router } from 'express';

export const agentRoutes = Router();

// List all agents
agentRoutes.get('/', async (_req, res) => {
  // TODO: fetch from Solana / local DB
  res.json({ agents: [], total: 0 });
});

// Get agent by name
agentRoutes.get('/:name', async (req, res) => {
  const { name } = req.params;
  // TODO: fetch agent account from Solana
  res.json({ name, status: 'not_implemented' });
});

// Register agent (triggers on-chain tx)
agentRoutes.post('/register', async (req, res) => {
  const { name, description, endpoint } = req.body;
  if (!name || !description || !endpoint) {
    return res.status(400).json({ error: 'name, description, endpoint required' });
  }
  // TODO: build and send register_agent tx
  res.json({ status: 'pending', name });
});
