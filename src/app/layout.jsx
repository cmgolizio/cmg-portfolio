import "./globals.css";
import {
  Fraunces,
  Hanken_Grotesk,
  JetBrains_Mono,
  IBM_Plex_Sans,
  Bricolage_Grotesque,
  DM_Sans,
} from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ThemeIntro from "@/components/ThemeIntro";

// Each font exposes a CSS variable; globals.css points the per-theme
// --font-display / --font-body tokens at the right one.
// Weights are trimmed to exactly what the CSS uses:
// display fonts at their theme's --display-weight, body fonts at 400/600,
// mono at 400 (+700 as the Technical display weight).
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-fraunces",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-hanken",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex",
  display: "swap",
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-bricolage",
  display: "swap",
});
const dmsans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-dmsans",
  display: "swap",
});

const fontVariables = [fraunces, hanken, jetbrains, plex, bricolage, dmsans]
  .map((f) => f.variable)
  .join(" ");

export const metadata = {
  title: "Christopher Golizio — Builder",
  description:
    "Full-stack developer who builds with code, wood, plastic, and circuits.",
};

// Runs before React hydrates so the saved theme is applied on first paint (no flash).
// Validates the stored value: an unknown id would match no token block and
// render the page unstyled until hydration.
const themeInitScript = `(function(){try{var t=localStorage.getItem('pf-theme');if(t==='minimal'||t==='technical'||t==='creative'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang='en'
      data-theme='minimal'
      suppressHydrationWarning
      className={fontVariables}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ThemeSwitcher />
          <ThemeIntro />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
