"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SheetTrigger } from "@/components/ui/sheet"

export function LearningToolsLauncher() {
  return (
    <div className="mt-6 flex flex-col gap-4 border border-[#111827] bg-[#111827] px-5 py-4 text-white shadow-[5px_5px_0_#F97316] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-orange-300" aria-hidden="true" />
          Learning tools
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/70">
          Optional AI help generated on this device. First use may download browser-managed models and use local storage and processing power.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <SheetTrigger asChild>
          <Button className="bg-white text-[#111827] hover:bg-white/90">Open learning tools</Button>
        </SheetTrigger>
        <Button asChild variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white">
          <Link href="/learning-tools">Learn how it works</Link>
        </Button>
      </div>
    </div>
  )
}
