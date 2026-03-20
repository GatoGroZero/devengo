"use client";

import { useMemo, useState } from "react";
import { Employee, calculateAccrued, formatCurrency } from "@/lib/payroll";

type Props = {
  employee: Employee;
};

export default function EmployeeDashboard({ employee }: Props) {
  const [withdrawn, setWithdrawn] = useState(employee.withdrawn);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(employee.paymentMethod);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const accrued = useMemo(() => {
    return calculateAccrued(employee);
  }, [employee]);

  const available = useMemo(() => {
    const maxWithdrawable = accrued * employee.maxWithdrawPercent;
    return Math.max(0, Math.round(maxWithdrawable - withdrawn));
  }, [accrued, employee.maxWithdrawPercent, withdrawn]);

  function handleWithdraw() {
    setMessage("");
    setError("");

    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount)) {
      setError("Ingresa un monto válido.");
      return;
    }

    if (numericAmount <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }

    if (numericAmount > available) {
      setError("No puedes retirar más de lo disponible.");
      return;
    }

    setWithdrawn((prev) => prev + numericAmount);
    setAmount("");
    setMessage(
      `Retiro simulado exitoso por ${formatCurrency(
        numericAmount
      )} vía ${paymentMethod}.`
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
            Tu saldo ya ganado
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Consulta cuánto has devengado, cuánto puedes retirar hoy y el saldo
            restante para tu próximo corte de pago.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-8">
          <p className="text-slate-400 text-sm">Empleado demo</p>
          <h2 className="text-2xl font-bold mt-2">{employee.name}</h2>
          <p className="mt-3 text-slate-300">
            Salario diario: {formatCurrency(employee.dailySalary)} · Días
            trabajados: {employee.workedDays} · Límite de retiro:{" "}
            {employee.maxWithdrawPercent * 100}%
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Devengado total</p>
            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(accrued)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Disponible para retiro</p>
            <h2 className="text-3xl font-bold mt-2 text-emerald-400">
              {formatCurrency(available)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Ya retirado</p>
            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(withdrawn)}
            </h2>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-2xl font-semibold mb-4">Solicitar retiro</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Monto a retirar
              </label>
              <input
                type="number"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Máximo ${available}`}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Método
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as "Wallet Devengo" | "Cuenta bancaria"
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              >
                <option>Wallet Devengo</option>
                <option>Cuenta bancaria</option>
              </select>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            Puedes retirar hasta {formatCurrency(available)} en este momento,
            según tu salario devengado y las reglas definidas por tu empresa.
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
            onClick={handleWithdraw}
            className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:opacity-90 transition"
          >
            Retirar ahora
          </button>
        </section>
      </div>
    </main>
  );
}