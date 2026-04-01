export const EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export const REQUEST_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "completed",
  "cancelled",
] as const;

export const SEED_CATEGORIES = [
  { name: "Sports", slug: "sports", icon: "sports" },
  { name: "Music", slug: "music", icon: "music" },
  { name: "Arts & Crafts", slug: "arts", icon: "arts" },
  { name: "Academics", slug: "academics", icon: "academics" },
  { name: "Technology", slug: "technology", icon: "technology" },
  { name: "Cooking", slug: "cooking", icon: "cooking" },
  { name: "Languages", slug: "languages", icon: "languages" },
  { name: "Fitness", slug: "fitness", icon: "fitness" },
  { name: "Photography", slug: "photography", icon: "photography" },
  { name: "Dance", slug: "dance", icon: "dance" },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  sports: "\u26BD",
  music: "\uD83C\uDFB5",
  arts: "\uD83C\uDFA8",
  academics: "\uD83D\uDCDA",
  technology: "\uD83D\uDCBB",
  cooking: "\uD83C\uDF73",
  languages: "\uD83C\uDF0D",
  fitness: "\uD83D\uDCAA",
  photography: "\uD83D\uDCF7",
  dance: "\uD83D\uDC83",
};
