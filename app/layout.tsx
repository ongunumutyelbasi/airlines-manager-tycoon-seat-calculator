import '../styles/globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Airlines Manager Tycoon - Seat Calculator',
  description: 'Select an aircraft to automatically load its limits, then enter your route demand. The calculator will help you find the optimal seating configuration within the aircraft\'s constraints.',
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
