import type { Document } from "@/types/document"

// Simple vector database implementation for browser environments
export class VectorDatabase {
  private documents: Map<string, DocumentVector> = new Map()
  private embeddings: Map<string, number[]> = new Map()
  private model: any = null
  private modelLoading = false
  private modelLoaded = false

  // Initialize the vector database
  async initialize(): Promise<boolean> {
    try {
      // We'll use a simple mock embedding function for now
      // In a real implementation, you would load a TensorFlow.js model here
      this.modelLoaded = true
      return true
    } catch (error) {
      console.error("Failed to initialize vector database:", error)
      return false
    }
  }

  // Check if the database is ready
  isReady(): boolean {
    return this.modelLoaded
  }

  // Add a document to the vector database
  async addDocument(document: Document, content: string): Promise<boolean> {
    try {
      if (!this.modelLoaded) {
        await this.initialize()
      }

      // Generate a simple embedding for the document
      const embedding = await this.generateEmbedding(content)

      // Store the document and its embedding
      const docVector: DocumentVector = {
        id: document.id,
        content,
        metadata: {
          filename: document.filename,
          fileType: document.fileType,
          pages: document.pages,
        },
        chunks: [],
      }

      // For longer documents, split into chunks
      if (content.length > 500) {
        const chunks = this.chunkDocument(content, document.id)
        docVector.chunks = chunks

        // Store embeddings for each chunk
        for (const chunk of chunks) {
          const chunkEmbedding = await this.generateEmbedding(chunk.content)
          this.embeddings.set(chunk.id, chunkEmbedding)
        }
      }

      // Store the document and its main embedding
      this.documents.set(document.id, docVector)
      this.embeddings.set(document.id, embedding)

      return true
    } catch (error) {
      console.error("Error adding document to vector database:", error)
      return false
    }
  }

  // Split a document into chunks
  private chunkDocument(content: string, documentId: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = []
    const chunkSize = 500
    const overlap = 100

    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      const chunkContent = content.substring(i, i + chunkSize)
      if (chunkContent.length < 100) continue // Skip very small chunks

      chunks.push({
        id: `${documentId}_chunk_${chunks.length}`,
        content: chunkContent,
        metadata: {
          parentId: documentId,
          chunkIndex: chunks.length,
        },
      })
    }

    return chunks
  }

  // Generate an embedding for text
  private async generateEmbedding(text: string): Promise<number[]> {
    // This is a very simple mock embedding function
    // In a real implementation, you would use a proper embedding model

    // Create a simple hash-based embedding (not suitable for real semantic search)
    const embedding: number[] = new Array(128).fill(0)

    // Generate some values based on the text content
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i)
      embedding[i % embedding.length] += charCode / 100
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map((val) => val / magnitude)
  }

  // Search for documents similar to a query
  async searchDocuments(query: string, numResults = 5): Promise<SearchResult[]> {
    try {
      if (!this.modelLoaded) {
        await this.initialize()
      }

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query)

      // Calculate similarity scores for all documents and chunks
      const scores: { id: string; score: number; isChunk: boolean }[] = []

      // Score all documents and chunks
      for (const [id, embedding] of this.embeddings.entries()) {
        const similarity = this.cosineSimilarity(queryEmbedding, embedding)
        const isChunk = id.includes("_chunk_")
        scores.push({ id, score: similarity, isChunk })
      }

      // Sort by similarity score (descending)
      scores.sort((a, b) => b.score - a.score)

      // Get the top results
      const results: SearchResult[] = []
      const seenParentIds = new Set<string>()

      for (const { id, score, isChunk } of scores) {
        if (results.length >= numResults) break

        if (isChunk) {
          // This is a document chunk
          const chunkId = id
          const parentId = id.split("_chunk_")[0]

          // Skip if we already have a result from this parent document
          if (seenParentIds.has(parentId)) continue

          const document = this.documents.get(parentId)
          if (!document) continue

          // Find the chunk
          const chunk = document.chunks.find((c) => c.id === chunkId)
          if (!chunk) continue

          results.push({
            id: chunkId,
            documentId: parentId,
            content: chunk.content,
            metadata: {
              ...document.metadata,
              chunkIndex: chunk.metadata.chunkIndex,
            },
            score,
          })

          seenParentIds.add(parentId)
        } else {
          // This is a full document
          const document = this.documents.get(id)
          if (!document || seenParentIds.has(id)) continue

          results.push({
            id,
            documentId: id,
            content: document.content,
            metadata: document.metadata,
            score,
          })

          seenParentIds.add(id)
        }
      }

      return results
    } catch (error) {
      console.error("Error searching vector database:", error)
      return []
    }
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      magnitudeA += a[i] * a[i]
      magnitudeB += b[i] * b[i]
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) return 0

    return dotProduct / (magnitudeA * magnitudeB)
  }
}

// Singleton instance
let vectorDB: VectorDatabase | null = null

// Get the vector database instance
export function getVectorDB(): VectorDatabase {
  if (!vectorDB) {
    vectorDB = new VectorDatabase()
    vectorDB.initialize()
  }
  return vectorDB
}

// Types
interface DocumentVector {
  id: string
  content: string
  metadata: {
    filename: string
    fileType: string
    pages: number
  }
  chunks: DocumentChunk[]
}

interface DocumentChunk {
  id: string
  content: string
  metadata: {
    parentId: string
    chunkIndex: number
  }
}

export interface SearchResult {
  id: string
  documentId: string
  content: string
  metadata: any
  score: number
}
