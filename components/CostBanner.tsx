'use client'

import { useState } from 'react'
import { calculateCost } from '@/lib/utils'

type CostBannerProps = {
  conceptCount: number
  imageCount: number
}

export default function CostBanner({ conceptCount, imageCount }: CostBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  
  if (!isVisible) return null
  
  const { conceptCost, imageCost, totalCost } = calculateCost(conceptCount, imageCount)
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-100 p-2 border-t border-blue-200 text-sm text-blue-800 flex justify-between items-center">
      <div>
        <span className="font-medium">Estimated cost:</span> ${totalCost} USD
        <span className="text-xs ml-2 text-blue-600">
          (Concepts: ${conceptCost} | Images: ${imageCost})
        </span>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-blue-600 hover:text-blue-800"
      >
        ✕
      </button>
    </div>
  )
}