import { useSearchParams, Link } from 'react-router-dom';
import { Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { prayers, prayerTopics } from '../data/prayers';
import type { PrayerTopic } from '../types';
import { useApp } from '../context/AppContext';

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
    <div className="flex-1 w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto">
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 0.5rem' }}>
          Bahá'í Prayers
        </p>
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 300, color: 'var(--text-heading)', margin: '0 0 0.25rem' }}>
          Prayers
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          {prayers.length} prayers across {prayerTopics.length} topics
        </p>
      </div>

      {TOPIC_GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
            <div style={{ width: 18, height: 1, background: group.color, opacity: 0.7 }} />
            <span style={{ fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: group.color, fontWeight: 600 }}>
              {group.label}
            </span>
            <div style={{ flex: 1, height: 1, background: `${group.color}22` }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.75rem' }}>
            {group.topics.map(topic => (
              <button
                key={topic}
                onClick={() => onSelect(topic)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.125rem', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderLeft: `3px solid ${group.color}`,
                  borderRadius: '0.625rem', cursor: 'pointer', textAlign: 'left',
                  transition: 'box-shadow 0.18s ease, transform 0.18s ease',
                  boxShadow: '0 1px 3px var(--card-shadow)',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 6px 18px var(--card-shadow-hover)'; el.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 1px 3px var(--card-shadow)'; el.style.transform = 'translateY(0)'; }}
              >
                <div>
                  <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 0.2rem', lineHeight: 1.3 }}>
                    {topic}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                    {topicCounts[topic]} prayer{topicCounts[topic] !== 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicPrayers({ topic, onBack }: { topic: PrayerTopic; onBack: () => void }) {
  const { toggleFavorite, isFavorite } = useApp();
  const filtered = prayers.filter(p => p.topic === topic);
  const group = TOPIC_GROUPS.find(g => g.topics.includes(topic));
  const accentColor = group?.color ?? '#C9A84C';

  return (
    <div className="flex-1 w-full px-4 py-10 sm:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto">
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'Inter', letterSpacing: '0.04em', marginBottom: '1.25rem', transition: 'color 0.15s ease' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-heading)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={13} /> All Prayers
        </button>
        <p style={{ fontFamily: 'Inter', fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: accentColor, margin: '0 0 0.4rem' }}>
          {group?.label}
        </p>
        <h1 style={{ fontFamily: 'Crimson Pro, serif', fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 300, color: 'var(--text-heading)', margin: '0 0 0.25rem' }}>
          {topic}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          {filtered.length} prayer{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div key={topic} className="topic-enter grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filtered.map(prayer => {
          const fav = isFavorite(prayer.id);
          const lines = prayer.text.split('\n').filter(l => l.trim());
          const previewText = lines.slice(0, 3).join(' ');
          const preview = previewText.length > 260 ? previewText.slice(0, 260).trimEnd() + '…' : previewText;
          const hasMore = prayer.text.length > 260 || lines.length > 3;

          return (
            <div
              key={prayer.id}
              style={{ display: 'flex', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 4px var(--card-shadow)', transition: 'box-shadow 0.2s ease', background: 'var(--bg-card)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px var(--card-shadow-hover)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px var(--card-shadow)')}
            >
              <div style={{ width: '3px', background: accentColor, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '1.375rem 1.5rem', display: 'flex', flexDirection: 'column' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: prayer.title ? '0.625rem' : '0.875rem' }}>
                  {prayer.title ? (
                    <h3 style={{ fontFamily: 'Crimson Pro, serif', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0, lineHeight: 1.3, flex: 1, paddingRight: '0.5rem' }}>
                      {prayer.title}
                    </h3>
                  ) : (
                    <span style={{ fontSize: '0.6rem', fontFamily: 'Inter', letterSpacing: '0.12em', textTransform: 'uppercase', color: accentColor, fontWeight: 500 }}>
                      {prayer.topic}
                    </span>
                  )}
                  <button
                    onClick={() => toggleFavorite(prayer.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, color: fav ? '#C9A84C' : 'var(--text-muted)', transition: 'color 0.15s ease' }}
                  >
                    <Star size={15} fill={fav ? '#C9A84C' : 'none'} />
                  </button>
                </div>

                <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '1.025rem', lineHeight: 1.8, color: 'var(--text-primary)', margin: '0 0 1.25rem', flex: 1 }}>
                  {preview}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-inner)', paddingTop: '0.75rem' }}>
                  <p style={{ fontFamily: 'Crimson Pro, serif', fontSize: '0.875rem', color: 'var(--text-author)', margin: 0, fontStyle: 'italic' }}>
                    — {prayer.author}
                  </p>
                  <Link
                    to={`/prayers/${prayer.id}`}
                    style={{ fontSize: '0.72rem', fontFamily: 'Inter', color: 'var(--text-heading)', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.15s ease' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C9A84C')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text-heading)')}
                  >
                    {hasMore ? 'Read full →' : 'Read & annotate →'}
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
