type StatCardProps = {
  label: string;
  value: string;
  description: string;
};

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}