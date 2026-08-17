import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-black p-6">
      <p className="text-gray-300">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}