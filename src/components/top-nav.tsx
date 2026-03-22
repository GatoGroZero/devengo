"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/empresa", label: "Portal empresa" },
  { href: "/empleado/emp-001", label: "App empleado" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/20" />
          <div>
            <p className="text-sm font-semibold text-white">PayStream</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">
              Demo
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-1">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}