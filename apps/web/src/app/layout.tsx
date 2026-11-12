import type { Metadata } from 'next';
import { DM_Sans, Barlow_Condensed, DM_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  weight: ['700', '800'],
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sao Tech Market - Marketplace Électronique Premium en RDC',
  description:
    "Découvrez des équipements électroniques premium avec livraison rapide, des prix compétitifs, partout en République Démocratique du Congo.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${barlowCondensed.variable} ${dmMono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

