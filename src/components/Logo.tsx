import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/nexus-logo.png"
      alt="Nexus"
      width={1335}
      height={605}
      priority
      className={`h-6 w-auto sm:h-8 ${className}`}
    />
  );
}
