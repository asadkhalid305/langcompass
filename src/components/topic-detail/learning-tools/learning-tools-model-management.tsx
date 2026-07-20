"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, HardDrive } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

const CHROME_AI_SETTINGS_ADDRESS = "chrome://settings/system"

export function LearningToolsModelManagement() {
  const [open, setOpen] = useState(false)
  const [copyState, setCopyState] = useState<"idle" | "copied" | "blocked">("idle")

  const copySettingsAddress = () => {
    void navigator.clipboard.writeText(CHROME_AI_SETTINGS_ADDRESS).then(
      () => setCopyState("copied"),
      () => setCopyState("blocked"),
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setCopyState("idle")
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
        Manage AI storage
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto overscroll-contain">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove downloaded AI models</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Chrome shares its on-device models across websites and browser features. LangCompass cannot delete them, and removing one model per learning tool would be misleading.
                </p>

                <div className="border border-border bg-muted/20 p-3 text-foreground">
                  <p className="font-semibold">Remove Chrome&apos;s generative AI models</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                    <li>Open the Chrome menu, then select Settings.</li>
                    <li>Open System.</li>
                    <li>Turn off On-device AI.</li>
                  </ol>
                  <p className="mt-2 text-muted-foreground">
                    Chrome removes the downloaded generative models and frees their disk space. Turning On-device AI on again allows Chrome to download them again.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-foreground">What about translation?</p>
                  <p className="mt-1">
                    Translation uses separate language packs. Chrome does not currently give websites a way to remove an individual pack. Releasing an active session frees runtime resources, but does not delete browser-managed files from disk.
                  </p>
                </div>

                <div>
                  <Button type="button" variant="outline" size="sm" onClick={copySettingsAddress}>
                    {copyState === "copied" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    Copy Chrome settings address
                  </Button>
                  <p className="mt-2 break-all font-mono text-xs text-foreground">{CHROME_AI_SETTINGS_ADDRESS}</p>
                  <p className="mt-1 text-xs" role="status" aria-live="polite">
                    {copyState === "copied" ? "Address copied. Paste it into Chrome's address bar." : null}
                    {copyState === "blocked" ? "Copy was blocked. Select the address above and copy it manually." : null}
                  </p>
                </div>

                <p>
                  This does not delete your generated LangCompass results. Manage those separately under Results, or read the{" "}
                  <Link href="/learning-tools#remove-models" target="_blank" className="font-semibold text-foreground underline underline-offset-4">
                    full storage guide
                  </Link>.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild><Button type="button">Done</Button></AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
