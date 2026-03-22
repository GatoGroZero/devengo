const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type CompanyPolicy = {
  minimumTenureYears: number;
  maxRequestsPerCycle: number;
  reviewMode: string;
  tenureRules: Array<{
    minYears: number;
    maxYears: number | null;
    percent: number;
  }>;
};

export type CompanyEmployee = {
  id: string;
  name: string;
  role: string;
  branch: string;
  hireDate: string;
  tenureYears: number;
  salaryPerCycle: number;
  active: boolean;
  rfc: string;
  eligibilityPercent: number;
  eligible: boolean;
  eligibilityReason: string;
  drawnThisCycle: number;
  availableToday: number;
  nextPayDate: string;
  requestsLastFive: Array<{
    id: string;
    status: "Pendiente" | "Aprobada" | "Rechazada";
    requestedAmount: number;
    createdAt: string;
  }>;
  requestsCount: number;
  onchain: boolean;
  alias: string | null;
  address: string | null;
};

export type CompanyRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  tenureYears: number;
  requestedAmount: number;
  availableAtRequest: number;
  reason: string;
  status: "Pendiente" | "Aprobada" | "Rechazada";
  createdAt: string;
  cycleNumber: number;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  execution?: {
    feeAmount: number;
    netAmount: number;
    totalDrawn: number;
  };
};

export type CompanyDashboardResponse = {
  company: {
    name: string;
    segment: string;
    country: string;
  };
  policies: CompanyPolicy;
  summary: {
    currentCycle: number;
    nextPayDate: string;
    fundAvailable: number;
    totalAdvanced: number;
    totalFees: number;
    pendingRequests: number;
    eligibleEmployees: number;
  };
  employees: CompanyEmployee[];
  requests: CompanyRequest[];
};

export type EmployeeAppResponse = {
  employee: CompanyEmployee;
  requests: CompanyRequest[];
  notifications: Array<{
    id: string;
    employeeId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>;
};

export async function fetchCompanyDashboard(): Promise<CompanyDashboardResponse> {
  const response = await fetch(`${API_URL}/app/company/dashboard`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el dashboard de empresa.");
  }

  return response.json();
}

export async function fetchEmployeeAppBob(): Promise<EmployeeAppResponse> {
  const response = await fetch(`${API_URL}/app/employee/bob`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar la app del empleado.");
  }

  return response.json();
}

export async function createEmployeeRequest(input: {
  requestedAmount: number;
  reason: string;
}) {
  const response = await fetch(`${API_URL}/app/employee/bob/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo enviar la solicitud.");
  }

  return json;
}
export async function createCompanyEmployee(input: {
  name: string;
  role: string;
  branch: string;
  hireDate: string;
  salaryPerCycle: number;
  rfc: string;
}) {
  const response = await fetch(`${API_URL}/app/company/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo agregar el empleado.");
  }

  return json;
}

export async function approveCompanyRequest(requestId: string) {
  const response = await fetch(`${API_URL}/app/company/requests/${requestId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reviewedBy: "Laura RH" }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo aprobar la solicitud.");
  }

  return json;
}

export async function rejectCompanyRequest(input: {
  requestId: string;
  rejectionReason: string;
}) {
  const response = await fetch(`${API_URL}/app/company/requests/${input.requestId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reviewedBy: "Laura RH",
      rejectionReason: input.rejectionReason,
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo rechazar la solicitud.");
  }

  return json;
}

export async function settleCompanyCycle() {
  const response = await fetch(`${API_URL}/app/company/settle-cycle`, {
    method: "POST",
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "No se pudo cerrar la quincena.");
  }

  return json;
}