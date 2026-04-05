![stellarr ci cd](https://github.com/user-attachments/assets/151d0dc1-cd93-48dc-a4bc-525e0ce55d8d)
![stellarr 3](https://github.com/user-attachments/assets/d60e6cea-d38d-491d-b1d9-449d392951d9)
![stellarr 2](https://github.com/user-attachments/assets/57e8b7a8-f7f8-4453-948e-1d22519fe5e6)
![stellarr 1](https://github.com/user-![stellar mobile](https://github.com/user-attachments/assets/9113746d-f698-4c23-bae4-f22a37618023)
attachments/assets/4d78ec7a-2ebd-43c3-b513-1df8c298a3b0)
# Stellar Reward Vault
[![CI/CD Pipeline](https://github.com/UnrealAnkit/stellarvault/actions/workflows/ci.yml/badge.svg)](https://github.com/UnrealAnkit/stellarvault/actions/workflows/ci.yml)

> **Stellar Journey to Mastery — Level 4: Green Belt Submission**

A production-ready reward distribution dApp built on the Stellar blockchain using Soroban smart contracts. Users connect their wallet and claim custom SRT (Stellar Reward Token) tokens from a vault contract via a real inter-contract call.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Frontend](#frontend)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Contract Deployment](#contract-deployment)
- [Frontend Development](#frontend-development)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Deployment to Vercel](#deployment-to-vercel)
- [Green Belt Requirements Checklist](#green-belt-requirements-checklist)

---

## Overview

Stellar Reward Vault allows:
- **Campaign admin** to initialize a reward campaign with a custom token and reward amount
- **Users** to connect their Stellar wallet (Freighter, Albedo, xBull, etc.) and claim a one-time SRT reward
- The vault contract makes a **real inter-contract call** to the token contract to transfer tokens directly to the claimant
- The frontend shows real-time claim status, activity feed, token balance, and full transaction state lifecycle

---

## Architecture

```
User Wallet
    │
    ▼ signs tx
Vault Contract (reward-vault)
    │  claim(user_address)
    │  ├── Check: has_claimed? → panic "already claimed"
    │  ├── Check: campaign active?
    │  └── Inter-contract call ──────────────────────────────────┐
                                                                  ▼
                                              Token Contract (reward-token)
                                                  transfer_from(admin, admin, user, amount)
                                                      │
                                                      ▼
                                              User's wallet receives SRT tokens
```

**Inter-contract call**: `vault::claim()` invokes `token::transfer_from()` directly on-chain — this is the core Green Belt requirement.

---

## Project Structure

```
stellar-reward-vault/
├── Cargo.toml                        # Rust workspace
├── contracts/
│   ├── reward-token/                 # Custom SRT token contract
│   │   ├── Cargo.toml
│   │   └── src/lib.rs
│   └── reward-vault/                 # Reward distribution vault contract
│       ├── Cargo.toml
│       └── src/lib.rs
├── frontend/                         # Next.js 14 + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout with providers
│   │   │   ├── page.tsx              # Dashboard page
│   │   │   ├── providers.tsx         # QueryClient + WalletProvider
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── activity/
│   │   │   │   └── ActivityFeed.tsx  # Live claim event feed
│   │   │   ├── ui/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── NetworkBadge.tsx
│   │   │   │   └── Skeleton.tsx
│   │   │   ├── vault/
│   │   │   │   ├── Dashboard.tsx           # Main layout
│   │   │   │   ├── RewardCampaignCard.tsx  # Claim UI
│   │   │   │   ├── ClaimStatusBadge.tsx    # Status indicator
│   │   │   │   ├── TxStatusPanel.tsx       # Tx lifecycle panel
│   │   │   │   ├── ContractInfoSection.tsx # Contract details
│   │   │   │   └── StatsBar.tsx            # Global stats
│   │   │   └── wallet/
│   │   │       ├── WalletButton.tsx        # Connect/disconnect
│   │   │       └── WalletSection.tsx       # Wallet info + balance
│   │   ├── hooks/
│   │   │   ├── useWallet.tsx         # Wallet context + provider
│   │   │   └── useVault.ts           # TanStack Query hooks
│   │   ├── lib/
│   │   │   ├── constants.ts          # Config, formatters
│   │   │   ├── stellar.ts            # Contract interaction utilities
│   │   │   ├── wallet.ts             # StellarWalletsKit integration
│   │   │   ├── events.ts             # Event polling (activity feed)
│   │   │   └── utils.ts              # cn() utility
│   │   ├── tests/
│   │   │   ├── setup.ts              # Vitest + jsdom setup
│   │   │   ├── utils.test.ts         # formatTokenAmount, shortenAddress
│   │   │   ├── errorParsing.test.ts  # parseContractError
│   │   │   ├── ClaimStatusBadge.test.tsx
│   │   │   ├── TxStatusPanel.test.tsx
│   │   │   └── WalletSection.test.tsx
│   │   └── types/
│   │       └── index.ts
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vitest.config.ts
├── scripts/
│   ├── deploy.sh                     # Full contract deployment script
│   └── setup.sh                      # One-shot local setup
└── .github/
    └── workflows/
        └── ci.yml                    # Full CI/CD pipeline
```

---

## Smart Contracts

### Contract 1: Reward Token (`reward-token`)

A custom Soroban token contract implementing:

| Function | Description |
|---|---|
| `initialize(admin, name, symbol, decimals, initial_supply)` | One-time init; mints supply to admin |
| `transfer(from, to, amount)` | Standard token transfer |
| `transfer_from(spender, from, to, amount)` | Delegated transfer — only admin (vault) is authorized |
| `mint(to, amount)` | Admin-only mint |
| `balance(address)` | Query balance |
| `total_supply()` | Query total supply |
| `name()`, `symbol()`, `decimals()` | Token metadata |

### Contract 2: Reward Vault (`reward-vault`)

The vault distributes tokens to claimants via inter-contract calls:

| Function | Description |
|---|---|
| `initialize(admin, token_contract, reward_amount, campaign_name)` | One-time init |
| `claim(user_address)` | Claim reward — calls `token::transfer_from` internally |
| `has_claimed(user_address)` | Check if a wallet has already claimed |
| `get_reward_amount()` | Get current reward per claim |
| `get_total_claims()` | Total number of claims processed |
| `get_campaign_info()` | Full campaign details struct |
| `get_claim_history()` | Vec of last 20 claimer addresses |
| `set_campaign_active(bool)` | Admin: pause/resume |
| `set_reward_amount(amount)` | Admin: update reward |

#### Business Rules
- Vault can only be initialized once
- Each wallet can claim **exactly once** — second attempt panics `"already claimed"`
- Campaign must be active to accept claims
- Claim emits a `"claimed"` event with user address, amount, and total claims

#### Inter-Contract Call (Green Belt Core Feature)

```rust
// Inside reward-vault/src/lib.rs — claim()
let token_client = token::Client::new(&env, &token_contract);
token_client.transfer_from(&admin, &admin, &user, &reward_amount);
```

This calls the deployed token contract directly on-chain, transferring tokens from the admin treasury to the user's wallet atomically within the same transaction.

---

## Frontend

Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **StellarWalletsKit**, and **TanStack Query**.

### Key Features

| Feature | Implementation |
|---|---|
| Wallet connect/disconnect | StellarWalletsKit modal (all wallets) |
| Claim flow | Build TX → Sign → Submit → Poll |
| Transaction states | `preparing → pending → success/failed` |
| Double-claim prevention | `has_claimed` queried before and shown in UI |
| Token balance | Polled every 8s via TanStack Query |
| Activity feed | Soroban event polling via `getEvents` RPC |
| Error handling | All contract errors parsed and displayed |
| Caching | TanStack Query with `staleTime`, `refetchInterval`, and post-claim invalidation |
| Mobile responsive | Tailwind responsive grid (single col → 3 col) |

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Rust + Cargo | stable | https://rustup.rs |
| wasm32 target | — | `rustup target add wasm32-unknown-unknown` |
| stellar-cli | latest | `cargo install --locked stellar-cli --features opt` |
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | bundled with Node |
| Freighter Wallet | latest | https://freighter.app |

---

## Local Setup

### Option A — Automated (recommended)

```bash
git clone https://github.com/yourname/stellar-reward-vault.git
cd stellar-reward-vault
chmod +x scripts/setup.sh scripts/deploy.sh
./scripts/setup.sh
```

### Option B — Manual

```bash
# 1. Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# 2. Install stellar-cli
cargo install --locked stellar-cli --features opt

# 3. Install Node.js 20 (via nvm)
nvm install 20 && nvm use 20

# 4. Install frontend dependencies
cd frontend && npm install && cd ..

# 5. Copy env template
cp frontend/.env.example frontend/.env.local
```

---

## Contract Deployment

### Deploy to Testnet (automated)

```bash
./scripts/deploy.sh
```

This will:
1. Generate (or use) an admin keypair named `vault-admin`
2. Fund the admin account via Friendbot
3. Build both WASM contracts
4. Deploy token contract and initialize (1,000,000 SRT to admin)
5. Deploy vault contract and initialize (100 SRT per claim)
6. Write contract addresses to `frontend/.env.local`

### Deploy manually (step-by-step)

```bash
# 0. Build contracts
stellar contract build --package reward-token
stellar contract build --package reward-vault

# 1. Generate admin keypair
stellar keys generate --no-fund vault-admin
stellar keys fund vault-admin --network testnet
ADMIN=$(stellar keys address vault-admin)

# 2. Deploy token contract
TOKEN_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/reward_token.wasm \
  --source vault-admin --network testnet)

# 3. Initialize token
stellar contract invoke --id $TOKEN_ID --source vault-admin --network testnet \
  -- initialize \
  --admin $ADMIN \
  --name "Stellar Reward Token" \
  --symbol "SRT" \
  --decimals 7 \
  --initial_supply 1000000_0000000

# 4. Deploy vault contract
VAULT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/reward_vault.wasm \
  --source vault-admin --network testnet)

# 5. Initialize vault
stellar contract invoke --id $VAULT_ID --source vault-admin --network testnet \
  -- initialize \
  --admin $ADMIN \
  --token_contract $TOKEN_ID \
  --reward_amount 100_0000000 \
  --campaign_name "Green Belt Campaign"

# 6. Update .env.local
echo "NEXT_PUBLIC_TOKEN_CONTRACT_ID=$TOKEN_ID" >> frontend/.env.local
echo "NEXT_PUBLIC_VAULT_CONTRACT_ID=$VAULT_ID" >> frontend/.env.local
```

### Verify deployment

```bash
# Check campaign info
stellar contract invoke --id $VAULT_ID --source vault-admin --network testnet \
  -- get_campaign_info

# Check token balance of admin
stellar contract invoke --id $TOKEN_ID --source vault-admin --network testnet \
  -- balance --address $ADMIN
```

---

## Frontend Development

```bash
cd frontend

# Development server
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start

# Type check
npm run typecheck

# Lint
npm run lint
```

### Freighter Setup for Testing

1. Install [Freighter](https://freighter.app) browser extension
2. Open Freighter → Settings → Network → Switch to **Testnet**
3. Go to http://localhost:3000 and click **Connect Wallet**
4. If your testnet account is empty, fund it at https://laboratory.stellar.org/#account-creator

---

## Running Tests

### Contract tests (Rust)

```bash
# All contracts
cargo test

# Specific contract
cargo test -p reward-token
cargo test -p reward-vault

# With output
cargo test -p reward-token -- --nocapture
```

### Frontend tests (Vitest)

```bash
cd frontend

# Run all tests once
npm test

# Watch mode
npm run test:watch

# Interactive UI
npm run test:ui
```

**Test coverage:**
- `utils.test.ts` — `formatTokenAmount`, `shortenAddress`
- `errorParsing.test.ts` — `parseContractError` for all error codes
- `ClaimStatusBadge.test.tsx` — All badge states
- `TxStatusPanel.test.tsx` — All transaction states, dismiss button
- `WalletSection.test.tsx` — Connected/disconnected/error states

---

## CI/CD Pipeline

GitHub Actions workflow at `.github/workflows/ci.yml`:

```
On push/PR to main:

contract-lint ──► contract-test ──► contract-build
                                         │
frontend-install ──► frontend-lint   ────┤
                 ├── frontend-typecheck   ├──► deploy (main only)
                 └── frontend-test    ───►│
                          │           frontend-build
```

**Jobs:**
| Job | What it does |
|---|---|
| `contract-lint` | `cargo fmt --check` + `cargo clippy` |
| `contract-test` | `cargo test` for both packages |
| `contract-build` | Builds WASM, uploads as artifact |
| `frontend-install` | `npm ci` with cache |
| `frontend-lint` | `next lint` / ESLint |
| `frontend-typecheck` | `tsc --noEmit` |
| `frontend-test` | Vitest |
| `frontend-build` | `next build` |
| `deploy` | Vercel production deploy (main branch only) |

---

## Environment Variables

Create `frontend/.env.local` (auto-generated by `deploy.sh`):

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Fill after deployment:
NEXT_PUBLIC_TOKEN_CONTRACT_ID=C...
NEXT_PUBLIC_VAULT_CONTRACT_ID=C...

NEXT_PUBLIC_APP_NAME=Stellar Reward Vault
NEXT_PUBLIC_POLL_INTERVAL_MS=8000
```

For CI, add `TOKEN_CONTRACT_ID` and `VAULT_CONTRACT_ID` as GitHub repository secrets.

---

## Deployment to Vercel

```bash
cd frontend
npx vercel

# Or link to existing project
npx vercel link
npx vercel env add NEXT_PUBLIC_TOKEN_CONTRACT_ID
npx vercel env add NEXT_PUBLIC_VAULT_CONTRACT_ID
# (add all other NEXT_PUBLIC_ vars)
npx vercel --prod
```

For automated CI deploys, add to GitHub secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `TOKEN_CONTRACT_ID`
- `VAULT_CONTRACT_ID`

---

## Green Belt Requirements Checklist

| # | Requirement | Status |
|---|---|---|
| 1 | Custom reward token contract | ✅ `reward-token` — SRT token, 7 decimals, 1M supply |
| 2 | Reward vault contract | ✅ `reward-vault` — full claim lifecycle |
| 3 | Real inter-contract call | ✅ `token::Client::transfer_from()` called inside `vault::claim()` |
| 4 | Wallet connect / disconnect | ✅ StellarWalletsKit modal, session persistence |
| 5 | Claim reward flow | ✅ Build → sign → submit → poll loop |
| 6 | Prevent double claim | ✅ `has_claimed` persistent storage, panics on second attempt |
| 7 | Show claim status | ✅ `ClaimStatusBadge` — Eligible / Pending / Claimed / Failed |
| 8 | Show token balance | ✅ SRT balance queried every 8s |
| 9 | Recent claim activity | ✅ `ActivityFeed` — Soroban events + on-chain history vec |
| 10 | Real-time updates | ✅ TanStack Query polling + post-claim invalidation |
| 11 | Transaction states | ✅ `preparing → pending → success → failed` in `TxStatusPanel` |
| 12 | Error handling | ✅ All 7 error types parsed and displayed gracefully |
| 13 | TanStack Query caching | ✅ `staleTime`, `refetchInterval`, `gcTime`, post-mutation invalidation |
| 14 | Mobile responsive | ✅ Tailwind responsive grid, mobile-first design |
| 15 | CI/CD pipeline | ✅ 8-job GitHub Actions workflow |
| 16 | 3–5 meaningful tests | ✅ 5 test files, 30+ test cases |
| 17 | Complete README | ✅ This document |
| 18 | Easy local setup | ✅ `./scripts/setup.sh` one-shot setup |
| 19 | Deployment instructions | ✅ `./scripts/deploy.sh` + manual steps above |

---

## Token Economics

| Parameter | Value |
|---|---|
| Token Name | Stellar Reward Token |
| Symbol | SRT |
| Decimals | 7 |
| Initial Supply | 1,000,000 SRT |
| Reward Per Claim | 100 SRT |
| Max Claims | 10,000 (limited by supply) |
| Network | Stellar Testnet |

---

## License

MIT — Built for the Stellar Journey to Mastery certification program.
