import { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

// Email provider configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  providers: [
    {
      id: "email",
      name: "Email",
      type: "email",
      async sendVerificationRequest({ identifier: email, url }) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Sign in to SpecForge",
          text: `Click this link to sign in: ${url}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #3b82f6;">Sign in to SpecForge</h1>
              <p>Click the button below to sign in to your account:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                Sign In
              </a>
              <p style="color: #64748b; font-size: 14px;">
                Or copy and paste this link: ${url}
              </p>
              <p style="color: #94a3b8; font-size: 12px;">
                This link expires in 24 hours and can only be used once.
              </p>
            </div>
          `,
        })
      },
    },
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
}
