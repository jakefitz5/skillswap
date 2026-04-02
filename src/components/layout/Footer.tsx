import Link from "next/link";

export default function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`bg-gray-50 border-t border-gray-200 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              SkillSwap
            </h3>
            <p className="text-sm text-gray-500">
              Connecting passionate teachers with eager learners for affordable
              hobby lessons.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Explore
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/browse"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Browse Teachers
              </Link>
              <Link
                href="/signup"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Become a Teacher
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              How It Works
            </h3>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">1. Browse local teachers</p>
              <p className="text-sm text-gray-500">2. Send a lesson request</p>
              <p className="text-sm text-gray-500">3. Learn something new</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            SkillSwap &mdash; Learn anything, teach anything
          </p>
        </div>
      </div>
    </footer>
  );
}
