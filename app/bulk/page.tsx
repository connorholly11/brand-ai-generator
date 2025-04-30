'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import CostBanner from '@/components/CostBanner'

export default function BulkImagePage() {
  const router = useRouter()
  const [promptsText, setPromptsText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Split by line and filter out empty lines
    const prompts = promptsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (prompts.length === 0) {
      toast.error('Please enter at least one prompt')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate images')
      }

      const data = await response.json()
      router.push(`/bulk/${data.id}`)
    } catch (error) {
      console.error('Error generating images:', error)
      toast.error('Failed to generate images')
      setIsLoading(false)
    }
  }

  // Count valid prompts for cost calculation
  const validPromptCount = promptsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .length

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bulk Image Generator</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompts" className="block text-lg font-medium mb-2">
            Enter one prompt per line:
          </label>
          <textarea
            id="prompts"
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Enter one prompt per line here...
Example: A modern logo for a tech startup with blue and teal colors
Example: A minimalist logo for a luxury fashion brand"
            value={promptsText}
            onChange={(e) => setPromptsText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-6 py-3 rounded-md ${
              isLoading || validPromptCount === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            disabled={isLoading || validPromptCount === 0}
          >
            {isLoading ? 'Generating...' : 'Generate Images'}
          </button>
        </div>
      </form>

      {validPromptCount > 0 && (
        <CostBanner conceptCount={0} imageCount={validPromptCount} />
      )}
    </div>
  )
}