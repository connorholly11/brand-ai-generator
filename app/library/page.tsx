'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import StepIndicator from '@/components/StepIndicator'

type DraftPreview = {
  id: string;
  brief: string;
  previewImage: string;
}

export default function LibraryPage() {
  const [drafts, setDrafts] = useState<DraftPreview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch('/api/files')
        if (!response.ok) {
          throw new Error('Failed to fetch drafts')
        }
        const data = await response.json()
        setDrafts(data.drafts || [])
      } catch (error) {
        console.error('Error fetching drafts:', error)
        toast.error('Failed to load library')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDrafts()
  }, [])
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <StepIndicator currentStep="library" />
        <div className="p-6">Loading library...</div>
      </div>
    )
  }
  
  if (!drafts || drafts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <StepIndicator currentStep="library" />
        <div className="p-6">
          <p>No saved drafts found. <Link href="/new" className="text-blue-600 hover:underline">Create a new brand</Link>.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <StepIndicator currentStep="library" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Brand Library</h1>
        <Link href="/new" className="text-blue-600 hover:underline">
          Create New Brand
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.map((draft) => (
          <Link
            key={draft.id}
            href={`/draft/${draft.id}/images`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {draft.previewImage ? (
              <div className="aspect-square relative">
                <Image
                  src={draft.previewImage}
                  alt={`Preview for ${draft.id}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No preview</p>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold truncate">{draft.id}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{draft.brief}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}