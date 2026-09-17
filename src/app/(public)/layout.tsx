import { Footer } from "@/components/Footer";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      <Footer
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
      />
    </div>
  );
}
