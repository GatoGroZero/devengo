"use client";

import { useEffect, useState } from "react";
import {
  fetchEmployees,
  fetchVaultSummary,
  type ApiEmployee,
  type VaultSummary,
} from "@/lib/api";

export default function CompanyDashboard() {
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [vaultSummary, setVaultSummary] = useState<VaultSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

        <section className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Empleados activos</p>
            <h2 className="text-3xl font-bold mt-2">
              {employees.filter((employee) => employee.active).length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Total depositado</p>
            <h2 className="text-3xl font-bold mt-2">
              ${vaultSummary.totalDeposited.toLocaleString("es-MX")} MXN
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
          <div className="mb-6">
            <h3 className="text-2xl font-semibold">Empleados</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Salario por ciclo</th>
                  <th className="py-3">RFC</th>
                  <th className="py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-slate-800">
                    <td className="py-4">{employee.name}</td>
                    <td className="py-4">
                      ${employee.salaryPerCycle.toLocaleString("es-MX")} MXN
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