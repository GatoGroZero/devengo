export default function EmpresaPage() {
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
              <h2 className="text-3xl font-bold mt-2">12</h2>
            </div>
  
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-400 text-sm">Saldo devengado hoy</p>
              <h2 className="text-3xl font-bold mt-2">$8,450 MXN</h2>
            </div>
  
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-400 text-sm">Retiros pendientes</p>
              <h2 className="text-3xl font-bold mt-2">4</h2>
            </div>
          </section>
  
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Empleados</h3>
              <button className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:opacity-90 transition">
                Agregar empleado
              </button>
            </div>
  
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3">Nombre</th>
                    <th className="py-3">Salario diario</th>
                    <th className="py-3">Devengado</th>
                    <th className="py-3">Disponible</th>
                    <th className="py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="py-4">Luis Hernández</td>
                    <td className="py-4">$450</td>
                    <td className="py-4">$1,350</td>
                    <td className="py-4 text-emerald-400">$675</td>
                    <td className="py-4">Activo</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-4">Ana Martínez</td>
                    <td className="py-4">$500</td>
                    <td className="py-4">$1,000</td>
                    <td className="py-4 text-emerald-400">$500</td>
                    <td className="py-4">Activo</td>
                  </tr>
                  <tr>
                    <td className="py-4">Carlos Rivera</td>
                    <td className="py-4">$380</td>
                    <td className="py-4">$760</td>
                    <td className="py-4 text-emerald-400">$380</td>
                    <td className="py-4">Activo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    );
  }