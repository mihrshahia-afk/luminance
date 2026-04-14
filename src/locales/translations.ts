export type Language = 'en' | 'fa' | 'ar';

export interface TranslationStrings {
  // App
  appName: string;
  appSubtitle: string;
  bahaiLibrary: string;

  // Navigation
  navHome: string;
  navLiterature: string;
  navLiteratureShort: string;
  navPrayers: string;
  navLetters: string;
  navSearch: string;
  navQiblih: string;
  navFavorites: string;
  navSaved: string;

  // Auth
  authSignIn: string;
  authSignUp: string;
  authSignOut: string;
  authContinueGuest: string;
  authName: string;
  authEmail: string;
  authPassword: string;
  authConfirmPassword: string;
  authNamePlaceholder: string;
  authEmailPlaceholder: string;
  authPasswordPlaceholder: string;
  authPasswordMinLength: string;
  authConfirmPlaceholder: string;
  authPasswordsMismatch: string;
  authPasswordTooShort: string;
  authNameRequired: string;
  authAccountCreated: string;
  authDescription: string;
  authAlreadyHaveAccount: string;
  authDontHaveAccount: string;

  // Home page
  homeDaily: string;
  homeBooks: string;
  homePrayers: string;
  homeLetters: string;
  homeSearch: string;
  homeCommunities: string;

  // Books page
  booksLibrary: string;
  booksTitle: string;
  booksInLibrary: string;
  booksChapter: string;
  booksChapters: string;
  booksRead: string;
  booksBeginReading: string;
  booksContinueReading: string;
  booksNotAvailable: string;
  booksAllBooks: string;
  booksCover: string;

  // Book categories
  catBahaullah: string;
  catAbdulBaha: string;
  catShoghiEffendi: string;
  catTheBab: string;
  catOther: string;

  // Prayers page
  prayersTitle: string;
  prayersBahaiPrayers: string;
  prayersAcrossTopics: string;
  prayersAll: string;
  prayersPrayer: string;
  prayersPrayers: string;

  // Prayer topics
  topicObligatory: string;
  topicDaily: string;
  topicMorning: string;
  topicEvening: string;
  topicPraise: string;
  topicLove: string;
  topicUnity: string;
  topicHealing: string;
  topicReliance: string;
  topicTests: string;
  topicSteadfastness: string;
  topicForgiveness: string;
  topicDetachment: string;
  topicProtection: string;
  topicKnowledge: string;
  topicService: string;
  topicTeaching: string;
  topicChildren: string;
  topicFamily: string;
  topicMarriage: string;
  topicDeparted: string;
  topicHolyDays: string;
  topicSpecialTablets: string;

  // Prayer topic groups
  topicGroupObligatory: string;
  topicGroupSpiritual: string;
  topicGroupStrength: string;
  topicGroupCommunity: string;
  topicGroupSpecial: string;

  // Letters page
  lettersTitle: string;
  lettersSubtitle: string;
  lettersFilter: string;

  // Favorites page
  favoritesTitle: string;
  favoritesItemsSaved: string;
  favoritesEmpty: string;
  favoritesBooks: string;
  favoritesPrayers: string;
  favoritesLetters: string;

  // Search page
  searchTitle: string;
  searchSubtitle: string;
  searchAllSources: string;
  searchBooks: string;
  searchPrayers: string;
  searchLetters: string;
  searchBook: string;
  searchPrayer: string;
  searchLetter: string;

  // Qiblih page
  qiblihTitle: string;
  qiblihSubtitle: string;
  qiblihShrineOf: string;
  qiblihEnable: string;
  qiblihLocating: string;
  qiblihPermissions: string;
  qiblihDenied: string;
  qiblihHoldDevice: string;
  qiblihNoCompass: string;
  qiblihKmTo: string;
  qiblihAbout: string;
  qiblihTryAgain: string;

  // Annotations
  annotNotes: string;
  annotSelectedText: string;
  annotPlaceholder: string;
  annotSave: string;
  annotDelete: string;

  // Theme labels
  themeBlue: string;
  themeDark: string;
  themeCream: string;

  // Common
  commonLoading: string;
  commonRetry: string;
  commonOpenOnBahai: string;
  commonLanguage: string;

  // Direction
  dir: 'ltr' | 'rtl';
}

