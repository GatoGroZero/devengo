"use client";

import { useEffect, useState } from "react";
import {
  createEmployeeRequest,
  fetchEmployeeAppBob,
  type EmployeeAppResponse,
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

function requestStatusClass(status: "Pendiente" | "Aprobada" | "Rechazada") {
  if (status === "Aprobada") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "Rechazada") {
    return "border-red-500/20 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-300";
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<EmployeeAppResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const response = await fetchEmployeeAppBob();
      setData(response);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo cargar la app del empleado.";
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

  async function handleSubmitRequest() {
    try {
      setError("");
      setMessage("");
      setSubmitting(true);

      const numericAmount = Number(amount);

      if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        setError("Escribe un monto válido.");
        return;
      }

      if (!reason.trim() || reason.trim().length < 8) {
        setError("Escribe un motivo claro para tu solicitud.");
        return;
      }

      await createEmployeeRequest({
        requestedAmount: numericAmount,
        reason: reason.trim(),
      });

      setAmount("");
      setReason("");
      setMessage("Tu solicitud fue enviada a revisión.");
      await loadData(false);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo enviar la solicitud.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
          <div className="rounded-[42px] border border-slate-800 bg-slate-900 p-10 shadow-2xl shadow-black/40">
            <p className="text-slate-300">Cargando app del empleado...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
          <div className="rounded-[42px] border border-red-500/20 bg-slate-900 p-10 shadow-2xl shadow-black/40">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { employee, requests, notifications } = data;
  const phoneNotifications = notifications.slice(0, 2);
  const phoneTopPadding = phoneNotifications.length > 0 ? "pt-52" : "pt-16";

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white">
      <style jsx global>{`
        .phone-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .phone-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-green-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">
        <div className="absolute bottom-6 h-10 w-80 rounded-full bg-black/40 blur-2xl" />

        <div className="relative w-full max-w-[430px]">
          <div className="absolute -left-1 top-28 h-16 w-1 rounded-full bg-slate-700/80" />
          <div className="absolute -left-1 top-48 h-24 w-1 rounded-full bg-slate-700/80" />
          <div className="absolute -right-1 top-40 h-24 w-1 rounded-full bg-slate-700/80" />

          <div className="rounded-[42px] border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-950 p-2 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            <div className="relative overflow-hidden rounded-[34px] border border-emerald-500/10 bg-slate-950">
              <div className="absolute left-1/2 top-3 z-30 h-7 w-36 -translate-x-1/2 rounded-full bg-black/90 shadow-lg" />
              <div className="absolute right-6 top-5 z-30 h-2 w-2 rounded-full bg-slate-700" />

              <div className="absolute inset-x-5 top-4 z-20 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium">9:41</span>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  <span className="h-2 w-4 rounded-sm bg-slate-500" />
                </div>
              </div>

              {phoneNotifications.length > 0 && (
                <div className="absolute inset-x-3 top-14 z-20 space-y-2">
                  {phoneNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-[24px] border border-white/10 bg-black/70 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/20" />
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300">
                            PayStream
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          ahora
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-white">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`phone-scroll max-h-[86vh] overflow-y-auto px-4 pb-8 ${phoneTopPadding}`}
              >
                <section className="relative overflow-hidden rounded-[28px] border border-emerald-500/15 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 shadow-xl shadow-black/30">
                  <div className="absolute -right-8 top-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />

                  <div className="relative z-10">
                    <p className="mb-3 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-300">
                      App empleado
                    </p>

                    <h1 className="text-3xl font-bold">PayStream</h1>

                    <p className="mt-2 text-sm text-slate-300">
                      Hola, {employee.name.split(" ")[0]}. Revisa tu disponible y
                      envía solicitudes de adelanto.
                    </p>
                  </div>
                </section>

                <section className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[24px] border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Disponible hoy</p>
                    <h2 className="mt-2 text-2xl font-bold text-emerald-400">
                      {money(employee.availableToday)}
                    </h2>
                  </div>

                  <div className="rounded-[24px] border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Ya retiraste</p>
                    <h2 className="mt-2 text-2xl font-bold">
                      {money(employee.drawnThisCycle)}
                    </h2>
                  </div>

                  <div className="rounded-[24px] border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Antigüedad</p>
                    <h2 className="mt-2 text-2xl font-bold">
                      {employee.tenureYears} años
                    </h2>
                  </div>

                  <div className="rounded-[24px] border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">% permitido</p>
                    <h2 className="mt-2 text-2xl font-bold text-emerald-300">
                      {employee.eligibilityPercent}%
                    </h2>
                  </div>
                </section>

                <section className="mt-4 rounded-[28px] border border-slate-800 bg-slate-900 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Tu perfil
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{employee.name}</h3>

                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <p>Puesto: {employee.role}</p>
                    <p>Sucursal: {employee.branch}</p>
                    <p>RFC: {employee.rfc}</p>
                    <p>
                      Estado:{" "}
                      {employee.eligible ? "Elegible" : employee.eligibilityReason}
                    </p>
                  </div>
                </section>

                {message && (
                  <div className="mt-4 rounded-[20px] border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-[20px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <section className="mt-4 rounded-[28px] border border-slate-800 bg-slate-900 p-5">
                  <h3 className="text-xl font-semibold">Pedir adelanto</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Envía tu solicitud y RH la revisará antes de liberarla.
                  </p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Monto solicitado
                      </label>
                      <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        placeholder={`Máximo ${employee.availableToday}`}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Motivo
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej. Transporte, medicinas, pago urgente..."
                        className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                      />
                    </div>

                    <button
                      onClick={handleSubmitRequest}
                      disabled={submitting}
                      className="w-full rounded-2xl bg-emerald-500 px-5 py-4 font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                    >
                      {submitting ? "Enviando solicitud..." : "Enviar solicitud"}
                    </button>
                  </div>
                </section>

                <section className="mt-4 rounded-[28px] border border-slate-800 bg-slate-900 p-5">
                  <h3 className="text-xl font-semibold">Tus últimas solicitudes</h3>

                  <div className="mt-4 space-y-3">
                    {requests.length === 0 ? (
                      <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-400">
                        Aún no tienes solicitudes registradas.
                      </div>
                    ) : (
                      requests.map((request) => (
                        <div
                          key={request.id}
                          className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">
                              {money(request.requestedAmount)}
                            </p>
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${requestStatusClass(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-slate-300">
                            {request.reason}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            {dateShort(request.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <div className="mt-6 flex justify-center">
                  <div className="h-1.5 w-28 rounded-full bg-slate-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}