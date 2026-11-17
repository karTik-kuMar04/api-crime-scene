import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Crime Scene",
  description: "A privacy-first browser network forensics tool."
};

const themeScript = `
  (function() {
    try {
      const stored = localStorage.getItem('acs-theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const preferred = stored === 'light' || stored === 'dark'
        ? stored
        : (stored === 'system' ? (systemDark ? 'dark' : 'light') : (systemDark ? 'dark' : 'light'));
      const root = document.documentElement;
      root.classList.add(preferred);
      root.style.colorScheme = preferred;
    } catch (e) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  })();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
