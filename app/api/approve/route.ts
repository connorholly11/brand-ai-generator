import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { generateImagesWithRateLimit } from '@/lib/server-utils'
import { DALLE_QUALITY } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { id, indices } = await req.json()
    
    if (!id || !indices || !Array.isArray(indices)) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters' },
        { status: 400 }
      )
    }
    
    // Path to the draft directory and file
    const dir = path.join(process.cwd(), 'public/generated', id)
    const draftPath = path.join(dir, 'draft.json')
    
    // Read and parse the draft file
    const draftContent = await fs.readFile(draftPath, 'utf8')
    const draft = JSON.parse(draftContent)
    
    // Get the selected concepts
    const picks = indices.map((i: number) => draft.concepts[i])
    
    // Extract prompts
    const prompts = picks.map(concept => concept.logoPrompt)
    const names = picks.map(concept => concept.name.replace(/\s+/g, '_'))
    
    // Generate images with rate limiting
    let urls: string[] = []
    
    if (prompts.length <= 10) {
      // For 10 or fewer images, we can generate them directly in parallel
      for (let i = 0; i < prompts.length; i++) {
        try {
          // Generate image using the OpenAI API
          const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: prompts[i],
              n: 1,
              size: "1024x1024",
              quality: DALLE_QUALITY.HD
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error(`Error generating image ${i}:`, error)
            continue
          }
          
          const result = await response.json()
          const remote = result.data[0].url
          
          // Download the image
          const imageResponse = await fetch(remote)
          if (!imageResponse.ok) {
            console.error(`Error downloading image ${i}:`, imageResponse.statusText)
            continue
          }
          
          const buffer = Buffer.from(await imageResponse.arrayBuffer())
          
          // Create a filename based on the concept name
          const filename = `${names[i]}.png`
          const filePath = path.join(dir, filename)
          
          // Save the image to the draft directory
          await fs.writeFile(filePath, buffer)
          
          // Add the URL to the list
          urls.push(`/generated/${id}/${filename}`)
        } catch (error) {
          console.error(`Error processing image ${i}:`, error)
        }
      }
    } else {
      // For more than 10 images, use rate limiting
      urls = await generateImagesWithRateLimit(prompts, id, names, DALLE_QUALITY.HD)
    }
    
    return NextResponse.json({ urls })
    
  } catch (error) {
    console.error('Error generating images:', error)
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}