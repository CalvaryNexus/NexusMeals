export function Footer({
  contactEmail,
  contactPhone,
}: {
  contactEmail: string;
  contactPhone: string;
}) {
  return (
    <footer className="bg-navy mt-auto">
      <div className="mx-auto max-w-[1140px] px-6 py-8 text-white/80 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p>Nexus Meals</p>
        <p>
          Questions? Contact{" "}
          <a href={`mailto:${contactEmail}`} className="underline">
            {contactEmail}
          </a>{" "}
          or{" "}
          <a href={`tel:${contactPhone}`} className="underline">
            {contactPhone}
          </a>
        </p>
      </div>
    </footer>
  );
}
