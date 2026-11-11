import { useState } from 'react';
import { sound } from '../../utils/audio';
import { HelpCircle, Unlock, Sparkles, Feather } from 'lucide-react';

interface KeystoneRiddlePuzzleProps {
  question: string;
  expectedAnswer: string;
  hintText: string;
  onSolve: () => void;
  onUseHint: () => void;
}

export function KeystoneRiddlePuzzle({
  question,
  expectedAnswer,
  hintText,
  onSolve,
  onUseHint,
}: KeystoneRiddlePuzzleProps) {
  const [inputVal, setInputVal] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleToggleHint = () => {
    sound.playParchmentRustle();
    if (!showHint) {
      onUseHint();
    }
    setShowHint(!showHint);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUser = inputVal.trim().toUpperCase();
    const cleanAnswer = expectedAnswer.trim().toUpperCase();

    // Support single words or containing the answer keyword
    if (cleanUser === cleanAnswer || cleanUser.includes(cleanAnswer) || cleanAnswer.includes(cleanUser) && cleanUser.length >= 3) {
      setIsSuccess(true);
      sound.playSuccessChime();
      setTimeout(() => {
        onSolve();
      }, 900);
    } else {
      sound.playErrorBuzzer();
      setErrorMsg('The ancient keystone remains silent. Re-read the riddle carefully.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 text-stone-200">
      <div className="text-center">
        <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold flex items-center justify-center gap-1.5">
          <Feather className="w-4 h-4" /> The Keystone Inscription Riddle
        </span>
        <p className="text-sm text-stone-400 mt-1">
          Speak the secret truth carved into the weathered masonry.
        </p>
      </div>

      {/* Parchment Keystone Card */}
      <div className="w-full bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-800/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Ancient corner ornamentations */}
        <div className="absolute top-2 left-2 text-amber-700/40 text-xs font-serif select-none">✦</div>
        <div className="absolute top-2 right-2 text-amber-700/40 text-xs font-serif select-none">✦</div>
        <div className="absolute bottom-2 left-2 text-amber-700/40 text-xs font-serif select-none">✦</div>
        <div className="absolute bottom-2 right-2 text-amber-700/40 text-xs font-serif select-none">✦</div>

        <div className="relative z-10 space-y-4">
          <p className="text-lg md:text-xl font-serif italic text-amber-100 text-center leading-relaxed">
            {question}
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleToggleHint}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-3 py-1 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/50 rounded-full transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? 'Conceal Wayfarer’s Whisper' : 'Consult Wayfarer’s Whisper (Hint)'}
            </button>
          </div>

          {showHint && (
            <div className="p-3 bg-stone-800/80 border border-amber-600/30 rounded-xl text-xs text-amber-200/90 text-center animate-fade-in flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{hintText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Answer Submission Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setErrorMsg('');
            }}
            placeholder="CARVE YOUR ANSWER"
            className="flex-1 px-4 py-2.5 bg-black/60 border border-amber-600/40 rounded-xl font-mono text-center tracking-widest text-amber-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 uppercase text-sm"
          />
          <button
            type="submit"
            disabled={isSuccess}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Unlock className="w-4 h-4" />
            {isSuccess ? 'UNLOCKED!' : 'SUBMIT'}
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 text-center font-medium animate-pulse">
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
}
