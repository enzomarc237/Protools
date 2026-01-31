import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"
import { AIProviderFactory } from "@/server/ai/providers/factory"
import { TRPCError } from "@trpc/server"

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
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" })
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Node not found" })
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
      existingNodes: z.array(z.object({
        content: z.string(),
        type: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get user's AI settings
      const settings = await ctx.prisma.aISettings.findUnique({
        where: { userId: ctx.session.user.id },
      })

      if (!settings || !settings.apiKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "AI settings not configured. Please configure your AI provider in settings.",
        })
      }

      // Get project context
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" })
      }

      try {
        const provider = AIProviderFactory.create(
          settings.provider as any,
          {
            apiKey: settings.apiKey,
            baseUrl: settings.baseUrl || undefined,
          }
        )

        // Build context from existing nodes
        const existingContext = input.existingNodes && input.existingNodes.length > 0
          ? `\n\nExisting ideas in this brainstorm:\n${input.existingNodes.map(n => `- ${n.type}: ${n.content}`).join("\n")}`
          : ""

        const systemPrompt = `You are an expert product strategist and creative consultant specializing in brainstorming and ideation.

Your task is to generate creative, diverse, and actionable ideas based on the user's prompt.

For each idea, provide:
1. The idea content (clear and concise)
2. The type of idea: feature, question, constraint, or goal

Respond in JSON format as an array of objects:
[
  { "content": "idea text", "type": "feature" },
  { "content": "question text", "type": "question" },
  ...
]

Guidelines:
- Generate 4-6 ideas
- Be specific and actionable
- Cover different angles (user needs, technical aspects, business concerns)
- Include a mix of types (not just features)`

        const userPrompt = `Project: ${project.title}
Description: ${project.description}

User request: ${input.prompt}${existingContext}

Generate ideas in the specified JSON format.`

        const stream = await provider.generateStream({
          model: settings.defaultModel || "gpt-4",
          systemPrompt,
          userPrompt,
          temperature: 0.8,
          maxTokens: 2000,
        })

        let fullContent = ""
        for await (const chunk of stream) {
          fullContent += chunk
        }

        // Parse the JSON response
        try {
          // Try to extract JSON from the response (in case there's extra text)
          const jsonMatch = fullContent.match(/\[[\s\S]*\]/)
          const jsonStr = jsonMatch ? jsonMatch[0] : fullContent
          const ideas = JSON.parse(jsonStr)
          
          return { ideas }
        } catch (parseError) {
          console.error("Failed to parse AI response:", fullContent)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to parse AI response. Please try again.",
          })
        }
      } catch (error) {
        console.error("Brainstorm generation error:", error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate ideas",
        })
      }
    }),

  expandIdea: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      ideaContent: z.string(),
      ideaType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.prisma.aISettings.findUnique({
        where: { userId: ctx.session.user.id },
      })

      if (!settings || !settings.apiKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "AI settings not configured.",
        })
      }

      try {
        const provider = AIProviderFactory.create(
          settings.provider as any,
          {
            apiKey: settings.apiKey,
            baseUrl: settings.baseUrl || undefined,
          }
        )

        const systemPrompt = `You are an expert product strategist. Expand on the given idea by generating related sub-ideas or breaking it down into actionable components.

Respond in JSON format as an array:
[
  { "content": "sub-idea text", "type": "feature" },
  { "content": "question text", "type": "question" },
  ...
]

Generate 3-4 related ideas.`

        const userPrompt = `Expand on this ${input.ideaType}: "${input.ideaContent}"

Generate related ideas in JSON format.`

        const stream = await provider.generateStream({
          model: settings.defaultModel || "gpt-4",
          systemPrompt,
          userPrompt,
          temperature: 0.7,
          maxTokens: 1500,
        })

        let fullContent = ""
        for await (const chunk of stream) {
          fullContent += chunk
        }

        const jsonMatch = fullContent.match(/\[[\s\S]*\]/)
        const jsonStr = jsonMatch ? jsonMatch[0] : fullContent
        const ideas = JSON.parse(jsonStr)
        
        return { ideas }
      } catch (error) {
        console.error("Expand idea error:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to expand idea",
        })
      }
    }),
})
