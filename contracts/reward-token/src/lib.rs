#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol,
};

// ── Storage Keys ──────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    Balance(Address),
    TotalSupply,
    Name,
    Symbol,
    Decimals,
    Initialized,
}

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct RewardToken;

#[contractimpl]
impl RewardToken {
    /// Initialize the token with name, symbol, decimals, and initial supply minted to admin.
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        decimals: u32,
        initial_supply: i128,
    ) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::TotalSupply, &initial_supply);
        env.storage().instance().set(&DataKey::Initialized, &true);

        // Mint initial supply to admin
        env.storage()
            .persistent()
            .set(&DataKey::Balance(admin.clone()), &initial_supply);

        env.events().publish(
            (symbol_short!("INIT"), symbol_short!("token")),
            (admin, initial_supply),
        );
    }

    /// Transfer tokens from `from` to `to`.
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("insufficient balance");
        }

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));

        env.events().publish(
            (symbol_short!("transfer"),),
            (from, to, amount),
        );
    }

    /// Transfer on behalf of another address (used by vault via inter-contract call).
    /// The vault must be approved first, OR the caller is the admin (vault calling itself as approved spender).
    /// For simplicity in this design: admin (vault) can transfer from any account if they are the admin.
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();

        // Only admin (vault contract) is authorized as a spender
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if spender != admin {
            panic!("unauthorized spender");
        }

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("insufficient balance: vault has {} needs {}", from_balance, amount);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));

        env.events().publish(
            (symbol_short!("xfer_frm"),),
            (spender, from, to, amount),
        );
    }

    /// Mint additional tokens to an address (admin only).
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(balance + amount));

        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total + amount));

        env.events().publish(
            (symbol_short!("mint"),),
            (to, amount),
        );
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    pub fn balance(env: Env, address: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(address))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap_or(7)
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, Address, RewardTokenClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, RewardToken);
        let client = RewardTokenClient::new(&env, &contract_id);
        client.initialize(
            &admin,
            &String::from_str(&env, "Stellar Reward Token"),
            &String::from_str(&env, "SRT"),
            &7,
            &1_000_000_0000000i128,
        );
        (env, admin, client)
    }

    #[test]
    fn test_initialize() {
        let (env, admin, client) = setup();
        assert_eq!(client.total_supply(), 1_000_000_0000000i128);
        assert_eq!(client.balance(&admin), 1_000_000_0000000i128);
        assert_eq!(client.decimals(), 7);
    }

    #[test]
    fn test_transfer() {
        let (env, admin, client) = setup();
        let user = Address::generate(&env);
        client.transfer(&admin, &user, &1_000_0000000i128);
        assert_eq!(client.balance(&user), 1_000_0000000i128);
        assert_eq!(
            client.balance(&admin),
            1_000_000_0000000i128 - 1_000_0000000i128
        );
    }

    #[test]
    #[should_panic(expected = "insufficient balance")]
    fn test_transfer_insufficient() {
        let (env, admin, client) = setup();
        let user = Address::generate(&env);
        // Try to transfer more than admin has
        client.transfer(&user, &admin, &1_000_0000000i128);
    }

    #[test]
    fn test_mint() {
        let (env, admin, client) = setup();
        let user = Address::generate(&env);
        client.mint(&user, &500_0000000i128);
        assert_eq!(client.balance(&user), 500_0000000i128);
        assert_eq!(
            client.total_supply(),
            1_000_000_0000000i128 + 500_0000000i128
        );
    }
}
