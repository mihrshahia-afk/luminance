export interface BookChapter {
  id: string;
  title: string;
  urlSegment: string; // the /1, /2, /chapter-slug etc appended to urlPath
}

export interface BookConfig {
  id: string;
  title: string;
  author: string;
  category: 'bahaullah' | 'abdulbaha' | 'shoghieffendi' | 'other';
  description: string;
  urlPath: string; // path after https://www.bahai.org/library/authoritative-texts/
  // Seed chapters — used immediately before discovery completes.
  // Discovery will expand this list with all chapters found on bahai.org.
  seedChapters: BookChapter[];
}

export const bookConfigs: BookConfig[] = [
  {
    id: 'hidden-words',
    title: 'The Hidden Words',
    author: "Bahá'u'lláh",
    category: 'bahaullah',
    description: 'A collection of ethical and spiritual aphorisms revealed by Bahá\'u\'lláh during His exile in Baghdad around 1858. Composed of two parts — Arabic and Persian — they distill the inner essence of the teachings of all the Prophets.',
    urlPath: 'bahaullah/hidden-words',
    seedChapters: [
      { id: 'hw-1', title: 'From the Arabic', urlSegment: '1' },
      { id: 'hw-2', title: 'From the Persian', urlSegment: '2' },
    ],
  },
  {
    id: 'seven-valleys',
    title: 'The Seven Valleys',
    author: "Bahá'u'lláh",
    category: 'bahaullah',
    description: 'Revealed in response to questions from a Sufi scholar, this mystical treatise describes the stages of the soul\'s journey to God through seven valleys: Search, Love, Knowledge, Unity, Contentment, Wonderment, and True Poverty.',
    urlPath: 'bahaullah/call-divine-beloved',
    seedChapters: [
      { id: 'sv-4', title: 'The Seven Valleys', urlSegment: '4' },
      { id: 'sv-9', title: 'The Four Valleys', urlSegment: '9' },
    ],
  },
  {
    id: 'gleanings',
    title: 'Gleanings from the Writings of Bahá\'u\'lláh',
    author: "Bahá'u'lláh",
    category: 'bahaullah',
    description: 'A selection of some of the most characteristic passages from the writings of Bahá\'u\'lláh, compiled and translated by Shoghi Effendi. Spans the full range of themes from God\'s nature to social transformation.',
    urlPath: 'bahaullah/gleanings-writings-bahaullah',
    seedChapters: [
      { id: 'gl-1', title: 'Selections I–XXX', urlSegment: '1' },
      { id: 'gl-2', title: 'Selections XXXI–LX', urlSegment: '2' },
      { id: 'gl-3', title: 'Selections LXI–XC', urlSegment: '3' },
      { id: 'gl-4', title: 'Selections XCI–CXXI', urlSegment: '4' },
      { id: 'gl-5', title: 'Selections CXXII–CLXVI', urlSegment: '5' },
    ],
  },
  {
    id: 'iqan',
    title: 'Kitáb-i-Íqán',
    author: "Bahá'u'lláh",
    category: 'bahaullah',
    description: 'The Book of Certitude — revealed in two days and two nights, this work establishes the spiritual foundation of the Bahá\'í Faith, demonstrating the continuity of divine revelation through the ages.',
    urlPath: 'bahaullah/kitab-i-iqan',
    seedChapters: [
      { id: 'iq-1', title: 'Part One', urlSegment: '1' },
      { id: 'iq-2', title: 'Part Two', urlSegment: '2' },
    ],
  },
  {
    id: 'aqdas',
    title: 'Kitáb-i-Aqdas',
    author: "Bahá'u'lláh",
    category: 'bahaullah',
    description: 'The Most Holy Book — Bahá\'u\'lláh\'s book of laws, described by Him as the "source of true felicity." Contains the laws and ordinances of the Bahá\'í Faith, together with a synopsis, codification, and notes.',
    urlPath: 'bahaullah/kitab-i-aqdas',
    seedChapters: [
      { id: 'aq-1', title: 'The Kitáb-i-Aqdas', urlSegment: '1' },
      { id: 'aq-2', title: 'Questions and Answers', urlSegment: '2' },
      { id: 'aq-3', title: 'Synopsis and Codification', urlSegment: '3' },
      { id: 'aq-4', title: 'Notes', urlSegment: '4' },
    ],
  },
  {
    id: 'paris-talks',
    title: 'Paris Talks',
    author: "'Abdu'l-Bahá",
    category: 'abdulbaha',
    description: 'Addresses given by \'Abdu\'l-Bahá during His visit to Paris in 1911 — covering spiritual principles, social teachings, and the nature of the Bahá\'í Faith in a series of intimate gatherings.',
    urlPath: 'abdul-baha/paris-talks',
    seedChapters: [
      { id: 'pt-1', title: 'Part One', urlSegment: '1' },
      { id: 'pt-2', title: 'Part Two', urlSegment: '2' },
      { id: 'pt-3', title: 'Part Three', urlSegment: '3' },
    ],
  },
  {
    id: 'promulgation',
    title: 'The Promulgation of Universal Peace',
    author: "'Abdu'l-Bahá",
    category: 'abdulbaha',
    description: 'Talks delivered by \'Abdu\'l-Bahá during His travels in North America in 1912, addressing diverse audiences on the principles of the Bahá\'í Faith and the coming age of world unity.',
    urlPath: 'abdul-baha/promulgation-universal-peace',
    seedChapters: [
      { id: 'pup-1', title: 'Part One', urlSegment: '1' },
      { id: 'pup-2', title: 'Part Two', urlSegment: '2' },
      { id: 'pup-3', title: 'Part Three', urlSegment: '3' },
      { id: 'pup-4', title: 'Part Four', urlSegment: '4' },
    ],
  },
  {
    id: 'some-answered-questions',
    title: 'Some Answered Questions',
    author: "'Abdu'l-Bahá",
    category: 'abdulbaha',
    description: 'A collection of table talks given by \'Abdu\'l-Bahá in \'Akká to Laura Clifford Barney, covering theology, philosophy, and science — from the nature of the soul to the interpretation of scripture.',
    urlPath: 'abdul-baha/some-answered-questions',
    seedChapters: [
      { id: 'saq-1', title: 'Part One: On the Influence of the Prophets', urlSegment: '1' },
      { id: 'saq-2', title: 'Part Two: Some Christian Subjects', urlSegment: '2' },
      { id: 'saq-3', title: 'Part Three: On the Powers and Conditions of the Manifestations', urlSegment: '3' },
      { id: 'saq-4', title: 'Part Four: On the Origin, Powers, and Conditions of Man', urlSegment: '4' },
      { id: 'saq-5', title: 'Part Five: Miscellaneous Subjects', urlSegment: '5' },
    ],
  },
];

export function getBookConfig(id: string): BookConfig | undefined {
  return bookConfigs.find(b => b.id === id);
}
