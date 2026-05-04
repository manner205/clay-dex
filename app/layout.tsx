import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AdminProvider } from '@/components/AdminProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '클레이 도감',
  description: '내가 만든 클레이 캐릭터 도감',
  openGraph: {
    title: '클레이 도감',
    description: '내가 만든 클레이 캐릭터 도감',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <AdminProvider>
          <main className="max-w-md mx-auto min-h-screen">{children}</main>
        </AdminProvider>
      </body>
    </html>
  )
}
