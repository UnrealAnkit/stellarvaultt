#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Deploy Stellar Reward Vault contracts to testnet
# =============================================================================
# Usage: ./scripts/deploy.sh [--network testnet|mainnet] [--admin <keypair-name>]
# =============================================================================

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
NETWORK="${NETWORK:-testnet}"
ADMIN_KEYPAIR="${ADMIN_KEYPAIR:-vault-admin}"
REWARD_AMOUNT="${REWARD_AMOUNT:-100_0000000}"          # 100 SRT (7 decimals)
CAMPAIGN_NAME="${CAMPAIGN_NAME:-Green Belt Campaign}"
INITIAL_SUPPLY="${INITIAL_SUPPLY:-1000000_0000000}"   # 1,000,000 SRT

RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

if [[ "$NETWORK" == "mainnet" ]]; then
  RPC_URL="https://mainnet.sorobanrpc.com"
  NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
fi

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
RESET='\033[0m'

log()  { echo -e "${CYAN}[deploy]${RESET} $*"; }
ok()   { echo -e "${GREEN}[  ok  ]${RESET} $*"; }
warn() { echo -e "${YELLOW}[ warn ]${RESET} $*"; }
die()  { echo -e "${RED}[ fail ]${RESET} $*"; exit 1; }

# ── Prerequisites ─────────────────────────────────────────────────────────────
command -v stellar >/dev/null 2>&1 || die "stellar CLI not found. Install: cargo install --locked stellar-cli --features opt"
command -v cargo   >/dev/null 2>&1 || die "cargo not found. Install Rust: https://rustup.rs"

log "Network      : ${BOLD}${NETWORK}${RESET}"
log "Admin keypair: ${BOLD}${ADMIN_KEYPAIR}${RESET}"
log "RPC URL      : ${RPC_URL}"
echo ""

# ── Step 1: Generate/use admin keypair ───────────────────────────────────────
log "Checking admin keypair..."
if ! stellar keys show "$ADMIN_KEYPAIR" &>/dev/null; then
  warn "Keypair '$ADMIN_KEYPAIR' not found. Generating..."
  stellar keys generate --no-fund "$ADMIN_KEYPAIR"
  ok "Generated keypair: $ADMIN_KEYPAIR"
fi

ADMIN_ADDRESS=$(stellar keys address "$ADMIN_KEYPAIR")
log "Admin address: ${BOLD}${ADMIN_ADDRESS}${RESET}"

# Fund on testnet if balance is low
if [[ "$NETWORK" == "testnet" ]]; then
  log "Funding admin account on testnet..."
  stellar keys fund "$ADMIN_KEYPAIR" --network "$NETWORK" || warn "Fund request may have failed (account may already be funded)"
fi

# ── Step 2: Build contracts ───────────────────────────────────────────────────
log "Building contracts..."
cargo build --manifest-path=contracts/reward-token/Cargo.toml --target wasm32-unknown-unknown --release
cargo build --manifest-path=contracts/reward-vault/Cargo.toml --target wasm32-unknown-unknown --release

stellar contract optimize --wasm target/wasm32-unknown-unknown/release/reward_token.wasm
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/reward_vault.wasm
ok "Contracts built."

TOKEN_WASM="target/wasm32-unknown-unknown/release/reward_token.optimized.wasm"
VAULT_WASM="target/wasm32-unknown-unknown/release/reward_vault.optimized.wasm"

[[ -f "$TOKEN_WASM" ]] || die "Token WASM not found: $TOKEN_WASM"
[[ -f "$VAULT_WASM" ]] || die "Vault WASM not found: $VAULT_WASM"

