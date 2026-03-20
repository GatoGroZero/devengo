import Link from "next/link";

export default function EmpleadoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 mb-3">
          Portal empleado
        </p>

        <h1 className="text-3xl md:text-5xl font-bold">
          Selecciona un portal de empleado
        </h1>

        <p className="mt-4 text-slate-300">
          Entra desde el panel empresa o abre el portal demo principal.
        </p>

        <div className="mt-8">
          <Link
            href="/empleado/emp-001"
            className="inline-flex rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:opacity-90 transition"
          >
            Abrir empleado demo principal
          </Link>
        </div>
      </div>
    </main>
  );
}