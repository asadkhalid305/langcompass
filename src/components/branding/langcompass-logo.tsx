import { cn } from "@/lib/utils/cn"

interface LangCompassLogoProps {
  className?: string
  showTagline?: boolean
  compact?: boolean
}

interface LangCompassMarkProps {
  className?: string
}

export function LangCompassMark({ className }: LangCompassMarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 72 72"
      className={cn("h-11 w-11 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="64" height="64" fill="#FFFDF8" stroke="#111827" strokeWidth="4" />
      <rect x="12" y="12" width="48" height="48" fill="#F3F0FF" stroke="#111827" strokeWidth="2" />
      <path d="M36 16L48 36L36 56L24 36L36 16Z" fill="#F97316" stroke="#111827" strokeWidth="3" />
      <path d="M36 24L43 36L36 48L29 36L36 24Z" fill="#FEF3C7" stroke="#111827" strokeWidth="2" />
      <path d="M17 48C22 42 28 39 35 39C43 39 50 34 55 23" stroke="#3B82F6" strokeWidth="4" strokeLinecap="square" />
      <circle cx="55" cy="23" r="4.5" fill="#3B82F6" stroke="#111827" strokeWidth="2" />
    </svg>
  )
}

export function LangCompassLogo({ className, showTagline = false, compact = false }: LangCompassLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LangCompassMark className={compact ? "h-9 w-9" : "h-11 w-11"} />

      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-[-0.04em] text-foreground md:text-2xl">LangCompass</span>
          {!compact ? <span className="hidden text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground sm:inline">German map</span> : null}
        </div>
        {showTagline ? (
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Curriculum-first German learning explorer</p>
        ) : null}
      </div>
    </div>
  )
}
