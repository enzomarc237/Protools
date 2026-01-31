import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"

const projectInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  targetAudience: z.string().optional(),
  constraints: z.string().optional(),
  techStack: z.string().optional(),
})

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        documents: {
          select: { id: true, type: true },
        },
      },
    })
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          documents: {
            orderBy: { createdAt: "desc" },
          },
          brainstormNodes: true,
        },
      })
    }),

  create: protectedProcedure
    .input(projectInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: projectInput.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.updateMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: input.data,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
    }),
})
