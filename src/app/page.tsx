"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TopNav from "@/components/top-nav";

type EmployeeStep = "email" | "camera" | "verifying";

export default function HomePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeStep, setEmployeeStep] = useState<EmployeeStep>("email");
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  async function startCamera() {
    try {
      setCameraError("");
      setCameraReady(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraReady(true);
    } catch (error) {
      console.error(error);
      setCameraError(
        "No se pudo acceder a la cámara. Revisa los permisos del navegador para continuar con la demo."
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function handleEmployeeContinue() {
    if (!employeeEmail.trim()) {
      setCameraError("Escribe un correo para continuar.");
      return;
    }

    setEmployeeStep("camera");
    await startCamera();
  }

  function handleBackToEmail() {
    stopCamera();
    setCameraError("");
    setEmployeeStep("email");
  }

  function handleVerifyIdentity() {
    if (!cameraReady) {
      setCameraError("Primero permite el acceso a la cámara.");
      return;
    }

    setEmployeeStep("verifying");

    setTimeout(() => {
      stopCamera();
      router.push("/empleado/emp-001");
    }, 1400);
  }

  const isEmailStep = employeeStep === "email";
  const isCameraStep = employeeStep === "camera";
  const isVerifyingStep = employeeStep === "verifying";

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
                  Acceso inmediato al salario ya ganado
                </h1>

                <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
                  Una plataforma para que empleados soliciten adelantos con una
                  experiencia simple y para que RH apruebe con reglas claras,
                  trazabilidad y control de cada ciclo de pago.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Liquidez inmediata</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Sin esperar al próximo pago
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      El empleado accede a una parte de su salario devengado cuando
                      realmente lo necesita.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Control empresarial</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Reglas por antigüedad
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      RH valida solicitudes según elegibilidad, motivo, historial y
                      política interna.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Experiencia moderna</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Biometría y notificaciones
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      El empleado entra con una experiencia tipo Face ID y recibe
                      respuesta inmediata de su solicitud.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-emerald-500/10 bg-slate-900/60 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                    Qué resuelve PayStream
                  </p>
                  <p className="mt-3 max-w-3xl text-slate-300">
                    Convertimos días trabajados en liquidez útil, sin fricción para
                    el empleado y con visibilidad total para RH. La aprobación se
                    refleja en la app, se notifica al usuario y queda ligada al
                    control del ciclo de pago.
                  </p>
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
                  Cada perfil entra con una experiencia distinta según su rol.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-[30px] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-slate-950 p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">
                        Acceso del empleado
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        Verificación biométrica
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-slate-950 text-xl">
                      ✦
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                    {isEmailStep && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Paso 1
                        </p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          Iniciar sesion
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          Ingresa tu correo para iniciar.
                        </p>

                        <div className="mt-5">
                          <label className="mb-2 block text-sm text-slate-300">
                            Correo del empleado
                          </label>
                          <input
                            type="email"
                            value={employeeEmail}
                            onChange={(e) => {
                              setEmployeeEmail(e.target.value);
                              setCameraError("");
                            }}
                            placeholder="Ejemplo123@ejemplo.com"
                            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-white outline-none focus:border-emerald-400"
                          />
                        </div>

                        {cameraError && (
                          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {cameraError}
                          </div>
                        )}

                        <button
                          onClick={handleEmployeeContinue}
                          className="mt-5 w-full rounded-2xl bg-emerald-500 px-5 py-4 font-semibold text-slate-950 transition hover:opacity-90"
                        >
                          Continuar a verificación
                        </button>

                       
                      </div>
                    )}

                    {isCameraStep && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Paso 2
                        </p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          Verifica tu identidad
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          Permite acceso a la cámara para simular Face ID. No se
                          guarda ninguna imagen.
                        </p>

                        <div className="mt-5 overflow-hidden rounded-[28px] border border-emerald-500/15 bg-black">
                          <div className="relative aspect-[4/3] w-full">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="h-full w-full object-cover"
                            />

                            {!cameraReady && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90">
                                <div className="text-center">
                                  <div className="mx-auto h-16 w-16 animate-pulse rounded-full border border-emerald-500/30 bg-emerald-500/10" />
                                  <p className="mt-4 text-sm text-slate-300">
                                    Esperando permiso de cámara...
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <div className="h-44 w-44 rounded-full border-2 border-emerald-400/70 shadow-[0_0_40px_rgba(16,185,129,0.25)]" />
                            </div>
                          </div>
                        </div>

                        {cameraError && (
                          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {cameraError}
                          </div>
                        )}

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <button
                            onClick={handleBackToEmail}
                            className="rounded-2xl border border-slate-700 px-5 py-4 font-semibold text-slate-200 transition hover:bg-slate-800"
                          >
                            Volver
                          </button>

                          <button
                            onClick={handleVerifyIdentity}
                            disabled={!cameraReady}
                            className="rounded-2xl bg-emerald-500 px-5 py-4 font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                          >
                            Verificar identidad
                          </button>
                        </div>

                        <p className="mt-4 text-xs text-emerald-200/80">
                          Simulación de passkey / biometría con cámara activa.
                        </p>
                      </div>
                    )}

                    {isVerifyingStep && (
                      <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          Paso 3
                        </p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          Autenticando identidad
                        </p>

                        <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/15 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                          <span className="text-3xl text-emerald-300">✓</span>
                        </div>

                        <p className="mt-5 text-sm text-slate-300">
                          Validando acceso biométrico...
                        </p>

                        <div className="mx-auto mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full w-full animate-pulse rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    )}
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
                <p className="text-sm text-slate-400">Escenario de producción</p>
                <p className="mt-2 text-slate-300">
                  Empleado con passkey biométrica y RH con acceso corporativo,
                  trazabilidad de revisiones y control de operaciones.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}