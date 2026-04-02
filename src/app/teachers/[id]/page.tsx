"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import WeeklyCalendar from "@/components/scheduling/WeeklyCalendar";
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
  teaching_philosophy: string;
  certifications: { name: string; issuer?: string; year?: number }[];
  social_links: { instagram?: string; youtube?: string; linkedin?: string };
  portfolio_urls: { url: string; title: string; type: string }[];
  years_experience: number;
}

export default function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
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
        <div className="text-right flex flex-col items-end gap-2">
          <div>
            <span className="text-3xl font-bold text-gray-900">
              ${teacher.hourly_rate}
            </span>
            <span className="text-gray-500">/hr</span>
          </div>
          {user && user.role === "student" && (
            <button
              onClick={async () => {
                const res = await fetch("/api/conversations", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ otherUserId: teacher.user_id }),
                });
                const data = await res.json();
                if (data.conversation) {
                  router.push(`/dashboard/messages?conversation=${data.conversation.id}`);
                }
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
          )}
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

      {/* Weekly Calendar */}
      <WeeklyCalendar
        teacherId={teacher.user_id}
        onSelectSlot={user?.role === "student" ? (date, time) => {
          setProposedDate(date);
          setProposedTime(time);
          setPreferredTime(`${new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} at ${time}`);
          document.getElementById("lesson-request-form")?.scrollIntoView({ behavior: "smooth" });
        } : undefined}
      />

      {/* Availability notes */}
      {teacher.availability.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Availability Notes
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
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Experience</h2>
        <div className="flex items-center gap-3">
          <Badge className="capitalize">{teacher.experience_level}</Badge>
          {teacher.years_experience > 0 && (
            <span className="text-sm text-gray-600">
              {teacher.years_experience} year{teacher.years_experience !== 1 ? "s" : ""} of experience
            </span>
          )}
        </div>
      </div>

      {/* Teaching Philosophy */}
      {teacher.teaching_philosophy && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Teaching Philosophy</h2>
          <p className="text-gray-600 whitespace-pre-line">{teacher.teaching_philosophy}</p>
        </div>
      )}

      {/* Certifications */}
      {teacher.certifications && teacher.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Certifications</h2>
          <div className="space-y-2">
            {teacher.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700 font-medium">{cert.name}</span>
                {cert.issuer && <span className="text-xs text-gray-400">by {cert.issuer}</span>}
                {cert.year && <span className="text-xs text-gray-400">({cert.year})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {teacher.portfolio_urls && teacher.portfolio_urls.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Portfolio</h2>
          <div className="grid grid-cols-2 gap-3">
            {teacher.portfolio_urls.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {item.type === "image" ? (
                  <img src={item.url} alt={item.title} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 truncate group-hover:text-indigo-600">{item.title || "View"}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {teacher.social_links && (teacher.social_links.instagram || teacher.social_links.youtube || teacher.social_links.linkedin) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Connect</h2>
          <div className="flex gap-3">
            {teacher.social_links.instagram && (
              <a href={teacher.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
            {teacher.social_links.youtube && (
              <a href={teacher.social_links.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            )}
            {teacher.social_links.linkedin && (
              <a href={teacher.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Lesson Request Form */}
      <div id="lesson-request-form" className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => {
                    setProposedDate(e.target.value);
                    if (e.target.value && proposedTime) {
                      setPreferredTime(`${new Date(e.target.value + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} at ${proposedTime}`);
                    }
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={proposedTime}
                  onChange={(e) => {
                    setProposedTime(e.target.value);
                    if (proposedDate && e.target.value) {
                      setPreferredTime(`${new Date(proposedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} at ${e.target.value}`);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            {preferredTime && (
              <p className="text-sm text-indigo-600 -mt-2">{preferredTime}</p>
            )}
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
