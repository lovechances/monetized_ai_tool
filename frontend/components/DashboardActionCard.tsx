import Link from "next/link";

type DashboardActionCardProps = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

export function DashboardActionCard({
  title,
  description,
  href,
  badge,
}: DashboardActionCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-gray-800 bg-gray-950 p-6 transition hover:border-gray-600 hover:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            {description}
          </p>
        </div>

        {badge && (
          <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}