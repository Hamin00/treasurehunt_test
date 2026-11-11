import { useState } from 'react';
import { sound } from '../../utils/audio';
import { RotateCw, RotateCcw, Unlock, KeyRound } from 'lucide-react';

interface CipherDialPuzzleProps {
  encodedText: string;
  cipherKey: number;
  expectedAnswer: string;
  onSolve: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function CipherDialPuzzle({
  encodedText,
  cipherKey,
  expectedAnswer,
  onSolve,
}: CipherDialPuzzleProps) {
  const [shift, setShift] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const rotate = (amount: number) => {
    sound.playDialTick();
    setShift((prev) => (prev + amount + 26) % 26);
    setErrorMsg('');
  };

  // Decode text using current shift
  const decodeWithShift = (str: string, currentShift: number) => {
    return str
      .toUpperCase()
      .split('')
      .map((char) => {
        const idx = ALPHABET.indexOf(char);
        if (idx === -1) return char;
        const newIdx = (idx - currentShift + 26) % 26;
        return ALPHABET[newIdx];
      })
      .join('');
  };

  const currentPreview = decodeWithShift(encodedText, shift);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAnswer = userAnswer.trim().toUpperCase();
    const cleanExpected = expectedAnswer.trim().toUpperCase();

    if (cleanAnswer === cleanExpected || currentPreview === cleanExpected) {
      setIsSuccess(true);
      sound.playSuccessChime();
      setTimeout(() => {
        onSolve();
      }, 900);
    } else {
      sound.playErrorBuzzer();
      setErrorMsg('The cipher runes reject your word. Check your ring offset!');
    }
  };

  const useDecodedAsAnswer = () => {
    setUserAnswer(currentPreview);
  };

  return (
    <div className="flex flex-col items-center space-y-6 text-stone-200">
      <div className="text-center">
        <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold flex items-center justify-center gap-1.5">
          <KeyRound className="w-4 h-4" /> Caesar’s Rotational Rune Dial
        </span>
        <p className="text-sm text-stone-400 mt-1">
          Rotate the inner cipher ring to decipher the surveyor’s secret key.
        </p>
      </div>

      {/* Visual Dial Rings */}
      <div className="relative w-64 h-64 flex items-center justify-center select-none">
        {/* Outer Ring (Ciphertext) */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-800/60 bg-stone-900/90 shadow-2xl flex items-center justify-center">
          <div className="absolute inset-1 rounded-full border border-amber-500/20" />
          {/* Subtle ring markings */}
          <div className="text-[10px] text-amber-600/60 font-mono tracking-widest absolute top-2">
            OUTER RING: CIPHER
          </div>
        </div>

        {/* Inner Rotating Ring */}
        <div
          className="relative w-44 h-44 rounded-full border-2 border-amber-500/50 bg-stone-950 flex flex-col items-center justify-center transition-transform duration-300 shadow-inner"
          style={{ transform: `rotate(${shift * 13.84}deg)` }}
        >
          <div className="text-[9px] uppercase tracking-wider text-amber-400/80 mb-1">
            Shift {shift}
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            A ➔ {ALPHABET[(0 + shift) % 26]}
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Key: {shift === cipherKey ? '✨ ALIGNED' : 'UNALIGNED'}
          </div>
        </div>

        {/* Center Golden Pin */}
        <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 border border-amber-900 shadow-lg flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
        </div>
      </div>

      {/* Dial Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => rotate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-200 text-xs rounded-lg border border-amber-500/30 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Rotate -1
        </button>

        <span className="font-mono text-xs text-amber-400 px-3 py-1 bg-stone-900 rounded border border-stone-800">
          Offset: <strong className="text-amber-200">+{shift}</strong>
        </span>

        <button
          type="button"
          onClick={() => rotate(1)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-200 text-xs rounded-lg border border-amber-500/30 transition-all cursor-pointer"
        >
          Rotate +1 <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Current Inscription Output */}
      <div className="w-full bg-stone-900/90 border border-amber-900/40 rounded-xl p-4 text-center">
        <div className="text-xs text-stone-400 uppercase tracking-wider mb-1">
          Encoded Inscription:
        </div>
        <div className="font-mono text-lg font-bold tracking-widest text-amber-400 mb-3">
          {encodedText}
        </div>

        <div className="text-xs text-stone-400 uppercase tracking-wider mb-1">
          Current Decoded Reading:
        </div>
        <div className="font-mono text-2xl font-black tracking-widest text-emerald-400 py-1 bg-black/40 rounded-lg border border-emerald-500/30 mb-2">
          {currentPreview}
        </div>

        <button
          type="button"
          onClick={useDecodedAsAnswer}
          className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
        >
          Fill &ldquo;{currentPreview}&rdquo; into Solution
        </button>
      </div>

      {/* Answer Verification Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
            placeholder="ENTER DECODED KEYWORD"
            className="flex-1 px-4 py-2.5 bg-black/50 border border-amber-600/40 rounded-xl font-mono text-center tracking-widest text-amber-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 uppercase text-sm"
          />
          <button
            type="submit"
            disabled={isSuccess}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Unlock className="w-4 h-4" />
            {isSuccess ? 'UNLOCKED!' : 'UNLOCK'}
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
