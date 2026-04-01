"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

interface LessonRequest {
  id: number;
  teacher_name: string;
  teacher_id: number;
  message: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

export default function StudentDashboard() {
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  async function fetchRequests() {
    const params = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/requests${params}`);
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function cancelRequest(id: number) {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    fetchRequests();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        My Lesson Requests
      </h1>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Requests</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No requests yet</p>
          <p className="text-sm text-gray-400 mt-1">
            <Link href="/browse" className="text-indigo-600 hover:text-indigo-500">
              Browse teachers
            </Link>{" "}
            to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Avatar name={req.teacher_name} size="sm" />
                  <div>
                    <Link
                      href={`/teachers/${req.teacher_id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {req.teacher_name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge status={req.status}>{req.status}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{req.message}</p>
              <p className="text-xs text-gray-500 mb-3">
                Preferred time: {req.preferred_time}
              </p>

              <div className="flex gap-2">
                {req.status === "pending" && (
                  <button
                    onClick={() => cancelRequest(req.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Cancel Request
                  </button>
                )}
                {req.status === "completed" && (
                  <Link
                    href={`/dashboard/student/reviews?requestId=${req.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Write a Review
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
