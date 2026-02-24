import { Idl } from '@coral-xyz/anchor';

export const SwarmXIDL: Idl = {
  address: "Duf2CX5ZGUgLddKffADWc6RygEEYawmqZxzpKGHzfMVE",
  metadata: {
    name: "swarmx",
    version: "0.1.0",
    spec: "0.1.0",
  },
  instructions: [
    {
      name: "register_agent",
      discriminator: [135, 157, 66, 195, 2, 113, 175, 30],
      accounts: [
        { name: "authority", writable: true, signer: true },
        { name: "agent", writable: true },
        { name: "token_mint", writable: true },
        { name: "token_program" },
        { name: "system_program" },
        { name: "rent" },
      ],
      args: [
        { name: "name", type: "string" },
        { name: "description", type: "string" },
        { name: "endpoint", type: "string" },
      ],
    },
    {
      name: "buy_token",
      discriminator: [138, 127, 14, 91, 38, 87, 115, 105],
      accounts: [
        { name: "buyer", writable: true, signer: true },
        { name: "agent", writable: true },
        { name: "token_mint", writable: true },
        { name: "buyer_token_account", writable: true },
        { name: "vault", writable: true },
        { name: "token_program" },
        { name: "associated_token_program" },
        { name: "system_program" },
      ],
      args: [
        { name: "amount_sol", type: "u64" },
      ],
    },
    {
      name: "sell_token",
      discriminator: [109, 61, 40, 187, 230, 176, 135, 174],
      accounts: [
        { name: "seller", writable: true, signer: true },
        { name: "agent", writable: true },
        { name: "token_mint", writable: true },
        { name: "seller_token_account", writable: true },
        { name: "vault", writable: true },
        { name: "token_program" },
        { name: "system_program" },
      ],
      args: [
        { name: "amount_token", type: "u64" },
      ],
    },
    {
      name: "call_agent",
      discriminator: [125, 203, 210, 199, 114, 184, 141, 36],
      accounts: [
        { name: "caller", writable: true, signer: true },
        { name: "agent", writable: true },
        { name: "token_mint", writable: true },
        { name: "caller_token_account", writable: true },
        { name: "dev_token_account", writable: true },
        { name: "platform_token_account", writable: true },
        { name: "token_program" },
      ],
      args: [
        { name: "token_amount", type: "u64" },
      ],
    },
  ],
  accounts: [
    {
      name: "AgentAccount",
      discriminator: [241, 119, 69, 140, 233, 9, 112, 50],
    },
    {
      name: "PlatformConfig",
      discriminator: [160, 78, 128, 0, 248, 83, 230, 160],
    },
  ],
  types: [
    {
      name: "AgentAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "pubkey" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "token_mint", type: "pubkey" },
          { name: "tokens_sold", type: "u64" },
          { name: "sol_collected", type: "u64" },
          { name: "call_count", type: "u64" },
          { name: "tokens_burned", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "PlatformConfig",
      type: {
        kind: "struct",
        fields: [
          { name: "admin", type: "pubkey" },
          { name: "fee_wallet", type: "pubkey" },
          { name: "agent_count", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "NameTooLong", msg: "Agent name too long (max 64 chars)" },
    { code: 6001, name: "DescriptionTooLong", msg: "Agent description too long (max 256 chars)" },
    { code: 6002, name: "EndpointTooLong", msg: "Endpoint too long (max 256 chars)" },
    { code: 6003, name: "InsufficientSol", msg: "Insufficient SOL for purchase" },
    { code: 6004, name: "InsufficientTokens", msg: "Insufficient tokens for sale" },
    { code: 6005, name: "InsufficientCallTokens", msg: "Insufficient tokens for call" },
    { code: 6006, name: "MathOverflow", msg: "Bonding curve calculation overflow" },
    { code: 6007, name: "ZeroAmount", msg: "Zero amount not allowed" },
  ],
};
