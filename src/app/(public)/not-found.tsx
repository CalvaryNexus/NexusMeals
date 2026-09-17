import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ArrowRightIcon } from "@/components/Icons";

export default function PublicNotFound() {
  return (
    <>
      <Hero
        compact
        eyebrow="Page not found"
        title="We couldn't find that page"
        subtitle="The link may be out of date, or the signup it pointed to has since changed."
      />
      <main className="mx-auto max-w-[1140px] px-6 py-12">
        <Link href="/schedule" className="btn btn-primary">
          Back to the schedule
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </main>
    </>
  );
}
