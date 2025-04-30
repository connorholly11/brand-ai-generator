'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import CostBanner from '@/components/CostBanner'
import StepIndicator from '@/components/StepIndicator'

export default function BriefPage() {
  const router = useRouter()
  const [brief, setBrief] = useState('')
  const [count, setCount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brief || brief.trim() === '') {
      toast.error('Please enter a brief description')
      return
    }
    
    setIsLoading(true)
    const loadingToast = toast.loading('Generating brand concepts...')
    
    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, n: count }),
      })
      
      // Get the response text for debugging
      const responseText = await response.text()
      
      // Try to parse it as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText)
        throw new Error('Invalid response format from server')
      }
      
      // Check for API error
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate concepts')
      }
      
      // Validate response
      if (!data?.id) {
        console.error('Invalid response data:', data)
        throw new Error('Invalid response from server: missing ID')
      }
      
      toast.success('Brand concepts generated!', { id: loadingToast })
      router.push(`/draft/${data.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate concepts', { id: loadingToast })
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StepIndicator currentStep="brief" />
      
      <h1 className="text-3xl font-bold mb-6">Create Brand Brief</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">
            Brand Brief
          </label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe your brand vibe, must-use words, colors, etc."
            className="w-full h-64 p-3 border rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">
            Number of Variants
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            min="1"
            max="20"
            className="w-32 p-2 border rounded-md"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? 'Generating...' : 'Generate Draft'}
        </button>
      </form>
      
      <CostBanner conceptCount={count} imageCount={0} />
    </div>
  )
}