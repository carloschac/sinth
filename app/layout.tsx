import type { Metadata } from 'next';
import { Syne, Hanken_Grotesk, Martian_Mono } from 'next/font/google';
import LenisProvider from '@/providers/LenisProvider';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

const martian = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PHASE — synth de bolso',
  description: 'PHASE é um sintetizador que roda no navegador. Toque agora.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className={`${syne.variable} ${hanken.variable} ${martian.variable}`}
    >
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
