type PageHeaderProps = {
  level?: string;
  title: string;
  description?: string;
};

export function PageHeader({ level, title, description }: PageHeaderProps) {
  return (
    <div className="mt-8">
      {level && <p className="text-sm text-gray-400">{level}</p>}

      <h1 className="text-4xl font-bold text-white">{title}</h1>

      {description && <p className="mt-3 text-gray-400">{description}</p>}
    </div>
  );
}