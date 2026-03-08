import { cn } from "@/lib/cn";

export default function TagChips({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}) {
  if (!tags.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs font-semibold text-white/80"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
