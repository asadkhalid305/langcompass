import "./globals.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Space_Grotesk, Inter } from "next/font/google"

const textFont = Inter({
  subsets: ["latin"],
  variable: "--font-text",
})

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

const metadataBase = (() => {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (explicitUrl) return new URL(explicitUrl)

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProductionUrl) return new URL(`https://${vercelProductionUrl}`)

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return new URL(`https://${vercelUrl}`)

  return new URL("http://localhost:3000")
})()

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "LangCompass",
    template: "%s | LangCompass",
  },
  description: "A static-first German curriculum explorer for navigating CEFR levels, topic relationships, and lesson depth.",
  applicationName: "LangCompass",
  category: "education",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${textFont.variable} ${displayFont.variable} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
}