const en: TranslationStrings = {
  appName: 'Luminance',
  appSubtitle: 'A Personal Bah\u00e1\u02bc\u00ed Library',
  bahaiLibrary: 'Bah\u00e1\u02bc\u00ed Library',

  navHome: 'Home',
  navLiterature: 'Bah\u00e1\u02bc\u00ed Literature',
  navLiteratureShort: 'Literature',
  navPrayers: 'Prayers',
  navLetters: 'Letters',
  navSearch: 'Search',
  navQiblih: 'Qiblih',
  navFavorites: 'Favorites',
  navSaved: 'Saved',

  authSignIn: 'Sign In',
  authSignUp: 'Sign Up',
  authSignOut: 'Sign Out',
  authContinueGuest: 'Continue as guest',
  authName: 'Name',
  authEmail: 'Email',
  authPassword: 'Password',
  authConfirmPassword: 'Confirm Password',
  authNamePlaceholder: 'Your name',
  authEmailPlaceholder: 'you@example.com',
  authPasswordPlaceholder: 'At least 6 characters',
  authPasswordMinLength: 'Your password',
  authConfirmPlaceholder: 'Re-enter your password',
  authPasswordsMismatch: 'Passwords do not match.',
  authPasswordTooShort: 'Password must be at least 6 characters.',
  authNameRequired: 'Please enter your name.',
  authAccountCreated: 'Account created! Check your email to confirm, then sign in.',
  authDescription: 'A personal Bah\u00e1\u02bc\u00ed library for sacred texts, prayers, and letters',
  authAlreadyHaveAccount: 'Already have an account?',
  authDontHaveAccount: "Don't have an account?",

  homeDaily: 'Daily Reflection',
  homeBooks: 'Books',
  homePrayers: 'Prayers',
  homeLetters: 'Letters',
  homeSearch: 'Search',
  homeCommunities: 'Communities in Action',

  booksLibrary: 'Library',
  booksTitle: 'Bah\u00e1\u02bc\u00ed Literature',
  booksInLibrary: 'books in your library',
  booksChapter: 'chapter',
  booksChapters: 'chapters',
  booksRead: 'read',
  booksBeginReading: 'Begin Reading',
  booksContinueReading: 'Continue Reading',
  booksNotAvailable: 'Not available in this language',
  booksAllBooks: '\u2190 All Books',
  booksCover: 'Cover',

  catBahaullah: 'Bah\u00e1\u02bcu\u02bcll\u00e1h',
  catAbdulBaha: '\u2018Abdu\u2019l-Bah\u00e1',
  catShoghiEffendi: 'Shoghi Effendi',
  catTheBab: 'The B\u00e1b',
  catOther: 'Other Authors',

  prayersTitle: 'Prayers',
  prayersBahaiPrayers: 'Bah\u00e1\u02bc\u00ed Prayers',
  prayersAcrossTopics: 'prayers across',
  prayersAll: 'All Prayers',
  prayersPrayer: 'prayer',
  prayersPrayers: 'prayers',

  topicObligatory: 'Obligatory Prayers',
  topicDaily: 'Daily Prayers',
  topicMorning: 'Morning',
  topicEvening: 'Evening',
  topicPraise: 'Praise & Gratitude',
  topicLove: 'Love',
  topicUnity: 'Unity',
  topicHealing: 'Healing',
  topicReliance: 'Reliance on God',
  topicTests: 'Tests & Difficulties',
  topicSteadfastness: 'Steadfastness',
  topicForgiveness: 'Forgiveness',
  topicDetachment: 'Detachment',
  topicProtection: 'Protection',
  topicKnowledge: 'Knowledge & Wisdom',
  topicService: 'Service & Teaching',
  topicTeaching: 'Teaching',
  topicChildren: 'Children',
  topicFamily: 'Family',
  topicMarriage: 'Marriage',
  topicDeparted: 'Departed Souls',
  topicHolyDays: 'Holy Days',
  topicSpecialTablets: 'Special Tablets',

  topicGroupObligatory: 'Obligatory & Daily',
  topicGroupSpiritual: 'Spiritual Life',
  topicGroupStrength: 'Strength & Support',
  topicGroupCommunity: 'Community & Service',
  topicGroupSpecial: 'Special Occasions',

  lettersTitle: 'Universal House of Justice Letters',
  lettersSubtitle: 'letters from 1963 to present \u2014 the complete record since the House of Justice was first established',
  lettersFilter: 'Filter letters...',

  favoritesTitle: 'Favorites',
  favoritesItemsSaved: 'items saved',
  favoritesEmpty: 'No favorites yet. Star items you love to find them here.',
  favoritesBooks: 'Books',
  favoritesPrayers: 'Prayers',
  favoritesLetters: 'Letters',

  searchTitle: 'Search the Writings',
  searchSubtitle: 'Bah\u00e1\u02bc\u00ed Reference Library',
  searchAllSources: 'All Sources',
  searchBooks: 'Books',
  searchPrayers: 'Prayers',
  searchLetters: 'Letters',
  searchBook: 'Book',
  searchPrayer: 'Prayer',
  searchLetter: 'Letter',

  qiblihTitle: 'Qiblih',
  qiblihSubtitle: 'Direction of Prayer',
  qiblihShrineOf: 'Shrine of Bah\u00e1\u02bcu\u02bcll\u00e1h \u00b7 Bahj\u00ed, \u02bcAkk\u00e1',
  qiblihEnable: 'Enable Compass',
  qiblihLocating: 'Locating you\u2026',
  qiblihPermissions: 'Requires location & motion permissions',
  qiblihDenied: 'Location permission denied',
  qiblihHoldDevice: 'Hold your device flat and rotate to align the arrow',
  qiblihNoCompass: 'Compass sensor not detected.',
  qiblihKmTo: 'km to Bahj\u00ed',
  qiblihAbout: 'The Qiblih is the point of adoration to which Bah\u00e1\u02bc\u00eds turn when reciting obligatory prayers. It is the resting place of Bah\u00e1\u02bcu\u02bcll\u00e1h at Bahj\u00ed.',
  qiblihTryAgain: 'Try Again',

  annotNotes: 'Notes',
  annotSelectedText: 'Selected text:',
  annotPlaceholder: 'Write your thoughts...',
  annotSave: 'Save',
  annotDelete: 'Delete',

  themeBlue: 'Blue',
  themeDark: 'Dark',
  themeCream: 'Cream',

  commonLoading: 'Loading...',
  commonRetry: 'Retry',
  commonOpenOnBahai: 'Open on bahai.org',
  commonLanguage: 'Language',

  dir: 'ltr',
};

