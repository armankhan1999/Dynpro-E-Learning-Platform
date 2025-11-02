'use client'

export default function ContentLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-sm text-gray-600">Loading content...</p>
      </div>
    </div>
  )
}
