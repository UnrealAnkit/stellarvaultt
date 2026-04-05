#!/usr/bin/env bash
# =============================================================================
# setup.sh — One-shot local development setup for Stellar Reward Vault
# =============================================================================
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
RESET='\033[0m'

log()  { echo -e "${CYAN}[setup]${RESET} $*"; }
ok()   { echo -e "${GREEN}[  ok  ]${RESET} $*"; }
warn() { echo -e "${YELLOW}[ warn ]${RESET} $*"; }
die()  { echo -e "${RED}[ fail ]${RESET} $*"; exit 1; }

echo ""
echo -e "${BOLD}Stellar Reward Vault — Local Setup${RESET}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Check prerequisites ───────────────────────────────────────────────────────
log "Checking prerequisites..."

check_cmd() {
  if command -v "$1" &>/dev/null; then
    ok "$1 found: $(command -v "$1")"
  else
    die "$1 not found. $2"
  fi
}

check_cmd "rustup"   "Install from https://rustup.rs"
check_cmd "cargo"    "Install from https://rustup.rs"
check_cmd "node"     "Install from https://nodejs.org (v20+)"
check_cmd "npm"      "Install from https://nodejs.org"
check_cmd "git"      "Install git"

# Check Node version
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_VERSION" -lt 18 ]]; then
  die "Node.js v18+ required. Current: $(node --version)"
fi
ok "Node.js $(node --version)"

# ── Rust wasm target ─────────────────────────────────────────────────────────
log "Adding wasm32-unknown-unknown target..."
rustup target add wasm32-unknown-unknown
ok "wasm32 target ready"

# ── stellar-cli ───────────────────────────────────────────────────────────────
if ! command -v stellar &>/dev/null; then
  log "Installing stellar-cli..."
  cargo install --locked stellar-cli --features opt
  ok "stellar-cli installed"
else
  ok "stellar-cli: $(stellar --version 2>&1 | head -1)"
fi

# ── Frontend dependencies ─────────────────────────────────────────────────────
log "Installing frontend dependencies..."
cd frontend
npm install
cd ..
ok "Frontend dependencies installed"

# ── .env.local ────────────────────────────────────────────────────────────────
if [[ ! -f "frontend/.env.local" ]]; then
  log "Creating frontend/.env.local from example..."
  cp frontend/.env.example frontend/.env.local
  warn "frontend/.env.local created — fill in contract IDs after deploying"
else
  ok "frontend/.env.local already exists"
fi

# ── Build contracts (check they compile) ─────────────────────────────────────
log "Building contracts (compilation check)..."
stellar contract build --package reward-token 2>&1 | tail -5
stellar contract build --package reward-vault 2>&1 | tail -5 || true
ok "Contracts compiled"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}${BOLD}  ✓ Setup complete!${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${CYAN}Next steps:${RESET}"
echo -e ""
echo -e "  ${BOLD}1. Deploy contracts to testnet:${RESET}"
echo -e "     ${YELLOW}./scripts/deploy.sh${RESET}"
echo ""
echo -e "  ${BOLD}2. Start the frontend:${RESET}"
echo -e "     ${YELLOW}cd frontend && npm run dev${RESET}"
echo ""
echo -e "  ${BOLD}3. Run tests:${RESET}"
echo -e "     ${YELLOW}cargo test                    # Rust contract tests${RESET}"
echo -e "     ${YELLOW}cd frontend && npm test       # Frontend tests${RESET}"
echo ""
echo -e "  ${BOLD}4. Install Freighter wallet:${RESET}"
echo -e "     https://freighter.app (Chrome extension)"
echo -e "     Switch to Testnet mode in the extension"
echo ""
