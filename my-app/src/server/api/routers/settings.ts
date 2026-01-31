import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"
import { AIProviderFactory } from "@/server/ai/providers/factory"

const settingsInput = z.object({
  provider: z.enum(["openai", "openrouter", "gemini", "ollama"]),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  defaultModel: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(100000).default(4000),
  prdSystemPrompt: z.string().optional(),
  techSpecSystemPrompt: z.string().optional(),
  designSpecSystemPrompt: z.string().optional(),
  planSystemPrompt: z.string().optional(),
})

export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.aISettings.findUnique({
      where: { userId: ctx.session.user.id },
    })
  }),

  save: protectedProcedure
    .input(settingsInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.aISettings.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          ...input,
          userId: ctx.session.user.id,
        },
        update: input,
      })
    }),

  fetchModels: protectedProcedure
    .input(z.object({
      provider: z.enum(["openai", "openrouter", "gemini", "ollama"]),
      apiKey: z.string(),
      baseUrl: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const provider = AIProviderFactory.create(input.provider, {
        apiKey: input.apiKey,
        baseUrl: input.baseUrl,
      })

      return provider.fetchModels()
    }),

  testConnection: protectedProcedure
    .input(z.object({
      provider: z.enum(["openai", "openrouter", "gemini", "ollama"]),
      apiKey: z.string(),
      baseUrl: z.string().optional(),
      model: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const provider = AIProviderFactory.create(input.provider, {
          apiKey: input.apiKey,
          baseUrl: input.baseUrl,
        })

        await provider.testConnection(input.model)
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        }
      }
    }),
})
