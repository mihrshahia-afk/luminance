export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'bahaullah' | 'abdulbaha' | 'shoghieffendi' | 'other';
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

export type PrayerTopic =
  | 'Daily Prayers'
  | 'Morning'
  | 'Evening'
  | 'Obligatory Prayers'
  | 'Unity'
  | 'Love'
  | 'Healing'
  | 'Praise & Gratitude'
  | 'Reliance on God'
  | 'Tests & Difficulties'
  | 'Steadfastness'
  | 'Detachment'
  | 'Forgiveness'
  | 'Service & Teaching'
  | 'Knowledge & Wisdom'
  | 'Protection'
  | 'Children'
  | 'Family'
  | 'Marriage'
  | 'Departed Souls'
  | 'Holy Days'
  | 'Special Tablets'
  | 'Teaching';
