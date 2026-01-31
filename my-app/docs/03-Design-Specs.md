# Design Specifications
## SpecForge - Visual Design System

---

## 1. Design Philosophy

**Aesthetic Direction:** "Intelligent Minimalism with Depth"

A refined, professional aesthetic that communicates sophistication and trustworthiness. The design balances clean minimalism with subtle depth cues - floating cards, soft gradients, and purposeful motion that guides without overwhelming.

**Key Principles:**
- **Clarity First:** Every element serves a purpose
- **Progressive Disclosure:** Complexity revealed gradually
- **Delightful Details:** Micro-interactions that reward exploration
- **Professional Polish:** Enterprise-grade appearance

---

## 2. Color System

### 2.1 Primary Palette
```css
:root {
  /* Brand Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;  /* Primary Blue */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Accent Colors */
  --color-accent-cyan: #06b6d4;
  --color-accent-purple: #8b5cf6;
  --color-accent-emerald: #10b981;
  --color-accent-amber: #f59e0b;
  --color-accent-rose: #f43f5e;

  /* Neutral Scale */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;
}
```

### 2.2 Semantic Colors
```css
:root {
  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-elevated: #ffffff;
  --bg-dark: #0f172a;

  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  --text-inverse: #ffffff;

  /* Borders */
  --border-light: #e2e8f0;
  --border-medium: #cbd5e1;
  --border-focus: #3b82f6;

  /* Status */
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-error: #ef4444;
  --status-info: #3b82f6;
}
```

### 2.3 Gradient Definitions
```css
:root {
  /* Hero Gradient */
  --gradient-hero: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 50%,
    #f093fb 100%
  );

  /* Card Gradient (subtle) */
  --gradient-card: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 100%
  );

  /* Button Gradient */
  --gradient-button: linear-gradient(
    135deg,
    #3b82f6 0%,
    #8b5cf6 100%
  );

  /* Background Mesh */
  --gradient-mesh: 
    radial-gradient(at 40% 20%, hsla(217,91%,60%,0.1) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(258,90%,66%,0.1) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(190,90%,60%,0.1) 0px, transparent 50%),
    radial-gradient(at 80% 50%, hsla(280,90%,66%,0.1) 0px, transparent 50%),
    radial-gradient(at 0% 100%, hsla(217,91%,60%,0.1) 0px, transparent 50%);
}
```

---

## 3. Typography

### 3.1 Font Families
```css
:root {
  /* Display/Headings - Distinctive */
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  
  /* Body - Highly readable */
  --font-body: 'Inter', system-ui, sans-serif;
  
  /* Mono - Code/Data */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 3.2 Type Scale
| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Display** | 4.5rem (72px) | 700 | 1.0 | -0.02em | Hero headlines |
| **H1** | 3rem (48px) | 700 | 1.1 | -0.02em | Page titles |
| **H2** | 2.25rem (36px) | 600 | 1.2 | -0.01em | Section headers |
| **H3** | 1.5rem (24px) | 600 | 1.3 | 0 | Card titles |
| **H4** | 1.25rem (20px) | 600 | 1.4 | 0 | Subsection |
| **H5** | 1.125rem (18px) | 500 | 1.5 | 0 | Labels |
| **Body Large** | 1.125rem (18px) | 400 | 1.6 | 0 | Intro text |
| **Body** | 1rem (16px) | 400 | 1.6 | 0 | Primary text |
| **Body Small** | 0.875rem (14px) | 400 | 1.5 | 0 | Secondary text |
| **Caption** | 0.75rem (12px) | 500 | 1.4 | 0.01em | Meta, badges |
| **Overline** | 0.75rem (12px) | 600 | 1.4 | 0.08em | Labels, uppercase |
```

### 3.3 Typography Patterns
```css
/* Hero Text */
.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-display);
  font-weight: 700;
  background: var(--gradient-hero);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

/* Section Header */
.section-title {
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--text-primary);
}

/* Document Title */
.doc-title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--text-primary);
}
```

---

## 4. Spacing System

### 4.1 Base Unit: 4px
| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing, icons |
| `space-2` | 8px | Related elements |
| `space-3` | 12px | Form labels, small gaps |
| `space-4` | 16px | Default padding, card gaps |
| `space-5` | 20px | Medium spacing |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Large gaps |
| `space-10` | 40px | Section separators |
| `space-12` | 48px | Major sections |
| `space-16` | 64px | Page sections |
| `space-20` | 80px | Hero spacing |
| `space-24` | 96px | Large sections |

