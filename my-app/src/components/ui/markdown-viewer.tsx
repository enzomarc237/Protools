"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check, FileCode } from "lucide-react"
import { useState } from "react"

interface MarkdownViewerProps {
  content: string
  className?: string
}

// Custom copy button component
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
      title={copied ? "Copied!" : "Copy code"}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks with syntax highlighting
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "")
            const code = String(children).replace(/\n$/, "")
            
            if (!inline && match) {
              return (
                <div className="relative group">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-t-lg">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <FileCode className="w-4 h-4" />
                      <span className="capitalize">{match[1]}</span>
                    </div>
                    <CopyButton code={code} />
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-b-lg !mt-0 !mb-4"
                    showLineNumbers
                    wrapLines
                    {...props}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              )
            }
            
            // Inline code
            return (
              <code
                className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            )
          },

          // Tables with better styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border-collapse border border-slate-200 rounded-lg">
                  {children}
                </table>
              </div>
            )
          },
          thead({ children }) {
            return <thead className="bg-slate-50">{children}</thead>
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-sm text-slate-600 border-b border-slate-100">
                {children}
              </td>
            )
          },

          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-400 pl-4 py-2 my-4 bg-blue-50/50 rounded-r-lg">
                {children}
              </blockquote>
            )
          },

          // Links
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          },

          // Headings with anchor links
          h1({ children }) {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return (
              <h1 
                id={id}
                className="text-3xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200 scroll-mt-24"
              >
                {children}
              </h1>
            )
          },
          h2({ children }) {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return (
              <h2 
                id={id}
                className="text-2xl font-bold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-100 scroll-mt-24"
              >
                {children}
              </h2>
            )
          },
          h3({ children }) {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return (
              <h3 
                id={id}
                className="text-xl font-semibold text-slate-800 mt-6 mb-3 scroll-mt-24"
              >
                {children}
              </h3>
            )
          },
          h4({ children }) {
            const id = String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return (
              <h4 
                id={id}
                className="text-lg font-semibold text-slate-700 mt-5 mb-2 scroll-mt-24"
              >
                {children}
              </h4>
            )
          },

          // Lists
          ul({ children }) {
            return <ul className="list-disc list-outside ml-6 space-y-1 my-4">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-6 space-y-1 my-4">{children}</ol>
          },
          li({ children }) {
            return <li className="text-slate-700">{children}</li>
          },

          // Paragraphs
          p({ children }) {
            return <p className="text-slate-700 leading-relaxed my-4">{children}</p>
          },

          // Horizontal rule
          hr() {
            return <hr className="my-8 border-slate-200" />
          },

          // Strong and emphasis
          strong({ children }) {
            return <strong className="font-semibold text-slate-900">{children}</strong>
          },
          em({ children }) {
            return <em className="italic text-slate-800">{children}</em>
          },

          // Images
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt}
                className="rounded-lg shadow-md my-6 max-w-full"
              />
            )
          },

          // Task lists
          input({ checked }) {
            return (
              <input
                type="checkbox"
                checked={checked}
                readOnly
                className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
