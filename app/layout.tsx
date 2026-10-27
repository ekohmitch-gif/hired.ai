import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const SITE_DESCRIPTION =
  'Build ATS-optimized resumes in minutes with AI. Scan your resume against any job description for a match score, get a tailored rewrite, and generate a matching cover letter.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.enhancerez.com'),
  title: 'EnhanceRez | AI Resume Builder',
  description: SITE_DESCRIPTION,
  openGraph: {
    title: 'EnhanceRez | AI Resume Builder',
    description: SITE_DESCRIPTION,
    url: 'https://www.enhancerez.com',
    siteName: 'EnhanceRez',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'EnhanceRez | AI Resume Builder',
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
