export interface Document {
  id: string
  filename: string
  fileType: string
  pages: number
  uploadedAt: string
  size: number
  vectorized?: boolean
}
