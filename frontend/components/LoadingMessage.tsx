type LoadingMessageProps = {
  message?: string;
};

export function LoadingMessage({
  message = "Loading...",
}: LoadingMessageProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}