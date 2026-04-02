import Link from "next/link";
import { getDb } from "@/lib/db";
import { CATEGORY_ICONS } from "@/lib/constants";
import TeacherCard from "@/components/browse/TeacherCard";
import AnimatedStats from "@/components/home/AnimatedStats";
import Testimonials from "@/components/home/Testimonials";
import TrustSignals from "@/components/home/TrustSignals";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await getDb();

  const categories = (await db.all("SELECT * FROM categories ORDER BY name")) as {
    id: number;
    name: string;
    slug: string;
    icon: string;
  }[];

  // Stats
  const teacherCount = (await db.get(
    "SELECT COUNT(*) as count FROM teacher_profiles WHERE is_published = 1"
  ))?.count as number || 0;
  const lessonCount = (await db.get(
    "SELECT COUNT(*) as count FROM lesson_requests WHERE status = 'completed'"
  ))?.count as number || 0;
  const categoryCount = (await db.get(
    "SELECT COUNT(*) as count FROM categories"
  ))?.count as number || 0;

  // Featured teachers
  const featuredRows = await db.all(
    `SELECT
      tp.id, tp.user_id, u.name, tp.bio, tp.hourly_rate,
      tp.experience_level, tp.location, tp.skills,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id) as review_count
    FROM teacher_profiles tp
    JOIN users u ON u.id = tp.user_id
    LEFT JOIN reviews r ON r.teacher_id = tp.user_id
    WHERE tp.is_published = 1
    GROUP BY tp.id
    ORDER BY avg_rating DESC, review_count DESC
    LIMIT 4`
  );

  const featuredTeachers = [];
  for (const t of featuredRows) {
    const cats = (await db.all(
      `SELECT c.* FROM categories c
       JOIN teacher_categories tc ON tc.category_id = c.id
       WHERE tc.teacher_profile_id = ?`,
      t.id
    )) as { slug: string; name: string }[];
    featuredTeachers.push({
      ...t,
      user_id: t.user_id as number,
      name: t.name as string,
      bio: t.bio as string,
      hourly_rate: t.hourly_rate as number,
      experience_level: t.experience_level as string,
      location: t.location as string,
      skills: JSON.parse((t.skills as string) || "[]"),
      avg_rating: (t.avg_rating as number) || null,
      review_count: t.review_count as number,
      categories: cats,
    });
  }

  // Top reviews for testimonials
  const testimonialRows = await db.all(
    `SELECT r.rating, r.comment, u.name as reviewer_name, t.name as teacher_name
     FROM reviews r
     JOIN users u ON u.id = r.student_id
     JOIN users t ON t.id = r.teacher_id
     WHERE r.comment != '' AND r.rating >= 4
     ORDER BY r.rating DESC, r.created_at DESC
     LIMIT 4`
  );

  const testimonials = testimonialRows.map((r) => ({
    rating: r.rating as number,
    comment: r.comment as string,
    reviewer_name: r.reviewer_name as string,
    teacher_name: r.teacher_name as string,
  }));

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            Learn anything from
            <br />
            <span className="text-indigo-200">passionate local teachers</span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Affordable hobby lessons in your neighborhood. Sports, music, arts, cooking, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Link
              href="/browse"
              className="bg-white text-indigo-600 px-8 py-3.5 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20"
            >
              Find a Teacher
            </Link>
            <Link
              href="/signup"
              className="border-2 border-white/60 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Start Teaching
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <AnimatedStats
            stats={[
              { label: "Teachers", value: Math.max(teacherCount, 1), suffix: "+" },
              { label: "Lessons Completed", value: Math.max(lessonCount, 1), suffix: "+" },
              { label: "Categories", value: categoryCount },
            ]}
          />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="flex flex-col items-center p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group bg-white"
            >
              <span className="text-3xl mb-2">
                {CATEGORY_ICONS[cat.slug] || ""}
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured teachers */}
      {featuredTeachers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Teachers
            </h2>
            <Link
              href="/browse"
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTeachers.map((teacher) => (
              <TeacherCard key={teacher.user_id} teacher={teacher} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              What Students Are Saying
            </h2>
            <Testimonials reviews={testimonials} />
          </div>
        </section>
      )}

      {/* Trust Signals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">
          Why SkillSwap?
        </h2>
        <TrustSignals />
      </section>

      {/* How it works */}
      <section className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Browse Teachers",
                desc: "Search by category, skill, price, or location to find the perfect teacher for you.",
              },
              {
                step: "2",
                title: "Send a Request",
                desc: "Tell them what you want to learn, pick a time, and send a lesson request.",
              },
              {
                step: "3",
                title: "Learn Something New",
                desc: "Meet up, learn a new hobby, and leave a review to help others find great teachers.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-lg shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/signup"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
