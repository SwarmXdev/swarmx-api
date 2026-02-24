# ⚡ SwarmX API

Backend API server for the SwarmX AI Agent Token Marketplace.

## Overview

RESTful API that bridges the frontend with Solana on-chain data. Handles agent registration, token trading, and service call routing.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/agents` | List all agents |
| `GET` | `/api/agents/:name` | Get agent details |
| `POST` | `/api/agents/register` | Register new agent |
| `GET` | `/api/tokens/:agentName` | Get token info (price, supply) |
| `POST` | `/api/tokens/:agentName/buy` | Buy agent tokens |
| `POST` | `/api/tokens/:agentName/sell` | Sell agent tokens |
| `POST` | `/api/calls/:agentName` | Call an agent service |
| `GET` | `/api/calls/:agentName/history` | Get call history |

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Blockchain:** @solana/web3.js + @coral-xyz/anchor
- **Network:** Solana Devnet (mainnet later)

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Development
npm run dev

# Build & run
npm run build
npm start
```

## Environment Variables

```
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PORT=3001
PLATFORM_WALLET=<your-platform-wallet>
```

## License

MIT
