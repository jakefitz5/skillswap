"use client";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={`flex gap-0.5 ${sizeClasses[size]}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${
            i < rating ? "text-amber-400" : "text-gray-300"
          }`}
          onClick={() => interactive && onChange?.(i + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
