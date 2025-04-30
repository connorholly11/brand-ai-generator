'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { debounce } from 'lodash'

type Concept = {
  name: string;
  slogan: string;
  logoPrompt: string;
}

type ConceptCardProps = {
  concept: Concept;
  isApproved: boolean;
  onApprove: () => void;
  draftId: string;
  index: number;
}

export default function ConceptCard({ concept, isApproved, onApprove, draftId, index }: ConceptCardProps) {
  const [logoPrompt, setLogoPrompt] = useState(concept.logoPrompt)
  
  // Update when prop changes
  useEffect(() => {
    setLogoPrompt(concept.logoPrompt)
  }, [concept.logoPrompt])
  
  // Debounced save function
  const debouncedSave = debounce(async (newPrompt: string) => {
    try {
      const response = await fetch('/api/draft/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          index,
          logoPrompt: newPrompt
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save prompt')
      }
      
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save logo prompt')
    }
  }, 500)
  
  const handleLogoPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value
    setLogoPrompt(newPrompt)
    
    // Make sure the prompt always mentions it's a logo and includes the brand name
    let enhancedPrompt = newPrompt
    if (!newPrompt.toLowerCase().includes('logo')) {
      enhancedPrompt = `Create a professional logo for ${concept.name}: ${newPrompt}`
    }
    if (!newPrompt.toLowerCase().includes(concept.name.toLowerCase())) {
      enhancedPrompt = `${newPrompt} The logo should prominently feature the brand name "${concept.name}".`
    }
    
    if (enhancedPrompt !== newPrompt) {
      setLogoPrompt(enhancedPrompt)
    }
    
    // Auto-save the updated prompt with debounce
    debouncedSave(enhancedPrompt)
  }

  return (
    <div className={`border rounded-lg p-4 ${isApproved ? 'border-green-500 bg-green-50' : ''}`}>
      <div className="mb-3">
        <h3 className="font-bold text-lg">{concept.name}</h3>
        <p className="text-gray-700">{concept.slogan}</p>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo Prompt
        </label>
        <textarea
          value={logoPrompt}
          onChange={handleLogoPromptChange}
          className="w-full p-2 border rounded-md text-sm"
          rows={4}
          placeholder={`Describe how the logo for ${concept.name} should look...`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Include details about colors, style, imagery, and make sure it features the brand name.
        </p>
      </div>
      
      <button
        onClick={onApprove}
        className={`w-full py-2 rounded-md transition-colors ${
          isApproved 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        {isApproved ? 'Approved ✓' : 'Approve'}
      </button>
    </div>
  )
}