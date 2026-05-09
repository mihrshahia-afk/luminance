export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'bahaullah' | 'abdulbaha' | 'shoghieffendi' | 'thebab' | 'other';
  description: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface Prayer {
  id: string;
  topic: PrayerTopic;
  title?: string;
  text: string;
  author: string;
}

export interface UHJLetter {
  id: string;
  title: string;
  date: string;
  recipient: string;
  content: string;
}

export interface Annotation {
  id: string;
  documentId: string;
  documentType: 'book' | 'prayer' | 'letter';
  chapterId?: string;
  selectedText: string;
  note: string;
  color: string;
  createdAt: string;
}

export type PrayerTopic
  = "Obligatory Prayers"
  | "Aid and Assistance"
  | "America"
  | "Children"
  | "Detachment"
  | "Divine Springtime"
  | "Evening"
  | "Families"
  | "Firmness in the Covenant"
  | "Forgiveness"
  | "Gatherings"
  | "Grace at Table"
  | "Healing"
  | "Humanity"
  | "Huqúqu'lláh"
  | "Manifestation of God"
  | "Marriage"
  | "Morning"
  | "Nearness to God"
  | "Occasional Prayers"
  | "Paradise"
  | "Praise and Gratitude"
  | "Prayers for Teaching from the Tablets of the Divine Plan"
  | "Prison"
  | "Protection"
  | "Sacrifice"
  | "Service"
  | "Special Tablets"
  | "Spiritual Assembly"
  | "Spiritual Growth"
  | "Steadfastness"
  | "Teaching"
  | "Tests and Difficulties"
  | "The Departed"
  | "The Fast"
  | "The Fund"
  | "Trials"
  | "Triumph of the Cause"
  | "Unity"
  | "Women"
  | "Youth";
