"use client";

import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/top-nav";
import {
  approveCompanyRequest,
  createCompanyEmployee,
  fetchCompanyDashboard,
  rejectCompanyRequest,
  settleCompanyCycle,
  type CompanyDashboardResponse,
  type CompanyEmployee,
  type CompanyRequest,
} from "@/lib/api";

function money(value: number) {
  return `$${value.toLocaleString("es-MX")}`;
}

function dateShort(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function payDate(value: string) {
  return new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function requestStatusClass(status: CompanyRequest["status"]) {
  if (status === "Aprobada") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "Rechazada") {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-300";
}

function employeeStatusClass(employee: CompanyEmployee) {
  return employee.eligible
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    : "border-slate-700 bg-slate-800 text-slate-200";
}

function employeeStatusText(employee: CompanyEmployee) {
  return employee.eligible ? "Elegible" : employee.eligibilityReason;
}

export default function CompanyDashboard() {
  const [dashboard, setDashboard] = useState<CompanyDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    role: "",
    branch: "",
    hireDate: "",
    salaryPerCycle: "",
    rfc: "",
  });

  async function loadData(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const data = await fetchCompanyDashboard();
      setDashboard(data);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo cargar el portal de empresa.";
      setError(msg);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const branches = useMemo(() => {
    if (!dashboard) return [];
    return Array.from(new Set(dashboard.employees.map((employee) => employee.branch)));
  }, [dashboard]);

  const filteredEmployees = useMemo(() => {
    if (!dashboard) return [];

    return dashboard.employees.filter((employee) => {
      const q = search.toLowerCase().trim();

      const matchesSearch =
        employee.name.toLowerCase().includes(q) ||
        employee.role.toLowerCase().includes(q) ||
        employee.rfc.toLowerCase().includes(q);

      const matchesBranch =
        branchFilter === "Todas" || employee.branch === branchFilter;

      const matchesStatus =
        statusFilter === "Todas" ||
        (statusFilter === "Elegibles" && employee.eligible) ||
        (statusFilter === "No elegibles" && !employee.eligible);

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [dashboard, search, branchFilter, statusFilter]);

  const pendingRequests = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.requests.filter((request) => request.status === "Pendiente");
  }, [dashboard]);

  async function handleApprove(requestId: string) {
    try {
      setError("");
      setMessage("");
      setSelectedRequestId(requestId);

      await approveCompanyRequest(requestId);
      await loadData(false);

      setMessage("Solicitud aprobada y adelanto enviado correctamente.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo aprobar la solicitud.";
      setError(msg);
    } finally {
      setSelectedRequestId(null);
    }
  }

  async function handleReject(requestId: string) {
    if (!rejectionReason.trim()) {
      setError("Escribe el motivo del rechazo.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await rejectCompanyRequest({
        requestId,
        rejectionReason,
      });

      await loadData(false);

      setRejectingId(null);
      setRejectionReason("");
      setMessage("Solicitud rechazada correctamente.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo rechazar la solicitud.";
      setError(msg);
    }
  }

  async function handleCreateEmployee() {
    try {
      setError("");
      setMessage("");
      setCreatingEmployee(true);

      if (
        !employeeForm.name.trim() ||
        !employeeForm.role.trim() ||
        !employeeForm.branch.trim() ||
        !employeeForm.hireDate.trim() ||
        !employeeForm.salaryPerCycle.trim() ||
        !employeeForm.rfc.trim()
      ) {
        setError("Completa todos los campos del empleado.");
        return;
      }

      const salary = Number(employeeForm.salaryPerCycle);

      if (Number.isNaN(salary) || salary <= 0) {
        setError("El salario por ciclo debe ser válido.");
        return;
      }

      await createCompanyEmployee({
        name: employeeForm.name.trim(),
        role: employeeForm.role.trim(),
        branch: employeeForm.branch.trim(),
        hireDate: employeeForm.hireDate,
        salaryPerCycle: salary,
        rfc: employeeForm.rfc.trim().toUpperCase(),
      });

      setEmployeeForm({
        name: "",
        role: "",
        branch: "",
        hireDate: "",
        salaryPerCycle: "",
        rfc: "",
      });

      await loadData(false);
      setMessage("Empleado agregado correctamente.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo agregar el empleado.";
      setError(msg);
    } finally {
      setCreatingEmployee(false);
    }
  }

  async function handleSettleCycle() {
    try {
      setError("");
      setMessage("");

      await settleCompanyCycle();
      await loadData(false);

      setMessage("Ciclo de pago finalizado correctamente.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo cerrar el ciclo de pago.";
      setError(msg);
    }
  }

  if (loading) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
          <div className="mx-auto max-w-7xl">
            <p className="text-slate-300">Cargando portal de empresa...</p>
          </div>
        </main>
      </>
    );
  }

  if (error && !dashboard) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
          <div className="mx-auto max-w-7xl">
            <p className="text-red-300">{error}</p>
          </div>
        </main>
      </>
    );
  }

  if (!dashboard) return null;

  return (
    <>
      <TopNav />

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-[32px] border border-emerald-500/15 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-2xl shadow-black/30">
            <div className="absolute -right-12 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-green-400/5 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-300">
                  Portal empresa
                </div>

                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                  PayStream
                </h1>

                <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
                  Control de solicitudes, elegibilidad y ciclos de pago.
                </p>
              </div>

              <button
                onClick={handleSettleCycle}
                className="rounded-2xl bg-emerald-500 px-6 py-4 text-base font-semibold text-slate-950 transition hover:scale-[1.01] hover:opacity-90"
              >
                Cerrar ciclo de pago
              </button>
            </div>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Ciclo actual</p>
              <h2 className="mt-3 text-3xl font-bold">#{dashboard.summary.currentCycle}</h2>
              <p className="mt-2 text-sm text-slate-500">Seguimiento activo</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Próximo pago</p>
              <h2 className="mt-3 text-2xl font-bold text-emerald-300">
                {payDate(dashboard.summary.nextPayDate)}
              </h2>
              <p className="mt-2 text-sm text-slate-500">Fecha estimada</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Fondo disponible</p>
              <h2 className="mt-3 text-3xl font-bold text-emerald-400">
                {money(dashboard.summary.fundAvailable)}
              </h2>
              <p className="mt-2 text-sm text-slate-500">Liquidez para adelantos</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Total adelantado</p>
              <h2 className="mt-3 text-3xl font-bold">
                {money(dashboard.summary.totalAdvanced)}
              </h2>
              <p className="mt-2 text-sm text-slate-500">Monto liberado</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Costo del programa</p>
              <h2 className="mt-3 text-3xl font-bold">
                {money(dashboard.summary.totalFees)}
              </h2>
              <p className="mt-2 text-sm text-slate-500">Fees acumulados</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">Pendientes por revisar</p>
              <h2 className="mt-3 text-3xl font-bold text-amber-300">
                {dashboard.summary.pendingRequests}
              </h2>
              <p className="mt-2 text-sm text-slate-500">Solicitudes activas</p>
            </div>
          </section>

          {message && (
            <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5">
              <h3 className="text-2xl font-semibold">Alta rápida de empleado</h3>
              <p className="mt-2 text-slate-300">
                RH puede registrar empleados nuevos y ver su elegibilidad al instante.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <input
                value={employeeForm.name}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nombre completo"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />

              <input
                value={employeeForm.role}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({ ...prev, role: e.target.value }))
                }
                placeholder="Puesto"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />

              <input
                value={employeeForm.branch}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({ ...prev, branch: e.target.value }))
                }
                placeholder="Sucursal"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />

              <input
                type="date"
                value={employeeForm.hireDate}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({ ...prev, hireDate: e.target.value }))
                }
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />

              <input
                type="number"
                value={employeeForm.salaryPerCycle}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    salaryPerCycle: e.target.value,
                  }))
                }
                placeholder="Salario por ciclo"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />

              <input
                value={employeeForm.rfc}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({ ...prev, rfc: e.target.value }))
                }
                placeholder="RFC"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white uppercase outline-none focus:border-emerald-400"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCreateEmployee}
                disabled={creatingEmployee}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
              >
                {creatingEmployee ? "Agregando..." : "Agregar empleado"}
              </button>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Solicitudes por revisar</h3>
                <p className="mt-2 text-slate-300">
                  Autoriza o rechaza cada solicitud con base en antigüedad, monto y motivo.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                Estado:{" "}
                <span className="font-semibold text-white">
                  {pendingRequests.length > 0 ? "Revisión manual activa" : "Todo al día"}
                </span>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-300">
                No hay solicitudes pendientes en este momento.
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <h4 className="text-2xl font-semibold">{request.employeeName}</h4>
                          <span
                            className={`rounded-full px-3 py-1 text-sm ${requestStatusClass(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2 text-sm text-slate-300">
                          <span className="rounded-full bg-slate-900 px-3 py-1">
                            {request.role}
                          </span>
                          <span className="rounded-full bg-slate-900 px-3 py-1">
                            {request.tenureYears} años
                          </span>
                          <span className="rounded-full bg-slate-900 px-3 py-1">
                            {dateShort(request.createdAt)}
                          </span>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-sm text-slate-400">Monto solicitado</p>
                            <p className="mt-2 text-2xl font-bold">
                              {money(request.requestedAmount)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-sm text-slate-400">Disponible al momento</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-400">
                              {money(request.availableAtRequest)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                          <p className="mb-2 text-sm text-slate-400">Motivo</p>
                          <p className="text-slate-200">{request.reason}</p>
                        </div>
                      </div>

                      <div className="w-full max-w-md xl:pl-4">
                        {rejectingId === request.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Escribe el motivo del rechazo"
                              className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
                            />

                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => handleReject(request.id)}
                                className="rounded-2xl border border-red-500/40 px-4 py-3 font-semibold text-red-300 hover:bg-red-500/10"
                              >
                                Confirmar rechazo
                              </button>

                              <button
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectionReason("");
                                }}
                                className="rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-slate-200 hover:bg-slate-800"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={selectedRequestId === request.id}
                              className="rounded-2xl bg-emerald-500 px-4 py-4 font-semibold text-slate-950 hover:opacity-90 disabled:opacity-60"
                            >
                              {selectedRequestId === request.id
                                ? "Aprobando..."
                                : "Aprobar y enviar"}
                            </button>

                            <button
                              onClick={() => {
                                setRejectingId(request.id);
                                setRejectionReason("");
                              }}
                              className="rounded-2xl border border-slate-700 px-4 py-4 font-semibold text-slate-200 hover:bg-slate-800"
                            >
                              Rechazar solicitud
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Empleados</h3>
                <p className="mt-2 text-slate-300">
                  Revisa elegibilidad, historial y disponibilidad de cada persona.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, RFC o puesto"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />

                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option>Todas</option>
                  {branches.map((branch) => (
                    <option key={branch}>{branch}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option>Todas</option>
                  <option>Elegibles</option>
                  <option>No elegibles</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {filteredEmployees.map((employee: CompanyEmployee) => (
                <div
                  key={employee.id}
                  className="rounded-3xl border border-slate-800 bg-slate-950 p-6 transition hover:border-emerald-500/20"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-2xl font-semibold">{employee.name}</h4>
                        <p className="mt-1 text-slate-400">{employee.rfc}</p>

                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                          <span className="rounded-full bg-slate-900 px-3 py-1">
                            {employee.role}
                          </span>
                          <span className="rounded-full bg-slate-900 px-3 py-1">
                            {employee.branch}
                          </span>
                          <span className="rounded-full bg-slate-900 px-3 py-1">
                            {employee.tenureYears} años
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-2 text-sm ${employeeStatusClass(
                          employee
                        )}`}
                      >
                        {employeeStatusText(employee)}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <p className="text-sm text-slate-400">% permitido</p>
                        <p className="mt-2 text-xl font-semibold text-emerald-300">
                          {employee.eligibilityPercent}%
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <p className="text-sm text-slate-400">Disponible hoy</p>
                        <p className="mt-2 text-xl font-semibold text-emerald-400">
                          {money(employee.availableToday)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <p className="text-sm text-slate-400">Ya retiró</p>
                        <p className="mt-2 text-xl font-semibold">
                          {money(employee.drawnThisCycle)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <p className="text-sm text-slate-400">Próximo pago</p>
                        <p className="mt-2 text-lg font-semibold text-emerald-300">
                          {payDate(employee.nextPayDate)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm text-slate-400">Historial reciente</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.requestsLastFive.length === 0 ? (
                          <span className="rounded-full bg-slate-900 px-3 py-2 text-sm text-slate-500">
                            Sin historial
                          </span>
                        ) : (
                          employee.requestsLastFive.map((item) => (
                            <span
                              key={item.id}
                              className={`rounded-full px-3 py-2 text-sm ${requestStatusClass(
                                item.status
                              )}`}
                            >
                              {money(item.requestedAmount)} · {item.status}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5">
              <h3 className="text-2xl font-semibold">Reglas del programa</h3>
              <p className="mt-2 text-slate-300">
                Estas reglas determinan quién puede solicitar adelanto y qué porcentaje
                del salario devengado se habilita.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">Antigüedad mínima</p>
                <p className="mt-2 text-xl font-semibold">
                  {dashboard.policies.minimumTenureYears} año
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">Solicitudes por ciclo</p>
                <p className="mt-2 text-xl font-semibold">
                  {dashboard.policies.maxRequestsPerCycle}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 xl:col-span-2">
                <p className="text-sm text-slate-400">Método de revisión</p>
                <p className="mt-2 text-xl font-semibold">
                  {dashboard.policies.reviewMode}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {dashboard.policies.tenureRules.map((rule) => (
                <div
                  key={`${rule.minYears}-${rule.maxYears ?? "plus"}`}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                >
                  {rule.maxYears
                    ? `${rule.minYears}-${rule.maxYears} años → ${rule.percent}%`
                    : `${rule.minYears}+ años → ${rule.percent}%`}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}