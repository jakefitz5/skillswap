import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";

interface TestimonialReview {
  rating: number;
  comment: string;
  reviewer_name: string;
  teacher_name: string;
}

export default function Testimonials({ reviews }: { reviews: TestimonialReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {reviews.map((review, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col"
        >
          <StarRating rating={review.rating} size="sm" />
          <p className="text-sm text-gray-600 mt-3 flex-1 line-clamp-4">
            &ldquo;{review.comment}&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <Avatar name={review.reviewer_name} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900">{review.reviewer_name}</p>
              <p className="text-xs text-gray-400">about {review.teacher_name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
