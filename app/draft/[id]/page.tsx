'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ConceptCard from '@/components/ConceptCard'
import CostBanner from '@/components/CostBanner'
import StepIndicator from '@/components/StepIndicator'

type Concept = {
  name: string;
  slogan: string;
  logoPrompt: string;
}

type DraftData = {
  id: string;
  brief: string;
  concepts: Concept[];
}

export default function DraftPage() {
  // Use the useParams hook instead of direct access
  const params = useParams();
  const id = params?.id as string;
  
  const router = useRouter()
  const [draftData, setDraftData] = useState<DraftData | null>(null)
  const [approvedIndices, setApprovedIndices] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!id) return;
    
    // Fetch draft data
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/draft/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch draft')
        }
        const data = await response.json()
        setDraftData(data)
      } catch (error) {
        console.error('Error fetching draft:', error)
        toast.error('Failed to load draft data')
      }
    }

    fetchDraft()
  }, [id])

  const handleApprove = (index: number) => {
    setApprovedIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    )
  }

  const handleApproveAll = () => {
    if (draftData?.concepts?.length) {
      setApprovedIndices([...Array(draftData.concepts.length).keys()])
      toast.success(`All ${draftData.concepts.length} concepts approved`)
    }
  }

  const handleGenerateImages = async () => {
    if (approvedIndices.length === 0) {
      toast.error('Please approve at least one concept')
      return
    }
    
    setIsLoading(true)
    const loadingToast = toast.loading(`Generating ${approvedIndices.length} images...`)
    
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, indices: approvedIndices }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate images')
      }
      
      toast.success('Images generated successfully!', { id: loadingToast })
      router.push(`/draft/${id}/images`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to generate images', { id: loadingToast })
      setIsLoading(false)
    }
  }

  if (!id) return <div className="p-6">Missing draft ID</div>
  if (!draftData) return <div className="p-6">Loading...</div>
  if (!draftData?.concepts?.length) return <div className="p-6">No concepts found for this draft.</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StepIndicator currentStep="concepts" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Brand Concepts</h1>
        <Link href="/new" className="text-blue-600 hover:underline">
          Back to Brief
        </Link>
      </div>
      
      <div className="mb-6">
        <p className="font-medium">Brief:</p>
        <p>{draftData.brief}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {draftData.concepts.map((concept, index) => (
          <ConceptCard
            key={index}
            concept={concept}
            isApproved={approvedIndices.includes(index)}
            onApprove={() => handleApprove(index)}
            draftId={id}
            index={index}
          />
        ))}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={handleApproveAll}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Approve All
        </button>
        
        <button
          onClick={handleGenerateImages}
          disabled={approvedIndices.length === 0 || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? 'Generating Images...' : 'Generate Images'}
        </button>
      </div>
      
      <CostBanner 
        conceptCount={draftData.concepts.length} 
        imageCount={approvedIndices.length} 
      />
    </div>
  )
}