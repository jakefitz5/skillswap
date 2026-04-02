"use client";

import { useState, useEffect } from "react";
import { EXPERIENCE_LEVELS } from "@/lib/constants";
import type { Certification, SocialLinks, PortfolioItem } from "@/types";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function TeacherProfileEdit() {
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [availability, setAvailability] = useState<string[]>([""]);
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [isPublished, setIsPublished] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New fields
  const [teachingPhilosophy, setTeachingPhilosophy] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [portfolioUrls, setPortfolioUrls] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([profileData, catData]) => {
      setCategories(catData.categories);
      if (profileData.profile) {
        const p = profileData.profile;
        setBio(p.bio || "");
        setHourlyRate(String(p.hourly_rate || ""));
        setSkills(p.skills || []);
        setCategoryIds(p.categoryIds || []);
        setAvailability(p.availability?.length ? p.availability : [""]);
        setLocation(p.location || "");
        setExperienceLevel(p.experience_level || "beginner");
        setIsPublished(!!p.is_published);
        setTeachingPhilosophy(p.teaching_philosophy || "");
        setYearsExperience(String(p.years_experience || ""));
        setCertifications(p.certifications || []);
        setSocialLinks(p.social_links || {});
        setPortfolioUrls(p.portfolio_urls || []);
      }
      setLoading(false);
    });
  }, []);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function toggleCategory(id: number) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function addAvailabilitySlot() {
    setAvailability([...availability, ""]);
  }

  function updateAvailability(index: number, value: string) {
    const updated = [...availability];
    updated[index] = value;
    setAvailability(updated);
  }

  function removeAvailability(index: number) {
    setAvailability(availability.filter((_, i) => i !== index));
  }

  function addCertification() {
    setCertifications([...certifications, { name: "" }]);
  }

  function updateCertification(index: number, field: keyof Certification, value: string | number) {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  }

  function removeCertification(index: number) {
    setCertifications(certifications.filter((_, i) => i !== index));
  }

  function addPortfolioItem() {
    if (portfolioUrls.length >= 10) return;
    setPortfolioUrls([...portfolioUrls, { url: "", title: "", type: "image" }]);
  }

  function updatePortfolioItem(index: number, field: keyof PortfolioItem, value: string) {
    const updated = [...portfolioUrls];
    updated[index] = { ...updated[index], [field]: value } as PortfolioItem;
    setPortfolioUrls(updated);
  }

  function removePortfolioItem(index: number) {
    setPortfolioUrls(portfolioUrls.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio,
        hourlyRate: Number(hourlyRate) || 0,
        skills,
        categoryIds,
        availability: availability.filter(Boolean),
        location,
        experienceLevel,
        isPublished,
        teachingPhilosophy,
        yearsExperience: Number(yearsExperience) || 0,
        certifications: certifications.filter((c) => c.name),
        socialLinks,
        portfolioUrls: portfolioUrls.filter((p) => p.url),
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Publish toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Profile Visibility</h3>
              <p className="text-sm text-gray-500">
                {isPublished
                  ? "Your profile is visible to students"
                  : "Your profile is hidden from students"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublished ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublished ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell students about yourself, your teaching style, and what they can expect..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Teaching Philosophy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Philosophy</label>
          <textarea
            rows={3}
            value={teachingPhilosophy}
            onChange={(e) => setTeachingPhilosophy(e.target.value)}
            placeholder="Describe your approach to teaching and what makes your lessons unique..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Hourly Rate + Years Experience row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="25"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input
              type="number"
              min="0"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span key={skill} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="text-indigo-400 hover:text-indigo-600">x</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder="Type a skill and press Enter"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button type="button" onClick={addSkill} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Add
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  categoryIds.includes(cat.id) ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input type="checkbox" checked={categoryIds.includes(cat.id)} onChange={() => toggleCategory(cat.id)} className="text-indigo-600 rounded" />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Certifications & Credentials</label>
          <div className="space-y-3">
            {certifications.map((cert, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(i, "name", e.target.value)}
                  placeholder="Certification name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={cert.issuer || ""}
                  onChange={(e) => updateCertification(i, "issuer", e.target.value)}
                  placeholder="Issuer (optional)"
                  className="sm:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  value={cert.year || ""}
                  onChange={(e) => updateCertification(i, "year", Number(e.target.value))}
                  placeholder="Year"
                  className="sm:w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="button" onClick={() => removeCertification(i)} className="text-red-500 hover:text-red-700 text-sm px-2">Remove</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addCertification} className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            + Add certification
          </button>
        </div>

        {/* Social Media Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-24">Instagram</span>
              <input
                type="url"
                value={socialLinks.instagram || ""}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/yourusername"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-24">YouTube</span>
              <input
                type="url"
                value={socialLinks.youtube || ""}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                placeholder="https://youtube.com/@yourchannel"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-24">LinkedIn</span>
              <input
                type="url"
                value={socialLinks.linkedin || ""}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio / Gallery</label>
          <p className="text-xs text-gray-400 mb-3">Add links to images or videos showcasing your work (max 10)</p>
          <div className="space-y-3">
            {portfolioUrls.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => updatePortfolioItem(i, "url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updatePortfolioItem(i, "title", e.target.value)}
                  placeholder="Title"
                  className="sm:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={item.type}
                  onChange={(e) => updatePortfolioItem(i, "type", e.target.value)}
                  className="sm:w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <button type="button" onClick={() => removePortfolioItem(i)} className="text-red-500 hover:text-red-700 text-sm px-2">Remove</button>
              </div>
            ))}
          </div>
          {portfolioUrls.length < 10 && (
            <button type="button" onClick={addPortfolioItem} className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
              + Add portfolio item
            </button>
          )}
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
          <div className="space-y-2">
            {availability.map((slot, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={slot}
                  onChange={(e) => updateAvailability(i, e.target.value)}
                  placeholder="e.g., Monday 9am - 12pm"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                {availability.length > 1 && (
                  <button type="button" onClick={() => removeAvailability(i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addAvailabilitySlot} className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            + Add time slot
          </button>
        </div>

        {/* Location + Experience Level row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Columbus, OH"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">Profile saved!</span>
          )}
        </div>
      </form>
    </div>
  );
}
