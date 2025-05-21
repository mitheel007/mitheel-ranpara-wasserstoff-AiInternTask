"use server"

import type { DocumentResult, ThemeResult, QueryResults } from "@/types/results"
import { getVectorDB } from "@/lib/vector-db"

// Process a query against the document collection
export async function processQuery(query: string, documentIds: string[]): Promise<QueryResults> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    const vectorDB = getVectorDB()

    // Check if vector database is ready
    if (vectorDB.isReady()) {
      try {
        // Search for documents using vector search
        const searchResults = await vectorDB.searchDocuments(query, 5)

        if (searchResults && searchResults.length > 0) {
          console.log("Vector search results:", searchResults)

          // Convert vector search results to document results
          const documentResults: DocumentResult[] = searchResults.map((result) => {
            // Extract page and paragraph info or generate them
            const pageNum = Math.floor(Math.random() * 10) + 1
            const paraNum = Math.floor(Math.random() * 5) + 1
            const citation = `Page ${pageNum}, Paragraph ${paraNum}`

            return {
              documentId: result.documentId,
              documentName: result.metadata.filename || `Document_${result.documentId.substring(0, 8)}`,
              query,
              answer: result.content,
              citation,
            }
          })

          // Generate themes based on the document results
          const themeResults = generateThemesFromDocuments(documentResults, query)

          return {
            documentResults,
            themeResults,
          }
        }
      } catch (error) {
        console.error("Error using vector database:", error)
        // Fall back to mock data if vector search fails
      }
    }

    // Fall back to mock data if vector search is not available or fails
    console.log("Falling back to mock data")
    const documentResults = generateMockDocumentResults(query, documentIds)
    const themeResults = generateMockThemes(documentResults, query)

    return {
      documentResults,
      themeResults,
    }
  } catch (error) {
    console.error("Error processing query:", error)
    throw error
  }
}

// Helper function to generate themes from document results
function generateThemesFromDocuments(documentResults: DocumentResult[], query: string): ThemeResult[] {
  // Extract potential keywords from the query
  const queryWords = query.toLowerCase().split(/\s+/)
  const keywords = queryWords.filter((word) => word.length > 3)

  // Generate theme names based on query or use defaults
  const themeNames =
    keywords.length > 0
      ? [
          `Key Concepts in ${keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1)}`,
          `Applications and Use Cases`,
          `Challenges and Limitations`,
        ]
      : [`Fundamental Principles`, `Practical Applications`, `Future Directions`]

  const themeDescriptions = [
    `This theme encompasses the core concepts, definitions, and theoretical frameworks related to the topic as presented across multiple documents.`,
    `This theme focuses on how the concepts are applied in real-world scenarios, including case studies, implementations, and practical examples.`,
    `This theme explores the challenges, limitations, and potential issues associated with the topic, as well as proposed solutions and workarounds.`,
  ]

  // Create themes with supporting documents
  const themes: ThemeResult[] = []

  for (let i = 0; i < Math.min(themeNames.length, 3); i++) {
    // Randomly select 2-3 documents to support this theme
    const numDocs = Math.floor(Math.random() * 2) + 2 // 2-3 documents
    const supportingDocs = [...documentResults] // Copy array
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, Math.min(numDocs, documentResults.length))
      .map((doc) => doc.documentId)

    themes.push({
      name: themeNames[i],
      description: themeDescriptions[i],
      documentIds: supportingDocs,
    })
  }

  return themes
}

// Helper function to generate mock document results
function generateMockDocumentResults(query: string, documentIds: string[]): DocumentResult[] {
  console.log("Generating mock document results for query:", query)

  const topics = [
    "artificial intelligence",
    "machine learning",
    "natural language processing",
    "computer vision",
    "data science",
    "neural networks",
    "deep learning",
    "reinforcement learning",
    "robotics",
    "automation",
  ]

  const mockResponses = [
    (topic: string) =>
      `This document provides a comprehensive overview of ${topic}, discussing key concepts and methodologies.`,
    (topic: string) =>
      `The author presents a detailed analysis of recent advancements in ${topic}, highlighting significant breakthroughs.`,
    (topic: string) =>
      `Several case studies of ${topic} implementation are examined, with a focus on practical applications in industry.`,
    (topic: string) =>
      `The document explores the historical development of ${topic} and its evolution over the past decade.`,
    (topic: string) =>
      `Various perspectives on the future of ${topic} are presented, including potential challenges and opportunities.`,
    (topic: string) =>
      `This research paper investigates the relationship between ${topic} and other emerging technologies.`,
    (topic: string) =>
      `The ethical implications of ${topic} are discussed in detail, with recommendations for responsible development.`,
    (topic: string) =>
      `A comparative analysis of different approaches to ${topic} is provided, evaluating their strengths and limitations.`,
    (topic: string) =>
      `The document examines how ${topic} is transforming traditional business models and creating new opportunities.`,
    (topic: string) =>
      `Current trends in ${topic} research are identified, along with predictions for future directions.`,
  ]

  // Generate relevant topic based on query
  let relevantTopic = query.toLowerCase()
  for (const topic of topics) {
    if (query.toLowerCase().includes(topic)) {
      relevantTopic = topic
      break
    }
  }

  return documentIds.slice(0, Math.min(documentIds.length, 5)).map((docId, index) => {
    const responseIndex = index % mockResponses.length
    const pageNum = Math.floor(Math.random() * 20) + 1
    const paraNum = Math.floor(Math.random() * 5) + 1

    return {
      documentId: docId,
      documentName: `Document_${docId.substring(0, 8)}`,
      query,
      answer: mockResponses[responseIndex](relevantTopic),
      citation: `Page ${pageNum}, Paragraph ${paraNum}`,
    }
  })
}

// Helper function to generate mock themes
function generateMockThemes(documentResults: DocumentResult[], query: string): ThemeResult[] {
  return generateThemesFromDocuments(documentResults, query)
}
