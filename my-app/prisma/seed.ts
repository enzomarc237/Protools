import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash("password", 10)
  
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
    },
  })

  console.log("Demo user created:", demoUser.email)

  // Create sample project with documents
  const project = await prisma.project.upsert({
    where: { 
      id: "sample-project-1" 
    },
    update: {},
    create: {
      id: "sample-project-1",
      userId: demoUser.id,
      title: "AI Writing Assistant",
      description: "An AI-powered writing tool that helps users create better content faster with smart suggestions and real-time editing.",
      targetAudience: "Content creators, marketers, and professionals",
      techStack: "Next.js, TypeScript, OpenAI API, PostgreSQL",
      status: "complete",
      documents: {
        create: [
          {
            type: "prd",
            title: "Product Requirements Document",
            content: `# Product Requirements Document: AI Writing Assistant

## 1. Executive Summary

The AI Writing Assistant is an intelligent content creation tool designed to help users write better, faster. Leveraging state-of-the-art language models, it provides real-time suggestions, grammar corrections, and content improvements.

## 2. Problem Statement

Content creation is time-consuming and challenging. Writers struggle with:
- Writer's block and getting started
- Grammar and style consistency
- SEO optimization
- Meeting deadlines

## 3. Target Audience

- Content marketers
- Bloggers and journalists
- Business professionals
- Students and academics

## 4. Key Features

### 4.1 Smart Compose
AI-powered text completion that suggests the next sentence or paragraph based on context.

### 4.2 Grammar & Style Check
Real-time grammar, spelling, and style suggestions with explanations.

### 4.3 Tone Adjustment
Modify the tone of writing (professional, casual, persuasive, etc.).

### 4.4 SEO Optimization
Suggestions for keywords, headings, and meta descriptions.

## 5. Success Metrics

- User engagement: 10+ sessions per week
- Feature adoption: 60% use AI features
- User satisfaction: NPS > 50

## 6. Timeline

- Month 1: Core writing engine
- Month 2: UI/UX and integration
- Month 3: Beta testing and launch`,
            version: 1,
          },
          {
            type: "tech-spec",
            title: "Technical Specification",
            content: `# Technical Specification: AI Writing Assistant

## 1. Architecture Overview

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    API      │────▶│    AI       │
│  (Next.js)  │◄────│  (tRPC)     │◄────│  Service    │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Database   │
                     │ (PostgreSQL)│
                     └─────────────┘
\`\`\`

## 2. Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 API
- **Authentication**: NextAuth.js

## 3. API Design

### 3.1 Generate Suggestions
\`POST /api/ai/suggest\`

Request:
\`\`\`json
{
  "text": "The quick brown fox",
  "context": "blog_post",
  "tone": "professional"
}
\`\`\`

Response:
\`\`\`json
{
  "suggestions": [
    {
      "text": "jumps over the lazy dog",
      "confidence": 0.95
    }
  ]
}
\`\`\`

## 4. Database Schema

See \`prisma/schema.prisma\` for full schema definition.

## 5. Security Considerations

- API key encryption at rest
- Rate limiting: 100 requests/minute
- Input sanitization
- Content moderation for AI outputs

## 6. Performance Requirements

- API response time: < 500ms
- Time to first suggestion: < 1s
- Support 1000 concurrent users`,
            version: 1,
          },
        ],
      },
    },
  })

  console.log("Sample project created:", project.title)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
