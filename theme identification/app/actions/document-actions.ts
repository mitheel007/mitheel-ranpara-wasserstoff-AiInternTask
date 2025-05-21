"use server"

import { v4 as uuidv4 } from "uuid"
import type { Document } from "@/types/document"
import { getVectorDB } from "@/lib/vector-db"

// This is a mock implementation for the demo
// In a real application, this would handle file uploads, OCR, and vector storage
export async function uploadDocuments(formData: FormData): Promise<Document[]> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const files = formData.getAll("documents") as File[]
  const documents: Document[] = []
  const vectorDB = getVectorDB()

  for (const file of files) {
    // Generate random number of pages between 5 and 50
    const pages = Math.floor(Math.random() * 46) + 5

    // Get file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    let fileType = "Unknown"

    if (fileExtension === "pdf") {
      fileType = "PDF"
    } else if (["doc", "docx"].includes(fileExtension)) {
      fileType = "Word"
    } else if (["jpg", "jpeg", "png"].includes(fileExtension)) {
      fileType = "Image"
    } else if (["txt", "md"].includes(fileExtension)) {
      fileType = "Text"
    }

    // Create document object
    const documentId = uuidv4()
    const document: Document = {
      id: documentId,
      filename: file.name,
      fileType,
      pages,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      vectorized: false,
    }

    // For text files, try to vectorize them
    if (["Text"].includes(fileType)) {
      try {
        // Extract text content from the file
        const text = await file.text()

        // Add document to vector database
        const success = await vectorDB.addDocument(document, text)
        document.vectorized = success
      } catch (error) {
        console.error("Error vectorizing document:", error)
        // Continue with the upload even if vectorization fails
      }
    }

    documents.push(document)
  }

  return documents
}
