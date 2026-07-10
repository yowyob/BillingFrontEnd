'use client'
import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingProvider } from './LoadingContext'
import LoadingOverlay from './LoadingOverlay'
import NavigationProgress from './NavigationProgress'
// Importing this also wires OpenAPI.TOKEN to the stored seller's access token.
import { getStoredSeller } from '@/src/api/session'
import OfflineProvider from '@/src/offline/providers/OfflineProvider'
import { isSessionValidOffline } from '@/src/offline/auth/jwtSession'
import { isBrowserOnline } from '@/src/offline/network/connectivity'

export default function ClientProviders({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const seller = getStoredSeller()
    if (!seller?.accessToken) {
      router.replace('/login')
      return
    }

    const online = isBrowserOnline()
    if (!online && !isSessionValidOffline()) {
      router.replace('/login')
      return
    }

    if (seller.mustChangePassword) {
      router.replace('/change-password')
      return
    }
    setChecked(true)
  }, [router])

  if (!checked) return null

  return (
    <OfflineProvider>
      <LoadingProvider>
        <NavigationProgress />
        <LoadingOverlay />
        <div style={{ display: 'contents' }}>
          {children}
        </div>
      </LoadingProvider>
    </OfflineProvider>
  )
}
