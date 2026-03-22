"use client";

import { useEffect, useState } from "react";
import {
  fetchOnchainBob,
  fetchOnchainVaultSummary,
  settleOnchainCycle,
  type OnchainEmployee,
  type OnchainVaultSummary,
} from "@/lib/api";

export default function CompanyDashboard() {
  const [vault, setVault] = useState<OnchainVaultSummary | null>(null);
  const [bob, setBob] = useState<OnchainEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const [vaultData, bobData] = await Promise.all([
        fetchOnchainVaultSummary(),
        fetchOnchainBob(),
      ]);

      setVault(vaultData);
      setBob(bobData);
    } catch {
      setError("No se pudo cargar la información on-chain.");
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

  async function handleSettleCycle() {
    try {
      setError("");
      setMessage("");

      await settleOnchainCycle();
      await loadData(false);

      setMessage("Ciclo liquidado on-chain correctamente.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo liquidar el ciclo on-chain.";
      setError(msg);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-300">Cargando dashboard on-chain...</p>
        </div>
      </main>
    );
  }

  if (error || !vault || !bob) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-red-300">
            {error || "No se pudo cargar el dashboard on-chain."}
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
            Estado on-chain del protocolo
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Vista conectada a Testnet para revisar vault y un empleado real del demo.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-5 mb-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Ciclo actual</p>
            <h2 className="text-3xl font-bold mt-2">#{vault.currentCycle}</h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Total depositado</p>
            <h2 className="text-3xl font-bold mt-2">
              ${vault.totalDeposited.toLocaleString("es-MX")}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Total adelantado</p>
            <h2 className="text-3xl font-bold mt-2">
              ${vault.totalDrawn.toLocaleString("es-MX")}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Fees cobrados</p>
            <h2 className="text-3xl font-bold mt-2">
              ${vault.totalFeesCollected.toLocaleString("es-MX")}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400 text-sm">Liquidez disponible</p>
            <h2 className="text-3xl font-bold mt-2 text-emerald-400">
              ${vault.availableLiquidity.toLocaleString("es-MX")}
            </h2>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h3 className="text-2xl font-semibold">Empleado demo on-chain</h3>

            <button
              onClick={handleSettleCycle}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:opacity-90 transition"
            >
              Liquidar ciclo on-chain
            </button>
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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-slate-400 text-sm">Empleado</p>
              <h4 className="text-2xl font-bold mt-2">{bob.label}</h4>
              <p className="mt-3 text-slate-300 break-all">
                Address: {bob.address}
              </p>
              <p className="mt-2 text-slate-300">RFC: {bob.rfc}</p>
              <p className="mt-2 text-slate-300">
                Estado: {bob.active ? "Activo" : "Inactivo"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-slate-400 text-sm">Resumen financiero</p>
              <p className="mt-3 text-slate-300">
                Salario por ciclo: ${bob.salaryPerCycle.toLocaleString("es-MX")}
              </p>
              <p className="mt-2 text-slate-300">
                Retirado en ciclo: ${bob.drawnThisCycle.toLocaleString("es-MX")}
              </p>
              <p className="mt-2 text-emerald-400 font-semibold">
                Disponible: ${bob.availableAdvance.toLocaleString("es-MX")}
              </p>
              <p className="mt-2 text-slate-300">
                Fees pagados: ${bob.totalFeesPaid.toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
