"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

interface LessonRequest {
  id: number;
  student_display_name: string;
  message: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

export default function TeacherDashboard() {
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

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchRequests();
  }

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Lesson Requests
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">
            {stats.completed}
          </p>
        </div>
      </div>

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
        </select>
      </div>

      {/* Request list */}
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
            Make sure your profile is published to receive lesson requests
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
                  <Avatar name={req.student_display_name} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {req.student_display_name}
                    </p>
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

              {/* Actions */}
              <div className="flex gap-2">
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(req.id, "accepted")}
                      className="text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(req.id, "declined")}
                      className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}
                {req.status === "accepted" && (
                  <button
                    onClick={() => updateStatus(req.id, "completed")}
                    className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
