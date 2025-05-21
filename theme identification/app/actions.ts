"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Server action to generate a response from Gemini
export async function generateResponse(prompt: string): Promise<string> {
  try {
    // Check if API key is available
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return "Error: Google API Key is not configured. Please add your GOOGLE_API_KEY to the environment variables."
    }

    console.log("Initializing Gemini with API key...")

    // Initialize the Google Generative AI with your API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // For this beginner example, we'll use the gemini-pro model
    console.log("Getting generative model: gemini-pro")
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Set some safety settings to ensure appropriate content
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1000,
    }

    // Generate content based on the prompt
    console.log("Generating content with prompt:", prompt.substring(0, 50) + "...")

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    })

    const response = await result.response
    const text = response.text()

    console.log("Successfully generated response")
    return text
  } catch (error) {
    console.error("Error generating response:", error)

    // Provide more helpful error messages based on common issues
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return "Error: Invalid API key. Please check your GOOGLE_API_KEY environment variable."
      } else if (error.message.includes("quota")) {
        return "Error: API quota exceeded. Please try again later or check your Google AI Studio quota limits."
      } else if (error.message.includes("network")) {
        return "Error: Network issue. Please check your internet connection and try again."
      }
      return `Error: ${error.message}`
    }

    return "Error: Unknown error occurred while generating the response."
  }
}
