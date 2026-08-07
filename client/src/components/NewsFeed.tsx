import React from 'react';
import { ThumbsUp, ExternalLink, Clock, Bot, Sparkles, Tag, ShieldAlert } from 'lucide-react';
import { NewsItem, Category } from '../types';
import { upvoteNewsArticle } from '../services/api';

interface NewsFeedProps {
  news: NewsItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNewsUpdated: () => void;
}

const CATEGORIES: Category[] = ['All', 'LLMs', 'Hardware', 'Multimodal', 'Agents', 'Ethics', 'Research'];

export const NewsFeed: React.FC<NewsFeedProps> = ({
  news,
  selectedCategory,
  onSelectCategory,
  onNewsUpdated
}) => {
  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await upvoteNewsArticle(id);
    onNewsUpdated();
  };

  return (
    <section className="mb-12">
      {/* Header and Category Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Latest Intelligence Pulses</span>
          </h2>
          <p className="text-xs text-slate-400">Curated and synthesized tech news & research papers</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No AI Pulses Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or selecting a different category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => {
            const isBullish = item.sentiment === 'Bullish';
            const isCautious = item.sentiment === 'Cautious';

            return (
              <article
                key={item.id}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Badge Strip */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.aiGenerated && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" title="Synthesized by Autonomous AI Engine">
                          <Bot className="w-3 h-3 text-cyan-400" /> AI Synthesized
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isBullish
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isCautious
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-700/30 text-slate-300 border border-slate-700/50'
                        }`}
                      >
                        {item.sentiment}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug mb-2">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                {/* Bottom Metadata & Footer */}
                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800">
                        <Tag className="w-2.5 h-2.5 text-purple-400" /> {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleUpvote(item.id, e)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-900/30 text-slate-300 hover:text-purple-300 border border-slate-800 transition-all active:scale-95"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="font-semibold text-xs">{item.upvotes}</span>
                      </button>

                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" /> {item.readTime}
                      </span>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                      title="Open source article"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
