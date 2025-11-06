// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(179,189,92,0.25), transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(84,83,55,0.35), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.8'/></svg>\")",
        }}
      />

      {/* Content */}
      <section className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
          Borrow or Lend<br className="hidden sm:block" />
          <span className="whitespace-nowrap text-2xl">
            Want stuff and things? Say less.
          </span>
        </h1>

        <p className="mt-4 text-base/7 md:text-lg/8 text-[color:var(--color-muted)] max-w-2xl">
          Pick your side.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link href="/borrowers" className="btn btn-primary text-lg px-8 py-4">
            I want to borrow
          </Link>
          <Link href="/lenders" className="btn btn-outline text-lg px-8 py-4">
            I want to lend
          </Link>
        </div>
      </section>
    </main>
  );
}
