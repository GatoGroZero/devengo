import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 mb-4">
          Devengo
        </p>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          La nómina flexible para pymes
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-300">
          Permite que empleados accedan a una parte del salario ya ganado,
          con reglas claras, retiros controlados y trazabilidad.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/empresa"
            className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:opacity-90 transition"
          >
            Soy empresa
          </Link>

          <Link
            href="/empleado"
            className="px-6 py-3 rounded-xl border border-slate-700 text-white hover:bg-slate-900 transition"
          >
            Soy empleado
          </Link>
        </div>
      </section>
    </main>
  );
}