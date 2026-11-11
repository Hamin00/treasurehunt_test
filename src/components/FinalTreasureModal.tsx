import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Quest } from '../types/hunt';
import { sound } from '../utils/audio';
import { formatDistance } from '../utils/geo';
import { Trophy, Award, Footprints, Clock, RotateCcw, Share2, Sparkles } from 'lucide-react';

interface FinalTreasureModalProps {
  quest: Quest;
  distanceMeters: number;
  durationMs: number;
  hintsUsed: number;
  onRestart: () => void;
  onSelectAnotherQuest: () => void;
}

export function FinalTreasureModal({
  quest,
  distanceMeters,
  durationMs,
  hintsUsed,
  onRestart,
  onSelectAnotherQuest,
}: FinalTreasureModalProps) {
  useEffect(() => {
    sound.playTreasureFanfare();

    // Trigger golden confetti burst
    const end = Date.now() + 3000;
    const colors = ['#f59e0b', '#fbbf24', '#d97706', '#ffffff', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const mins = Math.floor(durationMs / 60000);
  const secs = Math.floor((durationMs % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border-4 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.5)] text-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full filter blur-3xl pointer-events-none" />

        {/* Chest Icon */}
        <div className="relative inline-block mb-4">
          <div className="text-7xl sm:text-8xl filter drop-shadow-[0_0_25px_rgba(251,191,36,0.8)] animate-bounce">
            {quest.finalTreasure.icon || '🏆'}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-widest shadow-lg">
            +{quest.finalTreasure.valueGold} GOLD
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-200 uppercase tracking-wider font-serif">
          {quest.finalTreasure.name}
        </h2>

        <p className="text-xs text-amber-400/90 font-medium uppercase tracking-widest mt-1">
          Expedition Successfully Concluded
        </p>

        <p className="text-sm text-stone-300 italic mt-3 leading-relaxed">
          &ldquo;{quest.storyCompletion}&rdquo;
        </p>

        {/* Certificate Card */}
        <div className="my-6 p-4 bg-stone-950/80 border border-amber-600/40 rounded-2xl text-left space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-stone-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Grandmaster Wayfarer Citation
            </span>
            <span className="font-mono text-emerald-400">100% DISCOVERY</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-stone-900 rounded-lg">
              <div className="text-stone-400 text-[10px]">Trek Distance</div>
              <div className="font-bold font-mono text-amber-200 mt-0.5">
                {formatDistance(distanceMeters)}
              </div>
            </div>
            <div className="p-2 bg-stone-900 rounded-lg">
              <div className="text-stone-400 text-[10px]">Time Taken</div>
              <div className="font-bold font-mono text-amber-200 mt-0.5">
                {mins}m {secs}s
              </div>
            </div>
            <div className="p-2 bg-stone-900 rounded-lg">
              <div className="text-stone-400 text-[10px]">Hints Used</div>
              <div className="font-bold font-mono text-amber-200 mt-0.5">
                {hintsUsed}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onSelectAnotherQuest}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4" />
            Embark on Another Quest
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl text-xs transition-all border border-stone-700 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Re-run Trail
          </button>
        </div>
      </div>
    </div>
  );
}
