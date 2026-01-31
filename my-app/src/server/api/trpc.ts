import { initTRPC, TRPCError } from "@trpc/server"
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/server/auth"

export const createTRPCContext = cache(async () => {
  const session = await auth()
  return {
    prisma,
    session,
  }
})

const t = initTRPC.context<typeof createTRPCContext>().create()

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
