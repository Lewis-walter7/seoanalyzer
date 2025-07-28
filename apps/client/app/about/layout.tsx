import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "../components/theme-provider";
import Navbar from "../components/navbar/navbar";

export const metadata: Metadata = {
  title: "SEO Analyzer",
  description: "Analyze your website's SEO performance with our comprehensive tool.",
  keywords: "SEO, analyzer, website optimization, search engine optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
