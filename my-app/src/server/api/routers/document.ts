import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"

export const documentRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          project: true,
          versions: {
            orderBy: { createdAt: "desc" },
          },
        },
      })
      return document
    }),

  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.document.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.session.user.id,
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      })

      if (!document) {
        throw new Error("Document not found")
      }

      // Create version backup
      await ctx.prisma.documentVersion.create({
        data: {
          documentId: document.id,
          content: document.content,
          version: document.version,
        },
      })

      return ctx.prisma.document.update({
        where: { id: input.id },
        data: {
          content: input.content,
          version: { increment: 1 },
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.document.deleteMany({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      })
    }),
})
