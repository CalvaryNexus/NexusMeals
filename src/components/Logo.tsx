import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/nexus-logo.png"
      alt="Nexus"
      width={1966}
      height={514}
      priority
      className={`h-10 w-auto sm:h-14 ${className}`}
    />
  );
}
