Below is a clean “hand-off” doc you can drop into a GitHub issue for your dev.  
It keeps everything **local-only**, drops auth, and sticks to the exact four-screen flow you described.

---

## 1 Screen flow (no tables, just the story)

**/new** – *Input*  
- One big textarea for your brand brief (“vibe, must-use words, colors, etc.”).  
- A numeric input for “how many variants” (default 10).  
- **Generate Draft** button.

**/draft/:id** – *Edit & Approve*  
- For each variant: a compact card showing **Name**, **Slogan**, and an editable **Logo Prompt** field.  
- Inline editing (auto-save to local store).  
- Per-card **Approve ✓** and a global **Approve All**.  
- “Back to Brief” link for tweaks.

**/draft/:id/images** – *Result Gallery*  
- As soon as you approve, the API fires OpenAI Images (DALL-E 3).  
- Show a responsive grid of the PNGs.  
- Each tile: click to download; long-press (mobile) or hover shows the text prompt.  
- **Save All** button writes the PNGs to `/public/generated/<id>/`.  
- “Go to Library” link.

**/library** – *Saved images*  
- Scans `/public/generated/` and renders every previous draft folder (headline + thumbnails).  
- Click a set to reopen its gallery.

---

## 2 Stack & file-system layout

- **Next.js 15** with the App Router (keeps API + pages in one repo).  
- **Tailwind CSS** for instant styling.  
- **Zustand** for client state (edits / approvals) – no DB.  
- **OpenAI Node SDK** for chat + image calls.  
- Local storage under  
  ```
  public
  └─ generated
     └─ <draft-uuid>
        ├─ draft.json      // original prompt + concepts
        └─ *.png           // generated logos
  ```

---

## 3 Key API routes (concise TypeScript sketches)

### POST /api/draft  → create concepts
```ts
import fs from "fs/promises";
import path from "path";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const { brief, n = 10 } = await req.json();
  const sys = "You are a brand ideation engine.";
  const user = `Create ${n} brand concepts (name ≤2 syllables, slogan ≤10 words, logoPrompt) for: ${brief}`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: sys }, { role: "user", content: user }],
    response_format: { type: "json_object" },
  });
  const concepts = JSON.parse(chat.choices[0].message.content);

  const id = crypto.randomUUID();
  const dir = path.join(process.cwd(), "public/generated", id);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "draft.json"), JSON.stringify({ brief, concepts }));

  return Response.json({ id, concepts });
}
```

### POST /api/approve  → generate images
```ts
export async function POST(req: Request) {
  const { id, indices } = await req.json();          // indices of approved rows
  const dir = `public/generated/${id}`;
  const draft = JSON.parse(await fs.readFile(`${dir}/draft.json`, "utf8"));
  const picks = indices.map((i: number) => draft.concepts[i]);

  const urls = [];
  for (const c of picks) {
    const img = await openai.images.generate({
      model: "dall-e-3",
      prompt: c.logoPrompt,
      n: 1,
      size: "1024x1024",
    });
    const remote = img.data[0].url;
    const buf = Buffer.from(await fetch(remote).then(r => r.arrayBuffer()));
    const file = `${c.name.replace(/\s+/g, "_")}.png`;
    await fs.writeFile(`${dir}/${file}`, buf);
    urls.push(`/generated/${id}/${file}`);
  }

  return Response.json({ urls });
}
```

*(GET handlers simply stream the JSON or directory contents; omit for brevity.)*

---

## 4 Frontend component outline

1. **BriefForm.tsx** – controlled textarea + “Generate Draft.”  
2. **ConceptCard.tsx** – editable fields, Approve toggle (Zustand).  
3. **Gallery.tsx** – reads `/api/files?id=` to pull PNG paths; lightweight masonry grid.  
4. **Library.tsx** – `fs.readdir` on `/generated` (via API) → thumbnail list.

---

## 5 Implementation tips & guardrails

- **Hot reload & new images** – call `unstable_noStore()` in the gallery loader or use Next 15’s revalidatePath so freshly written PNGs appear instantly.  
- **Chunked image calls** – OpenAI’s default limit is 20/-min; if you ever request >10 at once, wrap with `p-limit` to avoid 429s.  
- **Cost readout** – even solo dev work can rack up; a tiny banner that sums `concepts.length*imagePrice` will save surprises.  
- **Absolute paths** – when writing files from API routes, resolve against `process.cwd()` to stay cross-platform.  
- **No DB now, easy DB later** – every write is already isolated in its own folder, so swapping FS for S3 is a two-line change.  

---

### Done!  
That’s the full blueprint—tight enough for a sprint, flexible for growth. What part do you want mocked out first: the draft creator or the gallery?