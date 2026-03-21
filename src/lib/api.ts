const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiEmployee = {
  id: string;
  name: string;
  salaryPerCycle: number;
  active: boolean;
  rfc: string;
  drawnThisCycle: number;
  availableAdvance: number;
};

export type VaultSummary = {
  totalDeposited: number;
  totalDrawn: number;
  totalFeesCollected: number;
  currentCycle: number;
  availableLiquidity: number;
  feeBps: number;
  maxAdvancePctBps: number;
};

export type AdvanceResponse = {
  ok: boolean;
  employeeId: string;
  requestedAmount: number;
  feeAmount: number;
  netAmount: number;
  newDrawnThisCycle: number;
  availableAdvance: number;
  vaultSummary: VaultSummary;
};

export async function fetchEmployees(): Promise<ApiEmployee[]> {
  const response = await fetch(`${API_URL}/employees`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los empleados");
  }

  const json = await response.json();
  return json.data;
}

export async function fetchEmployeeById(id: string): Promise<ApiEmployee> {
  const response = await fetch(`${API_URL}/employees/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el empleado");
  }

  return response.json();
}

export async function fetchVaultSummary(): Promise<VaultSummary> {
  const response = await fetch(`${API_URL}/vault/summary`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el resumen del vault");
  }

  return response.json();
}

export async function requestAdvance(input: {
  employeeId: string;
  requestedAmount: number;
}): Promise<AdvanceResponse> {
  const response = await fetch(`${API_URL}/advances/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo solicitar el adelanto");
  }

  return json;
}

export async function settleCycle() {
  const response = await fetch(`${API_URL}/vault/settle-cycle`, {
    method: "POST",
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo liquidar el ciclo");
  }

  return json;
}

export async function resetDemo() {
  const response = await fetch(`${API_URL}/demo/reset`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("No se pudo restablecer la demo");
  }

  return response.json();
}