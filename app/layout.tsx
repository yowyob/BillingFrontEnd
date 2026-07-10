// app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'Billing Enterprise ERP',
  description: 'Module de facturation ComOps - mode hors ligne',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#1e3a5f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
