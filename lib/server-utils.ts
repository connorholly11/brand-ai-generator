import fs from 'fs/promises'
import path from 'path'
import { openai } from './openai'
import { DALLE_QUALITY, ValueOf } from './constants'

// Helper to chunk requests for rate limiting
export async function generateImagesWithRateLimit(
  prompts: string[],
  draftId: string,
  names: string[],
  quality: ValueOf<typeof DALLE_QUALITY> = DALLE_QUALITY.HD
) {
  // DALL-E 3 has a rate limit of about 20 images per minute
  // We'll use batches of 5 to be safe
  const batchSize = 5
  const allUrls: string[] = []
  const dir = path.join(process.cwd(), 'public/generated', draftId)
  
  // Split prompts into chunks of batchSize
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize)
    const batchNames = names.slice(i, i + batchSize)
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (prompt, index) => {
        try {
          // Generate image
          const img = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: quality,
          })
          
          // Download the image
          const remote = img.data[0].url
          const response = await fetch(remote)
          const buffer = Buffer.from(await response.arrayBuffer())
          
          // Create filename based on concept name
          const filename = `${batchNames[index].replace(/\s+/g, '_')}.png`
          const filePath = path.join(dir, filename)
          
          // Save the image
          await writeFileSafe(filePath, buffer)
          
          return `/generated/${draftId}/${filename}`
        } catch (error) {
          console.error(`Error generating image for prompt ${i + index}:`, error)
          return null
        }
      })
    )
    
    // Add successful results to allUrls
    allUrls.push(...batchResults.filter(Boolean) as string[])
    
    // Wait 15 seconds between batches to avoid rate limits
    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 15000))
    }
  }
  
  return allUrls
}

// Safely write a file, creating directories if they don't exist
export async function writeFileSafe(filePath: string, content: string | Buffer) {
  // Ensure the directory exists
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })
  
  // Write the file
  await fs.writeFile(filePath, content)
  
  return filePath
}

// Generate a UUID
export function generateUUID() {
  return crypto.randomUUID()
}