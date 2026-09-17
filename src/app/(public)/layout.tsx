import { Footer } from "@/components/Footer";
import { SiteNav } from "@/components/SiteNav";
import { ToastProvider } from "@/components/Toast";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <Footer
          contactEmail={settings.contactEmail}
          contactPhone={settings.contactPhone}
        />
      </div>
    </ToastProvider>
  );
}
