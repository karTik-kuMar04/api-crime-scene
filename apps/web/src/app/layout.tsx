import type { Metadata } from "next";
import { instrumentSans, instrumentSerif, jetbrainsMono } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Crime Scene · Browser Network Forensics",
  description: "A privacy-first forensic workspace for inspecting, analyzing and comparing browser HAR recordings locally.",
};

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('acs-theme');
      var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark';
      var resolved = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      var root = document.documentElement;
      root.setAttribute('data-theme', resolved);
      root.setAttribute('data-no-transition', '');
      root.style.colorScheme = resolved;
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
