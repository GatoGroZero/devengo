"use client";

import { useEffect, useState } from "react";
import { fetchEmployeeById, type ApiEmployee } from "@/lib/api";

type Props = {
  employeeId: string;
};

export default function EmployeeDashboard({ employeeId }: Props) {
  const [employee, setEmployee] = useState<ApiEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    loadEmployee();
  }, [employeeId]);

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
            Estado del empleado
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Vista conectada a la API base de Devengo.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-400 text-sm">Empleado</p>
          <h2 className="text-2xl font-bold mt-2">{employee.name}</h2>
          <p className="mt-3 text-slate-300">
            Salario por ciclo: ${employee.salaryPerCycle.toLocaleString("es-MX")} MXN
          </p>
          <p className="mt-2 text-slate-300">RFC: {employee.rfc}</p>
          <p className="mt-2 text-slate-300">
            Estado: {employee.active ? "Activo" : "Inactivo"}
          </p>
        </section>
      </div>
    </main>
  );
}