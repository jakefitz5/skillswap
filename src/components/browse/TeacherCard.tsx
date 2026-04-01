import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import { CATEGORY_ICONS } from "@/lib/constants";

interface TeacherCardProps {
  teacher: {
    user_id: number;
    name: string;
    bio: string;
    hourly_rate: number;
    experience_level: string;
    location: string;
    skills: string[];
    avg_rating: number | null;
    review_count: number;
    categories: { slug: string; name: string }[];
  };
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Link
      href={`/teachers/${teacher.user_id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={teacher.name} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {teacher.name}
            </h3>
            {teacher.skills.length > 0 && (
              <p className="text-sm text-gray-500 truncate">
                {teacher.skills[0]}
                {teacher.skills.length > 1 && ` +${teacher.skills.length - 1} more`}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-lg font-bold text-gray-900">
              ${teacher.hourly_rate}
            </span>
            <span className="text-xs text-gray-500">/hr</span>
          </div>
        </div>

        {teacher.bio && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {teacher.bio}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {teacher.avg_rating ? (
              <>
                <StarRating rating={Math.round(teacher.avg_rating)} size="sm" />
                <span className="text-xs text-gray-500">
                  ({teacher.review_count})
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">No reviews yet</span>
            )}
          </div>
          {teacher.location && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {teacher.location}
            </span>
          )}
        </div>

        {teacher.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {teacher.categories.slice(0, 3).map((cat) => (
              <span
                key={cat.slug}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {CATEGORY_ICONS[cat.slug] || ""} {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
