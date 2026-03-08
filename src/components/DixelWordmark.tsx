import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

export default function DixelWordmark({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 font-display font-semibold tracking-tighter2",
        className,
      )}
      aria-label="DIXEL Home"
    >
      <Image
        src="/images/dixel_logo.png"
        alt="DIXEL"
        width={140}
        height={32}
        unoptimized
        className="h-6 w-auto opacity-95"
        priority
      />
      <span className="sr-only">DIXEL</span>
    </Link>
  );
}
