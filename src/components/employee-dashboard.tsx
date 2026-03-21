"use client";

import { useEffect, useState } from "react";
import {
  fetchEmployeeById,
  requestAdvance,
  type ApiEmployee,
} from "@/lib/api";

type Props = {
  employeeId: string;
};

export default function EmployeeDashboard({ employeeId }: Props) {
  const [employee, setEmployee] = useState<ApiEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");

  async function loadEmployee() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchEmployeeById(employeeId);
      setEmployee(data);
    } catch {
      setError("No se pudo cargar el empleado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  async function handleAdvanceRequest() {
    if (!employee) return;

    try {
      setError("");
      setMessage("");

      const numericAmount = Number(amount);

      if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        setError("Ingresa un monto válido.");
        return;
      }

      const result = await requestAdvance({
        employeeId: employee.id,
        requestedAmount: numericAmount,
      });

      setMessage(
        `Adelanto solicitado con éxito. Neto entregado: $${result.netAmount.toLocaleString(
          "es-MX"
        )} MXN. Fee: $${result.feeAmount.toLocaleString("es-MX")} MXN.`
      );

      setAmount("");
      await loadEmployee();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo solicitar el adelanto.";
      setError(message);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-300">Cargando empleado...</p>
        </div>
      </main>
    );
  }

  if (error || !employee) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-300">
            {error || "Empleado no encontrado."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 mb-3">
            Portal empleado
          </p>
          <h1 className="text-3xl md:text-5xl font-bold">
            Solicitar adelanto
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Vista conectada a la API base de Devengo.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-3">
            <p className="text-slate-400 text-sm">Empleado</p>
            <h2 className="text-2xl font-bold mt-2">{employee.name}</h2>
            <p className="mt-3 text-slate-300">
              Salario por ciclo: ${employee.salaryPerCycle.toLocaleString("es-MX")} MXN
            </p>
            <p className="mt-2 text-slate-300">RFC: {employee.rfc}</p>
            <p className="mt-2 text-slate-300">
              Estado: {employee.active ? "Activo" : "Inactivo"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Retirado en ciclo</p>
            <h2 className="text-3xl font-bold mt-2">
              ${employee.drawnThisCycle.toLocaleString("es-MX")} MXN
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Disponible</p>
            <h2 className="text-3xl font-bold mt-2 text-emerald-400">
              ${employee.availableAdvance.toLocaleString("es-MX")} MXN
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Límite visible</p>
            <h2 className="text-3xl font-bold mt-2">50%</h2>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-2xl font-semibold mb-4">Pedir adelanto</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Monto solicitado
              </label>
              <input
                type="number"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Máximo ${employee.availableAdvance}`}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {message}
            </div>
          )}

          <button
            onClick={handleAdvanceRequest}
            className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:opacity-90 transition"
          >
            Solicitar adelanto
          </button>
        </section>
      </div>
    </main>
  );
}