import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { TRPCProvider } from "@/components/providers/trpc-provider"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SpecForge - AI-Powered Product Planning",
  description: "Transform your ideas into comprehensive product documentation with AI. Generate PRDs, technical specs, design specs, and implementation plans in minutes.",
  keywords: ["AI", "product management", "PRD", "technical specifications", "documentation"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  )
}
