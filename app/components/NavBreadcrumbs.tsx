"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";

const LABELS: Record<string, string> = {
  borrowers: "Borrowers",
  lenders: "Lenders",
  components: "Components",
  wallet: "Wallet",
  new: "Create bid",
  underwrite: "Underwrite",
  review: "Review",
};

function labelFor(seg: string) {
  if (LABELS[seg]) return LABELS[seg];
  if (/^\d+$/.test(seg)) return `#${seg}`;
  // title-case fallback
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NavBreadcrumbs() {
  const pathname = usePathname() || "/";
  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname]
  );

  const crumbs = useMemo(() => {
    const list: { href: string; label: string }[] = [
      { href: "/", label: "Home" },
    ];
    let acc = "";
    for (const s of segments) {
      acc += `/${s}`;
      list.push({ href: acc, label: labelFor(s) });
    }
    return list;
  }, [segments]);

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center gap-2 flex-wrap">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={c.href}>
              {i > 0 && <span className="opacity-50">›</span>}
              {isLast || /^\#\d+/.test(c.label) ? (
                <span className={`truncate ${isLast ? "underline" : ""}`}>
                  {c.label}
                </span>
              ) : (
                <Link
                  href={c.href}
                  className={`
                    truncate underline-offset-4
                    hover:underline focus:underline
                    ${i === 0 && pathname === "/" ? "underline" : ""}
                  `}
                >
                  {c.label}
                </Link>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
