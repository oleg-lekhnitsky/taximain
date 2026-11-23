import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import LoadingBar from "@/components/LoadingBar/LoadingBar";
import { PageTransitionProvider } from "@/components/PageTransition/PageTransition";
import { CountryProvider } from "@/components/CountrySwitcher/CountryProvider";
import { countryForHostname, defaultCountry } from "@/lib/countries";
import { ContentProvider } from "@/components/CountrySwitcher/ContentProvider";
import { loadSiteContent } from "@/lib/cms/load";
import { readPreview } from "@/lib/cms/preview";
import PreviewBridge from "@/components/CmsPreview/PreviewBridge";
import "./globals.scss";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host") || "localhost:3000";
  const protocol = /^(localhost|127\.0\.0\.1)(:|$)/.test(host)
    ? "http"
    : "https";
  const origin = new URL(process.env.SITE_URL || `${protocol}://${host}`);
  const image = new URL("/assets/social/taxi-checkerboard.jpg", origin).href;
  const video = new URL("/assets/social/taxi-checkerboard.mp4", origin).href;
  return {
    metadataBase: origin,
    robots: (await readPreview()) ? { index: false, follow: false } : undefined,
    title: "WB Taxi",
    applicationName: "WB Taxi",
    description: "WB Taxi — сервис такси с кешбэком.",
    openGraph: {
      type: "website",
      siteName: "WB Taxi",
      images: [
        {
          url: image,
          width: 1200,
          height: 800,
          type: "image/jpeg",
          alt: "WB Taxi на розово-фиолетовом шахматном фоне",
        },
      ],
      videos: [{ url: video, width: 1200, height: 800, type: "video/mp4" }],
    },
    twitter: {
      card: "summary_large_image",
      images: [image],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const hostname = (await headers()).get("host")?.split(":")[0] ?? "";
  const initialCountry = countryForHostname(hostname) ?? defaultCountry;
  const [content, preview] = await Promise.all([
    loadSiteContent(),
    readPreview(),
  ]);
  return (
    <html
      lang={
        initialCountry === "am" ? "hy" : initialCountry === "ge" ? "ka" : "ru"
      }
      data-country={initialCountry}
      data-scroll-behavior="smooth"
    >
      <body>
        <CountryProvider initialCountry={initialCountry}>
          <ContentProvider content={content}>
            <PageTransitionProvider>
              <LoadingBar />
              {children}
              {preview && (
                <PreviewBridge
                  cmsOrigin={preview.cmsOrigin}
                  initialRevision={preview.revision}
                />
              )}
            </PageTransitionProvider>
          </ContentProvider>
        </CountryProvider>
      </body>
    </html>
  );
}
