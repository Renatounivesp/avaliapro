import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AvaliaPro | Conquiste mais Avaliações 5 Estrelas no Google',
  description: 'Transforme a opinião dos seus clientes em vendas. Aumente suas avaliações no Google de forma inteligente e impeça feedbacks negativos públicos.',
  keywords: 'avaliações google, local business, feedback de cliente, marketing local, saas avaliações',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  openGraph: {
    title: 'AvaliaPro | Conquiste mais Avaliações 5 Estrelas no Google',
    description: 'Transforme a opinião dos seus clientes em vendas. Aumente suas avaliações no Google de forma inteligente e impeça feedbacks negativos públicos.',
    url: 'https://avaliaproo.vercel.app',
    siteName: 'AvaliaPro',
    images: [
      {
        url: 'https://avaliaproo.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AvaliaPro SaaS',
      },
    ],
    locale: 'pt-BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AvaliaPro | Conquiste mais Avaliações 5 Estrelas no Google',
    description: 'Transforme a opinião dos seus clientes em vendas. Aumente suas avaliações no Google de forma inteligente e impeça feedbacks negativos públicos.',
    images: ['https://avaliaproo.vercel.app/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
