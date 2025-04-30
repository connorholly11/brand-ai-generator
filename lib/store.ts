import { create } from 'zustand'

type Concept = {
  name: string;
  slogan: string;
  logoPrompt: string;
}

type DraftStore = {
  currentDraftId: string | null;
  concepts: Concept[];
  approvedIndices: number[];
  
  // Actions
  setDraftId: (id: string) => void;
  setConcepts: (concepts: Concept[]) => void;
  updateLogoPrompt: (index: number, prompt: string) => void;
  toggleApproval: (index: number) => void;
  approveAll: () => void;
  clearApprovals: () => void;
  reset: () => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  currentDraftId: null,
  concepts: [],
  approvedIndices: [],
  
  setDraftId: (id) => set({ currentDraftId: id }),
  
  setConcepts: (concepts) => set({ concepts }),
  
  updateLogoPrompt: (index, prompt) => set((state) => ({
    concepts: state.concepts.map((concept, i) => 
      i === index ? { ...concept, logoPrompt: prompt } : concept
    )
  })),
  
  toggleApproval: (index) => set((state) => ({
    approvedIndices: state.approvedIndices.includes(index)
      ? state.approvedIndices.filter(i => i !== index)
      : [...state.approvedIndices, index]
  })),
  
  approveAll: () => set((state) => ({
    approvedIndices: [...Array(state.concepts.length).keys()]
  })),
  
  clearApprovals: () => set({ approvedIndices: [] }),
  
  reset: () => set({
    currentDraftId: null,
    concepts: [],
    approvedIndices: []
  })
}))