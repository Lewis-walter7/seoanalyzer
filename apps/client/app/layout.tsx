import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import Navbar from "./components/navbar/navbar";
import { AuthProvider } from "./components/providers/session-provider";
import { Toaster } from 'react-hot-toast';

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
      <head>
        {/* Google reCAPTCHA v3 */}
        <script
          src="https://www.google.com/recaptcha/api.js?render=YOUR_RECAPTCHA_SITE_KEY"
          async
          defer
        ></script>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_MEASUREMENT_ID"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'YOUR_GA_MEASUREMENT_ID');
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
