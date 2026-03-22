const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type OnchainVaultSummary = {
  totalDeposited: number;
  totalDrawn: number;
  totalFeesCollected: number;
  currentCycle: number;
  availableLiquidity: number;
  feeBps: number;
  maxAdvancePctBps: number;
};

export type OnchainEmployee = {
  id: string;
  alias: string;
  address: string;
  label: string;
  salaryPerCycle: number;
  active: boolean;
  drawnThisCycle: number;
  totalFeesPaid: number;
  rfc: string;
  availableAdvance: number;
};

export type OnchainAdvanceResponse = {
  ok: boolean;
  request: {
    currentCycle: number;
    employeeDrawnThisCycle: number;
    feeAmount: number;
    netAmount: number;
    requestedAmount: number;
    totalDrawn: number;
  };
  employee: OnchainEmployee;
};

export async function fetchOnchainVaultSummary(): Promise<OnchainVaultSummary> {
  const response = await fetch(`${API_URL}/onchain/vault/summary`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el resumen on-chain del vault");
  }

  return response.json();
}

export async function fetchOnchainBob(): Promise<OnchainEmployee> {
  const response = await fetch(`${API_URL}/onchain/employee/bob`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el empleado on-chain");
  }

  return response.json();
}

export async function requestOnchainBobAdvance(
  amount: number
): Promise<OnchainAdvanceResponse> {
  const response = await fetch(`${API_URL}/onchain/advance/bob`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo solicitar el adelanto on-chain");
  }

  return json;
}

export async function settleOnchainCycle() {
  const response = await fetch(`${API_URL}/onchain/vault/settle-cycle`, {
    method: "POST",
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo liquidar el ciclo on-chain");
  }

  return json;
}
