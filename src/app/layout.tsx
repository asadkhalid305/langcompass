import "./globals.css"
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

export const metadata = {
  title: "LangCompass",
  description: "A local-first German curriculum explorer.",
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
