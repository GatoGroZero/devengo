import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import {
  getOnchainEmployee,
  getOnchainVaultSummary,
  requestOnchainAdvance,
  settleOnchainCycle,
} from "./lib/stellar-cli";

const app = Fastify({
  logger: true,
});

type EmployeeBase = {
  id: string;
  name: string;
  role: string;
  branch: string;
  hireDate: string;
  tenureYears: number;
  salaryPerCycle: number;
  active: boolean;
  rfc: string;
  onchainAlias?: string;
  onchainAddress?: string;
  mockDrawnThisCycle?: number;
  mockAccruedProgress?: number;
};

type AdvanceRequestStatus = "Pendiente" | "Aprobada" | "Rechazada";

type AdvanceRequestRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  tenureYears: number;
  requestedAmount: number;
  availableAtRequest: number;
  reason: string;
  status: AdvanceRequestStatus;
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

type NotificationRecord = {
  id: string;
  employeeId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const companyPolicies = {
  minimumTenureYears: 1,
  maxRequestsPerCycle: 3,
  reviewMode: "Manual por RH",
  tenureRules: [
    { minYears: 1, maxYears: 1, percent: 20 },
    { minYears: 2, maxYears: 3, percent: 30 },
    { minYears: 4, maxYears: 4, percent: 40 },
    { minYears: 5, maxYears: null, percent: 50 },
  ],
};

const employeeDirectory: EmployeeBase[] = [
  {
    id: "emp-001",
    name: "Luis Hernández",
    role: "Operador de almacén",
    branch: "Cuernavaca",
    hireDate: "2019-02-14",
    tenureYears: 5,
    salaryPerCycle: 900000,
    active: true,
    rfc: "BOB900101ABC",
    onchainAlias: "bob",
    onchainAddress: "GAK55PIJ7L77EKQWPLERXQTSWCUS2NDB6LT6PAVM52BZU2QI3LNUZL2C",
  },
  {
    id: "emp-002",
    name: "Ana Martínez",
    role: "Cajera",
    branch: "CDMX Norte",
    hireDate: "2024-01-10",
    tenureYears: 1,
    salaryPerCycle: 12000,
    active: true,
    rfc: "ANAM920202DEF",
    mockDrawnThisCycle: 300,
    mockAccruedProgress: 0.42,
  },
  {
    id: "emp-003",
    name: "Carlos Rivera",
    role: "Supervisor",
    branch: "Puebla Centro",
    hireDate: "2022-06-01",
    tenureYears: 2,
    salaryPerCycle: 18000,
    active: true,
    rfc: "CARR930303GHI",
    mockDrawnThisCycle: 700,
    mockAccruedProgress: 0.48,
  },
  {
    id: "emp-004",
    name: "Mariana Soto",
    role: "Analista de operaciones",
    branch: "Querétaro",
    hireDate: "2020-03-20",
    tenureYears: 4,
    salaryPerCycle: 22000,
    active: true,
    rfc: "MASO940404JKL",
    mockDrawnThisCycle: 1200,
    mockAccruedProgress: 0.51,
  },
  {
    id: "emp-005",
    name: "Diego Pérez",
    role: "Auxiliar de almacén",
    branch: "Toluca",
    hireDate: "2025-04-01",
    tenureYears: 0,
    salaryPerCycle: 10000,
    active: true,
    rfc: "DIPE950505MNO",
    mockDrawnThisCycle: 0,
    mockAccruedProgress: 0.35,
  },
];

let advanceRequests: AdvanceRequestRecord[] = [
  {
    id: "REQ-0001",
    employeeId: "emp-001",
    employeeName: "Luis Hernández",
    role: "Operador de almacén",
    tenureYears: 5,
    requestedAmount: 500,
    availableAtRequest: 596,
    reason: "Medicinas y consulta familiar",
    status: "Aprobada",
    createdAt: "2026-03-20T09:10:00.000Z",
    reviewedAt: "2026-03-20T09:15:00.000Z",
    reviewedBy: "Laura RH",
    cycleNumber: 1,
    execution: {
      feeAmount: 10,
      netAmount: 490,
      totalDrawn: 500,
    },
  },
  {
    id: "REQ-0002",
    employeeId: "emp-001",
    employeeName: "Luis Hernández",
    role: "Operador de almacén",
    tenureYears: 5,
    requestedAmount: 100,
    availableAtRequest: 1188,
    reason: "Transporte de la semana",
    status: "Aprobada",
    createdAt: "2026-03-20T12:30:00.000Z",
    reviewedAt: "2026-03-20T12:35:00.000Z",
    reviewedBy: "Laura RH",
    cycleNumber: 1,
    execution: {
      feeAmount: 2,
      netAmount: 98,
      totalDrawn: 600,
    },
  },
  {
    id: "REQ-0003",
    employeeId: "emp-002",
    employeeName: "Ana Martínez",
    role: "Cajera",
    tenureYears: 1,
    requestedAmount: 1500,
    availableAtRequest: 1008,
    reason: "Pago urgente de servicios",
    status: "Rechazada",
    createdAt: "2026-03-20T15:00:00.000Z",
    reviewedAt: "2026-03-20T15:08:00.000Z",
    reviewedBy: "Laura RH",
    rejectionReason: "El monto solicitado excedía lo disponible por política.",
    cycleNumber: 1,
  },
];

let notifications: NotificationRecord[] = [
  {
    id: "NTF-0001",
    employeeId: "emp-001",
    title: "Solicitud aprobada",
    message: "Tu adelanto de $500 fue aprobado y enviado.",
    read: false,
    createdAt: "2026-03-20T09:16:00.000Z",
  },
  {
    id: "NTF-0002",
    employeeId: "emp-001",
    title: "Solicitud aprobada",
    message: "Tu adelanto de $100 fue aprobado y enviado.",
    read: false,
    createdAt: "2026-03-20T12:36:00.000Z",
  },
];

const createEmployeeRequestSchema = z.object({
  requestedAmount: z.number().int().positive(),
  reason: z.string().min(8).max(160),
});

const reviewRequestSchema = z.object({
  reviewedBy: z.string().min(2).default("Laura RH"),
});

const rejectRequestSchema = z.object({
  reviewedBy: z.string().min(2).default("Laura RH"),
  rejectionReason: z.string().min(5).max(160),
});

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

function getNextPayDate(cycleNumber: number) {
  const baseDate = new Date("2026-03-31T09:00:00.000Z");
  const nextPayDate = new Date(baseDate);
  nextPayDate.setUTCDate(baseDate.getUTCDate() + (cycleNumber - 1) * 14);
  return nextPayDate.toISOString();
}

function getEligibilityPercent(tenureYears: number) {
  if (tenureYears < 1) return 0;
  if (tenureYears < 2) return 20;
  if (tenureYears < 4) return 30;
  if (tenureYears < 5) return 40;
  return 50;
}

function getEligibilityReason(tenureYears: number, active: boolean) {
  if (!active) return "Empleado inactivo";
  if (tenureYears < 1) return "Disponible a partir del primer año";
  return "Elegible por política de antigüedad";
}

function calculatePolicyAvailableFromOnchain(
  onchainAvailableAt50Pct: number,
  drawnThisCycle: number,
  eligibilityPercent: number
) {
  if (eligibilityPercent <= 0) return 0;

  const factor = eligibilityPercent / 50;
  const available = Math.floor(
    (onchainAvailableAt50Pct + drawnThisCycle) * factor - drawnThisCycle
  );

  return Math.max(0, available);
}

function calculateMockAvailable(
  salaryPerCycle: number,
  eligibilityPercent: number,
  drawnThisCycle: number,
  accruedProgress = 0.45
) {
  if (eligibilityPercent <= 0) return 0;

  const accrued = salaryPerCycle * accruedProgress;
  const capped = accrued * (eligibilityPercent / 100);
  const available = Math.floor(capped - drawnThisCycle);

  return Math.max(0, available);
}

function getEmployeeBaseById(employeeId: string) {
  return employeeDirectory.find((employee) => employee.id === employeeId);
}

function getRecentRequestsByEmployee(employeeId: string, limit = 5) {
  return advanceRequests
    .filter((request) => request.employeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function getNotificationsByEmployee(employeeId: string, limit = 5) {
  return notifications
    .filter((notification) => notification.employeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function addNotification(employeeId: string, title: string, message: string) {
  notifications.unshift({
    id: createId("NTF"),
    employeeId,
    title,
    message,
    read: false,
    createdAt: nowIso(),
  });
}

async function buildEmployeeView(base: EmployeeBase, currentCycle: number) {
  const eligibilityPercent = getEligibilityPercent(base.tenureYears);
  const eligible = base.active && eligibilityPercent > 0;
  const eligibilityReason = getEligibilityReason(base.tenureYears, base.active);
  const recentRequests = getRecentRequestsByEmployee(base.id, 5);
  const nextPayDate = getNextPayDate(currentCycle);

  if (base.onchainAlias && base.onchainAddress) {
    const onchainEmployee = await getOnchainEmployee({
      employeeAddress: base.onchainAddress,
      sourceAlias: base.onchainAlias,
      salaryPerCycle: base.salaryPerCycle,
    });

    const drawnThisCycle = Number(onchainEmployee.drawn_this_cycle);
    const availableToday = calculatePolicyAvailableFromOnchain(
      Number(onchainEmployee.availableAdvance),
      drawnThisCycle,
      eligibilityPercent
    );

    return {
      id: base.id,
      name: base.name,
      role: base.role,
      branch: base.branch,
      hireDate: base.hireDate,
      tenureYears: base.tenureYears,
      salaryPerCycle: base.salaryPerCycle,
      active: base.active,
      rfc: base.rfc,
      eligibilityPercent,
      eligible,
      eligibilityReason,
      drawnThisCycle,
      availableToday,
      nextPayDate,
      requestsLastFive: recentRequests.map((request) => ({
        id: request.id,
        status: request.status,
        requestedAmount: request.requestedAmount,
        createdAt: request.createdAt,
      })),
      requestsCount: recentRequests.length,
      onchain: true,
      alias: base.onchainAlias,
      address: base.onchainAddress,
    };
  }

  const drawnThisCycle = base.mockDrawnThisCycle ?? 0;
  const availableToday = calculateMockAvailable(
    base.salaryPerCycle,
    eligibilityPercent,
    drawnThisCycle,
    base.mockAccruedProgress ?? 0.45
  );

  return {
    id: base.id,
    name: base.name,
    role: base.role,
    branch: base.branch,
    hireDate: base.hireDate,
    tenureYears: base.tenureYears,
    salaryPerCycle: base.salaryPerCycle,
    active: base.active,
    rfc: base.rfc,
    eligibilityPercent,
    eligible,
    eligibilityReason,
    drawnThisCycle,
    availableToday,
    nextPayDate,
    requestsLastFive: recentRequests.map((request) => ({
      id: request.id,
      status: request.status,
      requestedAmount: request.requestedAmount,
      createdAt: request.createdAt,
    })),
    requestsCount: recentRequests.length,
    onchain: false,
    alias: null,
    address: null,
  };
}

async function buildCompanyDashboard() {
  const vault = await getOnchainVaultSummary();
  const currentCycle = vault.currentCycle;
  const employees = await Promise.all(
    employeeDirectory.map((employee) => buildEmployeeView(employee, currentCycle))
  );

  const pendingRequests = advanceRequests.filter(
    (request) => request.status === "Pendiente"
  ).length;

  const eligibleEmployees = employees.filter((employee) => employee.eligible).length;

  return {
    company: {
      name: "PayStream Demo",
      segment: "PyME / RRHH",
      country: "México",
    },
    policies: companyPolicies,
    summary: {
      currentCycle: vault.currentCycle,
      nextPayDate: getNextPayDate(vault.currentCycle),
      fundAvailable: vault.availableLiquidity,
      totalAdvanced: vault.totalDrawn,
      totalFees: vault.totalFeesCollected,
      pendingRequests,
      eligibleEmployees,
    },
    employees,
    requests: advanceRequests
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((request) => ({
        ...request,
      })),
  };
}

async function main() {
  await app.register(cors, {
    origin: true,
  });

  app.get("/health", async () => {
    return {
      ok: true,
      service: "paystream-api",
    };
  });

  app.get("/onchain/vault/summary", async () => {
    return getOnchainVaultSummary();
  });

  app.get("/onchain/employee/bob", async () => {
    const bob = employeeDirectory[0];
    const vault = await getOnchainVaultSummary();
    const employee = await buildEmployeeView(bob, vault.currentCycle);

    return {
      id: employee.id,
      alias: bob.onchainAlias,
      address: bob.onchainAddress,
      label: employee.name,
      salaryPerCycle: employee.salaryPerCycle,
      active: employee.active,
      drawnThisCycle: employee.drawnThisCycle,
      totalFeesPaid: 0,
      rfc: employee.rfc,
      availableAdvance: employee.availableToday,
      nextPayDate: employee.nextPayDate,
    };
  });

  app.post("/onchain/advance/bob", async (request, reply) => {
    const parsed = z
      .object({
        amount: z.number().int().positive(),
      })
      .safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Payload inválido",
      });
    }

    const bob = employeeDirectory[0];

    const result = await requestOnchainAdvance({
      employeeAddress: bob.onchainAddress!,
      sourceAlias: bob.onchainAlias!,
      salaryPerCycle: bob.salaryPerCycle,
      amount: parsed.data.amount,
    });

    return {
      ok: true,
      request: result,
    };
  });

  app.post("/onchain/vault/settle-cycle", async () => {
    const vault = await settleOnchainCycle();

    return {
      ok: true,
      message: "Ciclo liquidado on-chain correctamente",
      vault,
      nextPayDate: getNextPayDate(vault.currentCycle),
    };
  });

  app.get("/app/company/dashboard", async () => {
    return buildCompanyDashboard();
  });

  app.get("/app/employee/bob", async () => {
    const bob = employeeDirectory[0];
    const vault = await getOnchainVaultSummary();
    const employee = await buildEmployeeView(bob, vault.currentCycle);

    return {
      employee,
      requests: getRecentRequestsByEmployee(bob.id, 5),
      notifications: getNotificationsByEmployee(bob.id, 5),
    };
  });

  app.post("/app/employee/bob/request", async (request, reply) => {
    const parsed = createEmployeeRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "La solicitud no es válida.",
        issues: parsed.error.flatten(),
      });
    }

    const bob = employeeDirectory[0];
    const vault = await getOnchainVaultSummary();
    const employee = await buildEmployeeView(bob, vault.currentCycle);
    const approvedThisCycle = advanceRequests.filter(
      (item) =>
        item.employeeId === bob.id &&
        item.cycleNumber === vault.currentCycle &&
        item.status === "Aprobada"
    ).length;
    const pendingRequest = advanceRequests.find(
      (item) => item.employeeId === bob.id && item.status === "Pendiente"
    );

    if (!employee.eligible) {
      return reply.status(400).send({
        message: employee.eligibilityReason,
      });
    }

    if (pendingRequest) {
      return reply.status(400).send({
        message: "Ya tienes una solicitud pendiente de revisión.",
      });
    }

    if (approvedThisCycle >= companyPolicies.maxRequestsPerCycle) {
      return reply.status(400).send({
        message: "Ya alcanzaste el máximo de solicitudes aprobadas por ciclo.",
      });
    }

    if (parsed.data.requestedAmount > employee.availableToday) {
      return reply.status(400).send({
        message: "El monto solicitado excede tu disponible de hoy.",
      });
    }

    const createdAt = nowIso();

    const newRequest: AdvanceRequestRecord = {
      id: createId("REQ"),
      employeeId: bob.id,
      employeeName: bob.name,
      role: bob.role,
      tenureYears: bob.tenureYears,
      requestedAmount: parsed.data.requestedAmount,
      availableAtRequest: employee.availableToday,
      reason: parsed.data.reason,
      status: "Pendiente",
      createdAt,
      cycleNumber: vault.currentCycle,
    };

    advanceRequests.unshift(newRequest);

    addNotification(
      bob.id,
      "Solicitud enviada",
      "Tu solicitud fue enviada a RH y está pendiente de revisión."
    );

    return {
      ok: true,
      message: "Solicitud enviada correctamente.",
      request: newRequest,
      employee,
    };
  });

  app.post("/app/company/requests/:id/approve", async (request, reply) => {
    const params = request.params as { id: string };
    const parsed = reviewRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Payload inválido",
      });
    }

    const targetRequest = advanceRequests.find((item) => item.id === params.id);

    if (!targetRequest) {
      return reply.status(404).send({
        message: "Solicitud no encontrada.",
      });
    }

    if (targetRequest.status !== "Pendiente") {
      return reply.status(400).send({
        message: "Solo se pueden aprobar solicitudes pendientes.",
      });
    }

    const employeeBase = getEmployeeBaseById(targetRequest.employeeId);

    if (!employeeBase || !employeeBase.onchainAlias || !employeeBase.onchainAddress) {
      return reply.status(400).send({
        message: "Este empleado no está conectado a la red demo.",
      });
    }

    const currentVault = await getOnchainVaultSummary();
    const employee = await buildEmployeeView(employeeBase, currentVault.currentCycle);

    if (targetRequest.requestedAmount > employee.availableToday) {
      return reply.status(400).send({
        message: "La solicitud ya no cumple el monto disponible actual.",
      });
    }

    const execution = await requestOnchainAdvance({
      employeeAddress: employeeBase.onchainAddress,
      sourceAlias: employeeBase.onchainAlias,
      salaryPerCycle: employeeBase.salaryPerCycle,
      amount: targetRequest.requestedAmount,
    });

    targetRequest.status = "Aprobada";
    targetRequest.reviewedAt = nowIso();
    targetRequest.reviewedBy = parsed.data.reviewedBy;
    targetRequest.execution = {
      feeAmount: execution.feeAmount,
      netAmount: execution.netAmount,
      totalDrawn: execution.totalDrawn,
    };

    addNotification(
      targetRequest.employeeId,
      "Solicitud aprobada",
      `Tu adelanto por $${targetRequest.requestedAmount.toLocaleString(
        "es-MX"
      )} fue aprobado.`
    );

    const updatedEmployee = await buildEmployeeView(
      employeeBase,
      execution.currentCycle
    );
    const dashboard = await buildCompanyDashboard();

    return {
      ok: true,
      message: "Solicitud aprobada y adelanto enviado.",
      request: targetRequest,
      employee: updatedEmployee,
      dashboard,
    };
  });

  app.post("/app/company/requests/:id/reject", async (request, reply) => {
    const params = request.params as { id: string };
    const parsed = rejectRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Payload inválido",
        issues: parsed.error.flatten(),
      });
    }

    const targetRequest = advanceRequests.find((item) => item.id === params.id);

    if (!targetRequest) {
      return reply.status(404).send({
        message: "Solicitud no encontrada.",
      });
    }

    if (targetRequest.status !== "Pendiente") {
      return reply.status(400).send({
        message: "Solo se pueden rechazar solicitudes pendientes.",
      });
    }

    targetRequest.status = "Rechazada";
    targetRequest.reviewedAt = nowIso();
    targetRequest.reviewedBy = parsed.data.reviewedBy;
    targetRequest.rejectionReason = parsed.data.rejectionReason;

    addNotification(
      targetRequest.employeeId,
      "Solicitud rechazada",
      parsed.data.rejectionReason
    );

    const dashboard = await buildCompanyDashboard();

    return {
      ok: true,
      message: "Solicitud rechazada correctamente.",
      request: targetRequest,
      dashboard,
    };
  });

  app.post("/app/company/settle-cycle", async () => {
    const currentVault = await getOnchainVaultSummary();
    const pendingThisCycle = advanceRequests.filter(
      (item) =>
        item.status === "Pendiente" &&
        item.cycleNumber === currentVault.currentCycle
    );

    for (const request of pendingThisCycle) {
      request.status = "Rechazada";
      request.reviewedAt = nowIso();
      request.reviewedBy = "Sistema";
      request.rejectionReason = "La quincena fue cerrada antes de autorizar la solicitud.";

      addNotification(
        request.employeeId,
        "Solicitud cerrada",
        "Tu solicitud fue cerrada porque RH terminó la quincena."
      );
    }

    const vault = await settleOnchainCycle();

    addNotification(
      "emp-001",
      "Nueva quincena iniciada",
      "Tu disponible de hoy se recalculó para un nuevo ciclo."
    );

    return {
      ok: true,
      message: "Quincena cerrada correctamente.",
      vault,
      nextPayDate: getNextPayDate(vault.currentCycle),
    };
  });

  try {
    await app.listen({
      port: 4000,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();