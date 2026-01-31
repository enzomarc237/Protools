# Technical Specifications
## SpecForge - Architecture & Implementation Details

---

## 1. Technology Stack

### 1.1 Frontend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **Next.js 15** (App Router) | SSR, API routes, optimal performance |
| Language | **TypeScript** | Type safety, better DX |
| Styling | **Tailwind CSS** + **shadcn/ui** | Rapid UI development, consistent design |
| State Management | **Zustand** | Simple, performant global state |
| Forms | **React Hook Form** + **Zod** | Type-safe forms with validation |
| Animation | **Framer Motion** | Declarative animations, gestures |
| Icons | **Lucide React** | Consistent, beautiful icons |
| Markdown | **MDX** + **react-markdown** | Rich document rendering |

### 1.2 Backend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | **Node.js 20+** | Modern JS features, performance |
| API | **Next.js API Routes** + **tRPC** | End-to-end type safety |
| Database | **PostgreSQL** | Reliable, scalable relational data |
| ORM | **Prisma** | Type-safe database access |
| Auth | **NextAuth.js v5** | Flexible authentication |
| Storage | **AWS S3** / **Cloudflare R2** | Document storage, exports |
| Redis | **Upstash Redis** | Caching, rate limiting, sessions |

### 1.3 AI Integration
| Provider | Integration Method | Models Endpoint |
|----------|-------------------|-----------------|
| OpenAI | Direct REST API | `/v1/models` |
| OpenRouter | REST API with key | `/api/v1/models` |
| Gemini | Google AI SDK | `/v1beta/models` |
| Ollama | Local HTTP API | `/api/tags` |

### 1.4 Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting, edge functions |
| **Railway** / **Render** | Database hosting |
| **GitHub Actions** | CI/CD pipeline |

---

## 2. System Architecture

### 2.1 High-Level Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Landing │  │ Dashboard│  │ Generator│  │ Settings │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                    API LAYER (tRPC)                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │    Auth    │ │   AI Gen   │ │  Document  │              │
│  └────────────┘ └────────────┘ └────────────┘              │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐
│ PostgreSQL   │  │   Redis Cache   │  │ AI Providers│
│  (Prisma)    │  │  (Rate Limit)   │  │ (Streaming) │
└──────────────┘  └─────────────────┘  └────────────┘
```

### 2.2 Database Schema

```prisma
// User & Authentication
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  projects      Project[]
  aiSettings    AISettings?
  sessions      Session[]
}

// AI Provider Configuration
model AISettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  provider        String   // openai | openrouter | gemini | ollama
  apiKey          String?  // Encrypted
  baseUrl         String?  // For Ollama/custom endpoints
  defaultModel    String?
  temperature     Float    @default(0.7)
  maxTokens       Int      @default(4000)
  
  // System prompts per document type
  prdSystemPrompt        String?
  techSpecSystemPrompt   String?
  designSpecSystemPrompt String?
  planSystemPrompt       String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Projects (Ideas)
