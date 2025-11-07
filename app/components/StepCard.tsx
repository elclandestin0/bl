"use client";

type Props = {
  title: string;
  subtitle: string;
  checked: boolean;          // controls the checkbox UI
  onActivate: () => void;    // called when the card is clicked
  disabled?: boolean;        // optional
  className?: string;
};

export default function StepCard({
  title,
  subtitle,
  checked,
  onActivate,
  disabled,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={disabled}
      className={`
        group w-full text-left rounded-2xl border p-5 transition
        ${checked
          ? "bg-[color:var(--color-accent)]/10 border-[color:var(--color-accent)]/70 hover:bg-[color:var(--color-accent)]/15"
          : "hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/10"}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        ${className ?? ""}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-[color:var(--color-muted)] mt-1">{subtitle}</p>
        </div>

        {/* Outline-only checkbox indicator */}
        <span
          aria-hidden
          className={`inline-grid size-5 place-items-center rounded-md border
            ${checked ? "border-[color:var(--color-accent)]" : "border-[color:var(--color-muted)]"}`}
        >
          {checked ? "✔" : ""}
        </span>
      </div>
    </button>
  );
}
