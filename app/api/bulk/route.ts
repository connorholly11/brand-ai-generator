import { NextRequest, NextResponse } from 'next/server';
import { generateImagesWithRateLimit } from '@/lib/server-utils';
import { DALLE_QUALITY } from '@/lib/constants';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const { prompts } = await req.json();               // array<string>

  if (!Array.isArray(prompts) || prompts.length === 0)
    return NextResponse.json({ error: 'No prompts' }, { status: 400 });

  const id = crypto.randomUUID();
  const dir = path.join(process.cwd(), 'public/generated', id);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(`${dir}/batch.json`, JSON.stringify({ prompts }));

  // fabricate filenames "image-01.png", "image-02.png", … for now
  const names = prompts.map((_, i) => `image-${String(i + 1).padStart(2, '0')}`);

  const urls = await generateImagesWithRateLimit(
    prompts,
    id,
    names,
    DALLE_QUALITY.HD,              // square 1024×1024 HD
  );

  return NextResponse.json({ id, urls });
}