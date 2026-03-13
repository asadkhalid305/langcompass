import "./globals.css"
import type { ReactNode } from "react"

export const metadata = {
  title: "LangCompass",
  description: "A local-first German learning knowledge explorer.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
