import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const CONTRACTS_DIR = "/home/luis/devengo/contracts";
const NETWORK = "testnet";
const ADMIN_ALIAS = "alice";
const VAULT_ID = "devengo_vault";
const REGISTRY_ID = "devengo_registry";

function stripCliNoise(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("ℹ️") &&
        !line.startsWith("🌎") &&
        !line.startsWith("✅") &&
        !line.startsWith("🔗")
    );
}

function parseCliValue(raw: string) {
  const lines = stripCliNoise(raw);
  const last = lines[lines.length - 1] ?? "";

  try {
    return JSON.parse(last);
  } catch {
    return last.replace(/^"|"$/g, "");
  }
}

async function invokeContract(input: {
  contractId: string;
  sourceAlias: string;
  method: string;
  args?: string[];
}) {
  const args = [
    "contract",
    "invoke",
    "--id",
    input.contractId,
    "--source-account",
    input.sourceAlias,
    "--network",
    NETWORK,
    "--",
    input.method,
    ...(input.args ?? []),
  ];

  const { stdout, stderr } = await execFileAsync("stellar", args, {
    cwd: CONTRACTS_DIR,
    maxBuffer: 1024 * 1024,
  });

  return parseCliValue(`${stdout}\n${stderr}`);
}

export async function getOnchainVaultSummary() {
  const [
    totalDeposited,
    totalDrawn,
    totalFeesCollected,
    currentCycle,
    availableLiquidity,
  ] = await Promise.all([
    invokeContract({
      contractId: VAULT_ID,
      sourceAlias: ADMIN_ALIAS,
      method: "get_total_deposited",
    }),
    invokeContract({
      contractId: VAULT_ID,
      sourceAlias: ADMIN_ALIAS,
      method: "get_total_drawn",
    }),
    invokeContract({
      contractId: VAULT_ID,
      sourceAlias: ADMIN_ALIAS,
      method: "get_total_fees_collected",
    }),
    invokeContract({
      contractId: VAULT_ID,
      sourceAlias: ADMIN_ALIAS,
      method: "get_current_cycle",
    }),
    invokeContract({
      contractId: VAULT_ID,
      sourceAlias: ADMIN_ALIAS,
      method: "get_available_liquidity",
    }),
  ]);

  return {
    totalDeposited: Number(totalDeposited),
    totalDrawn: Number(totalDrawn),
    totalFeesCollected: Number(totalFeesCollected),
    currentCycle: Number(currentCycle),
    availableLiquidity: Number(availableLiquidity),
    feeBps: 200,
    maxAdvancePctBps: 5000,
  };
}

export async function getOnchainEmployee(input: {
  employeeAddress: string;
  sourceAlias?: string;
  salaryPerCycle: number;
}) {
  const [registryEmployee, availableAdvance, drawnThisCycle] = await Promise.all([
    invokeContract({
      contractId: REGISTRY_ID,
      sourceAlias: ADMIN_ALIAS,
      method: "get_employee",
      args: ["--employee", input.employeeAddress],
    }),
    invokeContract({
      contractId: VAULT_ID,
      sourceAlias: input.sourceAlias ?? ADMIN_ALIAS,
      method: "get_available_advance",
      args: [
        "--employee",
        input.employeeAddress,
        "--salary_per_cycle",
        String(input.salaryPerCycle),
      ],
    }),
    invokeContract({
      contractId: VAULT_ID,
      sourceAlias: ADMIN_ALIAS,
      method: "get_employee_drawn",
      args: ["--employee", input.employeeAddress],
    }),
  ]);

  return {
    ...registryEmployee,
    drawn_this_cycle: Number(drawnThisCycle),
    availableAdvance: Number(availableAdvance),
  };
}

export async function requestOnchainAdvance(input: {
  employeeAddress: string;
  sourceAlias: string;
  salaryPerCycle: number;
  amount: number;
}) {
  const result = await invokeContract({
    contractId: VAULT_ID,
    sourceAlias: input.sourceAlias,
    method: "request_advance",
    args: [
      "--employee",
      input.employeeAddress,
      "--salary_per_cycle",
      String(input.salaryPerCycle),
      "--amount",
      String(input.amount),
    ],
  });

  return {
    currentCycle: Number(result.current_cycle),
    employeeDrawnThisCycle: Number(result.employee_drawn_this_cycle),
    feeAmount: Number(result.fee_amount),
    netAmount: Number(result.net_amount),
    requestedAmount: Number(result.requested_amount),
    totalDrawn: Number(result.total_drawn),
  };
}

export async function settleOnchainCycle() {
  await invokeContract({
    contractId: VAULT_ID,
    sourceAlias: ADMIN_ALIAS,
    method: "settle_cycle",
  });

  return getOnchainVaultSummary();
}
