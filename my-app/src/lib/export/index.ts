import jsPDF from "jspdf"
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"

export type ExportFormat = "markdown" | "pdf" | "docx" | "json"

export async function exportDocument(
  content: string,
  title: string,
  format: ExportFormat
): Promise<Blob> {
  switch (format) {
    case "markdown":
      return new Blob([content], { type: "text/markdown" })

    case "json":
      const json = {
        title,
        content,
        exportedAt: new Date().toISOString(),
      }
      return new Blob([JSON.stringify(json, null, 2)], { type: "application/json" })

    case "pdf":
      return exportToPDF(content, title)

    case "docx":
      return exportToDOCX(content, title)

    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

async function exportToPDF(content: string, title: string): Promise<Blob> {
  // Simple text-based PDF export
  // For production, consider using a more sophisticated markdown-to-PDF solution
  const pdf = new jsPDF()
  
  // Title
  pdf.setFontSize(20)
  pdf.text(title, 20, 30)
  
  // Content (simple line wrapping)
  pdf.setFontSize(12)
  const lines = content.split("\n")
  let y = 50
  const lineHeight = 7
  const maxWidth = 170
  
  for (const line of lines) {
    if (y > 280) {
      pdf.addPage()
      y = 20
    }
    
    const trimmedLine = line.trim()
    
    // Handle headers
    if (trimmedLine.startsWith("# ")) {
      pdf.setFontSize(16)
      pdf.setFont("helvetica", "bold")
      pdf.text(trimmedLine.replace("# ", ""), 20, y)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
    } else if (trimmedLine.startsWith("## ")) {
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(trimmedLine.replace("## ", ""), 20, y)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
    } else if (trimmedLine.startsWith("### ")) {
      pdf.setFontSize(13)
      pdf.setFont("helvetica", "bold")
      pdf.text(trimmedLine.replace("### ", ""), 20, y)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
    } else if (trimmedLine) {
      const splitLines = pdf.splitTextToSize(trimmedLine, maxWidth)
      pdf.text(splitLines, 20, y)
      y += (splitLines.length - 1) * lineHeight
    }
    
    y += lineHeight
  }
  
  return pdf.output("blob")
}

async function exportToDOCX(content: string, title: string): Promise<Blob> {
  const lines = content.split("\n")
  const children: Paragraph[] = []
  
  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  )
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (!trimmedLine) {
      children.push(new Paragraph({ spacing: { after: 200 } }))
      continue
    }
    
    if (trimmedLine.startsWith("# ")) {
      children.push(
        new Paragraph({
          text: trimmedLine.replace("# ", ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      )
    } else if (trimmedLine.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: trimmedLine.replace("## ", ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      )
    } else if (trimmedLine.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: trimmedLine.replace("### ", ""),
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 200 },
        })
      )
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun(trimmedLine)],
          spacing: { after: 200 },
        })
      )
    }
  }
  
  const doc = new Document({
    sections: [{ children }],
  })
  
  return await Packer.toBlob(doc)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
