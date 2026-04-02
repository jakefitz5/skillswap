"use client";

import { DAYS_OF_WEEK, TIME_SLOTS } from "@/lib/constants";
import type { AvailabilitySlot } from "@/types";

interface AvailabilityEditorProps {
  slots: AvailabilitySlot[];
  onChange: (slots: AvailabilitySlot[]) => void;
}

export default function AvailabilityEditor({ slots, onChange }: AvailabilityEditorProps) {
  function addSlot() {
    onChange([...slots, { day_of_week: 1, start_time: "09:00", end_time: "12:00" }]);
  }

  function removeSlot(index: number) {
    onChange(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: keyof AvailabilitySlot, value: number | string) {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  return (
    <div>
      <div className="space-y-3">
        {slots.map((slot, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <select
              value={slot.day_of_week}
              onChange={(e) => updateSlot(i, "day_of_week", Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DAYS_OF_WEEK.map((day, idx) => (
                <option key={idx} value={idx}>{day}</option>
              ))}
            </select>

            <select
              value={slot.start_time}
              onChange={(e) => updateSlot(i, "start_time", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>

            <span className="text-sm text-gray-400">to</span>

            <select
              value={slot.end_time}
              onChange={(e) => updateSlot(i, "end_time", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIME_SLOTS.filter((t) => t > slot.start_time).map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => removeSlot(i)}
              className="text-red-500 hover:text-red-700 text-sm px-2 ml-auto"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addSlot}
        className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
      >
        + Add time slot
      </button>
    </div>
  );
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
}
