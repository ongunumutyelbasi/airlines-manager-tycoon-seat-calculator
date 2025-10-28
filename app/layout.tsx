import '../styles/globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Airlines Seat Calculator',
  description: 'Demo app with centralized theme file for fonts and colors',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <main className="mx-auto max-w-3xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
