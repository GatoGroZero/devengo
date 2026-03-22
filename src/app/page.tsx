import Link from "next/link";
import TopNav from "@/components/top-nav";

export default function HomePage() {
  return (
    <>
      <TopNav />

      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto flex min-h-[92vh] max-w-7xl items-center">
          <div className="grid w-full gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="relative overflow-hidden rounded-[40px] border border-emerald-500/15 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)] md:p-10">
              <div className="absolute -right-10 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-green-400/5 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-300">
                  PayStream
                </div>

                <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
                  Adelantos de nómina con experiencia moderna para empleados y RH
                </h1>

                <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
                  Solicitudes claras, aprobación controlada y seguimiento de
                  ciclos de pago en una sola plataforma.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Empleado</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Solicita adelanto
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Consulta tu disponible y envía tu solicitud en segundos.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Recursos humanos</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Revisa y aprueba
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Valida antigüedad, motivo y monto antes de liberar el pago.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Sistema</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Ejecuta y notifica
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      El empleado recibe respuesta y RH mantiene control del
                      ciclo.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[40px] border border-slate-800 bg-slate-900 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)] md:p-8">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                  Acceso seguro
                </p>
                <h2 className="mt-3 text-3xl font-bold">Iniciar sesión</h2>
                <p className="mt-3 text-slate-300">
                  Selecciona el perfil con el que quieres entrar a la demo.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-[30px] border border-emerald-500/20 bg-emerald-500/10 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">
                        Acceso del empleado
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        Continuar con biometría
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-slate-950 text-xl">
                      ✦
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Número de empleado
                      </p>
                      <p className="mt-1 text-white">EMP-001</p>
                    </div>

                    <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Validación
                      </p>
                      <p className="mt-1 text-white">Face ID / Huella (demo)</p>
                    </div>

                    <Link
                      href="/empleado/emp-001"
                      className="block rounded-2xl bg-emerald-500 px-5 py-4 text-center font-semibold text-slate-950 transition hover:opacity-90"
                    >
                      Entrar como empleado
                    </Link>

                    <p className="text-xs text-emerald-200/80">
                      Demo con acceso seguro simulado para passkey y biometría.
                    </p>
                  </div>
                </div>

                <div className="rounded-[30px] border border-slate-800 bg-slate-950 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">
                        Acceso empresarial
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        Portal RH
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-xl">
                      ▣
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Correo corporativo
                      </p>
                      <p className="mt-1 text-white">laura.rh@paystream.demo</p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Contraseña
                      </p>
                      <p className="mt-1 text-white">••••••••••••</p>
                    </div>

                    <Link
                      href="/empresa"
                      className="block rounded-2xl border border-emerald-500/20 bg-slate-900 px-5 py-4 text-center font-semibold text-white transition hover:border-emerald-400/30 hover:bg-slate-800"
                    >
                      Entrar al portal RH
                    </Link>

                    <p className="text-xs text-slate-400">
                      Modo demo con acceso corporativo simulado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">
                  Escenario de producción
                </p>
                <p className="mt-2 text-slate-300">
                  Empleado con biometría o passkey. RH con acceso corporativo y
                  trazabilidad de revisiones.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}