#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Map, Vec,
};

// ── External Token Contract Interface (for inter-contract calls) ───────────────

mod token {
    soroban_sdk::contractimport!(file = "../../target/wasm32-unknown-unknown/release/reward_token.wasm");
}

// ── Storage Keys ──────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    RewardAmount,
    Initialized,
    HasClaimed(Address),
    TotalClaims,
    CampaignActive,
    CampaignName,
    // Stores last N claim addresses in order (vec of Address)
    ClaimHistory,
}

// ── Campaign Info Return Type ──────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CampaignInfo {
    pub name: soroban_sdk::String,
    pub admin: Address,
    pub token_contract: Address,
    pub reward_amount: i128,
    pub total_claims: u64,
    pub is_active: bool,
}

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct RewardVault;

#[contractimpl]
impl RewardVault {
    /// Initialize vault (can only be called once).
    pub fn initialize(
        env: Env,
        admin: Address,
        token_contract: Address,
        reward_amount: i128,
        campaign_name: soroban_sdk::String,
    ) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }

        admin.require_auth();

        if reward_amount <= 0 {
            panic!("reward_amount must be positive");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::RewardAmount, &reward_amount);
        env.storage().instance().set(&DataKey::CampaignName, &campaign_name);
        env.storage().instance().set(&DataKey::CampaignActive, &true);
        env.storage().instance().set(&DataKey::TotalClaims, &0u64);
        env.storage().instance().set(&DataKey::Initialized, &true);

        // Initialize empty claim history
        let history: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&DataKey::ClaimHistory, &history);

        env.events().publish(
            (symbol_short!("vault"), symbol_short!("init")),
            (admin, token_contract, reward_amount),
        );
    }

    /// Claim reward. Each wallet can only claim once.
    /// This triggers an inter-contract call to the token contract to transfer tokens.
    pub fn claim(env: Env, user: Address) -> i128 {
        user.require_auth();

        // Ensure initialized
        if !env.storage().instance().has(&DataKey::Initialized) {
            panic!("vault not initialized");
        }

        // Ensure campaign is active
        let is_active: bool = env
            .storage()
            .instance()
            .get(&DataKey::CampaignActive)
            .unwrap_or(false);
        if !is_active {
            panic!("campaign is not active");
        }

        // Prevent double claim
        if Self::has_claimed(env.clone(), user.clone()) {
            panic!("already claimed");
        }

        let reward_amount: i128 = env
            .storage()
            .instance()
            .get(&DataKey::RewardAmount)
            .unwrap();

        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();

        // ── Inter-Contract Call ────────────────────────────────────────────────
        // Call the token contract's transfer function.
        // The vault itself holds the token supply; we move reward_amount to user.
        let vault_addr = env.current_contract_address();
        let token_client = token::Client::new(&env, &token_contract);
        token_client.transfer(&vault_addr, &user, &reward_amount);      
        // ──────────────────────────────────────────────────────────────────────

        // Mark as claimed
        env.storage()
            .persistent()
            .set(&DataKey::HasClaimed(user.clone()), &true);

        // Increment total claims
        let total: u64 = env
            .storage()
            .instance()
            .get(&DataKey::TotalClaims)
            .unwrap_or(0);
        let new_total = total + 1;
        env.storage()
            .instance()
            .set(&DataKey::TotalClaims, &new_total);

        // Append to claim history (keep last 20)
        let mut history: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::ClaimHistory)
            .unwrap_or_else(|| Vec::new(&env));
        history.push_back(user.clone());
        if history.len() > 20 {
            history.remove(0);
        }
        env.storage().instance().set(&DataKey::ClaimHistory, &history);

        // Emit event
        env.events().publish(
            (symbol_short!("claimed"),),
            (user, reward_amount, new_total),
        );

        reward_amount
    }

    /// Admin can pause/resume the campaign.
    pub fn set_campaign_active(env: Env, active: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::CampaignActive, &active);

        env.events().publish(
            (symbol_short!("campaign"),),
            (active,),
        );
    }

    /// Admin can update the reward amount.
    pub fn set_reward_amount(env: Env, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        env.storage().instance().set(&DataKey::RewardAmount, &amount);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    pub fn has_claimed(env: Env, user: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::HasClaimed(user))
            .unwrap_or(false)
    }

    pub fn get_reward_amount(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::RewardAmount)
            .unwrap_or(0)
    }

    pub fn get_total_claims(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::TotalClaims)
            .unwrap_or(0)
    }

    pub fn get_campaign_info(env: Env) -> CampaignInfo {
        CampaignInfo {
            name: env.storage().instance().get(&DataKey::CampaignName).unwrap(),
            admin: env.storage().instance().get(&DataKey::Admin).unwrap(),
            token_contract: env.storage().instance().get(&DataKey::TokenContract).unwrap(),
            reward_amount: env.storage().instance().get(&DataKey::RewardAmount).unwrap_or(0),
            total_claims: env.storage().instance().get(&DataKey::TotalClaims).unwrap_or(0),
            is_active: env.storage().instance().get(&DataKey::CampaignActive).unwrap_or(false),
        }
    }

    pub fn get_claim_history(env: Env) -> Vec<Address> {
        env.storage()
            .instance()
            .get(&DataKey::ClaimHistory)
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_token_contract(env: Env) -> Address {
        env.storage().instance().get(&DataKey::TokenContract).unwrap()
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    // Note: Full integration tests with inter-contract calls require
    // deploying both contracts in the test environment. These unit tests
    // cover vault logic independently.

    fn create_vault(env: &Env) -> (Address, Address, Address, RewardVaultClient) {
        let admin = Address::generate(env);
        let token_contract_addr = Address::generate(env); // mock address for unit tests
        let vault_id = env.register_contract(None, RewardVault);
        let client = RewardVaultClient::new(env, &vault_id);
        (admin, token_contract_addr, vault_id, client)
    }

    #[test]
    fn test_initialize_once() {
        let env = Env::default();
        env.mock_all_auths();
        let (admin, token_addr, _, client) = create_vault(&env);

        client.initialize(
            &admin,
            &token_addr,
            &100_0000000i128,
            &soroban_sdk::String::from_str(&env, "Green Belt Campaign"),
        );

        let info = client.get_campaign_info();
        assert_eq!(info.reward_amount, 100_0000000i128);
        assert_eq!(info.total_claims, 0);
        assert!(info.is_active);
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_initialize() {
        let env = Env::default();
        env.mock_all_auths();
        let (admin, token_addr, _, client) = create_vault(&env);
        client.initialize(
            &admin,
            &token_addr,
            &100_0000000i128,
            &soroban_sdk::String::from_str(&env, "Campaign"),
        );
        client.initialize(
            &admin,
            &token_addr,
            &100_0000000i128,
            &soroban_sdk::String::from_str(&env, "Campaign 2"),
        );
    }

    #[test]
    fn test_has_claimed_default_false() {
        let env = Env::default();
        env.mock_all_auths();
        let (admin, token_addr, _, client) = create_vault(&env);
        client.initialize(
            &admin,
            &token_addr,
            &100_0000000i128,
            &soroban_sdk::String::from_str(&env, "Campaign"),
        );
        let user = Address::generate(&env);
        assert!(!client.has_claimed(&user));
    }

    #[test]
    fn test_set_campaign_active() {
        let env = Env::default();
        env.mock_all_auths();
        let (admin, token_addr, _, client) = create_vault(&env);
        client.initialize(
            &admin,
            &token_addr,
            &100_0000000i128,
            &soroban_sdk::String::from_str(&env, "Campaign"),
        );
        client.set_campaign_active(&false);
        let info = client.get_campaign_info();
        assert!(!info.is_active);
        client.set_campaign_active(&true);
        let info2 = client.get_campaign_info();
        assert!(info2.is_active);
    }

    #[test]
    fn test_get_reward_amount() {
        let env = Env::default();
        env.mock_all_auths();
        let (admin, token_addr, _, client) = create_vault(&env);
        client.initialize(
            &admin,
            &token_addr,
            &250_0000000i128,
            &soroban_sdk::String::from_str(&env, "Campaign"),
        );
        assert_eq!(client.get_reward_amount(), 250_0000000i128);
    }
}
