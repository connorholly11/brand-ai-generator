'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function BulkGallery() {
  const params = useParams();
  const id = params?.id as string;
  
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!id) return;
    
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/files?id=${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }
        const data = await response.json()
        setImageUrls(data.urls || [])
      } catch (error) {
        console.error('Error fetching images:', error)
        toast.error('Failed to load images')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchImages()
  }, [id])
  
  const handleDownload = (url: string) => {
    try {
      const filename = url.split('/').pop() || 'image.png'
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success(`Downloaded ${filename}`)
    } catch (error) {
      console.error('Error downloading image:', error)
      toast.error('Failed to download image')
    }
  }
  
  const handleDownloadAll = () => {
    if (imageUrls.length === 0) {
      toast.error('No images to download')
      return
    }
    
    try {
      for (const url of imageUrls) {
        const filename = url.split('/').pop() || 'image.png'
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      toast.success(`Downloaded ${imageUrls.length} images`)
    } catch (error) {
      console.error('Error downloading images:', error)
      toast.error('Failed to download all images')
    }
  }

  if (!id) return <div className="p-6">Missing batch ID</div>
  
  if (isLoading) {
    return <div className="p-6">Loading images...</div>
  }
  
  if (imageUrls.length === 0) {
    return (
      <div className="p-6">
        <p>No images found. <Link href="/bulk" className="text-blue-600 hover:underline">Back to Bulk Generator</Link></p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bulk Generated Images</h1>
        <div>
          <Link href="/bulk" className="text-blue-600 hover:underline mr-4">
            Back to Bulk Generator
          </Link>
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </div>
      </div>
      
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleDownloadAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Download All
        </button>
      </div>
      
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {imageUrls.map((url, index) => (
          <div 
            key={index} 
            className="relative border rounded-lg overflow-hidden group break-inside-avoid mb-4"
          >
            <Image
              src={url}
              alt={`Generated image ${index + 1}`}
              width={1024}
              height={1024}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => handleDownload(url)}
                className="px-4 py-2 bg-white text-black font-medium rounded-md"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}