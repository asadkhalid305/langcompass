"use client"

import Link from "next/link"
import { CircleAlert, CircleCheck, Download, LoaderCircle, X } from "lucide-react"
import { useEffect, useState } from "react"

import {
  DEFAULT_LEARNING_TOOL_OPTIONS,
  detectCapabilities,
  getChromeAIEnvironment,
  resolveLearningToolsDeviceStatus,
  type LearningToolsDeviceStatus,
} from "@/lib/learning-tools"

const statusCopy: Record<LearningToolsDeviceStatus, { Icon: typeof CircleAlert; title: string; detail: string; className: string }> = {
  checking: {
    Icon: LoaderCircle,
    title: "Checking AI learning tools",
    detail: "Checking this browser and device.",
    className: "border-border bg-white text-muted-foreground",
  },
  ready: {
    Icon: CircleCheck,
    title: "AI learning tools available",
    detail: "At least one on-device tool is ready here.",
    className: "border-emerald-300 bg-emerald-50 text-emerald-950",
  },
  downloadable: {
    Icon: Download,
    title: "AI learning tools need a download",
    detail: "Your browser can download the required on-device model or language pack.",
    className: "border-amber-300 bg-amber-50 text-amber-950",
  },
  unavailable: {
    Icon: CircleAlert,
    title: "AI learning tools unavailable",
    detail: "This browser or device does not currently support them. Lessons remain fully available.",
    className: "border-red-300 bg-red-50 text-red-950",
  },
}

export function LearningToolsDeviceStatusNotice() {
  const [status, setStatus] = useState<LearningToolsDeviceStatus>("checking")
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let active = true
    void detectCapabilities(getChromeAIEnvironment(), DEFAULT_LEARNING_TOOL_OPTIONS)
      .then((capabilities) => {
        if (active) setStatus(resolveLearningToolsDeviceStatus(capabilities))
      })
      .catch(() => {
        if (active) setStatus("unavailable")
      })
    return () => {
      active = false
    }
  }, [])

  const { Icon, title, detail, className } = statusCopy[status]

  if (dismissed) return null

  return (
    <aside className={`fixed bottom-3 right-3 z-40 max-w-[calc(100vw-1.5rem)] border px-3 py-2 pr-10 shadow-[3px_3px_0_rgba(17,24,39,0.16)] ${className}`} aria-live="polite">
      <button type="button" onClick={() => setDismissed(true)} className="absolute right-2 top-2 rounded-sm p-1 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Dismiss Learning tools status">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${status === "checking" ? "motion-safe:animate-spin" : ""}`} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-bold">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-80">{detail}</p>
          <Link href="/learning-tools" className="mt-1 inline-block text-xs font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Requirements and help</Link>
        </div>
      </div>
    </aside>
  )
}
