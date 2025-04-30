import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { openai } from '@/lib/openai';
import { unstable_noStore as noStore } from 'next/cache';

export async function POST(req: NextRequest) {
  noStore();
  try {
    const { brief, n = 10 } = await req.json();

    if (!brief || brief.trim() === '') {
      return NextResponse.json(
        { error: 'Brief is required' },
        { status: 400 }
      );
    }

    console.log('Generating concepts with brief:', brief, 'and count:', n);

    // Make sure we're really using the OpenAI key
    const apiKey = process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY;
    if (!apiKey) {
      console.error('Missing OpenAI API key');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const sys =
      'You are a top-tier brand strategist and logo designer. Reply ONLY in valid JSON matching ' +
      'this schema: { "concepts": [ { "name": string, "slogan": string, "logoPrompt": string } ] }. ' +
      'For each concept: ' +
      '1. "name" should be a catchy, distinctive brand name of 1-2 syllables ' +
      '2. "slogan" should be a compelling tagline of 3-8 words ' +
      '3. "logoPrompt" should be a detailed description for generating a professional logo, including: ' +
      '   - Clear instruction that this is a company/brand logo ' +
      '   - The brand name in the logo design ' +
      '   - Visual style, colors, and imagery inspired by the brand brief ' +
      '   - Professional design elements (shapes, typography, layout) ' +
      'Each logo prompt should be highly detailed for DALL-E 3 logo generation. Include the word "json" in your response.';
      
    const user = `Create ${n} unique brand concepts based on this brief: "${brief}". 
      Each concept should include:
      - A distinctive brand name (max 2 syllables)
      - A memorable slogan (3-8 words)
      - A detailed logo prompt that specifies this is for logo design, includes the brand name prominently, 
        and provides specific details about style, color scheme, imagery, and layout.
      
      The logo prompts should be optimized for DALL-E 3 image generation and should create professional, 
      modern logos that prominently include the brand name and reflect the brand's personality.
      
      Return as JSON only.`;

    try {
      const chat = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
      });

      const content = chat.choices[0].message.content;
      console.log('API response content:', content);

      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse the response
      const parsed = JSON.parse(content);
      console.log('Parsed response:', parsed);

      if (!parsed.concepts || !Array.isArray(parsed.concepts)) {
        throw new Error('Invalid response format: missing concepts array');
      }

      // Enhance the logo prompts to ensure they're optimized for logos
      const concepts = parsed.concepts.map(concept => {
        // Make sure the logo prompt includes the brand name and is clear it's a logo
        const enhancedLogoPrompt = 
          `Create a professional business logo for "${concept.name}" brand. ` +
          `The logo should include the brand name "${concept.name}" prominently, ` +
          `and it should reflect the brand's slogan: "${concept.slogan}". ` +
          concept.logoPrompt + 
          ` Make this a clean, professional logo design suitable for business use.`;
        
        return {
          ...concept,
          logoPrompt: enhancedLogoPrompt
        };
      });

      // Create a unique ID for this draft
      const id = crypto.randomUUID();
      const dir = path.join(process.cwd(), 'public/generated', id);
      await fs.mkdir(dir, { recursive: true });

      // Save draft data
      await fs.writeFile(
        path.join(dir, 'draft.json'),
        JSON.stringify({ brief, concepts })
      );

      return NextResponse.json({ id, concepts });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(
        { error: `OpenAI API error: ${openaiError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in draft creation:', error);
    return NextResponse.json(
      { error: `Failed to generate brand concepts: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}