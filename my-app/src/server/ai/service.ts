import { PrismaClient } from "@prisma/client"
import { AIProviderFactory, ProviderType } from "./providers/factory"

interface GenerateDocumentInput {
  projectId: string
  type: "prd" | "tech-spec" | "design-spec" | "plan"
  context: {
    idea: string
    audience?: string
    constraints?: string
    techStack?: string
  }
}

const DEFAULT_PROMPTS: Record<string, string> = {
  prd: `You are an expert Product Manager. Create a comprehensive Product Requirements Document (PRD) based on the user's idea.

Include the following sections:
1. Executive Summary
2. Problem Statement
3. Target Audience
4. User Stories
5. Functional Requirements
6. Non-Functional Requirements
7. Success Metrics
8. Timeline & Milestones
9. Risks & Mitigation

Use professional product management language and be thorough but concise.`,

  "tech-spec": `You are an expert Technical Architect. Create a comprehensive Technical Specification based on the user's idea.

Include the following sections:
1. Overview
2. System Architecture
3. Technology Stack
4. API Design
5. Database Schema
6. Security Considerations
7. Performance Requirements
8. Deployment Strategy
9. Monitoring & Logging

Be technically detailed and include specific technologies where appropriate.`,

  "design-spec": `You are an expert UX/UI Designer. Create a comprehensive Design Specification based on the user's idea.

Include the following sections:
1. Design Philosophy
2. User Experience Flow
3. Visual Design System
4. Component Library
5. Responsive Behavior
6. Accessibility Requirements
7. Interaction Design
8. Prototype Specifications

Focus on user-centered design principles and be specific about design decisions.`,

  plan: `You are an expert Project Manager. Create a comprehensive Implementation Plan based on the user's idea.

Include the following sections:
1. Project Overview
2. Phase Breakdown
3. Task Dependencies
4. Resource Allocation
5. Timeline Estimates
6. Risk Assessment
7. Milestone Definitions
8. Success Criteria

Be practical and actionable with clear deliverables for each phase.`,
}

export class AIService {
  private prisma: PrismaClient
  private userId: string

  constructor(prisma: PrismaClient, userId: string) {
    this.prisma = prisma
    this.userId = userId
  }

  async *generateDocument(input: GenerateDocumentInput): AsyncIterableIterator<{ chunk: string; status: string }> {
    // Get user's AI settings
    const settings = await this.prisma.aISettings.findUnique({
      where: { userId: this.userId },
    })

    if (!settings || !settings.apiKey) {
      throw new Error("AI settings not configured. Please configure your AI provider in settings.")
    }

    const provider = AIProviderFactory.create(
      settings.provider as ProviderType,
      {
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl || undefined,
      }
    )

    // Get the appropriate system prompt
    const systemPromptKey = `${input.type}SystemPrompt` as keyof typeof settings
    const systemPrompt = (settings[systemPromptKey] as string) || DEFAULT_PROMPTS[input.type]

    // Build the user prompt
    const userPrompt = this.buildUserPrompt(input)

    yield { chunk: "", status: "generating" }

    let fullContent = ""

    try {
      for await (const chunk of provider.generateStream({
        model: settings.defaultModel || "gpt-4",
        systemPrompt,
        userPrompt,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
      })) {
        fullContent += chunk
        yield { chunk, status: "streaming" }
      }

      // Save the document
      await this.saveDocument(input, fullContent, settings)

      yield { chunk: "", status: "complete" }
    } catch (error) {
      console.error("Generation error:", error)
      throw error
    }
  }

  async *refineSection(input: {
    documentId: string
    section: string
    instruction: string
  }): AsyncIterableIterator<{ chunk: string }> {
    // Get document and settings
    const document = await this.prisma.document.findFirst({
      where: {
        id: input.documentId,
        project: { userId: this.userId },
      },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    const settings = await this.prisma.aISettings.findUnique({
      where: { userId: this.userId },
    })

    if (!settings || !settings.apiKey) {
      throw new Error("AI settings not configured")
    }

    const provider = AIProviderFactory.create(
      settings.provider as ProviderType,
      {
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl || undefined,
      }
    )

    const systemPrompt = "You are an expert editor. Refine the specified section of the document based on the user's instructions."
    const userPrompt = `Document:\n${document.content}\n\nSection to refine: ${input.section}\n\nInstructions: ${input.instruction}\n\nPlease provide the refined version of this section only.`

    for await (const chunk of provider.generateStream({
      model: settings.defaultModel || "gpt-4",
      systemPrompt,
      userPrompt,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
    })) {
      yield { chunk }
    }
  }

  private buildUserPrompt(input: GenerateDocumentInput): string {
    const { context } = input
    
    let prompt = `Idea: ${context.idea}\n\n`
    
    if (context.audience) {
      prompt += `Target Audience: ${context.audience}\n\n`
    }
    
    if (context.constraints) {
      prompt += `Constraints: ${context.constraints}\n\n`
    }
    
    if (context.techStack) {
      prompt += `Preferred Tech Stack: ${context.techStack}\n\n`
    }
    
    prompt += `Please create a ${input.type.replace("-", " ").toUpperCase()} based on this information.`
    
    return prompt
  }

  private async saveDocument(
    input: GenerateDocumentInput,
    content: string,
    settings: { defaultModel?: string | null }
  ) {
    // Check if document already exists
    const existingDoc = await this.prisma.document.findFirst({
      where: {
        projectId: input.projectId,
        type: input.type,
      },
    })

    if (existingDoc) {
      // Create version backup
      await this.prisma.documentVersion.create({
        data: {
          documentId: existingDoc.id,
          content: existingDoc.content,
          version: existingDoc.version,
        },
      })

      // Update document
      await this.prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          content,
          version: { increment: 1 },
          modelUsed: settings.defaultModel || undefined,
        },
      })
    } else {
      // Create new document
      await this.prisma.document.create({
        data: {
          projectId: input.projectId,
          type: input.type,
          title: this.getDocumentTitle(input),
          content,
          modelUsed: settings.defaultModel || undefined,
        },
      })
    }
  }

  private getDocumentTitle(input: GenerateDocumentInput): string {
    const titles: Record<string, string> = {
      prd: "Product Requirements Document",
      "tech-spec": "Technical Specification",
      "design-spec": "Design Specification",
      plan: "Implementation Plan",
    }
    return titles[input.type] || "Document"
  }
}
