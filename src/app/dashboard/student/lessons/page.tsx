"use client";

import { useState, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

interface Booking {
  id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  other_name: string;
  message: string;
}

export default function StudentLessons() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  async function fetchBookings() {
    const params = showAll ? "" : "?upcoming=true";
    const res = await fetch(`/api/bookings${params}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchBookings();
  }, [showAll]); // eslint-disable-line react-hooks/exhaustive-deps

  async function cancelBooking(id: number) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    fetchBookings();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming Lessons</h1>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="rounded text-indigo-600"
          />
          Show all
        </label>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No upcoming lessons</p>
          <p className="text-sm text-gray-400 mt-1">Book a lesson with a teacher to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Avatar name={booking.other_name} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900">{booking.other_name}</p>
                    <p className="text-sm text-indigo-600 font-medium">
                      {new Date(booking.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at {booking.scheduled_time}
                    </p>
                  </div>
                </div>
                <Badge status={booking.status}>{booking.status}</Badge>
              </div>
              {booking.status === "upcoming" && (
                <button
                  onClick={() => cancelBooking(booking.id)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Cancel Lesson
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
