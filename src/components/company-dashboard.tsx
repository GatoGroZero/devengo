"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Employee,
  calculateAccrued,
  calculateAvailable,
  formatCurrency,
} from "@/lib/payroll";
import {
  addEmployee,
  loadEmployees,
  resetEmployees,
} from "@/lib/payroll-storage";

type FormState = {
  name: string;
  dailySalary: string;
  workedDays: string;
  maxWithdrawPercent: string;
  paymentMethod: "Wallet Devengo" | "Cuenta bancaria";
};

const initialForm: FormState = {
  name: "",
  dailySalary: "",
  workedDays: "",
  maxWithdrawPercent: "50",
  paymentMethod: "Wallet Devengo",
};

export default function CompanyDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmployees(loadEmployees());
  }, []);

  const stats = useMemo(() => {
    const activeEmployees = employees.filter(
      (employee) => employee.status === "Activo"
    ).length;

    const totalAccruedToday = employees.reduce(
      (total, employee) => total + calculateAccrued(employee),
      0
    );

    const pendingWithdrawals = employees.filter(
      (employee) => calculateAvailable(employee) > 0
    ).length;

    return {
      activeEmployees,
      totalAccruedToday,
      pendingWithdrawals,
    };
  }, [employees]);

  function handleResetDemo() {
    const initialEmployees = resetEmployees();
    setEmployees(initialEmployees);
    setMessage("Demo restablecida correctamente.");
    setError("");
    setShowForm(false);
    setForm(initialForm);
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAddEmployee() {
    setMessage("");
    setError("");

    const name = form.name.trim();
    const dailySalary = Number(form.dailySalary);
    const workedDays = Number(form.workedDays);
    const maxWithdrawPercent = Number(form.maxWithdrawPercent);

    if (!name) {
      setError("Ingresa el nombre del empleado.");
      return;
    }

    if (!Number.isFinite(dailySalary) || dailySalary <= 0) {
      setError("Ingresa un salario diario válido.");
      return;
    }

    if (!Number.isFinite(workedDays) || workedDays < 0) {
      setError("Ingresa días trabajados válidos.");
      return;
    }

    if (
      !Number.isFinite(maxWithdrawPercent) ||
      maxWithdrawPercent <= 0 ||
      maxWithdrawPercent > 100
    ) {
      setError("El porcentaje de retiro debe estar entre 1 y 100.");
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name,
      dailySalary: Math.round(dailySalary),
      workedDays: Math.round(workedDays),
      withdrawn: 0,
      maxWithdrawPercent: maxWithdrawPercent / 100,
      status: "Activo",
      paymentMethod: form.paymentMethod,
    };

    const nextEmployees = addEmployee(newEmployee);
    setEmployees(nextEmployees);
    setForm(initialForm);
    setShowForm(false);
    setMessage(`Empleado agregado: ${newEmployee.name}.`);
    setError("");
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
            <h2 className="text-3xl font-bold mt-2">{stats.activeEmployees}</h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Saldo devengado hoy</p>
            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(stats.totalAccruedToday)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Retiros pendientes</p>
            <h2 className="text-3xl font-bold mt-2">
              {stats.pendingWithdrawals}
            </h2>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <h3 className="text-2xl font-semibold">Empleados</h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setShowForm((prev) => !prev);
                  setMessage("");
                  setError("");
                }}
                className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:opacity-90 transition"
              >
                {showForm ? "Cerrar formulario" : "Agregar empleado"}
              </button>

              <button
                onClick={handleResetDemo}
                className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition"
              >
                Restablecer demo
              </button>
            </div>
          </div>

          {showForm && (
            <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <h4 className="text-xl font-semibold mb-4">Nuevo empleado</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Ej. Daniela Cruz"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Salario diario
                  </label>
                  <input
                    type="number"
                    value={form.dailySalary}
                    onChange={(e) => handleChange("dailySalary", e.target.value)}
                    placeholder="Ej. 550"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Días trabajados
                  </label>
                  <input
                    type="number"
                    value={form.workedDays}
                    onChange={(e) => handleChange("workedDays", e.target.value)}
                    placeholder="Ej. 2"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    % máximo retirable
                  </label>
                  <input
                    type="number"
                    value={form.maxWithdrawPercent}
                    onChange={(e) =>
                      handleChange("maxWithdrawPercent", e.target.value)
                    }
                    placeholder="Ej. 50"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-300 mb-2">
                    Método de pago
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      handleChange(
                        "paymentMethod",
                        e.target.value as "Wallet Devengo" | "Cuenta bancaria"
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-emerald-400"
                  >
                    <option>Wallet Devengo</option>
                    <option>Cuenta bancaria</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleAddEmployee}
                  className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:opacity-90 transition"
                >
                  Guardar empleado
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {message}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Salario diario</th>
                  <th className="py-3">Días trabajados</th>
                  <th className="py-3">Devengado</th>
                  <th className="py-3">Retirado</th>
                  <th className="py-3">Disponible</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Portal</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => {
                  const accrued = calculateAccrued(employee);
                  const available = calculateAvailable(employee);

                  return (
                    <tr key={employee.id} className="border-b border-slate-800">
                      <td className="py-4">{employee.name}</td>
                      <td className="py-4">
                        {formatCurrency(employee.dailySalary)}
                      </td>
                      <td className="py-4">{employee.workedDays}</td>
                      <td className="py-4">{formatCurrency(accrued)}</td>
                      <td className="py-4">
                        {formatCurrency(employee.withdrawn)}
                      </td>
                      <td className="py-4 text-emerald-400">
                        {formatCurrency(available)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            employee.status === "Activo"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/empleado/${employee.id}`}
                          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}