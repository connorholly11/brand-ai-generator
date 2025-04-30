import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  noStore();
  const { id } = await params;
  const filePath = path.join(
    process.cwd(),
    'public/generated',
    id,
    'draft.json',
  );

  try {
    await fs.access(filePath);
  } catch {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  try {
    const raw = JSON.parse(await fs.readFile(filePath, 'utf8'));

    /** Gracefully handle legacy `{ concepts: { concepts: [...] } }` shape */
    const concepts = Array.isArray(raw.concepts)
      ? raw.concepts
      : raw.concepts?.concepts ?? [];

    return NextResponse.json({ id, brief: raw.brief, concepts });
  } catch (err) {
    console.error('Error reading draft:', err);
    return NextResponse.json(
      { error: 'Failed to read draft' },
      { status: 500 },
    );
  }
}