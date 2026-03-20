"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Employee,
  calculateAccrued,
  calculateAvailable,
  formatCurrency,
} from "@/lib/payroll";
import { loadEmployees, resetEmployees } from "@/lib/payroll-storage";

export default function CompanyDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);

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

            <div className="flex gap-3">
              <button className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:opacity-90 transition">
                Agregar empleado
              </button>

              <button
                onClick={handleResetDemo}
                className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition"
              >
                Restablecer demo
              </button>
            </div>
          </div>

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