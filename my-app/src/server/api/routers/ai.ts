import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"
import { AIService } from "@/server/ai/service"

const generateInput = z.object({
  projectId: z.string(),
  type: z.enum(["prd", "tech-spec", "design-spec", "plan"]),
  context: z.object({
    idea: z.string(),
    audience: z.string().optional(),
    constraints: z.string().optional(),
    techStack: z.string().optional(),
  }),
})

export const aiRouter = createTRPCRouter({
  generateDocument: protectedProcedure
    .input(generateInput)
    .mutation(async function* ({ ctx, input }) {
      const aiService = new AIService(ctx.prisma, ctx.session.user.id)
      
      try {
        const stream = await aiService.generateDocument(input)
        
        for await (const chunk of stream) {
          yield chunk
        }
      } catch (error) {
        console.error("AI generation error:", error)
        throw error
      }
    }),

  refineSection: protectedProcedure
    .input(z.object({
      documentId: z.string(),
      section: z.string(),
      instruction: z.string(),
    }))
    .mutation(async function* ({ ctx, input }) {
      const aiService = new AIService(ctx.prisma, ctx.session.user.id)
      
      const stream = await aiService.refineSection(input)
      
      for await (const chunk of stream) {
        yield chunk
      }
    }),
})
