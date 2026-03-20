#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Employer,
    Token,
    FeeBps,
    MaxAdvancePct,
    CycleLength,
    Initialized,
}

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn init(
        env: Env,
        employer: Address,
        token: Address,
        fee_bps: u32,
        max_advance_pct: u32,
        cycle_length: u64,
    ) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("vault already initialized");
        }

        employer.require_auth();

        env.storage().instance().set(&DataKey::Employer, &employer);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::MaxAdvancePct, &max_advance_pct);
        env.storage().instance().set(&DataKey::CycleLength, &cycle_length);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    pub fn get_employer(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Employer).unwrap()
    }

    pub fn get_token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).unwrap()
    }

    pub fn get_fee_bps(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::FeeBps).unwrap()
    }

    pub fn get_max_advance_pct(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::MaxAdvancePct).unwrap()
    }

    pub fn get_cycle_length(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::CycleLength).unwrap()
    }

    pub fn is_initialized(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Initialized).unwrap_or(false)
    }
}