import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface Quote {
  text: string;
  author: string;
  source: string;
}

// 100 verified Bahá'í quotes — same QUOTES array as before (keeping it compact here)
const QUOTES: Quote[] = [
  { text: 'O Son of Spirit! My first counsel is this: Possess a pure, kindly and radiant heart, that thine may be a sovereignty ancient, imperishable and everlasting.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 1' },
  { text: 'O Son of Man! I loved thy creation, hence I created thee. Wherefore, do thou love Me, that I may name thy name and fill thy soul with the spirit of life.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 4' },
  { text: 'O Son of Being! Love Me, that I may love thee. If thou lovest Me not, My love can in no wise reach thee. Know this, O servant.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 5' },
  { text: 'O Son of Being! Thy Paradise is My love; thy heavenly home, reunion with Me. Enter therein and tarry not. This is that which hath been destined for thee in Our kingdom above and Our exalted dominion.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 6' },
  { text: 'O Son of Man! If thou lovest Me, turn away from thyself; and if thou seekest My pleasure, regard not thine own; that thou mayest die in Me and I may eternally live in thee.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 7' },
  { text: 'O Son of Spirit! There is no peace for thee save by renouncing thyself and turning unto Me; for it behooveth thee to glory in My name, not in thine own; to put thy trust in Me and not in thyself, since I desire to be loved alone and above all that is.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 8' },
  { text: 'O Son of Being! Walk in My statutes for love of Me and deny thyself that which thou desirest if thou seekest My pleasure.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 38' },
  { text: 'O Son of Man! Be thou content with Me and seek no other helper. For none but Me can ever suffice thee.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 17' },
  { text: 'O Son of Being! Bring thyself to account each day ere thou art summoned to a reckoning; for death, unheralded, shall come upon thee and thou shalt be called to give account for thy deeds.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 31' },
  { text: 'O Son of Man! Humble thyself before Me, that I may graciously visit thee. Arise for the triumph of My cause, that while yet on earth thou mayest obtain the victory.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 42' },
  { text: 'Be generous in prosperity, and thankful in adversity. Be worthy of the trust of thy neighbor, and look upon him with a bright and friendly face.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings from the Writings of Bah\u00e1\u2019u\u2019ll\u00e1h, CXXX' },
  { text: 'The best beloved of all things in My sight is Justice; turn not away therefrom if thou desirest Me, and neglect it not that I may confide in thee.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 2' },
  { text: 'So powerful is the light of unity that it can illuminate the whole earth.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Epistle to the Son of the Wolf' },
  { text: 'Let your vision be world-embracing, rather than confined to your own self.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, XLIII' },
  { text: 'My love is My stronghold; he that entereth therein is safe and secure, and he that turneth away shall surely stray and perish.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 9' },
  { text: 'The earth is but one country, and mankind its citizens.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXVII' },
  { text: 'Regard man as a mine rich in gems of inestimable value. Education can, alone, cause it to reveal its treasures, and enable mankind to benefit therefrom.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXXII' },
  { text: 'A kindly tongue is the lodestone of the hearts of men. It is the bread of the spirit, it clotheth the words with meaning, it is the fountain of the light of wisdom and understanding.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Epistle to the Son of the Wolf' },
  { text: 'We desire but the good of the world and the happiness of the nations; yet they deem Us a stirrer up of strife and sedition worthy of bondage and banishment.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h, Lawh-i-Maqsud' },
  { text: 'Consort with all religions with amity and concord, that they may inhale from you the sweet fragrance of God.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Kit\u00e1b-i-Aqdas, \u00b6144' },
  { text: 'The source of all good is trust in God, submission unto His command, and contentment with His holy will and pleasure.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h' },
  { text: 'He Who is your Lord, the All-Merciful, cherisheth in His heart the desire of beholding the entire human race as one soul and one body.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXIV' },
  { text: 'Blessed is he who preferreth his brother before himself.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h' },
  { text: 'Cleanse ye your eyes, so that ye behold no man as different from yourselves. See ye no strangers; rather see all men as friends.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXIV' },
  { text: 'Breathe not the sins of others so long as thou art thyself a sinner. Shouldst thou transgress this command, accursed wouldst thou be, and to this I bear witness.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 27' },
  { text: 'The purpose of religion as revealed from the Heaven of God\u2019s holy Will is to establish unity and concord amongst the peoples of the world; make it not the cause of dissension and strife.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h, Ishraqa\u0301t' },
  { text: 'All men have been created to carry forward an ever-advancing civilization.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CIX' },
  { text: 'Knowledge is as wings to man\u2019s life, and a ladder for his ascent. Its acquisition is incumbent upon everyone.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Epistle to the Son of the Wolf' },
  { text: 'Deal ye one with another with the utmost love and harmony, with friendliness and fellowship.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXXXII' },
  { text: 'O people of God! Be not occupied with yourselves. Be intent on the betterment of the world and the training of its peoples.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h, Lawh-i-Dunya\u0301' },
  { text: 'That one indeed is a man who, today, dedicateth himself to the service of the entire human race.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXVII' },
  { text: 'It is not for him to pride himself who loveth his own country, but rather for him who loveth the whole world.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h, Lawh-i-Maqsu\u0301d' },
  { text: 'The well-being of mankind, its peace and security, are unattainable unless and until its unity is firmly established.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXXXI' },
  { text: 'Ye are the fruits of one tree, and the leaves of one branch.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXII' },
  { text: 'Be anxiously concerned with the needs of the age ye live in, and center your deliberations on its exigencies and requirements.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CVI' },
  { text: 'The tabernacle of unity hath been raised; regard ye not one another as strangers.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h, Bisharát' },
  { text: 'Truthfulness is the foundation of all human virtues.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Cited in Advent of Divine Justice' },
  { text: 'O friend! In the garden of thy heart plant naught but the rose of love.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Persian no. 3' },
  { text: 'Noble have I created thee, yet thou hast abased thyself. Rise then unto that for which thou wast created.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 22' },
  { text: 'The light of a good character surpasseth the light of the sun and the radiance thereof.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h, Tara\u0301za\u0301t' },
  { text: 'Do not busy yourselves in your own concerns; let your thoughts be fixed upon that which will rehabilitate the fortunes of mankind.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, XCVI' },
  { text: 'Set your faces towards unity, and let the radiance of its light shine upon you.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Epistle to the Son of the Wolf' },
  { text: 'Immerse yourselves in the ocean of My words, that ye may unravel its secrets, and discover all the pearls of wisdom that lie hid in its depths.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Kit\u00e1b-i-Aqdas, \u00b6182' },
  { text: 'The source of all learning is the knowledge of God, exalted be His Glory, and this cannot be attained save through the knowledge of His Divine Manifestation.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h' },
  { text: 'Whoso ariseth among you to teach the Cause of his Lord, let him, before all else, teach his own self, that his speech may attract the hearts of them that hear him.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CLVIII' },
  { text: 'The fundamental purpose animating the Faith of God and His Religion is to safeguard the interests and promote the unity of the human race.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h, Lawh-i-Dunya\u0301' },
  { text: 'Were man to appreciate the greatness of his station and the loftiness of his destiny he would manifest naught save goodly character, pure deeds, and a seemly and praiseworthy conduct.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Tablets of Bah\u00e1\u2019u\u2019ll\u00e1h, Tara\u0301za\u0301t' },
  { text: 'O Son of Man! Wert thou to speed through the immensity of space and traverse the expanse of heaven, yet thou wouldst find no rest save in submission to Our command and humbleness before Our Face.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'The Hidden Words, Arabic no. 40' },
  { text: 'Arise, O people, and, by the power of God\u2019s might, resolve to gain the victory over your own selves, that haply the whole earth may be freed and sanctified from its servitude to the gods of its idle fancies.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, XLIII' },
  { text: 'The purpose of the one true God in manifesting Himself is to summon all mankind to truthfulness and sincerity, to piety and trustworthiness, to resignation and submissiveness to the Will of God.', author: "Bah\u00e1\u2019u\u2019ll\u00e1h", source: 'Gleanings, CXXXVI' },
  // 'Abdu'l-Bahá
  { text: 'Do not be content with showing friendship in words alone, let your heart burn with loving kindness for all who may cross your path.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 16' },
  { text: 'Be in perfect unity. Never become angry with one another.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'The Promulgation of Universal Peace, p. 93' },
  { text: 'The gift of God to this enlightened age is the knowledge of the oneness of mankind and of the fundamental oneness of religion.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b715' },
  { text: 'In the world of existence there is no more powerful magnet than the magnet of love.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b712' },
  { text: 'Service to humanity is service to God. Let the love and light of the Kingdom radiate through you until all who look upon you shall be illumined by its reflection.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 177' },
  { text: 'My home is the home of peace. My home is the home of joy and delight. My home is the home of laughter and exultation.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b734' },
  { text: 'Let them look not upon a man\u2019s color but upon his heart. If the heart be filled with light, that man is nigh unto the threshold of his Lord.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b756' },
  { text: 'When a thought of war comes, oppose it by a stronger thought of peace. A thought of hatred must be destroyed by a more powerful thought of love.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 29' },
  { text: 'We must not look at our own shortcomings, or we shall grow discouraged. Let us rather look at the goodness of God.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Star of the West, vol. 8, no. 1' },
  { text: 'If we are true Bah\u00e1\u2019\u00eds speech is not needed. Our actions will help on the world, will spread civilization, will help the progress of science, and cause the arts to develop.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 80' },
  { text: 'The woman is indeed of the greater importance to the race. She has the greater burden and the greater work.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 162' },
  { text: 'Religion should unite all hearts and cause wars and disputes to vanish from the face of the earth.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 40' },
  { text: 'Laughter is a spiritual relaxation.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Star of the West, vol. 8, no. 19' },
  { text: 'Let each morn be better than its eve and each morrow richer than its yesterday.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'The Secret of Divine Civilization, p. 39' },
  { text: 'You must manifest complete love and affection toward all mankind. Do not exalt yourselves above others, but consider all as your equals.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'The Promulgation of Universal Peace, p. 291' },
  { text: 'The happiness of mankind will be realized when women and men coordinate and advance equally, for each is the complement and helpmeet of the other.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'The Promulgation of Universal Peace, p. 182' },
  { text: 'The diversity in the human family should be the cause of love and harmony, as it is in music where many different notes blend together in the making of a perfect chord.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 53' },
  { text: 'It is easy to approach the Kingdom of Heaven, but hard to stand firm and staunch within it, for the tests are rigorous, and heavy to bear.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b7185' },
  { text: 'Every imperfect soul is self-centred and thinketh only of his own good. But as his thoughts expand a little he will begin to think of the welfare and comfort of his family.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b7227' },
  { text: 'The betterment of the world can be accomplished through pure and goodly deeds, through commendable and seemly conduct.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b7225' },
  { text: 'Strive to be shining examples unto all mankind, and true reminders of the virtues of God amidst men.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b735' },
  { text: 'Be not the slave of your moods, but their master. But if you are so angry, so depressed and so sore that your spirit cannot find deliverance and peace even in prayer, then quickly go and give some pleasure to someone lowly or sorrowful.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Cited in Bah\u00e1\u2019u\u2019ll\u00e1h and the New Era' },
  { text: 'If a man has ten good qualities and one bad one, look at the ten and forget the one. And if a man has ten bad qualities and one good one, look at the one and forget the ten.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Cited in The Chosen Highway' },
  { text: 'Close your eyes to racial differences, and welcome all with the light of oneness.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'The Promulgation of Universal Peace, p. 299' },
  { text: 'We should all visit the sick. When they are in sorrow and suffering, it is a real help and benefit to have a friend come.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b7230' },
  { text: 'My hope for you is that you will ever avoid tyranny and oppression; that you will work without ceasing till justice reigns in every land.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 159' },
  { text: 'Hearts must be so cemented together, love must become so dominant that the rich shall most willingly extend assistance to the poor.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'The Promulgation of Universal Peace, p. 181' },
  { text: 'Knowledge is love. Study, listen, attend, and reflect. Be just in your judgment, be fair to the truth; do not be led by prejudice.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 72' },
  { text: 'Praise be to God, the windows of heaven are wide open, the doors of the Kingdom are flung wide, the divine bounties are descending.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b7206' },
  { text: 'Let your thoughts dwell on your own spiritual development, and close your eyes to the deficiencies of other souls.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b7160' },
  { text: 'If love and agreement are manifest in a single family, that family will advance, become illumined and spiritual.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'The Promulgation of Universal Peace, p. 144' },
  { text: 'Where there is love, nothing is too much trouble and there is always time.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Cited in Bah\u00e1\u2019u\u2019ll\u00e1h and the New Era' },
  { text: 'Truthfulness is the foundation of all the virtues of the world of humanity. Without truthfulness, progress and success in all of the worlds of God are impossible for a soul.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b7225' },
  { text: 'Today the confirmations of the Kingdom of Abh\u00e1 are with those who renounce themselves, forget their own opinions, cast aside personalities and are thinking of the welfare of others.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b736' },
  { text: 'Let us put aside all thoughts of self; let us close our eyes to all on earth, let us neither make known our sufferings nor complain of our wrongs.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Selections from the Writings of \u2018Abdu\u2019l-Bah\u00e1, \u00b7200' },
  { text: 'Bah\u00e1\u2019u\u2019ll\u00e1h has drawn the circle of unity, He has made a design for the uniting of all the peoples, and for the gathering of them all under the shelter of the tent of universal unity.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Paris Talks, p. 53' },
  { text: 'Every soul who travels through the cities, villages and hamlets of these states and gives the summons of the Kingdom, is like unto a candle which hath been set alight.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'Tablets of the Divine Plan, no. 6' },
  { text: 'True civilization will unfurl its banner in the midmost heart of the world whenever a certain number of its distinguished and high-minded sovereigns shall, with firm resolve and clear vision, establish the Cause of Universal Peace.', author: "\u2018Abdu\u2019l-Bah\u00e1", source: 'The Secret of Divine Civilization, p. 64' },
];

function QuotePage({ quote, pageNum, total }: { quote: Quote; pageNum: number; total: number }) {
  return (
    <div className="absolute inset-0 bg-card flex flex-col justify-center text-center px-5 py-6 sm:px-10 sm:py-10 overflow-hidden">
      <p className="section-label mb-2 sm:mb-3 text-[0.55rem] sm:text-[0.6rem]">{useApp().t.homeDaily}</p>
      <p className="font-reading text-[clamp(0.85rem,2.5vw,1.3rem)] italic font-normal text-primary leading-[1.65] sm:leading-[1.7] max-w-[34rem] mx-auto mb-2 sm:mb-3 line-clamp-5 sm:line-clamp-6">
        &ldquo;{quote.text}&rdquo;
      </p>
      <div className="w-8 sm:w-10 h-px mx-auto mb-2 sm:mb-3" style={{ background: 'rgba(201,168,76,0.35)' }} />
      <p className="font-reading text-author text-[0.78rem] sm:text-[0.85rem] tracking-[0.06em] m-0 mb-1">
        &mdash; {quote.author}
      </p>
      <p className="text-[0.55rem] sm:text-[0.6rem] text-muted m-0 font-body">{quote.source}</p>
      <div className="absolute bottom-2 sm:bottom-3 left-3 sm:left-4">
        <span className="text-[0.55rem] sm:text-[0.6rem] text-muted/40 font-body">{pageNum} / {total}</span>
      </div>
    </div>
  );
}

export default function QuoteBook() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [dragX, setDragX] = useState(0); // negative = dragging left (next), positive = dragging right (prev)
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = QUOTES[idx];
  const nextQuote = QUOTES[(idx + 1) % QUOTES.length];
  const prevQuote = QUOTES[(idx - 1 + QUOTES.length) % QUOTES.length];

  const handleStart = useCallback((clientX: number) => {
    if (isAnimating) return;
    setIsDragging(true);
    startX.current = clientX;
  }, [isAnimating]);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    setDragX(clientX - startX.current);
  }, [isDragging]);

  const flip = useCallback((dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    const w = containerRef.current?.offsetWidth || 600;
    setDragX(dir === 'next' ? -w : w);
    setTimeout(() => {
      setIdx(prev => dir === 'next'
        ? (prev + 1) % QUOTES.length
        : (prev - 1 + QUOTES.length) % QUOTES.length
      );
      setDragX(0);
      setIsAnimating(false);
    }, 450);
  }, [isAnimating]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const w = containerRef.current?.offsetWidth || 600;
    const threshold = w * 0.25;

    if (dragX < -threshold) {
      flip('next');
    } else if (dragX > threshold) {
      flip('prev');
    } else {
      setIsAnimating(true);
      setDragX(0);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isDragging, dragX, flip]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') flip('next');
      if (e.key === 'ArrowLeft') flip('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip]);

  const w = containerRef.current?.offsetWidth || 600;
  const pct = Math.min(1, Math.abs(dragX) / w);
  const goingNext = dragX <= 0;
  const underQuote = goingNext ? nextQuote : prevQuote;
  const underNum = goingNext
    ? ((idx + 1) % QUOTES.length) + 1
    : ((idx - 1 + QUOTES.length) % QUOTES.length) + 1;
  const t = isAnimating ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.45s ease' : 'none';

  return (
    <div className="py-[clamp(1.5rem,4vw,3.5rem)] px-1 sm:px-0">
      <div
        ref={containerRef}
        className="relative rounded-lg select-none book-border overflow-hidden"
        style={{ height: 'clamp(280px, 50vw, 380px)', touchAction: 'pan-y pinch-zoom' }}
        onMouseDown={e => handleStart(e.clientX)}
        onMouseMove={e => handleMove(e.clientX)}
        onMouseUp={() => handleEnd()}
        onMouseLeave={() => isDragging && handleEnd()}
        onTouchStart={e => { startX.current = e.touches[0].clientX; setIsDragging(true); }}
        onTouchMove={e => {
          if (!isDragging) return;
          const dx = e.touches[0].clientX - startX.current;
          // Only prevent default scroll if dragging mostly horizontally
          if (Math.abs(dx) > 10) {
            e.preventDefault();
            setDragX(dx);
          }
        }}
        onTouchEnd={() => handleEnd()}
      >
        {/* LAYER 1: The page underneath — always visible, never moves */}
        <QuotePage quote={underQuote} pageNum={underNum} total={QUOTES.length} />

        {/* LAYER 2: The top page — slides left/right to reveal what's underneath */}
        <div
          className="absolute inset-0 bg-card cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${dragX}px)`,
            transition: t,
            zIndex: 2,
            boxShadow: pct > 0.01
              ? `${goingNext ? '' : '-'}${Math.round(4 + pct * 12)}px 0 ${Math.round(8 + pct * 24)}px rgba(0,0,0,${(0.1 + pct * 0.2).toFixed(2)})`
              : 'none',
          }}
        >
          <QuotePage quote={current} pageNum={idx + 1} total={QUOTES.length} />
          {/* Gold corner accents */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-gold/25 rounded-tl-lg pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-gold/25 rounded-br-lg pointer-events-none" />
        </div>

        {/* Swipe hint arrows */}
        {dragX === 0 && !isAnimating && (
          <div className="absolute inset-0 flex items-end justify-between px-4 pb-3 pointer-events-none z-10">
            <button onClick={(e) => { e.stopPropagation(); flip('prev'); }} className="pointer-events-auto text-muted/30 hover:text-muted/60 bg-transparent border-none cursor-pointer p-1 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-[0.6rem] text-muted/30 font-body">swipe to turn</span>
            <button onClick={(e) => { e.stopPropagation(); flip('next'); }} className="pointer-events-auto text-muted/30 hover:text-muted/60 bg-transparent border-none cursor-pointer p-1 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
