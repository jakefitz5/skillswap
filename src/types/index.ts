export interface User {
  id: number;
  email: string;
  name: string;
  role: "teacher" | "student";
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: number;
  user_id: number;
  bio: string;
  hourly_rate: number;
  experience_level: "beginner" | "intermediate" | "advanced" | "expert";
  location: string;
  availability: string; // JSON array
  skills: string; // JSON array
  is_published: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export interface LessonRequest {
  id: number;
  student_id: number;
  teacher_id: number;
  student_name: string;
  message: string;
  preferred_time: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  lesson_request_id: number;
  student_id: number;
  teacher_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface TeacherListing {
  id: number;
  user_id: number;
  name: string;
  email: string;
  bio: string;
  hourly_rate: number;
  experience_level: string;
  location: string;
  availability: string[];
  skills: string[];
  categories: Category[];
  avg_rating: number | null;
  review_count: number;
  is_published: number;
}

export interface SessionUser {
  userId: number;
  email: string;
  name: string;
  role: "teacher" | "student";
}
