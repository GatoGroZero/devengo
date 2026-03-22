const API_URL = "http://10.10.65.39:4000";

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

export async function fetchOnchainVaultSummary(): Promise<OnchainVaultSummary> {
  const response = await fetch(`${API_URL}/onchain/vault/summary`);

  if (!response.ok) {
    throw new Error("No se pudo cargar el vault on-chain");
  }

  return response.json();
}

export async function fetchOnchainBob(): Promise<OnchainEmployee> {
  const response = await fetch(`${API_URL}/onchain/employee/bob`);

  if (!response.ok) {
    throw new Error("No se pudo cargar Bob on-chain");
  }

  return response.json();
}

export async function requestOnchainBobAdvance(amount: number) {
  const response = await fetch(`${API_URL}/onchain/advance/bob`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo solicitar el adelanto");
  }

  return json;
}