const fa: TranslationStrings = {
  appName: '\u0644\u0648\u0645\u06cc\u0646\u0627\u0646\u0633',
  appSubtitle: '\u06a9\u062a\u0627\u0628\u062e\u0627\u0646\u0647\u0654 \u0634\u062e\u0635\u06cc \u0628\u0647\u0627\u0626\u06cc',
  bahaiLibrary: '\u06a9\u062a\u0627\u0628\u062e\u0627\u0646\u0647\u0654 \u0628\u0647\u0627\u0626\u06cc',

  navHome: '\u062e\u0627\u0646\u0647',
  navLiterature: '\u0622\u062b\u0627\u0631 \u0628\u0647\u0627\u0626\u06cc',
  navLiteratureShort: '\u0622\u062b\u0627\u0631',
  navPrayers: '\u0645\u0646\u0627\u062c\u0627\u062a',
  navLetters: '\u0627\u0644\u0648\u0627\u062d',
  navSearch: '\u062c\u0633\u062a\u062c\u0648',
  navQiblih: '\u0642\u0628\u0644\u0647',
  navFavorites: '\u0645\u0648\u0631\u062f \u0639\u0644\u0627\u0642\u0647',
  navSaved: '\u0630\u062e\u06cc\u0631\u0647',

  authSignIn: '\u0648\u0631\u0648\u062f',
  authSignUp: '\u062b\u0628\u062a \u0646\u0627\u0645',
  authSignOut: '\u062e\u0631\u0648\u062c',
  authContinueGuest: '\u0627\u062f\u0627\u0645\u0647 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0645\u0647\u0645\u0627\u0646',
  authName: '\u0646\u0627\u0645',
  authEmail: '\u0627\u06cc\u0645\u06cc\u0644',
  authPassword: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631',
  authConfirmPassword: '\u062a\u0623\u06cc\u06cc\u062f \u0631\u0645\u0632 \u0639\u0628\u0648\u0631',
  authNamePlaceholder: '\u0646\u0627\u0645 \u0634\u0645\u0627',
  authEmailPlaceholder: 'you@example.com',
  authPasswordPlaceholder: '\u062d\u062f\u0627\u0642\u0644 \u06f6 \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631',
  authPasswordMinLength: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0634\u0645\u0627',
  authConfirmPlaceholder: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0631\u0627 \u062f\u0648\u0628\u0627\u0631\u0647 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f',
  authPasswordsMismatch: '\u0631\u0645\u0632\u0647\u0627\u06cc \u0639\u0628\u0648\u0631 \u0645\u0637\u0627\u0628\u0642\u062a \u0646\u062f\u0627\u0631\u0646\u062f.',
  authPasswordTooShort: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0628\u0627\u06cc\u062f \u062d\u062f\u0627\u0642\u0644 \u06f6 \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631 \u0628\u0627\u0634\u062f.',
  authNameRequired: '\u0644\u0637\u0641\u0627\u064b \u0646\u0627\u0645 \u062e\u0648\u062f \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f.',
  authAccountCreated: '\u062d\u0633\u0627\u0628 \u0634\u0645\u0627 \u0627\u06cc\u062c\u0627\u062f \u0634\u062f! \u0627\u06cc\u0645\u06cc\u0644 \u062e\u0648\u062f \u0631\u0627 \u0628\u0631\u0631\u0633\u06cc \u06a9\u0646\u06cc\u062f.',
  authDescription: '\u06a9\u062a\u0627\u0628\u062e\u0627\u0646\u0647\u0654 \u0634\u062e\u0635\u06cc \u0628\u0647\u0627\u0626\u06cc \u0628\u0631\u0627\u06cc \u0622\u062b\u0627\u0631 \u0645\u0642\u062f\u0633\u0647\u060c \u0645\u0646\u0627\u062c\u0627\u062a \u0648 \u0627\u0644\u0648\u0627\u062d',
  authAlreadyHaveAccount: '\u062d\u0633\u0627\u0628 \u062f\u0627\u0631\u06cc\u062f\u061f',
  authDontHaveAccount: '\u062d\u0633\u0627\u0628 \u0646\u062f\u0627\u0631\u06cc\u062f\u061f',

  homeDaily: '\u062a\u0623\u0645\u0644 \u0631\u0648\u0632\u0627\u0646\u0647',
  homeBooks: '\u06a9\u062a\u0628',
  homePrayers: '\u0645\u0646\u0627\u062c\u0627\u062a',
  homeLetters: '\u0627\u0644\u0648\u0627\u062d',
  homeSearch: '\u062c\u0633\u062a\u062c\u0648',
  homeCommunities: '\u062c\u0648\u0627\u0645\u0639 \u062f\u0631 \u0639\u0645\u0644',

  booksLibrary: '\u06a9\u062a\u0627\u0628\u062e\u0627\u0646\u0647',
  booksTitle: '\u0622\u062b\u0627\u0631 \u0628\u0647\u0627\u0626\u06cc',
  booksInLibrary: '\u06a9\u062a\u0627\u0628 \u062f\u0631 \u06a9\u062a\u0627\u0628\u062e\u0627\u0646\u0647\u0654 \u0634\u0645\u0627',
  booksChapter: '\u0641\u0635\u0644',
  booksChapters: '\u0641\u0635\u0644',
  booksRead: '\u062e\u0648\u0627\u0646\u062f\u0647 \u0634\u062f\u0647',
  booksBeginReading: '\u0634\u0631\u0648\u0639 \u0645\u0637\u0627\u0644\u0639\u0647',
  booksContinueReading: '\u0627\u062f\u0627\u0645\u0647\u0654 \u0645\u0637\u0627\u0644\u0639\u0647',
  booksNotAvailable: '\u062f\u0631 \u0627\u06cc\u0646 \u0632\u0628\u0627\u0646 \u0645\u0648\u062c\u0648\u062f \u0646\u06cc\u0633\u062a',
  booksAllBooks: '\u2192 \u0647\u0645\u0647\u0654 \u06a9\u062a\u0628',
  booksCover: '\u062c\u0644\u062f',

  catBahaullah: '\u062d\u0636\u0631\u062a \u0628\u0647\u0627\u0621\u0627\u0644\u0644\u0647',
  catAbdulBaha: '\u062d\u0636\u0631\u062a \u0639\u0628\u062f\u0627\u0644\u0628\u0647\u0627\u0621',
  catShoghiEffendi: '\u062d\u0636\u0631\u062a \u0634\u0648\u0642\u06cc \u0627\u0641\u0646\u062f\u06cc',
  catTheBab: '\u062d\u0636\u0631\u062a \u0628\u0627\u0628',
  catOther: '\u0633\u0627\u06cc\u0631 \u0645\u0624\u0644\u0641\u06cc\u0646',

  prayersTitle: '\u0645\u0646\u0627\u062c\u0627\u062a',
  prayersBahaiPrayers: '\u0645\u0646\u0627\u062c\u0627\u062a \u0628\u0647\u0627\u0626\u06cc',
  prayersAcrossTopics: '\u0645\u0646\u0627\u062c\u0627\u062a \u062f\u0631',
  prayersAll: '\u0647\u0645\u0647\u0654 \u0645\u0646\u0627\u062c\u0627\u062a',
  prayersPrayer: '\u0645\u0646\u0627\u062c\u0627\u062a',
  prayersPrayers: '\u0645\u0646\u0627\u062c\u0627\u062a',

  topicObligatory: '\u0635\u0644\u0648\u0627\u062a \u0648\u0627\u062c\u0628\u0647',
  topicDaily: '\u0645\u0646\u0627\u062c\u0627\u062a \u0631\u0648\u0632\u0627\u0646\u0647',
  topicMorning: '\u0635\u0628\u062d',
  topicEvening: '\u0634\u0627\u0645',
  topicPraise: '\u062d\u0645\u062f \u0648 \u0633\u067e\u0627\u0633',
  topicLove: '\u0639\u0634\u0642',
  topicUnity: '\u0627\u062a\u062d\u0627\u062f',
  topicHealing: '\u0634\u0641\u0627',
  topicReliance: '\u062a\u0648\u06a9\u0644 \u0628\u0631 \u062e\u062f\u0627\u0648\u0646\u062f',
  topicTests: '\u0627\u0645\u062a\u062d\u0627\u0646\u0627\u062a \u0648 \u0645\u0634\u06a9\u0644\u0627\u062a',
  topicSteadfastness: '\u0627\u0633\u062a\u0642\u0627\u0645\u062a',
  topicForgiveness: '\u0628\u062e\u0634\u0634',
  topicDetachment: '\u0627\u0646\u0642\u0637\u0627\u0639',
  topicProtection: '\u062d\u0641\u0627\u0638\u062a',
  topicKnowledge: '\u0639\u0644\u0645 \u0648 \u062d\u06a9\u0645\u062a',
  topicService: '\u062e\u062f\u0645\u062a \u0648 \u062a\u0628\u0644\u06cc\u063a',
  topicTeaching: '\u062a\u0628\u0644\u06cc\u063a',
  topicChildren: '\u06a9\u0648\u062f\u06a9\u0627\u0646',
  topicFamily: '\u062e\u0627\u0646\u0648\u0627\u062f\u0647',
  topicMarriage: '\u0627\u0632\u062f\u0648\u0627\u062c',
  topicDeparted: '\u0627\u0631\u0648\u0627\u062d \u0631\u0641\u062a\u06af\u0627\u0646',
  topicHolyDays: '\u0627\u06cc\u0627\u0645 \u0645\u0628\u0627\u0631\u06a9\u0647',
  topicSpecialTablets: '\u0627\u0644\u0648\u0627\u062d \u062e\u0627\u0635',

  topicGroupObligatory: '\u0648\u0627\u062c\u0628\u0647 \u0648 \u0631\u0648\u0632\u0627\u0646\u0647',
  topicGroupSpiritual: '\u062d\u06cc\u0627\u062a \u0631\u0648\u062d\u0627\u0646\u06cc',
  topicGroupStrength: '\u0642\u0648\u062a \u0648 \u062d\u0645\u0627\u06cc\u062a',
  topicGroupCommunity: '\u062c\u0627\u0645\u0639\u0647 \u0648 \u062e\u062f\u0645\u062a',
  topicGroupSpecial: '\u0645\u0646\u0627\u0633\u0628\u062a\u200c\u0647\u0627\u06cc \u062e\u0627\u0635',

  lettersTitle: '\u0627\u0644\u0648\u0627\u062d \u0628\u06cc\u062a \u0627\u0644\u0639\u062f\u0644 \u0627\u0639\u0638\u0645',
  lettersSubtitle: '\u0627\u0644\u0648\u0627\u062d \u0627\u0632 \u0633\u0627\u0644 \u06f1\u06f9\u06f6\u06f3 \u062a\u0627 \u06a9\u0646\u0648\u0646',
  lettersFilter: '\u062c\u0633\u062a\u062c\u0648\u06cc \u0627\u0644\u0648\u0627\u062d...',

  favoritesTitle: '\u0645\u0648\u0631\u062f \u0639\u0644\u0627\u0642\u0647',
  favoritesItemsSaved: '\u0645\u0648\u0631\u062f \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f\u0647',
  favoritesEmpty: '\u0647\u0646\u0648\u0632 \u0645\u0648\u0631\u062f \u0639\u0644\u0627\u0642\u0647\u200c\u0627\u06cc \u0646\u062f\u0627\u0631\u06cc\u062f. \u0645\u0648\u0627\u0631\u062f \u0645\u0648\u0631\u062f \u0639\u0644\u0627\u0642\u0647 \u0631\u0627 \u0633\u062a\u0627\u0631\u0647\u200c\u062f\u0627\u0631 \u06a9\u0646\u06cc\u062f.',
  favoritesBooks: '\u06a9\u062a\u0628',
  favoritesPrayers: '\u0645\u0646\u0627\u062c\u0627\u062a',
  favoritesLetters: '\u0627\u0644\u0648\u0627\u062d',

  searchTitle: '\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u0622\u062b\u0627\u0631',
  searchSubtitle: '\u06a9\u062a\u0627\u0628\u062e\u0627\u0646\u0647\u0654 \u0645\u0631\u062c\u0639 \u0628\u0647\u0627\u0626\u06cc',
  searchAllSources: '\u0647\u0645\u0647\u0654 \u0645\u0646\u0627\u0628\u0639',
  searchBooks: '\u06a9\u062a\u0628',
  searchPrayers: '\u0645\u0646\u0627\u062c\u0627\u062a',
  searchLetters: '\u0627\u0644\u0648\u0627\u062d',
  searchBook: '\u06a9\u062a\u0627\u0628',
  searchPrayer: '\u0645\u0646\u0627\u062c\u0627\u062a',
  searchLetter: '\u0644\u0648\u062d',

  qiblihTitle: '\u0642\u0628\u0644\u0647',
  qiblihSubtitle: '\u062c\u0647\u062a \u0646\u0645\u0627\u0632',
  qiblihShrineOf: '\u0645\u0642\u0627\u0645 \u0627\u0639\u0644\u06cc \u062d\u0636\u0631\u062a \u0628\u0647\u0627\u0621\u0627\u0644\u0644\u0647 \u00b7 \u0628\u0647\u062c\u06cc\u060c \u0639\u06a9\u0627',
  qiblihEnable: '\u0641\u0639\u0627\u0644\u200c\u0633\u0627\u0632\u06cc \u0642\u0637\u0628\u200c\u0646\u0645\u0627',
  qiblihLocating: '\u062f\u0631 \u062d\u0627\u0644 \u06cc\u0627\u0641\u062a\u0646 \u0645\u0648\u0642\u0639\u06cc\u062a \u0634\u0645\u0627\u2026',
  qiblihPermissions: '\u0646\u06cc\u0627\u0632 \u0628\u0647 \u0645\u062c\u0648\u0632 \u0645\u06a9\u0627\u0646 \u0648 \u062d\u0631\u06a9\u062a',
  qiblihDenied: '\u0645\u062c\u0648\u0632 \u0645\u06a9\u0627\u0646 \u0631\u062f \u0634\u062f',
  qiblihHoldDevice: '\u062f\u0633\u062a\u06af\u0627\u0647 \u0631\u0627 \u0635\u0627\u0641 \u0646\u06af\u0647 \u062f\u0627\u0631\u06cc\u062f \u0648 \u0628\u0631\u0627\u06cc \u062a\u0646\u0638\u06cc\u0645 \u0641\u0644\u0634 \u0628\u0686\u0631\u062e\u0627\u0646\u06cc\u062f',
  qiblihNoCompass: '\u062d\u0633\u06af\u0631 \u0642\u0637\u0628\u200c\u0646\u0645\u0627 \u0634\u0646\u0627\u0633\u0627\u06cc\u06cc \u0646\u0634\u062f.',
  qiblihKmTo: '\u06a9\u06cc\u0644\u0648\u0645\u062a\u0631 \u062a\u0627 \u0628\u0647\u062c\u06cc',
  qiblihAbout: '\u0642\u0628\u0644\u0647 \u0646\u0642\u0637\u0647\u200c\u0627\u06cc \u0627\u0633\u062a \u06a9\u0647 \u0628\u0647\u0627\u0626\u06cc\u0627\u0646 \u0647\u0646\u06af\u0627\u0645 \u062a\u0644\u0627\u0648\u062a \u0635\u0644\u0648\u0627\u062a \u0648\u0627\u062c\u0628\u0647 \u0628\u0647 \u0633\u0648\u06cc \u0622\u0646 \u0631\u0648 \u0645\u06cc\u200c\u06a9\u0646\u0646\u062f. \u0622\u0631\u0627\u0645\u06af\u0627\u0647 \u062d\u0636\u0631\u062a \u0628\u0647\u0627\u0621\u0627\u0644\u0644\u0647 \u062f\u0631 \u0628\u0647\u062c\u06cc.',
  qiblihTryAgain: '\u062a\u0644\u0627\u0634 \u0645\u062c\u062f\u062f',

  annotNotes: '\u06cc\u0627\u062f\u062f\u0627\u0634\u062a\u200c\u0647\u0627',
  annotSelectedText: '\u0645\u062a\u0646 \u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u062f\u0647:',
  annotPlaceholder: '\u0627\u0641\u06a9\u0627\u0631 \u062e\u0648\u062f \u0631\u0627 \u0628\u0646\u0648\u06cc\u0633\u06cc\u062f...',
  annotSave: '\u0630\u062e\u06cc\u0631\u0647',
  annotDelete: '\u062d\u0630\u0641',

  themeBlue: '\u0622\u0628\u06cc',
  themeDark: '\u062a\u06cc\u0631\u0647',
  themeCream: '\u06a9\u0631\u0645',

  commonLoading: '\u062f\u0631 \u062d\u0627\u0644 \u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc...',
  commonRetry: '\u062a\u0644\u0627\u0634 \u0645\u062c\u062f\u062f',
  commonOpenOnBahai: '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u062f\u0631 bahai.org',
  commonLanguage: '\u0632\u0628\u0627\u0646',

  dir: 'rtl',
};

