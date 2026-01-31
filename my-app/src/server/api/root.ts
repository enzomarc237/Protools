import { createTRPCRouter } from "@/server/api/trpc"
import { authRouter } from "@/server/api/routers/auth"
import { projectRouter } from "@/server/api/routers/project"
import { documentRouter } from "@/server/api/routers/document"
import { aiRouter } from "@/server/api/routers/ai"
import { settingsRouter } from "@/server/api/routers/settings"
import { brainstormRouter } from "@/server/api/routers/brainstorm"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  project: projectRouter,
  document: documentRouter,
  ai: aiRouter,
  settings: settingsRouter,
  brainstorm: brainstormRouter,
})

export type AppRouter = typeof appRouter
