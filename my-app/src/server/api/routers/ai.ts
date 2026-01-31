import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"
import { AIService } from "@/server/ai/service"
import { TRPCError } from "@trpc/server"

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
    .mutation(async ({ ctx, input }) => {
      const aiService = new AIService(ctx.prisma, ctx.session.user.id)
      
      try {
        const chunks: string[] = []
        
        for await (const chunk of aiService.generateDocument(input)) {
          if (chunk.chunk) {
            chunks.push(chunk.chunk)
          }
        }
        
        return { success: true, content: chunks.join("") }
      } catch (error) {
        console.error("AI generation error:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate document",
        })
      }
    }),

  refineSection: protectedProcedure
    .input(z.object({
      documentId: z.string(),
      section: z.string(),
      instruction: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const aiService = new AIService(ctx.prisma, ctx.session.user.id)
      
      try {
        const chunks: string[] = []
        
        for await (const chunk of aiService.refineSection(input)) {
          chunks.push(chunk.chunk)
        }
        
        return { success: true, content: chunks.join("") }
      } catch (error) {
        console.error("Refinement error:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to refine section",
        })
      }
    }),
})