const ar: TranslationStrings = {
  appName: '\u0644\u0648\u0645\u064a\u0646\u0627\u0646\u0633',
  appSubtitle: '\u0645\u0643\u062a\u0628\u0629 \u0628\u0647\u0627\u0626\u064a\u0629 \u0634\u062e\u0635\u064a\u0629',
  bahaiLibrary: '\u0627\u0644\u0645\u0643\u062a\u0628\u0629 \u0627\u0644\u0628\u0647\u0627\u0626\u064a\u0629',

  navHome: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
  navLiterature: '\u0627\u0644\u0622\u062b\u0627\u0631 \u0627\u0644\u0628\u0647\u0627\u0626\u064a\u0629',
  navLiteratureShort: '\u0627\u0644\u0622\u062b\u0627\u0631',
  navPrayers: '\u0627\u0644\u0645\u0646\u0627\u062c\u0627\u0629',
  navLetters: '\u0627\u0644\u0623\u0644\u0648\u0627\u062d',
  navSearch: '\u0628\u062d\u062b',
  navQiblih: '\u0627\u0644\u0642\u0628\u0644\u0629',
  navFavorites: '\u0627\u0644\u0645\u0641\u0636\u0644\u0629',
  navSaved: '\u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629',

  authSignIn: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
  authSignUp: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628',
  authSignOut: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c',
  authContinueGuest: '\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0643\u0636\u064a\u0641',
  authName: '\u0627\u0644\u0627\u0633\u0645',
  authEmail: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
  authPassword: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  authConfirmPassword: '\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  authNamePlaceholder: '\u0627\u0633\u0645\u0643',
  authEmailPlaceholder: 'you@example.com',
  authPasswordPlaceholder: '\u0666 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
  authPasswordMinLength: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  authConfirmPlaceholder: '\u0623\u0639\u062f \u0625\u062f\u062e\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
  authPasswordsMismatch: '\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646.',
  authPasswordTooShort: '\u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0666 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.',
  authNameRequired: '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0633\u0645\u0643.',
  authAccountCreated: '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628! \u062a\u062d\u0642\u0642 \u0645\u0646 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a.',
  authDescription: '\u0645\u0643\u062a\u0628\u0629 \u0628\u0647\u0627\u0626\u064a\u0629 \u0634\u062e\u0635\u064a\u0629 \u0644\u0644\u0646\u0635\u0648\u0635 \u0627\u0644\u0645\u0642\u062f\u0633\u0629 \u0648\u0627\u0644\u0645\u0646\u0627\u062c\u0627\u0629 \u0648\u0627\u0644\u0623\u0644\u0648\u0627\u062d',
  authAlreadyHaveAccount: '\u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644\u061f',
  authDontHaveAccount: '\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f',

  homeDaily: '\u062a\u0623\u0645\u0644 \u064a\u0648\u0645\u064a',
  homeBooks: '\u0643\u062a\u0628',
  homePrayers: '\u0645\u0646\u0627\u062c\u0627\u0629',
  homeLetters: '\u0623\u0644\u0648\u0627\u062d',
  homeSearch: '\u0628\u062d\u062b',
  homeCommunities: '\u0627\u0644\u0645\u062c\u062a\u0645\u0639\u0627\u062a \u0641\u064a \u0627\u0644\u0639\u0645\u0644',

  booksLibrary: '\u0627\u0644\u0645\u0643\u062a\u0628\u0629',
  booksTitle: '\u0627\u0644\u0622\u062b\u0627\u0631 \u0627\u0644\u0628\u0647\u0627\u0626\u064a\u0629',
  booksInLibrary: '\u0643\u062a\u0627\u0628 \u0641\u064a \u0645\u0643\u062a\u0628\u062a\u0643',
  booksChapter: '\u0641\u0635\u0644',
  booksChapters: '\u0641\u0635\u0648\u0644',
  booksRead: '\u0645\u0642\u0631\u0648\u0621',
  booksBeginReading: '\u0627\u0628\u062f\u0623 \u0627\u0644\u0642\u0631\u0627\u0621\u0629',
  booksContinueReading: '\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0642\u0631\u0627\u0621\u0629',
  booksNotAvailable: '\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631 \u0628\u0647\u0630\u0647 \u0627\u0644\u0644\u063a\u0629',
  booksAllBooks: '\u2190 \u062c\u0645\u064a\u0639 \u0627\u0644\u0643\u062a\u0628',
  booksCover: '\u0627\u0644\u063a\u0644\u0627\u0641',

  catBahaullah: '\u062d\u0636\u0631\u0629 \u0628\u0647\u0627\u0621\u0627\u0644\u0644\u0647',
  catAbdulBaha: '\u062d\u0636\u0631\u0629 \u0639\u0628\u062f\u0627\u0644\u0628\u0647\u0627\u0621',
  catShoghiEffendi: '\u062d\u0636\u0631\u0629 \u0634\u0648\u0642\u064a \u0623\u0641\u0646\u062f\u064a',
  catTheBab: '\u062d\u0636\u0631\u0629 \u0627\u0644\u0628\u0627\u0628',
  catOther: '\u0645\u0624\u0644\u0641\u0648\u0646 \u0622\u062e\u0631\u0648\u0646',

  prayersTitle: '\u0627\u0644\u0645\u0646\u0627\u062c\u0627\u0629',
  prayersBahaiPrayers: '\u0627\u0644\u0645\u0646\u0627\u062c\u0627\u0629 \u0627\u0644\u0628\u0647\u0627\u0626\u064a\u0629',
  prayersAcrossTopics: '\u0645\u0646\u0627\u062c\u0627\u0629 \u0641\u064a',
  prayersAll: '\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0646\u0627\u062c\u0627\u0629',
  prayersPrayer: '\u0645\u0646\u0627\u062c\u0627\u0629',
  prayersPrayers: '\u0645\u0646\u0627\u062c\u0627\u0629',

  topicObligatory: '\u0627\u0644\u0635\u0644\u0648\u0627\u062a \u0627\u0644\u0648\u0627\u062c\u0628\u0629',
  topicDaily: '\u0627\u0644\u0645\u0646\u0627\u062c\u0627\u0629 \u0627\u0644\u064a\u0648\u0645\u064a\u0629',
  topicMorning: '\u0627\u0644\u0635\u0628\u0627\u062d',
  topicEvening: '\u0627\u0644\u0645\u0633\u0627\u0621',
  topicPraise: '\u0627\u0644\u062d\u0645\u062f \u0648\u0627\u0644\u0634\u0643\u0631',
  topicLove: '\u0627\u0644\u062d\u0628',
  topicUnity: '\u0627\u0644\u0648\u062d\u062f\u0629',
  topicHealing: '\u0627\u0644\u0634\u0641\u0627\u0621',
  topicReliance: '\u0627\u0644\u062a\u0648\u0643\u0644 \u0639\u0644\u0649 \u0627\u0644\u0644\u0647',
  topicTests: '\u0627\u0644\u0627\u0628\u062a\u0644\u0627\u0621\u0627\u062a \u0648\u0627\u0644\u0635\u0639\u0648\u0628\u0627\u062a',
  topicSteadfastness: '\u0627\u0644\u0627\u0633\u062a\u0642\u0627\u0645\u0629',
  topicForgiveness: '\u0627\u0644\u0645\u063a\u0641\u0631\u0629',
  topicDetachment: '\u0627\u0644\u0627\u0646\u0642\u0637\u0627\u0639',
  topicProtection: '\u0627\u0644\u062d\u0645\u0627\u064a\u0629',
  topicKnowledge: '\u0627\u0644\u0639\u0644\u0645 \u0648\u0627\u0644\u062d\u0643\u0645\u0629',
  topicService: '\u0627\u0644\u062e\u062f\u0645\u0629 \u0648\u0627\u0644\u062a\u0628\u0644\u064a\u063a',
  topicTeaching: '\u0627\u0644\u062a\u0628\u0644\u064a\u063a',
  topicChildren: '\u0627\u0644\u0623\u0637\u0641\u0627\u0644',
  topicFamily: '\u0627\u0644\u0639\u0627\u0626\u0644\u0629',
  topicMarriage: '\u0627\u0644\u0632\u0648\u0627\u062c',
  topicDeparted: '\u0627\u0644\u0623\u0631\u0648\u0627\u062d \u0627\u0644\u0631\u0627\u062d\u0644\u0629',
  topicHolyDays: '\u0627\u0644\u0623\u064a\u0627\u0645 \u0627\u0644\u0645\u0628\u0627\u0631\u0643\u0629',
  topicSpecialTablets: '\u0623\u0644\u0648\u0627\u062d \u062e\u0627\u0635\u0629',

  topicGroupObligatory: '\u0627\u0644\u0648\u0627\u062c\u0628\u0629 \u0648\u0627\u0644\u064a\u0648\u0645\u064a\u0629',
  topicGroupSpiritual: '\u0627\u0644\u062d\u064a\u0627\u0629 \u0627\u0644\u0631\u0648\u062d\u064a\u0629',
  topicGroupStrength: '\u0627\u0644\u0642\u0648\u0629 \u0648\u0627\u0644\u062f\u0639\u0645',
  topicGroupCommunity: '\u0627\u0644\u0645\u062c\u062a\u0645\u0639 \u0648\u0627\u0644\u062e\u062f\u0645\u0629',
  topicGroupSpecial: '\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062a \u0627\u0644\u062e\u0627\u0635\u0629',

  lettersTitle: '\u0623\u0644\u0648\u0627\u062d \u0628\u064a\u062a \u0627\u0644\u0639\u062f\u0644 \u0627\u0644\u0623\u0639\u0638\u0645',
  lettersSubtitle: '\u0623\u0644\u0648\u0627\u062d \u0645\u0646 \u0639\u0627\u0645 \u0661\u0669\u0666\u0663 \u062d\u062a\u0649 \u0627\u0644\u0622\u0646',
  lettersFilter: '\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0623\u0644\u0648\u0627\u062d...',

  favoritesTitle: '\u0627\u0644\u0645\u0641\u0636\u0644\u0629',
  favoritesItemsSaved: '\u0639\u0646\u0627\u0635\u0631 \u0645\u062d\u0641\u0648\u0638\u0629',
  favoritesEmpty: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0641\u0636\u0644\u0627\u062a \u0628\u0639\u062f. \u0636\u0639 \u0646\u062c\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u062a\u064a \u062a\u062d\u0628\u0647\u0627.',
  favoritesBooks: '\u0643\u062a\u0628',
  favoritesPrayers: '\u0645\u0646\u0627\u062c\u0627\u0629',
  favoritesLetters: '\u0623\u0644\u0648\u0627\u062d',

  searchTitle: '\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0622\u062b\u0627\u0631',
  searchSubtitle: '\u0627\u0644\u0645\u0643\u062a\u0628\u0629 \u0627\u0644\u0628\u0647\u0627\u0626\u064a\u0629 \u0627\u0644\u0645\u0631\u062c\u0639\u064a\u0629',
  searchAllSources: '\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0635\u0627\u062f\u0631',
  searchBooks: '\u0643\u062a\u0628',
  searchPrayers: '\u0645\u0646\u0627\u062c\u0627\u0629',
  searchLetters: '\u0623\u0644\u0648\u0627\u062d',
  searchBook: '\u0643\u062a\u0627\u0628',
  searchPrayer: '\u0645\u0646\u0627\u062c\u0627\u0629',
  searchLetter: '\u0644\u0648\u062d',

  qiblihTitle: '\u0627\u0644\u0642\u0628\u0644\u0629',
  qiblihSubtitle: '\u0627\u062a\u062c\u0627\u0647 \u0627\u0644\u0635\u0644\u0627\u0629',
  qiblihShrineOf: '\u0645\u0642\u0627\u0645 \u062d\u0636\u0631\u0629 \u0628\u0647\u0627\u0621\u0627\u0644\u0644\u0647 \u00b7 \u0627\u0644\u0628\u0647\u062c\u0629\u060c \u0639\u0643\u0627',
  qiblihEnable: '\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0628\u0648\u0635\u0644\u0629',
  qiblihLocating: '\u062c\u0627\u0631\u064d \u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639\u0643\u2026',
  qiblihPermissions: '\u064a\u062a\u0637\u0644\u0628 \u0625\u0630\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062d\u0631\u0643\u0629',
  qiblihDenied: '\u062a\u0645 \u0631\u0641\u0636 \u0625\u0630\u0646 \u0627\u0644\u0645\u0648\u0642\u0639',
  qiblihHoldDevice: '\u0623\u0645\u0633\u0643 \u062c\u0647\u0627\u0632\u0643 \u0628\u0634\u0643\u0644 \u0645\u0633\u062a\u0648\u064d \u0648\u0623\u062f\u0631\u0647 \u0644\u0645\u062d\u0627\u0630\u0627\u0629 \u0627\u0644\u0633\u0647\u0645',
  qiblihNoCompass: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0643\u062a\u0634\u0627\u0641 \u0645\u0633\u062a\u0634\u0639\u0631 \u0627\u0644\u0628\u0648\u0635\u0644\u0629.',
  qiblihKmTo: '\u0643\u0645 \u0625\u0644\u0649 \u0627\u0644\u0628\u0647\u062c\u0629',
  qiblihAbout: '\u0627\u0644\u0642\u0628\u0644\u0629 \u0647\u064a \u0627\u0644\u0646\u0642\u0637\u0629 \u0627\u0644\u062a\u064a \u064a\u062a\u0648\u062c\u0647 \u0625\u0644\u064a\u0647\u0627 \u0627\u0644\u0628\u0647\u0627\u0626\u064a\u0648\u0646 \u0639\u0646\u062f \u062a\u0644\u0627\u0648\u0629 \u0627\u0644\u0635\u0644\u0648\u0627\u062a \u0627\u0644\u0648\u0627\u062c\u0628\u0629. \u0625\u0646\u0647\u0627 \u0645\u062b\u0648\u0649 \u062d\u0636\u0631\u0629 \u0628\u0647\u0627\u0621\u0627\u0644\u0644\u0647 \u0641\u064a \u0627\u0644\u0628\u0647\u062c\u0629.',
  qiblihTryAgain: '\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',

  annotNotes: '\u0645\u0644\u0627\u062d\u0638\u0627\u062a',
  annotSelectedText: '\u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u062d\u062f\u062f:',
  annotPlaceholder: '\u0627\u0643\u062a\u0628 \u0623\u0641\u0643\u0627\u0631\u0643...',
  annotSave: '\u062d\u0641\u0638',
  annotDelete: '\u062d\u0630\u0641',

  themeBlue: '\u0623\u0632\u0631\u0642',
  themeDark: '\u062f\u0627\u0643\u0646',
  themeCream: '\u0643\u0631\u064a\u0645\u064a',

  commonLoading: '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...',
  commonRetry: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629',
  commonOpenOnBahai: '\u0641\u062a\u062d \u0641\u064a bahai.org',
  commonLanguage: '\u0627\u0644\u0644\u063a\u0629',

  dir: 'rtl',
};

export const translations: Record<Language, TranslationStrings> = { en, fa, ar };

// Language metadata for the selector
export const languageMeta: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'fa', name: 'Persian', nativeName: '\u0641\u0627\u0631\u0633\u06cc', flag: '\u0641\u0627' },
  { code: 'ar', name: 'Arabic', nativeName: '\u0639\u0631\u0628\u064a', flag: '\u0639\u0631' },
];
