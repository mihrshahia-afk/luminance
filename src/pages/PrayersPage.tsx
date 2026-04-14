import { useSearchParams, Link } from 'react-router-dom';
import { Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { prayers, prayerTopics } from '../data/prayers';
import type { PrayerTopic } from '../types';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';

const TOPIC_GROUPS: { label: string; color: string; topics: PrayerTopic[] }[] = [
  { label: 'Obligatory & Daily', color: '#0B4F6C',
    topics: ['Obligatory Prayers', 'Daily Prayers', 'Morning', 'Evening'] },
  { label: 'Spiritual Life', color: '#7D9B8A',
    topics: ['Praise & Gratitude', 'Love', 'Unity', 'Reliance on God', 'Detachment', 'Forgiveness'] },
  { label: 'Strength & Support', color: '#8B6F47',
    topics: ['Healing', 'Tests & Difficulties', 'Steadfastness', 'Protection', 'Knowledge & Wisdom'] },
  { label: 'Community & Service', color: '#6B5B8A',
    topics: ['Service & Teaching', 'Teaching', 'Children', 'Family', 'Marriage'] },
  { label: 'Special Occasions', color: '#C9A84C',
    topics: ['Departed Souls', 'Holy Days', 'Special Tablets'] },
];

const topicCounts = Object.fromEntries(
  prayerTopics.map(t => [t, prayers.filter(p => p.topic === t).length])
);

function TopicLanding({ onSelect }: { onSelect: (t: PrayerTopic) => void }) {
  return (
    <div className="flex-1 w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto stagger-enter">
      <div className="mb-10">
        <p className="section-label">Bah&aacute;&rsquo;&iacute; Prayers</p>
        <h1 className="page-title text-[clamp(1.8rem,4vw,2.6rem)]">Prayers</h1>
        <p className="text-sm text-muted m-0">{prayers.length} prayers across {prayerTopics.length} topics</p>
      </div>

      {TOPIC_GROUPS.map(group => (
        <div key={group.label} className="mb-10">
          <div className="category-divider" style={{ color: group.color }}>
            <span>{group.label}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.topics.map(topic => (
              <Card key={topic} accentColor={group.color} accentPosition="left" onClick={() => onSelect(topic)}>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-display text-[1.05rem] font-medium text-primary m-0 mb-0.5 leading-snug">
                      {topic}
                    </p>
                    <p className="text-[0.7rem] text-muted m-0 font-body">
                      {topicCounts[topic]} prayer{topicCounts[topic] !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-muted shrink-0 ml-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicPrayers({ topic, onBack }: { topic: PrayerTopic; onBack: () => void }) {
  const { toggleFavorite, isFavorite, getAnnotationsForDocument } = useApp();
  const filtered = prayers.filter(p => p.topic === topic);
  const group = TOPIC_GROUPS.find(g => g.topics.includes(topic));
  const accentColor = group?.color ?? '#C9A84C';

  return (
    <div className="flex-1 w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 text-muted text-[0.78rem] font-body tracking-[0.04em] mb-5 hover:text-heading transition-colors"
        >
          <ArrowLeft size={13} /> All Prayers
        </button>
        <p className="section-label" style={{ color: accentColor }}>{group?.label}</p>
        <h1 className="page-title text-[clamp(1.8rem,4vw,2.4rem)]">{topic}</h1>
        <p className="text-sm text-muted m-0">{filtered.length} prayer{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div key={topic} className="topic-enter grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filtered.map(prayer => {
          const fav = isFavorite(prayer.id);
          const noteCount = getAnnotationsForDocument(prayer.id).length;
          const lines = prayer.text.split('\n').filter(l => l.trim());
          const previewText = lines.slice(0, 3).join(' ');
          const preview = previewText.length > 260 ? previewText.slice(0, 260).trimEnd() + '\u2026' : previewText;
          const hasMore = prayer.text.length > 260 || lines.length > 3;

          return (
            <div key={prayer.id} className="card-elevated flex">
              <div className="w-[3px] shrink-0" style={{ background: accentColor }} />
              <div className="flex-1 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2.5">
                  {prayer.title ? (
                    <h3 className="font-display text-[1.1rem] font-semibold text-heading m-0 leading-snug flex-1 pr-2">
                      {prayer.title}
                    </h3>
                  ) : (
                    <span className="text-[0.6rem] font-body tracking-[0.12em] uppercase font-medium" style={{ color: accentColor }}>
                      {prayer.topic}
                    </span>
                  )}
                  <div className="flex items-center gap-1 shrink-0">
                    {noteCount > 0 && (
                      <Link to={`/prayers/${prayer.id}`} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[0.55rem] font-body font-bold no-underline"
                        style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                        {noteCount}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </Link>
                    )}
                    <button
                      onClick={() => toggleFavorite(prayer.id)}
                      className="bg-transparent border-none cursor-pointer p-0.5 shrink-0 transition-colors"
                      style={{ color: fav ? '#C9A84C' : 'var(--text-muted)' }}
                    >
                      <Star size={15} fill={fav ? '#C9A84C' : 'none'} />
                    </button>
                  </div>
                </div>

                <p className="font-reading text-[1.025rem] leading-[1.8] text-primary m-0 mb-5 flex-1">
                  {preview}
                </p>

                <div className="flex justify-between items-center border-t border-border-inner pt-3">
                  <p className="font-reading text-sm text-author m-0 italic">
                    &mdash; {prayer.author}
                  </p>
                  <Link
                    to={`/prayers/${prayer.id}`}
                    className="text-[0.72rem] font-body text-heading no-underline tracking-[0.04em] hover:text-gold transition-colors"
                  >
                    {hasMore ? 'Read full \u2192' : 'Read & annotate \u2192'}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PrayersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const topicParam = searchParams.get('topic') as PrayerTopic | null;
  const activeTopic = topicParam && prayerTopics.includes(topicParam) ? topicParam : null;

  if (activeTopic) {
    return <TopicPrayers topic={activeTopic} onBack={() => setSearchParams({})} />;
  }
  return <TopicLanding onSelect={t => setSearchParams({ topic: t })} />;
}
