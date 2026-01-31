import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"

const nodeInput = z.object({
  content: z.string(),
  type: z.enum(["idea", "question", "feature", "constraint"]).default("idea"),
  x: z.number().default(0),
  y: z.number().default(0),
  parentId: z.string().optional(),
})

export const brainstormRouter = createTRPCRouter({
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.brainstormNode.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.session.user.id,
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }),

  create: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      ...nodeInput.shape,
    }))
    .mutation(async ({ ctx, input }) => {
      const { projectId, ...data } = input
      
      // Verify project ownership
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!project) {
        throw new Error("Project not found")
      }

      return ctx.prisma.brainstormNode.create({
        data: {
          ...data,
          projectId,
        },
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: nodeInput.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const node = await ctx.prisma.brainstormNode.findFirst({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      })

      if (!node) {
        throw new Error("Node not found")
      }

      return ctx.prisma.brainstormNode.update({
        where: { id: input.id },
        data: input.data,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brainstormNode.deleteMany({
        where: {
          id: input.id,
          project: {
            userId: ctx.session.user.id,
          },
        },
      })
    }),

  generateIdeas: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      prompt: z.string(),
    }))
    .mutation(async function* ({ ctx, input }) {
      // This will be implemented with AI integration
      // For now, return placeholder
      yield { ideas: ["Feature idea 1", "Feature idea 2", "Feature idea 3"] }
    }),
})
