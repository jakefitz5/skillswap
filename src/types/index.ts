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
  availability: string;
  skills: string;
  is_published: number;
  teaching_philosophy: string;
  certifications: string;
  social_links: string;
  portfolio_urls: string;
  years_experience: number;
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
  proposed_date: string;
  proposed_time: string;
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
  years_experience: number;
}

export interface SessionUser {
  userId: number;
  email: string;
  name: string;
  role: "teacher" | "student";
}

// Phase A: Enhanced profiles
export interface Certification {
  name: string;
  issuer?: string;
  year?: number;
}

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

export interface PortfolioItem {
  url: string;
  title: string;
  type: "image" | "video";
}

// Phase B: Scheduling
export interface AvailabilitySlot {
  id?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface LessonBooking {
  id: number;
  lesson_request_id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: "upcoming" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

// Phase C: Messaging
export interface Conversation {
  id: number;
  participant_1: number;
  participant_2: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationSummary {
  id: number;
  other_user_id: number;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: number;
  created_at: string;
}

// Phase D: Notifications
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: number;
  created_at: string;
}
