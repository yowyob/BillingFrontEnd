'use client'
import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  isError: boolean
  message: string
  showLoader: (msg?: string) => void
  hideLoader: () => void
  showError: (msg?: string) => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  isError: false,
  message: '',
  showLoader: () => {},
  hideLoader: () => {},
  showError: () => {},
})

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [message, setMessage] = useState('Loading...')
  const errorActiveRef = useRef(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showLoader = useCallback((msg = 'Loading...') => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    errorActiveRef.current = false
    setIsError(false)
    setMessage(msg)
    setIsLoading(true)
  }, [])

  const hideLoader = useCallback(() => {
    // If an error is being displayed, let the auto-dismiss timer handle it
    if (errorActiveRef.current) return
    setIsLoading(false)
  }, [])

  const showError = useCallback((msg = 'Something went wrong') => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
    errorActiveRef.current = true
    setIsError(true)
    setMessage(msg)
    setIsLoading(true)

    dismissTimerRef.current = setTimeout(() => {
      errorActiveRef.current = false
      setIsError(false)
      setIsLoading(false)
    }, 2500)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, isError, message, showLoader, hideLoader, showError }}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => useContext(LoadingContext)
