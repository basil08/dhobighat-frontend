import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DhobiGhat - Clothing Management',
  description: 'Manage your clothing items and cleaning schedules',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <a href="/" className="text-xl font-bold text-gray-900">
                      DhobiGhat
                    </a>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a href="/" className="text-gray-600 hover:text-gray-900">
                      Home
                    </a>
                    <a href="/add" className="text-gray-600 hover:text-gray-900">
                      Add Item
                    </a>
                    <a href="/archive" className="text-gray-600 hover:text-gray-900">
                      Archive
                    </a>
                    <a href="/auth" className="text-gray-600 hover:text-gray-900">
                      Login
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 