import { CheckpointReward, ClueCheckpoint, Quest } from '../types/hunt';
import { formatDistance } from '../utils/geo';
import { Briefcase, Trophy, Clock, Footprints, BookOpen, X, Sparkles } from 'lucide-react';

interface ExplorerSatchelProps {
  quest: Quest;
  collectedItems: CheckpointReward[];
  distanceTraveledMeters: number;
  startTime: number;
  completedTime?: number;
  solvedCheckpointIds: string[];
  hintsUsed: number;
  onClose: () => void;
}

export function ExplorerSatchel({
  quest,
  collectedItems,
  distanceTraveledMeters,
  startTime,
  completedTime,
  solvedCheckpointIds,
  hintsUsed,
  onClose,
}: ExplorerSatchelProps) {
  const elapsedMs = (completedTime || Date.now()) - startTime;
  const elapsedMins = Math.floor(elapsedMs / 60000);
  const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-stone-900 border-2 border-amber-800/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-200">
                Explorer’s Satchel & Field Journal
              </h3>
              <p className="text-xs text-stone-400">
                {quest.title} — Artifacts & Voyage Log
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-stone-400">
                <Footprints className="w-3.5 h-3.5 text-amber-500" /> Distance
              </div>
              <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                {formatDistance(distanceTraveledMeters)}
              </div>
            </div>

            <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-stone-400">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Duration
              </div>
              <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                {elapsedMins}m {elapsedSecs}s
              </div>
            </div>

            <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-stone-400">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Relics
              </div>
              <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                {collectedItems.length} / {quest.checkpoints.length}
              </div>
            </div>

            <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-stone-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Hints
              </div>
              <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                {hintsUsed}
              </div>
            </div>
          </div>

          {/* Collected Relics Inventory */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Discovered Ancient Relics
            </h4>

            {collectedItems.length === 0 ? (
              <div className="p-6 bg-stone-950/60 border border-dashed border-stone-800 rounded-2xl text-center text-xs text-stone-500">
                Your leather pouch is currently empty. Solve waypoint puzzles to collect ancient seals and keys!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {collectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-gradient-to-br from-stone-950 to-stone-900 border border-amber-600/30 rounded-xl flex items-start gap-3 shadow-md"
                  >
                    <span className="text-3xl p-1 bg-stone-900 rounded-lg border border-stone-800 shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-amber-300">
                        {item.name}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                        {item.lore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Field Journal Log */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Expedition Log & Checkpoint Lore
            </h4>

            <div className="space-y-3">
              {quest.checkpoints.map((cp) => {
                const isCleared = solvedCheckpointIds.includes(cp.id);
                return (
                  <div
                    key={cp.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      isCleared
                        ? 'bg-stone-950/80 border-emerald-500/40'
                        : 'bg-stone-950/40 border-stone-800/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-amber-200 mb-1">
                      <span>#{cp.order}: {cp.title}</span>
                      <span className={isCleared ? 'text-emerald-400' : 'text-stone-500'}>
                        {isCleared ? '✓ Solved' : '🔒 Undiscovered'}
                      </span>
                    </div>
                    <p className="text-stone-400 italic">
                      {isCleared ? cp.storyLore : 'This passage of the field journal is encrypted until you reach the site.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
