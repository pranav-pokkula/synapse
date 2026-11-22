import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SYNAPSE — Build knowledge from what you build.",
  description:
    "Turn your repository into a source-backed learning journey, with architecture maps, visual lessons, and practical assessments.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
