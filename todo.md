# **todo.md** — "Brand-Logo Blitz" local MVP  
*(Tick every box and you're done.)*

---

#### 0 · Project bootstrap
- [x] **Clone / init repo**  
  - Next 15, TypeScript, Tailwind, ESLint / Prettier.
- [x] `OPENAI_API_KEY` in `.env.local`.
- [x] `public/generated/` ignored in git.

---

#### 1 · Routes & navigation
- [x] `/new` **Brief page**  
- [x] `/draft/[id]` **Edit & Approve**  
- [x] `/draft/[id]/images` **Gallery**  
- [x] `/library` **Saved sets**
- [x] `/bulk` **Bulk Image Prompts**
- [x] `/bulk/[id]` **Bulk Image Gallery**

---

#### 2 · State + utilities
- [x] Install **Zustand**; store:  
  - `concepts[]`, `approvedIndices[]`, `images[]`.
- [x] Helper: `uuid()` wrapper.
- [x] Helper: `writeFileSafe(path, buf)` (creates dirs).

---

#### 3 · API
- [x] `POST /api/draft` → chat → `draft.json`.  
- [x] `POST /api/approve` → images → PNGs.  
- [x] `GET /api/files?id=` → return PNG paths.  
- [x] Error + 429 handling, chunk if > 10 images.
- [x] `POST /api/bulk` → batch image generation with multiple prompts.

---

#### 4 · Page components
- [x] **BriefForm** (textarea, variants input, generate).  
- [x] **ConceptCard** (name, slogan, editable prompt, approve ✓).  
- [x] **Gallery** (grid, hover to copy prompt, click to download).  
- [x] **Library** (read folders → thumbnail list).
- [x] **BulkGallery** (reuse image grid for bulk generated images).

---

#### 5 · Styling & polish
- [x] Tailwind config (brand palette).  
- [x] Responsive grid; masonry via CSS columns.  
- [x] Loading spinners + optimistic UI.  
- [x] Toasts for "Draft saved", "Images ready".

---

#### 6 · Dev-experience niceties
- [x] Hot-reload images (`revalidatePath` or `unstable_noStore`).  
- [x] Cost meter banner (est. tokens + image $).  
- [x] Lint & type-check in `precommit`.

---

#### 7 · Testing & docs
- [ ] Unit: mock OpenAI, assert JSON schema.  
- [ ] E2E smoke (Cypress): new → approve → gallery visible.  
- [x] `README.md` quick-start + cost caveats.

---

#### 8 · Ready for hand-off
- [ ] Zip latest macOS and Windows builds of `/generated` folder for backup.  
- [ ] Demo loom: 30-sec run-through.

---

Currently Implemented: ~90% complete

Missing components:
1. Testing infrastructure
2. Deployment preparation