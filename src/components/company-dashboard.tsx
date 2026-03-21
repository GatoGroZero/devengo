"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchEmployees,
  fetchVaultSummary,
  resetDemo,
  settleCycle,
  type ApiEmployee,
  type VaultSummary,
} from "@/lib/api";

export default function CompanyDashboard() {
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [vaultSummary, setVaultSummary] = useState<VaultSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const [employeesData, vaultData] = await Promise.all([
        fetchEmployees(),
        fetchVaultSummary(),
      ]);

      setEmployees(employeesData);
      setVaultSummary(vaultData);
    } catch {
      setError("No se pudo cargar la información desde la API.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function handleResetDemo() {
    try {
      setMessage("");
      setError("");
      await resetDemo();
      await loadData(false);
      setMessage("Demo restablecida correctamente.");
    } catch {
      setError("No se pudo restablecer la demo.");
    }
  }

  async function handleSettleCycle() {
    try {
      setMessage("");
      setError("");
      await settleCycle();
      await loadData(false);
      setMessage("Ciclo liquidado correctamente.");
    } catch {
      setError("No se pudo liquidar el ciclo.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-300">Cargando dashboard...</p>
        </div>
      </main>
    );
  }

  if (error || !vaultSummary) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-red-300">
            {error || "No se pudo cargar el dashboard."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 mb-3">
            Panel empresa
          </p>
          <h1 className="text-3xl md:text-5xl font-bold">
            Control de nómina flexible
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Administra empleados, revisa saldo devengado y controla retiros
            parciales antes del corte de pago.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-5 mb-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Empleados activos</p>
            <h2 className="text-3xl font-bold mt-2">
              {employees.filter((employee) => employee.active).length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Ciclo actual</p>
            <h2 className="text-3xl font-bold mt-2">
              #{vaultSummary.currentCycle}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Total depositado</p>
            <h2 className="text-3xl font-bold mt-2">
              ${vaultSummary.totalDeposited.toLocaleString("es-MX")} MXN
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Total adelantado</p>
            <h2 className="text-3xl font-bold mt-2">
              ${vaultSummary.totalDrawn.toLocaleString("es-MX")} MXN
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Liquidez disponible</p>
            <h2 className="text-3xl font-bold mt-2 text-emerald-400">
              ${vaultSummary.availableLiquidity.toLocaleString("es-MX")} MXN
            </h2>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h3 className="text-2xl font-semibold">Empleados</h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSettleCycle}
                className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:opacity-90 transition"
              >
                Liquidar ciclo
              </button>

              <button
                onClick={handleResetDemo}
                className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition"
              >
                Restablecer demo
              </button>
            </div>
          </div>

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Salario por ciclo</th>
                  <th className="py-3">Retirado en ciclo</th>
                  <th className="py-3">Disponible</th>
                  <th className="py-3">RFC</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Portal</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-slate-800">
                    <td className="py-4">{employee.name}</td>
                    <td className="py-4">
                      ${employee.salaryPerCycle.toLocaleString("es-MX")} MXN
                    </td>
                    <td className="py-4">
                      ${employee.drawnThisCycle.toLocaleString("es-MX")} MXN
                    </td>
                    <td className="py-4 text-emerald-400">
                      ${employee.availableAdvance.toLocaleString("es-MX")} MXN
                    </td>
                    <td className="py-4">{employee.rfc}</td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          employee.active
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {employee.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/empleado/${employee.id}`}
                        className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}