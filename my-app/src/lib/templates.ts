export interface Template {
  id: string
  title: string
  description: string
  category: "saas" | "mobile" | "web" | "api" | "other"
  defaultData: {
    title: string
    description: string
    targetAudience?: string
    techStack?: string
    constraints?: string
  }
}

export const templates: Template[] = [
  {
    id: "saas-product",
    title: "SaaS Product",
    description: "A software-as-a-service product with subscription billing",
    category: "saas",
    defaultData: {
      title: "SaaS Product",
      description: "A cloud-based software solution that helps businesses streamline their operations through automation and real-time collaboration features.",
      targetAudience: "Small to medium businesses, teams of 10-100 people",
      techStack: "Next.js, TypeScript, PostgreSQL, Stripe, AWS",
      constraints: "Must support multi-tenancy, GDPR compliance, 99.9% uptime SLA",
    },
  },
  {
    id: "mobile-app",
    title: "Mobile App",
    description: "iOS and Android mobile application",
    category: "mobile",
    defaultData: {
      title: "Mobile Application",
      description: "A cross-platform mobile app that provides on-the-go access to core features with offline support and real-time sync.",
      targetAudience: "Consumers aged 18-45, both iOS and Android users",
      techStack: "React Native, TypeScript, Firebase, Node.js",
      constraints: "Must work offline, support both platforms, app store approval requirements",
    },
  },
  {
    id: "ecommerce",
    title: "E-commerce Platform",
    description: "Online store with payment processing",
    category: "web",
    defaultData: {
      title: "E-commerce Platform",
      description: "A full-featured online marketplace with product management, shopping cart, payment processing, and order management.",
      targetAudience: "Online shoppers, small business owners",
      techStack: "Next.js, Node.js, PostgreSQL, Stripe, Redis",
      constraints: "PCI compliance, multi-currency support, inventory management",
    },
  },
  {
    id: "api-service",
    title: "API Service",
    description: "RESTful API for developers",
    category: "api",
    defaultData: {
      title: "Developer API Service",
      description: "A robust REST API that provides developers with programmatic access to core functionality with rate limiting and comprehensive documentation.",
      targetAudience: "Software developers, third-party integrators",
      techStack: "Node.js, Express, PostgreSQL, Redis, Docker",
      constraints: "Rate limiting, backward compatibility, 99.99% uptime, API versioning",
    },
  },
  {
    id: "marketplace",
    title: "Two-sided Marketplace",
    description: "Platform connecting buyers and sellers",
    category: "web",
    defaultData: {
      title: "Two-sided Marketplace",
      description: "A platform that connects service providers with customers, featuring booking, payments, reviews, and dispute resolution.",
      targetAudience: "Service providers and customers in specific niche",
      techStack: "Next.js, Node.js, PostgreSQL, Stripe, AWS S3",
      constraints: "Trust and safety features, payment escrow, dispute resolution, KYC compliance",
    },
  },
  {
    id: "ai-tool",
    title: "AI-powered Tool",
    description: "Product leveraging AI/ML capabilities",
    category: "saas",
    defaultData: {
      title: "AI Content Assistant",
      description: "An AI-powered tool that helps users create, edit, and optimize content using natural language processing and machine learning.",
      targetAudience: "Content creators, marketers, writers",
      techStack: "Next.js, Python, OpenAI API, PostgreSQL, Redis",
      constraints: "AI cost management, content moderation, user data privacy, rate limiting",
    },
  },
]

export const categories = [
  { id: "all", label: "All Templates" },
  { id: "saas", label: "SaaS" },
  { id: "mobile", label: "Mobile" },
  { id: "web", label: "Web" },
  { id: "api", label: "API" },
  { id: "other", label: "Other" },
] as const
