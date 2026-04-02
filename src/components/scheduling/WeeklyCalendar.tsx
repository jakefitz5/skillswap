"use client";

import { useState, useEffect } from "react";
import { DAYS_OF_WEEK } from "@/lib/constants";

interface Slot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface WeeklyCalendarProps {
  teacherId: number;
  onSelectSlot?: (date: string, time: string) => void;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
}

function getWeekDates(offset: number): { date: Date; dayOfWeek: number }[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return { date, dayOfWeek: i };
  });
}

function formatDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function WeeklyCalendar({ teacherId, onSelectSlot }: WeeklyCalendarProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teachers/${teacherId}/availability`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [teacherId]);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-lg" />;
  }

  if (slots.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-gray-500 min-w-[140px] text-center">
            {weekDates[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" - "}
            {weekDates[6].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <button
            onClick={() => setWeekOffset((w) => Math.min(4, w + 1))}
            disabled={weekOffset >= 4}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map(({ date, dayOfWeek }) => {
          const isPast = date < today;
          const daySlots = slots.filter((s) => s.day_of_week === dayOfWeek);
          const isToday = formatDateStr(date) === formatDateStr(new Date());

          return (
            <div
              key={dayOfWeek}
              className={`text-center p-2 rounded-lg ${
                isToday ? "bg-indigo-50 border border-indigo-200" : "bg-gray-50"
              } ${isPast ? "opacity-40" : ""}`}
            >
              <p className="text-xs font-medium text-gray-500">
                {DAYS_OF_WEEK[dayOfWeek].slice(0, 3)}
              </p>
              <p className={`text-sm font-semibold mb-1 ${isToday ? "text-indigo-600" : "text-gray-900"}`}>
                {date.getDate()}
              </p>
              {daySlots.length > 0 ? (
                <div className="space-y-1">
                  {daySlots.map((slot, i) => (
                    <button
                      key={i}
                      disabled={isPast || !onSelectSlot}
                      onClick={() =>
                        onSelectSlot?.(formatDateStr(date), slot.start_time)
                      }
                      className={`w-full text-[10px] px-1 py-0.5 rounded ${
                        isPast
                          ? "bg-gray-200 text-gray-400"
                          : onSelectSlot
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {formatTime(slot.start_time)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-300">-</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
