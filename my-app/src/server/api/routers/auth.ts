import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "You are logged in and can see this secret message!"
  }),
})
