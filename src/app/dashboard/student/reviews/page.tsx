"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import StarRating from "@/components/ui/StarRating";

export default function StudentReviewsWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded w-48" />}>
      <StudentReviewsContent />
    </Suspense>
  );
}

interface CompletedRequest {
  id: number;
  teacher_name: string;
  teacher_id: number;
  message: string;
  created_at: string;
  has_review?: boolean;
}

function StudentReviewsContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [requests, setRequests] = useState<CompletedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(
    requestId ? Number(requestId) : null
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/requests?status=completed")
      .then((r) => r.json())
      .then((d) => {
        setRequests(d.requests || []);
        setLoading(false);
      });
  }, []);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewingId || rating === 0) return;
    setSubmitting(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonRequestId: reviewingId,
        rating,
        comment,
      }),
    });

    if (res.ok) {
      setSuccess("Review submitted!");
      setReviewingId(null);
      setRating(0);
      setComment("");
      // Mark as reviewed
      setRequests((prev) =>
        prev.map((r) =>
          r.id === reviewingId ? { ...r, has_review: true } : r
        )
      );
    } else {
      const data = await res.json();
      setSuccess(data.error || "Failed to submit review");
    }
    setSubmitting(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h1>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No completed lessons yet</p>
          <p className="text-sm text-gray-400 mt-1">
            You can write reviews after your lessons are marked complete
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">
                  Lesson with {req.teacher_name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-3">{req.message}</p>

              {req.has_review ? (
                <p className="text-sm text-emerald-600 font-medium">
                  Review submitted
                </p>
              ) : reviewingId === req.id ? (
                <form onSubmit={handleSubmitReview} className="space-y-3 border-t border-gray-100 pt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <StarRating
                      rating={rating}
                      interactive
                      onChange={setRating}
                      size="lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting || rating === 0}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewingId(null);
                        setRating(0);
                        setComment("");
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setReviewingId(req.id)}
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Write a Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
