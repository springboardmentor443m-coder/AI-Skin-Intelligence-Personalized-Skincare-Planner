import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'AI Skin Intelligence',
  description: 'Premium AI-powered skincare analysis and recommendations',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const themeConfig = {
                  'dark': {
                    '--background': '#fff8f3',
                    '--foreground': '#3b2f2f',
                    '--card': '#ffffff',
                    '--card-foreground': '#3b2f2f',
                    '--primary': '#d89c8b',
                    '--accent': '#c98b72',
                    '--muted': '#f8ede7',
                    '--muted-foreground': '#8a736f',
                  },
                  'premium-black': {
                    '--background': '#fff8f3',
                    '--foreground': '#3b2f2f',
                    '--card': '#ffffff',
                    '--card-foreground': '#3b2f2f',
                    '--primary': '#d89c8b',
                    '--accent': '#c98b72',
                    '--muted': '#f8ede7',
                    '--muted-foreground': '#8a736f',
                  },
                  'light': {
                    '--background': '#fff8f3',
                    '--foreground': '#3b2f2f',
                    '--card': '#ffffff',
                    '--card-foreground': '#3b2f2f',
                    '--primary': '#d89c8b',
                    '--accent': '#c98b72',
                    '--muted': '#f8ede7',
                    '--muted-foreground': '#8a736f',
                  },
                  'ocean': {
                    '--background': '#fff8f3',
                    '--foreground': '#3b2f2f',
                    '--card': '#ffffff',
                    '--card-foreground': '#3b2f2f',
                    '--primary': '#d89c8b',
                    '--accent': '#c98b72',
                    '--muted': '#f8ede7',
                    '--muted-foreground': '#8a736f',
                  },
                  'forest': {
                    '--background': '#fff8f3',
                    '--foreground': '#3b2f2f',
                    '--card': '#ffffff',
                    '--card-foreground': '#3b2f2f',
                    '--primary': '#d89c8b',
                    '--accent': '#c98b72',
                    '--muted': '#f8ede7',
                    '--muted-foreground': '#8a736f',
                  }
                };
                const theme = localStorage.getItem('ai-skin-theme') || 'light';
                const colors = themeConfig[theme] || themeConfig['light'];
                Object.entries(colors).forEach(([key, value]) => {
                  document.documentElement.style.setProperty(key, value);
                });
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
