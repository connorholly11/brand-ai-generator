import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Brand AI</h1>
      <p className="text-xl max-w-2xl mb-8">
        Generate brand concepts with AI. Create names, slogans, and logo images in minutes.
      </p>
      
      <div className="space-y-4">
        <Link 
          href="/new" 
          className="block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Brand
        </Link>
        
        <Link
          href="/library"
          className="block px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          View Library
        </Link>
        
        <Link
          href="/bulk"
          className="block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Bulk Image Prompts
        </Link>
      </div>
    </div>
  )
}