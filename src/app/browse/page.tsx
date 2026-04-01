"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TeacherCard from "@/components/browse/TeacherCard";
import { CATEGORY_ICONS, EXPERIENCE_LEVELS } from "@/lib/constants";

export default function BrowsePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
          Loading...
        </div>
      }
    >
      <BrowsePageContent />
    </Suspense>
  );
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Teacher {
  user_id: number;
  name: string;
  bio: string;
  hourly_rate: number;
  experience_level: string;
  location: string;
  skills: string[];
  avg_rating: number | null;
  review_count: number;
  categories: { slug: string; name: string }[];
}

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const experience = searchParams.get("experience") || "";
  const sort = searchParams.get("sort") || "rating";
  const page = parseInt(searchParams.get("page") || "1");

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories));
  }, []);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (experience) params.set("experience", experience);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));

    const res = await fetch(`/api/teachers?${params}`);
    const data = await res.json();
    setTeachers(data.teachers);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, [q, category, minPrice, maxPrice, experience, sort, page]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`/browse?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter("q", searchInput);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search teachers, skills, topics..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Category
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!category}
                    onChange={() => updateFilter("category", "")}
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
                {categories.map((cat) => (
                  <label
                    key={cat.slug}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === cat.slug}
                      onChange={() => updateFilter("category", cat.slug)}
                      className="text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">
                      {CATEGORY_ICONS[cat.slug]} {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Price Range
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Experience
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experience"
                    checked={!experience}
                    onChange={() => updateFilter("experience", "")}
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Any</span>
                </label>
                {EXPERIENCE_LEVELS.map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === level}
                      onChange={() => updateFilter("experience", level)}
                      className="text-indigo-600"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {(category || minPrice || maxPrice || experience || q) && (
              <button
                onClick={() => router.push("/browse")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {loading ? "Searching..." : `${total} teacher${total !== 1 ? "s" : ""} found`}
            </p>
            <select
              value={sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="rating">Top Rated</option>
              <option value="rate_asc">Price: Low to High</option>
              <option value="rate_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">No teachers found</p>
              <p className="text-gray-400 text-sm">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                  <TeacherCard key={teacher.user_id} teacher={teacher} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => updateFilter("page", String(page - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => updateFilter("page", String(page + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
