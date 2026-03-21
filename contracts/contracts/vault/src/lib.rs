#![no_std]

use core::cmp::min;
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Employer,
    Token,
    FeeBps,
    MaxAdvancePct,
    CycleLength,
    CycleStart,
    CurrentCycle,
    TotalDeposited,
    TotalDrawn,
    TotalFeesCollected,
    EmployeeAdvanceState(Address),
    Initialized,
}

#[derive(Clone)]
#[contracttype]
pub struct EmployeeAdvanceState {
    pub cycle: u64,
    pub drawn_this_cycle: i128,
}

#[derive(Clone)]
#[contracttype]
pub struct AdvanceResult {
    pub requested_amount: i128,
    pub fee_amount: i128,
    pub net_amount: i128,
    pub employee_drawn_this_cycle: i128,
    pub total_drawn: i128,
    pub current_cycle: u64,
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

        if fee_bps > 10_000 {
            panic!("fee_bps cannot exceed 10000");
        }

        if max_advance_pct == 0 || max_advance_pct > 10_000 {
            panic!("max_advance_pct must be between 1 and 10000");
        }

        if cycle_length == 0 {
            panic!("cycle_length must be greater than zero");
        }

        employer.require_auth();

        env.storage().instance().set(&DataKey::Employer, &employer);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::MaxAdvancePct, &max_advance_pct);
        env.storage().instance().set(&DataKey::CycleLength, &cycle_length);
        env.storage()
            .instance()
            .set(&DataKey::CycleStart, &env.ledger().timestamp());
        env.storage().instance().set(&DataKey::CurrentCycle, &1_u64);
        env.storage().instance().set(&DataKey::TotalDeposited, &0_i128);
        env.storage().instance().set(&DataKey::TotalDrawn, &0_i128);
        env.storage()
            .instance()
            .set(&DataKey::TotalFeesCollected, &0_i128);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    pub fn deposit(env: Env, amount: i128) {
        let employer = Self::get_employer(env.clone());
        employer.require_auth();

        if amount <= 0 {
            panic!("deposit amount must be greater than zero");
        }

        let new_total = Self::get_total_deposited(env.clone()) + amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &new_total);
    }

    pub fn request_advance(
        env: Env,
        employee: Address,
        salary_per_cycle: i128,
        amount: i128,
    ) -> AdvanceResult {
        if salary_per_cycle <= 0 {
            panic!("salary_per_cycle must be greater than zero");
        }

        if amount <= 0 {
            panic!("advance amount must be greater than zero");
        }

        employee.require_auth();

        let available =
            Self::get_available_advance(env.clone(), employee.clone(), salary_per_cycle);

        if amount > available {
            panic!("requested amount exceeds available advance");
        }

        let vault_liquidity = Self::get_available_liquidity(env.clone());

        if amount > vault_liquidity {
            panic!("insufficient vault liquidity");
        }

        let fee_bps = Self::get_fee_bps(env.clone()) as i128;
        let fee_amount = (amount * fee_bps) / 10_000;
        let net_amount = amount - fee_amount;

        let current_cycle = Self::get_current_cycle(env.clone());
        let current_drawn = Self::get_employee_drawn(env.clone(), employee.clone());
        let new_employee_drawn = current_drawn + amount;
        let new_total_drawn = Self::get_total_drawn(env.clone()) + amount;
        let new_total_fees = Self::get_total_fees_collected(env.clone()) + fee_amount;

        let employee_state_key = DataKey::EmployeeAdvanceState(employee);
        let employee_state = EmployeeAdvanceState {
            cycle: current_cycle,
            drawn_this_cycle: new_employee_drawn,
        };

        env.storage()
            .persistent()
            .set(&employee_state_key, &employee_state);
        env.storage().instance().set(&DataKey::TotalDrawn, &new_total_drawn);
        env.storage()
            .instance()
            .set(&DataKey::TotalFeesCollected, &new_total_fees);

        AdvanceResult {
            requested_amount: amount,
            fee_amount,
            net_amount,
            employee_drawn_this_cycle: new_employee_drawn,
            total_drawn: new_total_drawn,
            current_cycle,
        }
    }

    pub fn settle_cycle(env: Env) {
        let employer = Self::get_employer(env.clone());
        employer.require_auth();

        let current_cycle = Self::get_current_cycle(env.clone());
        let next_cycle = current_cycle + 1;

        env.storage()
            .instance()
            .set(&DataKey::CurrentCycle, &next_cycle);
        env.storage()
            .instance()
            .set(&DataKey::CycleStart, &env.ledger().timestamp());
    }

    pub fn get_available_advance(
        env: Env,
        employee: Address,
        salary_per_cycle: i128,
    ) -> i128 {
        if salary_per_cycle <= 0 {
            return 0;
        }

        let cycle_length = Self::get_cycle_length(env.clone());
        let cycle_start = Self::get_cycle_start(env.clone());
        let now = env.ledger().timestamp();

        let elapsed = min(now.saturating_sub(cycle_start), cycle_length);

        let accrued = (salary_per_cycle * elapsed as i128) / cycle_length as i128;
        let max_advance_bps = Self::get_max_advance_pct(env.clone()) as i128;
        let capped_advance = (accrued * max_advance_bps) / 10_000;
        let drawn = Self::get_employee_drawn(env, employee);

        let available = capped_advance - drawn;

        if available > 0 {
            available
        } else {
            0
        }
    }

    pub fn get_available_liquidity(env: Env) -> i128 {
        let available = Self::get_total_deposited(env.clone()) - Self::get_total_drawn(env);

        if available > 0 {
            available
        } else {
            0
        }
    }

    pub fn get_employee_drawn(env: Env, employee: Address) -> i128 {
        let key = DataKey::EmployeeAdvanceState(employee);
        let state: Option<EmployeeAdvanceState> = env.storage().persistent().get(&key);
        let current_cycle = Self::get_current_cycle(env);

        match state {
            Some(record) if record.cycle == current_cycle => record.drawn_this_cycle,
            _ => 0,
        }
    }

    pub fn get_current_cycle(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::CurrentCycle).unwrap()
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

    pub fn get_cycle_start(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::CycleStart).unwrap()
    }

    pub fn get_total_deposited(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .unwrap_or(0_i128)
    }

    pub fn get_total_drawn(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalDrawn).unwrap_or(0_i128)
    }

    pub fn get_total_fees_collected(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalFeesCollected)
            .unwrap_or(0_i128)
    }

    pub fn is_initialized(env: Env) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::Initialized)
            .unwrap_or(false)
    }
}