model Project {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title       String
  description String   @db.Text
  status      String   @default("draft") // draft | generating | complete
  
  // Context
  targetAudience String?
  constraints    String? @db.Text
  techStack      String?
  
  documents   Document[]
  brainstormNodes BrainstormNode[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Generated Documents
model Document {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  type        String   // prd | tech-spec | design-spec | plan
  title       String
  content     String   @db.Text
  version     Int      @default(1)
  
  // Metadata
  modelUsed   String?
  tokensUsed  Int?
  generationTimeMs Int?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  versions    DocumentVersion[]
}

// Document Version History
model DocumentVersion {
  id          String   @id @default(cuid())
  documentId  String
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  content     String   @db.Text
  version     Int
  changeSummary String?
  
  createdAt   DateTime @default(now())
}

// Brainstorming Nodes
model BrainstormNode {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  content     String
  type        String   @default("idea") // idea | question | feature | constraint
  x           Float    @default(0)
  y           Float    @default(0)
  parentId    String?
  
  createdAt   DateTime @default(now())
}

// Usage Tracking
model UsageLog {
  id          String   @id @default(cuid())
  userId      String
  provider    String
  model       String
  tokensIn    Int
  tokensOut   Int
  costUsd     Float?
  endpoint    String
  createdAt   DateTime @default(now())
}
```

---

## 3. API Design

### 3.1 tRPC Router Structure
```
routers/
├── _app.ts           # Main router
├── auth.ts           # Authentication procedures
├── ai.ts             # AI generation & streaming
├── project.ts        # CRUD for projects
├── document.ts       # Document management
├── brainstorm.ts     # Brainstorming operations
├── settings.ts       # AI provider settings
└── export.ts         # Export functionality
```

### 3.2 Key Procedures

#### AI Generation
```typescript
// Stream document generation
ai.generateDocument.useMutation({
  input: {
    projectId: string,
    type: 'prd' | 'tech-spec' | 'design-spec' | 'plan',
    context: {
      idea: string,
      audience?: string,
      constraints?: string,
      techStack?: string
    }
  }
})
// Returns: AsyncIterator<{ chunk: string, status: string }>
```

#### Provider Models
```typescript
// Fetch available models from provider
settings.fetchModels.useQuery({
  input: {
    provider: 'openai' | 'openrouter' | 'gemini' | 'ollama',
    apiKey: string,
    baseUrl?: string // For Ollama
  }
})
// Returns: { id: string, name: string, contextWindow: number, pricing?: object }[]
```

---

## 4. AI Provider Integration

### 4.1 OpenAI
```typescript
const openai = new OpenAI({ apiKey: settings.apiKey });

// Streaming completion
const stream = await openai.chat.completions.create({
  model: settings.model,
  messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
  stream: true,
  temperature: settings.temperature,
  max_tokens: settings.maxTokens
});

// Models endpoint
const models = await openai.models.list();
```

### 4.2 OpenRouter
```typescript
// Same OpenAI SDK, different baseURL
const openrouter = new OpenAI({
  apiKey: settings.apiKey,
  baseURL: 'https://openrouter.ai/api/v1'
});

// Models endpoint
fetch('https://openrouter.ai/api/v1/models', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

### 4.3 Gemini
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(settings.apiKey);
const model = genAI.getGenerativeModel({ model: settings.model });

// Streaming
const result = await model.generateContentStream(prompt);

// Models endpoint
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
```

### 4.4 Ollama
```typescript
// Local API
const response = await fetch(`${settings.baseUrl}/api/generate`, {
  method: 'POST',
  body: JSON.stringify({
    model: settings.model,
    prompt: userPrompt,
    system: systemPrompt,
    stream: true
  })
});

// Models endpoint
fetch(`${settings.baseUrl}/api/tags`);
```

---

## 5. Security Considerations

### 5.1 API Key Storage
- Keys encrypted using AES-256-GCM
- Encryption key from environment variable
- Never exposed to client
- Keys stored only server-side

### 5.2 Rate Limiting
```typescript
// Redis-based rate limiting
const rateLimit = {
  anonymous: { requests: 5, window: '1h' },
  authenticated: { requests: 50, window: '1h' },
  ai_generation: { requests: 20, window: '1h' }
};
```

### 5.3 CORS & CSP
```typescript
// Strict CSP for production
const csp = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'"], // Required for some libraries
  'style-src': ["'self'", "'unsafe-inline'"],
  'connect-src': ["'self'", "https://api.openai.com", "https://openrouter.ai"],
  'img-src': ["'self'", "data:", "https:"],
};
```

---

## 6. Performance Optimizations

### 6.1 Caching Strategy
| Layer | TTL | Use Case |
|-------|-----|----------|
| Redis (AI responses) | 1 hour | Identical prompts |
| SWR (Client) | 5 min | Document lists |
| CDN (Static) | 1 year | Assets, fonts |

### 6.2 Database Indexes
```sql
-- Performance critical indexes
CREATE INDEX idx_project_user ON Project(userId, createdAt DESC);
CREATE INDEX idx_document_project ON Document(projectId, type);
CREATE INDEX idx_usage_user ON UsageLog(userId, createdAt DESC);
```

---

## 7. Deployment Pipeline

### 7.1 Git Workflow
```
main (production) ← develop ← feature/*
                         ↑
                    hotfix/*
```

### 7.2 CI/CD Steps
1. **Lint & Type Check** - ESLint, TypeScript
2. **Unit Tests** - Jest, React Testing Library
3. **Build** - Next.js production build
4. **E2E Tests** - Playwright
5. **Deploy Preview** - Vercel preview
6. **Deploy Production** - Vercel production

---

*Document Version: 1.0*
*Last Updated: 2026-01-31*
