import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnPath - AI-Powered Learning Onboarding",
  description:
    "Personalized learning experience powered by conversational AI onboarding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
