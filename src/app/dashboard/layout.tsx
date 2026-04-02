"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-48" />
      </div>
    );
  }

  const teacherLinks = [
    { href: "/dashboard/teacher", label: "Requests" },
    { href: "/dashboard/teacher/lessons", label: "Lessons" },
    { href: "/dashboard/teacher/profile", label: "Profile" },
    { href: "/dashboard/teacher/reviews", label: "Reviews" },
    { href: "/dashboard/messages", label: "Messages" },
  ];

  const studentLinks = [
    { href: "/dashboard/student", label: "Requests" },
    { href: "/dashboard/student/lessons", label: "Lessons" },
    { href: "/dashboard/student/reviews", label: "Reviews" },
    { href: "/dashboard/messages", label: "Messages" },
  ];

  const links = user?.role === "teacher" ? teacherLinks : studentLinks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Mobile: horizontal scrolling tabs */}
      <div className="lg:hidden mb-4 -mx-4 px-4">
        <nav className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Dashboard
            </h2>
            <nav className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
