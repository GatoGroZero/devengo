import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({
  logger: true,
});

const employees = [
  {
    id: "emp-001",
    name: "Luis Hernández",
    salaryPerCycle: 9000,
    active: true,
    rfc: "LUIS900101ABC",
  },
  {
    id: "emp-002",
    name: "Ana Martínez",
    salaryPerCycle: 10000,
    active: true,
    rfc: "ANAM920202DEF",
  },
];

const vaultSummary = {
  totalDeposited: 50000,
  totalDrawn: 12000,
  totalFeesCollected: 240,
  currentCycle: 1,
  availableLiquidity: 38000,
};

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
    return {
      data: employees,
      total: employees.length,
    };
  });

  app.get("/vault/summary", async () => {
    return vaultSummary;
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