# ── Step 3: Deploy Token Contract ─────────────────────────────────────────────
log "Deploying Reward Token contract..."
TOKEN_CONTRACT_ID=$(stellar contract deploy \
  --wasm "$TOKEN_WASM" \
  --source "$ADMIN_KEYPAIR" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE")

ok "Token contract deployed: ${BOLD}${TOKEN_CONTRACT_ID}${RESET}"

# ── Step 4: Initialize Token Contract ────────────────────────────────────────
log "Initializing Reward Token contract..."
stellar contract invoke \
  --id "$TOKEN_CONTRACT_ID" \
  --source "$ADMIN_KEYPAIR" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin "$ADMIN_ADDRESS" \
  --name "Stellar Reward Token" \
  --symbol "SRT" \
  --decimals 7 \
  --initial_supply "$INITIAL_SUPPLY"

ok "Token contract initialized. Supply: ${INITIAL_SUPPLY} (stroops)"

# ── Step 5: Deploy Vault Contract ─────────────────────────────────────────────
log "Deploying Reward Vault contract..."
VAULT_CONTRACT_ID=$(stellar contract deploy \
  --wasm "$VAULT_WASM" \
  --source "$ADMIN_KEYPAIR" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE")

ok "Vault contract deployed: ${BOLD}${VAULT_CONTRACT_ID}${RESET}"

# ── Step 6: Initialize Vault Contract ────────────────────────────────────────
log "Initializing Reward Vault contract..."
stellar contract invoke \
  --id "$VAULT_CONTRACT_ID" \
  --source "$ADMIN_KEYPAIR" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin "$ADMIN_ADDRESS" \
  --token_contract "$TOKEN_CONTRACT_ID" \
  --reward_amount "$REWARD_AMOUNT" \
  --campaign_name "$CAMPAIGN_NAME"

ok "Vault contract initialized. Reward per claim: ${REWARD_AMOUNT} (stroops)"

# ── Step 7: Fund Vault with tokens ───────────────────────────────────────────
# The vault uses its own balance for rewards, so admin transfers tokens to vault.
log "Admin holds initial token supply. Transferring tokens to Vault..."
stellar contract invoke \
  --id "$TOKEN_CONTRACT_ID" \
  --source "$ADMIN_KEYPAIR" \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- transfer \
  --from "$ADMIN_ADDRESS" \
  --to "$VAULT_CONTRACT_ID" \
  --amount "10000000000"

ok "Vault funded with tokens."

# ── Step 8: Write .env files ─────────────────────────────────────────────────
for ENV_FILE in "frontend/.env.development" "frontend/.env.production"; do
  log "Writing ${ENV_FILE}..."
  cat > "$ENV_FILE" <<EOF
# Auto-generated by deploy.sh — $(date -u '+%Y-%m-%d %H:%M UTC')
NEXT_PUBLIC_STELLAR_NETWORK=${NETWORK}
NEXT_PUBLIC_STELLAR_RPC_URL=${RPC_URL}
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=${NETWORK_PASSPHRASE}
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_TOKEN_CONTRACT_ID=${TOKEN_CONTRACT_ID}
NEXT_PUBLIC_VAULT_CONTRACT_ID=${VAULT_CONTRACT_ID}
NEXT_PUBLIC_APP_NAME="Stellar Reward Vault"
NEXT_PUBLIC_POLL_INTERVAL_MS=8000
EOF
  ok "Written: ${ENV_FILE}"
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  ✓ Deployment Complete${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════${RESET}"
echo -e "  Network          : ${BOLD}${NETWORK}${RESET}"
echo -e "  Admin Address    : ${BOLD}${ADMIN_ADDRESS}${RESET}"
echo -e "  Token Contract   : ${BOLD}${TOKEN_CONTRACT_ID}${RESET}"
echo -e "  Vault Contract   : ${BOLD}${VAULT_CONTRACT_ID}${RESET}"
echo -e "  Reward Amount    : ${BOLD}${REWARD_AMOUNT} stroops${RESET}"
echo -e "  Campaign         : ${BOLD}${CAMPAIGN_NAME}${RESET}"
echo ""
echo -e "  ${CYAN}Next steps:${RESET}"
echo -e "  1. cd frontend && npm run dev"
echo -e "  2. Open http://localhost:3000"
echo -e "  3. Connect Freighter wallet (testnet mode)"
echo -e "  4. Click 'Claim Reward'"
echo -e "${BOLD}═══════════════════════════════════════════════════════════${RESET}"
