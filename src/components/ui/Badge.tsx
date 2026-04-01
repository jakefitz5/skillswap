const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-600",
};

interface BadgeProps {
  status?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ status, children, className = "" }: BadgeProps) {
  const colorClass = status
    ? STATUS_COLORS[status] || "bg-gray-100 text-gray-600"
    : "bg-indigo-100 text-indigo-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
