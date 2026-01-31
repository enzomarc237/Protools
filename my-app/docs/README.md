# SpecForge - Project Documentation

## Overview
A comprehensive AI-powered platform for transforming simple ideas into production-ready product documentation.

**Live URL:** http://localhost:3000 (development)

---

## 📋 Documentation Files

| Document | Description | Status |
|----------|-------------|--------|
| [01-PRD.md](./01-PRD.md) | Product Requirements Document | ✅ Complete |
| [02-Technical-Specs.md](./02-Technical-Specs.md) | Technical architecture & API design | ✅ Complete |
| [03-Design-Specs.md](./03-Design-Specs.md) | Visual design system | ✅ Complete |
| [04-Implementation-Plan.md](./04-Implementation-Plan.md) | Development roadmap | ✅ Complete |
| [05-Task-Plan.md](./05-Task-Plan.md) | Session tracking | ✅ Complete |

---

## ✨ Implemented Features

### 1. **Authentication System**
- Email/password authentication with NextAuth.js v5
- Registration and login flows
- Protected routes
- Demo account: `demo@example.com` / `password`

### 2. **Landing Page**
- Animated hero section with gradient effects
- Feature showcase with scroll animations
- How it works section
- Responsive design

### 3. **Dashboard**
- Project list with search functionality
- Grid and list view toggle
- Project stats (total projects, documents)
- Quick actions
- Project deletion

### 4. **Document Generator**
- 3-step wizard for creating projects
- **Templates:** SaaS, Mobile App, E-commerce, API Service, Marketplace, AI Tool
- Context inputs: target audience, constraints, tech stack
- Multi-select document types (PRD, Tech Spec, Design Spec, Implementation Plan)
- Progress tracking during generation

### 5. **AI Provider Settings**
- **Supported Providers:** OpenAI, OpenRouter, Gemini, Ollama
- API key management (encrypted at rest)
- Dynamic model fetching with "Fetch Models" button
- Connection testing
- Temperature and max tokens controls
- Custom system prompts per document type

### 6. **Project Viewer**
- Tabbed document navigation
- Document preview with Markdown rendering
- **Document editing** with save functionality
- **Version history** tracking
- Document deletion
- Project deletion
- Export formats: **Markdown, PDF, DOCX, JSON**

### 7. **Brainstorming Canvas**
- **AI-powered idea generation**
- **Idea expansion** (branching)
- Draggable nodes (ideas, features, questions, constraints, goals)
- **Canvas panning** (hold Space + drag)
- Loading states during AI generation
- Visual connections between nearby ideas
- Clear canvas functionality

### 8. **UI/UX Enhancements**
- Toast notifications (sonner)
- Loading spinners
- Responsive sidebar navigation
- Mobile-friendly design
- Keyboard shortcuts (Space for pan mode)

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| State Management | tRPC + TanStack Query |
| Database | SQLite (Prisma ORM) |
| Auth | NextAuth.js v5 |
| API | tRPC |
| Animation | Framer Motion |
| Icons | Lucide React |
| Export | jsPDF, docx |

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup database
export DATABASE_URL="file:./prisma/dev.db"
pnpm exec prisma migrate dev
pnpm exec prisma db seed

# Run development server
pnpm dev

# Open http://localhost:3000
```

---

## 📁 Project Structure

```
my-app/
├── docs/                       # Documentation
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── dev.db                 # SQLite database
├── src/
│   ├── app/
│   │   ├── (landing)/         # Public landing page
│   │   ├── (app)/             # Protected app routes
│   │   │   ├── dashboard/     # Project dashboard
│   │   │   ├── generate/      # Document generator
│   │   │   ├── project/[id]/  # Project viewer
│   │   │   ├── brainstorm/    # Brainstorming canvas
│   │   │   └── settings/      # AI provider settings
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth routes
│   │   │   └── trpc/          # tRPC API
│   │   └── auth/              # Auth pages
│   ├── components/
│   │   ├── ui/                # UI components
│   │   ├── dashboard/         # Dashboard components
│   │   └── providers/         # App providers
│   ├── lib/
│   │   ├── export/            # Export utilities
│   │   ├── templates.ts       # Document templates
│   │   ├── prisma.ts          # Prisma client
│   │   └── trpc.ts            # tRPC client
│   └── server/
│       ├── ai/
│       │   ├── providers/     # AI provider implementations
│       │   └── service.ts     # AI service layer
│       ├── api/
│       │   └── routers/       # tRPC routers
│       └── auth/              # Auth configuration
├── public/                     # Static assets
├── .env.local                  # Environment variables
└── package.json
```

---

## ⚙️ Environment Variables

```env
# Required
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="file:/absolute/path/to/prisma/dev.db"

# Optional (for email)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
EMAIL_FROM=""

# Optional (for rate limiting)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Encryption key for API keys
ENCRYPTION_KEY="your-32-char-encryption-key"
```

---

## 🎯 Git Workflow

```
main (production, protected)
  ↑
develop (integration branch)
  ↑
feature/* (individual features)
```

**Commit Convention:** `type(scope): subject`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 🧪 Testing

### Demo Credentials
- **Email:** `demo@example.com`
- **Password:** `password`

### Test Flows
1. **Landing → Sign Up → Dashboard → New Project → Generate → View Documents**
2. **Settings → Configure AI Provider → Test Connection → Save**
3. **Brainstorm → Generate Ideas → Expand Idea → Pan Canvas**

---

## 📝 API Routes

| Route | Description |
|-------|-------------|
| `/api/trpc` | tRPC API endpoint |
| `/api/auth/*` | NextAuth authentication |
| `/api/auth/register` | User registration |

---

## 🔧 Troubleshooting

### Database "readonly" error
```bash
chmod -R 777 prisma/
```

### Prisma Client not found
```bash
pnpm exec prisma generate
```

### Node modules issues
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 🚧 Future Enhancements

- [ ] Team collaboration (shared projects)
- [ ] Real-time collaborative brainstorming
- [ ] AI chat interface for document refinement
- [ ] Custom export templates
- [ ] Dark mode
- [ ] Project sharing (public links)
- [ ] Comments and annotations
- [ ] GitHub/GitLab integration
- [ ] Mobile app

---

## 📄 License

MIT License - See LICENSE file

---

*Built with ❤️ using Next.js, TypeScript, and AI* 🤖
