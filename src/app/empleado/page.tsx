export default function EmpleadoPage() {
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
  
          <section className="grid gap-6 md:grid-cols-3 mb-10">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-400 text-sm">Devengado total</p>
              <h2 className="text-3xl font-bold mt-2">$1,350 MXN</h2>
            </div>
  
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-400 text-sm">Disponible para retiro</p>
              <h2 className="text-3xl font-bold mt-2 text-emerald-400">$675 MXN</h2>
            </div>
  
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-400 text-sm">Ya retirado</p>
              <h2 className="text-3xl font-bold mt-2">$200 MXN</h2>
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
                  placeholder="Ej. 300"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>
  
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Método
                </label>
                <select className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400">
                  <option>Wallet Devengo</option>
                  <option>Cuenta bancaria</option>
                </select>
              </div>
            </div>
  
            <button className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:opacity-90 transition">
              Retirar ahora
            </button>
          </section>
        </div>
      </main>
    );
  }