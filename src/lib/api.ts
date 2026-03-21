const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiEmployee = {
  id: string;
  name: string;
  salaryPerCycle: number;
  active: boolean;
  rfc: string;
};

export type VaultSummary = {
  totalDeposited: number;
  totalDrawn: number;
  totalFeesCollected: number;
  currentCycle: number;
  availableLiquidity: number;
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