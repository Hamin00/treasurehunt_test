import { useState } from 'react';
import { sound } from '../../utils/audio';
import { ShieldAlert, Unlock, ChevronUp, ChevronDown } from 'lucide-react';

interface SymbolLockPuzzleProps {
  symbols: string[];
  expectedSequence: string; // e.g. "⛰️-💧-💨-🔥"
  onSolve: () => void;
}

const AVAILABLE_GLYPHS = ['⛰️', '💧', '💨', '🔥', '⭐', '⚡', '🌙', '☀️', '⚓', '🗝️'];

export function SymbolLockPuzzle({
  symbols,
  expectedSequence,
  onSolve,
}: SymbolLockPuzzleProps) {
  // Pool of glyphs includes the required ones plus some extras
  const glyphPool = Array.from(new Set([...symbols, ...AVAILABLE_GLYPHS])).slice(0, 8);
  const targetTokens = expectedSequence.split('-');
  const slotCount = targetTokens.length;

  // Initialize with scrambled glyphs
  const [slots, setSlots] = useState<string[]>(() => {
    return Array.from({ length: slotCount }, (_, i) => {
      // Pick a random glyph that is not necessarily the correct one initially
      const poolWithoutTarget = glyphPool.filter((g) => g !== targetTokens[i]);
      return poolWithoutTarget[i % poolWithoutTarget.length] || glyphPool[0];
    });
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const cycleSlot = (slotIndex: number, delta: number) => {
    sound.playDialTick();
    setSlots((prev) => {
      const copy = [...prev];
      const currentGlyph = copy[slotIndex];
      const poolIdx = glyphPool.indexOf(currentGlyph);
      const nextIdx = (poolIdx + delta + glyphPool.length) % glyphPool.length;
      copy[slotIndex] = glyphPool[nextIdx];
      return copy;
    });
    setErrorMsg('');
  };

  const handleTestLock = () => {
    const currentCode = slots.join('-');
    if (currentCode === expectedSequence) {
      setIsSuccess(true);
      sound.playSuccessChime();
      setTimeout(() => {
        onSolve();
      }, 900);
    } else {
      sound.playErrorBuzzer();
      setErrorMsg('The tumblers rattle and lock up. The rune order is incorrect!');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 text-stone-200">
      <div className="text-center">
        <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-4 h-4" /> Antique 4-Cylinder Tumbler Lock
        </span>
        <p className="text-sm text-stone-400 mt-1">
          Cycle each ancient cylinder to match the sacred elemental sequence.
        </p>
      </div>

      {/* Tumbler cylinders box */}
      <div className="bg-stone-900/90 border-2 border-amber-800/80 rounded-2xl p-5 shadow-2xl flex items-center justify-center gap-3 md:gap-5">
        {slots.map((glyph, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => cycleSlot(idx, -1)}
              className="p-1 text-amber-500/70 hover:text-amber-300 hover:bg-stone-800 rounded transition-all cursor-pointer active:scale-90"
              title="Rotate Up"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            {/* Cylinder barrel */}
            <div
              onClick={() => cycleSlot(idx, 1)}
              className="w-14 h-20 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border-2 border-amber-600/50 rounded-xl flex items-center justify-center text-3xl shadow-inner cursor-pointer hover:border-amber-400 select-none transition-all active:scale-95"
            >
              <span className="filter drop-shadow-md">{glyph}</span>
            </div>

            <button
              type="button"
              onClick={() => cycleSlot(idx, 1)}
              className="p-1 text-amber-500/70 hover:text-amber-300 hover:bg-stone-800 rounded transition-all cursor-pointer active:scale-90"
              title="Rotate Down"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            <span className="text-[10px] text-stone-500 font-mono mt-0.5">
              Slot {idx + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Action and feedback */}
      <div className="w-full space-y-3">
        <button
          type="button"
          onClick={handleTestLock}
          disabled={isSuccess}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Unlock className="w-4 h-4" />
          {isSuccess ? 'TUMBLERS UNLOCKED!' : 'ALIGN & SLIDE BOLTS'}
        </button>

        {errorMsg && (
          <p className="text-xs text-rose-400 text-center font-medium animate-pulse">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}
