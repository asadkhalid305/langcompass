import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils/cn"

interface BreadcrumbItem {
  label: string
  href?: string
  variant?: "default" | "brand"
}

interface AppBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function AppBreadcrumb({ items, className }: AppBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const itemClassName =
          item.variant === "brand"
            ? "font-display text-xl font-bold tracking-tight text-foreground normal-case"
            : cn("uppercase", isLast ? "text-foreground" : undefined)

        return (
          <div key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className={cn("transition-colors hover:text-foreground", itemClassName)}>
                {item.label}
              </Link>
            ) : (
              <span className={itemClassName}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          </div>
        )
      })}
    </nav>
  )
}
