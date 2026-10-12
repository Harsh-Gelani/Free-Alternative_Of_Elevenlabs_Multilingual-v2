import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ElevenLabs Multilingual v2 | Local Studio',
  description: 'Clean-room clone of ElevenLabs Multilingual v2 speech synthesis model. Lifelike emotional voiceovers across 29 languages running 100% locally on PC with zero external APIs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-studio-950 text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
