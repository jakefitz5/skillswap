"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import { CATEGORY_ICONS } from "@/lib/constants";

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

interface Teacher {
  user_id: number;
  name: string;
  bio: string;
  hourly_rate: number;
  experience_level: string;
  location: string;
  skills: string[];
  availability: string[];
  avg_rating: number | null;
  review_count: number;
  categories: { slug: string; name: string }[];
  reviews: Review[];
}

export default function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/teachers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setTeacher(d.teacher);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !teacher) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.user_id,
          message,
          preferredTime,
        }),
      });

      if (res.ok) {
        setRequestSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send request");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 bg-gray-200 rounded-full" />
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Teacher not found</h1>
        <p className="text-gray-500 mt-2">
          This teacher may not exist or their profile isn&apos;t published.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar name={teacher.name} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {teacher.avg_rating ? (
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(teacher.avg_rating)} size="sm" />
                <span className="text-sm text-gray-500">
                  {teacher.avg_rating} ({teacher.review_count} review
                  {teacher.review_count !== 1 ? "s" : ""})
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">No reviews yet</span>
            )}
          </div>
          {teacher.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {teacher.location}
            </p>
          )}
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-gray-900">
            ${teacher.hourly_rate}
          </span>
          <span className="text-gray-500">/hr</span>
        </div>
      </div>

      {/* Bio */}
      {teacher.bio && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-600 whitespace-pre-line">{teacher.bio}</p>
        </div>
      )}

      {/* Skills */}
      {teacher.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {teacher.skills.map((skill) => (
              <span
                key={skill}
                className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {teacher.categories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {teacher.categories.map((cat) => (
              <Badge key={cat.slug}>
                {CATEGORY_ICONS[cat.slug]} {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {teacher.availability.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Availability
          </h2>
          <div className="space-y-1">
            {teacher.availability.map((slot, i) => (
              <p key={i} className="text-sm text-gray-600">
                {slot}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Experience Level
        </h2>
        <Badge className="capitalize">{teacher.experience_level}</Badge>
      </div>

      {/* Lesson Request Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Request a Lesson
        </h2>

        {requestSent ? (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg">
            Your lesson request has been sent! Check your dashboard for updates.
          </div>
        ) : !user ? (
          <p className="text-gray-500">
            <a href="/login" className="text-indigo-600 font-medium hover:text-indigo-500">
              Log in
            </a>{" "}
            as a student to request a lesson.
          </p>
        ) : user.role !== "student" ? (
          <p className="text-gray-500">
            Only students can request lessons.
          </p>
        ) : (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the teacher what you'd like to learn..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time
              </label>
              <input
                type="text"
                required
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="e.g., Saturday mornings, weekday evenings"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Lesson Request"}
            </button>
          </form>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Reviews ({teacher.reviews.length})
        </h2>
        {teacher.reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {teacher.reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={review.reviewer_name} size="sm" />
                    <span className="text-sm font-medium text-gray-900">
                      {review.reviewer_name}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
