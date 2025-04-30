import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { unstable_noStore as noStore } from 'next/cache'

// GET /api/files - List all draft folders
// GET /api/files?id=<draft-id> - List files in a specific draft folder
export async function GET(req: NextRequest) {
  noStore()
  
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    const baseDir = path.join(process.cwd(), 'public/generated')
    
    // Ensure the generated directory exists
    try {
      await fs.access(baseDir)
    } catch {
      await fs.mkdir(baseDir, { recursive: true })
      return NextResponse.json({ drafts: [] })
    }
    
    // If an ID is provided, list files in that specific draft folder
    if (id) {
      const draftDir = path.join(baseDir, id)
      
      try {
        await fs.access(draftDir)
      } catch {
        return NextResponse.json(
          { error: 'Draft folder not found' },
          { status: 404 }
        )
      }
      
      // Get all files in the draft directory
      const files = await fs.readdir(draftDir)
      
      // Filter out non-image files (keep only .png, .jpg, etc.)
      const imageFiles = files.filter(file => 
        /\.(png|jpe?g|gif|webp)$/i.test(file) && file !== 'draft.json'
      )
      
      // Convert to URLs
      const urls = imageFiles.map(file => `/generated/${id}/${file}`)
      
      return NextResponse.json({ urls })
    }
    
    // Otherwise, list all draft folders
    const drafts = []
    const folders = await fs.readdir(baseDir)
    
    for (const folder of folders) {
      const draftDir = path.join(baseDir, folder)
      const stats = await fs.stat(draftDir)
      
      if (stats.isDirectory()) {
        try {
          // Try to read the draft.json file
          const draftPath = path.join(draftDir, 'draft.json')
          const draftContent = await fs.readFile(draftPath, 'utf8')
          const draftData = JSON.parse(draftContent)
          
          // Find a preview image (first PNG)
          const files = await fs.readdir(draftDir)
          const previewImage = files.find(file => /\.png$/i.test(file) && file !== 'draft.json')
          
          drafts.push({
            id: folder,
            brief: draftData.brief,
            previewImage: previewImage ? `/generated/${folder}/${previewImage}` : null,
          })
        } catch (error) {
          // Skip folders without draft.json
          console.error(`Error reading draft in ${folder}:`, error)
        }
      }
    }
    
    return NextResponse.json({ drafts })
    
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}