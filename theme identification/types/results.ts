export interface DocumentResult {
  documentId: string
  documentName: string
  query: string
  answer: string
  citation: string
}

export interface ThemeResult {
  name: string
  description: string
  documentIds: string[]
}

export interface QueryResults {
  documentResults: DocumentResult[]
  themeResults: ThemeResult[]
}
