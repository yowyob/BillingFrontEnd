'use client'
import { Loader2, XCircle } from 'lucide-react'
import { useLoading } from './LoadingContext'

export default function LoadingOverlay() {
  const { isLoading, isError, message } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className={`flex flex-col items-center gap-4 bg-white rounded-2xl shadow-2xl px-10 py-8 min-w-[220px] border ${isError ? 'border-red-100' : 'border-transparent'}`}>
        {isError ? (
          <XCircle className="w-10 h-10 text-red-500" />
        ) : (
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        )}
        <p className={`text-sm font-medium text-center ${isError ? 'text-red-500' : 'text-gray-600'}`}>
          {message}
        </p>
      </div>
    </div>
  )
}
