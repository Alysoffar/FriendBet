import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata: Metadata = {
  title: 'FriendBet - Social Betting with Friends',
  description: 'Challenge your friends, make predictions, and have fun!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dark-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
