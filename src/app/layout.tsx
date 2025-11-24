import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chart Agent MVP - FD Mediagroep',
  description: 'AI-powered chart generation agent for FD and BNR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
