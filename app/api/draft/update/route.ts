import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// POST /api/draft/update - Update a concept in a draft
export async function POST(req: NextRequest) {
  try {
    const { draftId, index, logoPrompt } = await req.json()
    
    // Validate input
    if (!draftId || index === undefined || !logoPrompt) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    // Path to the draft file
    const filePath = path.join(process.cwd(), 'public/generated', draftId, 'draft.json')
    
    // Check if file exists
    try {
      await fs.access(filePath)
    } catch (error) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }
    
    // Read and parse the draft file
    const fileContent = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    
    // Update the logo prompt
    if (!data.concepts || !data.concepts[index]) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      )
    }
    
    data.concepts[index].logoPrompt = logoPrompt
    
    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(data))
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error updating draft:', error)
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    )
  }
}