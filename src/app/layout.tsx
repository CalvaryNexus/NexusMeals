import type { Metadata, Viewport } from "next";
import { Archivo_Black, Poppins } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexus Meals",
    template: "%s · Nexus Meals",
  },
  description: "Sign up to bring the Sunday night Nexus meal.",
};

export const viewport: Viewport = {
  themeColor: "#1c326a",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // globals.css sets `scroll-behavior: smooth`; this tells Next to opt out
      // of it during route transitions so navigation still jumps to the top.
      data-scroll-behavior="smooth"
      className={`${archivoBlack.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        {/* The wordmark is painted as a CSS mask, so it isn't discoverable
            by the preload scanner the way an <img> would be. */}
        <link rel="preload" as="image" href="/nexus-mark.png" />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