### 4.2 Container Widths
```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}
```

---

## 5. Components

### 5.1 Buttons

**Primary Button**
```css
.btn-primary {
  background: var(--gradient-button);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.39);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}
.btn-primary:active {
  transform: translateY(0);
}
```

**Secondary Button**
```css
.btn-secondary {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--border-focus);
}
```

**Ghost Button**
```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-ghost:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
```

### 5.2 Cards

**Standard Card**
```css
.card {
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}
.card:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
```

**Elevated Card**
```css
.card-elevated {
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.05);
}
```

### 5.3 Inputs

**Text Input**
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: white;
}
.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.input::placeholder {
  color: var(--text-tertiary);
}
```

**Textarea**
```css
.textarea {
  min-height: 120px;
  resize: vertical;
}
```

### 5.4 Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
.badge-blue {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}
.badge-green {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-accent-emerald);
}
.badge-purple {
  background: rgba(139, 92, 246, 0.1);
  color: var(--color-accent-purple);
}
```

---

## 6. Layout Patterns

### 6.1 Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│                     Navigation Bar                          │  64px
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Main Content                           │  Flexible
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                       Footer                                │  Auto
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Dashboard Grid
```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar  │  Header                                          │
│  260px    ├──────────────────────────────────────────────────┤
│           │  Stats Cards                                     │
│           │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│           │  │      │ │      │ │      │ │      │           │
│           │  └──────┘ └──────┘ └──────┘ └──────┘           │
│           │                                                  │
│           │  Recent Projects          Quick Actions          │
│           │  ┌─────────────────────┐  ┌────────────┐        │
│           │  │                     │  │            │        │
│           │  │                     │  │            │        │
│           │  └─────────────────────┘  └────────────┘        │
│           │                                                  │
└───────────┴──────────────────────────────────────────────────┘
```

### 6.3 Document Editor
```
┌─────────────────────────────────────────────────────────────┐
│  Toolbar: [Tab: PRD] [Tab: Tech Spec] [Tab: Design] [...]   │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│     Markdown Editor      │      Preview Panel               │
│     (Monaco/Custom)      │      (Rendered MDX)              │
│                          │                                  │
│                          │                                  │
├──────────────────────────┴──────────────────────────────────┤
│  [Save] [Regenerate] [Export ▼] [Version History]          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Animation & Motion

### 7.1 Timing Functions
```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### 7.2 Durations
```css
:root {
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
}
```

### 7.3 Key Animations

**Fade In Up (Entrance)**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s var(--ease-out) forwards;
}
```

**Stagger Children**
```css
@keyframes staggerFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.stagger-children > * {
  animation: staggerFadeIn 0.4s var(--ease-out) forwards;
  opacity: 0;
}
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 100ms; }
.stagger-children > *:nth-child(3) { animation-delay: 200ms; }
/* ... continue pattern */
```

**Pulse (Loading)**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s var(--ease-default) infinite;
}
```

**Shimmer (Skeleton)**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 7.4 Scroll Animations
```typescript
// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1]
    }
  }
};
```

---

## 8. Responsive Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

### Responsive Behavior
| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Navigation | Hamburger | Sidebar | Sidebar |
| Dashboard Grid | 1 col | 2 col | 3-4 col |
| Document Editor | Stacked tabs | Split view | Split view |
| Font Size | -10% | Base | Base |
| Container Padding | 16px | 24px | 32px |

---

## 9. Icon System

**Library:** Lucide React
**Size Scale:** 16px, 20px, 24px, 32px

### Icon Usage
```tsx
// Standard icons
<Home size={20} />
<Settings size={20} />
<Sparkles size={24} className="text-primary" />

// Status icons
<CheckCircle size={16} className="text-green-500" />
<AlertCircle size={16} className="text-red-500" />
<Loader2 size={16} className="animate-spin" />
```

---

## 10. Dark Mode (Future)

```css
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #64748b;
  --border-light: #334155;
  --border-medium: #475569;
}
```

---

*Document Version: 1.0*
*Last Updated: 2026-01-31*
