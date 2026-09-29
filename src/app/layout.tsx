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

const SITE_NAME = "Nexus Meals";
const DESCRIPTION =
  "Sign up to bring the Sunday evening meal for Nexus students.";

export const metadata: Metadata = {
  // Lets Next resolve opengraph-image.png to an absolute URL, which link
  // previews require.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: SITE_NAME,
    template: "%s · Nexus Meals",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  // Without these, link previews (BAND, iMessage, Facebook, WhatsApp) fall
  // back to scraping visible page text, which produced a run-on of the nav
  // and footer links.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
  },
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
