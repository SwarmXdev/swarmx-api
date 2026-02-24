import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRoutes } from './routes/agents';
import { tokenRoutes } from './routes/tokens';
import { callRoutes } from './routes/calls';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/calls', callRoutes);

app.listen(PORT, () => {
  console.log(`SwarmX API running on port ${PORT}`);
});

export default app;
