"use client"

import { useEffect, useState } from "react"
import { List } from "lucide-react"

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Extract headings from markdown content
    const lines = content.split("\n")
    const items: TOCItem[] = []
    
    lines.forEach((line) => {
      const match = line.match(/^(#{2,4})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
        items.push({ id, text, level })
      }
    })
    
    setHeadings(items)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-100px 0px -60% 0px" }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (headings.length === 0) return null

  return (
    <div className="hidden xl:block w-64 flex-shrink-0">
      <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-medium">
          <List className="w-4 h-4" />
          <span>Contents</span>
        </div>
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors ${
                activeId === heading.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              style={{ paddingLeft: `${(heading.level - 2) * 12 + 8}px` }}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
