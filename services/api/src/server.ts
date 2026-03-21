import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";

const app = Fastify({
  logger: true,
});

type Employee = {
  id: string;
  name: string;
  salaryPerCycle: number;
  active: boolean;
  rfc: string;
  drawnThisCycle: number;
};

const initialEmployees: Employee[] = [
  {
    id: "emp-001",
    name: "Luis Hernández",
    salaryPerCycle: 9000,
    active: true,
    rfc: "LUIS900101ABC",
    drawnThisCycle: 1200,
  },
  {
    id: "emp-002",
    name: "Ana Martínez",
    salaryPerCycle: 10000,
    active: true,
    rfc: "ANAM920202DEF",
    drawnThisCycle: 800,
  },
];

let employees: Employee[] = structuredClone(initialEmployees);

let vaultSummary = {
  totalDeposited: 50000,
  totalDrawn: 2000,
  totalFeesCollected: 40,
  currentCycle: 1,
  availableLiquidity: 48000,
  feeBps: 200,
  maxAdvancePctBps: 5000,
};

const requestAdvanceSchema = z.object({
  employeeId: z.string().min(1),
  requestedAmount: z.number().int().positive(),
});

function getEmployeeAvailableAdvance(employee: Employee) {
  const accrued = employee.salaryPerCycle;
  const cappedAdvance =
    Math.floor((accrued * vaultSummary.maxAdvancePctBps) / 10000);

  const available = cappedAdvance - employee.drawnThisCycle;
  return Math.max(0, available);
}

function recalculateVaultLiquidity() {
  vaultSummary.availableLiquidity =
    vaultSummary.totalDeposited - vaultSummary.totalDrawn;
}

async function main() {
  await app.register(cors, {
    origin: true,
  });

  app.get("/health", async () => {
    return {
      ok: true,
      service: "devengo-api",
    };
  });

  app.get("/config", async () => {
    return {
      app: "Devengo",
      network: "testnet",
      blockchainEnabled: false,
    };
  });

  app.get("/employees", async () => {
    const data = employees.map((employee) => ({
      ...employee,
      availableAdvance: getEmployeeAvailableAdvance(employee),
    }));

    return {
      data,
      total: data.length,
    };
  });

  app.get("/employees/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const employee = employees.find((item) => item.id === id);

    if (!employee) {
      return reply.status(404).send({
        message: "Empleado no encontrado",
      });
    }

    return {
      ...employee,
      availableAdvance: getEmployeeAvailableAdvance(employee),
    };
  });

  app.get("/vault/summary", async () => {
    return vaultSummary;
  });

  app.post("/advances/request", async (request, reply) => {
    const parsed = requestAdvanceSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Payload inválido",
        issues: parsed.error.flatten(),
      });
    }

    const { employeeId, requestedAmount } = parsed.data;

    const employee = employees.find((item) => item.id === employeeId);

    if (!employee) {
      return reply.status(404).send({
        message: "Empleado no encontrado",
      });
    }

    if (!employee.active) {
      return reply.status(400).send({
        message: "El empleado está inactivo",
      });
    }

    const availableAdvance = getEmployeeAvailableAdvance(employee);

    if (requestedAmount > availableAdvance) {
      return reply.status(400).send({
        message: "El monto solicitado excede el adelanto disponible",
        availableAdvance,
      });
    }

    if (requestedAmount > vaultSummary.availableLiquidity) {
      return reply.status(400).send({
        message: "La vault no tiene liquidez suficiente",
        availableLiquidity: vaultSummary.availableLiquidity,
      });
    }

    const feeAmount = Math.floor(
      (requestedAmount * vaultSummary.feeBps) / 10000
    );

    const netAmount = requestedAmount - feeAmount;

    employee.drawnThisCycle += requestedAmount;
    vaultSummary.totalDrawn += requestedAmount;
    vaultSummary.totalFeesCollected += feeAmount;
    recalculateVaultLiquidity();

    return {
      ok: true,
      employeeId,
      requestedAmount,
      feeAmount,
      netAmount,
      newDrawnThisCycle: employee.drawnThisCycle,
      availableAdvance: getEmployeeAvailableAdvance(employee),
      vaultSummary,
    };
  });

  app.post("/vault/settle-cycle", async () => {
    vaultSummary.currentCycle += 1;

    employees = employees.map((employee) => ({
      ...employee,
      drawnThisCycle: 0,
    }));

    return {
      ok: true,
      message: "Ciclo liquidado correctamente",
      currentCycle: vaultSummary.currentCycle,
    };
  });

  app.post("/demo/reset", async () => {
    employees = structuredClone(initialEmployees);
    vaultSummary = {
      totalDeposited: 50000,
      totalDrawn: 2000,
      totalFeesCollected: 40,
      currentCycle: 1,
      availableLiquidity: 48000,
      feeBps: 200,
      maxAdvancePctBps: 5000,
    };

    return {
      ok: true,
      message: "Demo restablecida",
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