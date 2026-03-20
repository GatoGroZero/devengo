#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Employer,
    Vault,
    CycleLength,
    Initialized,
    Employee(Address),
}

#[derive(Clone)]
#[contracttype]
pub struct EmployeeRecord {
    pub employee: Address,
    pub salary_per_cycle: i128,
    pub drawn_this_cycle: i128,
    pub total_fees_paid: i128,
    pub active: bool,
    pub rfc: String,
}

#[contract]
pub struct RegistryContract;

#[contractimpl]
impl RegistryContract {
    pub fn init(env: Env, employer: Address, vault: Address, cycle_length: u64) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("registry already initialized");
        }

        employer.require_auth();

        env.storage().instance().set(&DataKey::Employer, &employer);
        env.storage().instance().set(&DataKey::Vault, &vault);
        env.storage().instance().set(&DataKey::CycleLength, &cycle_length);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    pub fn register_employee(
        env: Env,
        employee: Address,
        salary_per_cycle: i128,
        rfc: String,
    ) {
        let employer: Address = env.storage().instance().get(&DataKey::Employer).unwrap();
        employer.require_auth();

        if salary_per_cycle <= 0 {
            panic!("salary must be greater than zero");
        }

        let key = DataKey::Employee(employee.clone());

        if env.storage().persistent().has(&key) {
            panic!("employee already registered");
        }

        let record = EmployeeRecord {
            employee,
            salary_per_cycle,
            drawn_this_cycle: 0,
            total_fees_paid: 0,
            active: true,
            rfc,
        };

        env.storage().persistent().set(&key, &record);
    }

    pub fn update_salary(env: Env, employee: Address, salary_per_cycle: i128) {
        let employer: Address = env.storage().instance().get(&DataKey::Employer).unwrap();
        employer.require_auth();

        if salary_per_cycle <= 0 {
            panic!("salary must be greater than zero");
        }

        let key = DataKey::Employee(employee.clone());
        let mut record: EmployeeRecord = env.storage().persistent().get(&key).unwrap();

        record.salary_per_cycle = salary_per_cycle;

        env.storage().persistent().set(&key, &record);
    }

    pub fn deactivate_employee(env: Env, employee: Address) {
        let employer: Address = env.storage().instance().get(&DataKey::Employer).unwrap();
        employer.require_auth();

        let key = DataKey::Employee(employee.clone());
        let mut record: EmployeeRecord = env.storage().persistent().get(&key).unwrap();

        record.active = false;

        env.storage().persistent().set(&key, &record);
    }

    pub fn get_employee(env: Env, employee: Address) -> EmployeeRecord {
        let key = DataKey::Employee(employee);
        env.storage().persistent().get(&key).unwrap()
    }

    pub fn get_employer(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Employer).unwrap()
    }

    pub fn get_vault(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Vault).unwrap()
    }

    pub fn get_cycle_length(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::CycleLength).unwrap()
    }

    pub fn is_initialized(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Initialized).unwrap_or(false)
    }
}