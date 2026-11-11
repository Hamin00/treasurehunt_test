import { useState } from 'react';
import { sound } from '../../utils/audio';
import { Compass, CheckCircle2, Navigation2 } from 'lucide-react';
import { bearingToCardinal } from '../../utils/geo';

interface CompassAzimuthPuzzleProps {
  targetBearing: number;
  tolerance?: number;
  onSolve: () => void;
}

export function CompassAzimuthPuzzle({
  targetBearing,
  tolerance = 12,
  onSolve,
}: CompassAzimuthPuzzleProps) {
  const [currentBearing, setCurrentBearing] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Compute angular difference (shortest path on 360 circle)
  const diff = Math.abs(((currentBearing - targetBearing + 180) % 360) - 180);
  const isAligned = diff <= tolerance;

  const handleSliderChange = (deg: number) => {
    sound.playDialTick();
    setCurrentBearing(deg);
    setErrorMsg('');
  };

  const handleStep = (step: number) => {
    sound.playDialTick();
    setCurrentBearing((prev) => (prev + step + 360) % 360);
    setErrorMsg('');
  };

  const handleVerify = () => {
    if (isAligned) {
      setIsSuccess(true);
      sound.playSuccessChime();
      setTimeout(() => {
        onSolve();
      }, 900);
    } else {
      sound.playErrorBuzzer();
      setErrorMsg(`The celestial prism is misaligned by ~${Math.round(diff)}°. Align closer to the target bearing!`);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 text-stone-200">
      <div className="text-center">
        <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold flex items-center justify-center gap-1.5">
          <Compass className="w-4 h-4" /> Celestial Astrolabe Alignment
        </span>
        <p className="text-sm text-stone-400 mt-1">
          Turn the brass sight-ring until the azimuth needle points to{' '}
          <strong className="text-amber-300 font-mono">{targetBearing}° ({bearingToCardinal(targetBearing)})</strong>.
        </p>
      </div>

      {/* Visual Astrolabe Dial */}
      <div className="relative w-64 h-64 flex items-center justify-center select-none">
        {/* Outer Weathered Dial */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-700/80 bg-stone-900 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Degree ticks */}
          <div className="absolute inset-2 rounded-full border border-amber-500/20 flex items-center justify-center">
            {/* Cardinal points */}
            <span className="absolute top-2 text-xs font-bold font-mono text-amber-400">N (0°)</span>
            <span className="absolute right-3 text-xs font-bold font-mono text-amber-400">E (90°)</span>
            <span className="absolute bottom-2 text-xs font-bold font-mono text-amber-400">S (180°)</span>
            <span className="absolute left-3 text-xs font-bold font-mono text-amber-400">W (270°)</span>
          </div>

          {/* Target Bearing Marker Indicator */}
          <div
            className="absolute w-full h-full pointer-events-none transition-transform duration-300"
            style={{ transform: `rotate(${targetBearing}deg)` }}
          >
            <div className="w-2 h-4 bg-amber-400/80 rounded-full mx-auto mt-1 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          </div>
        </div>

        {/* Rotating Compass Needle */}
        <div
          className="relative w-44 h-44 flex items-center justify-center transition-transform duration-150"
          style={{ transform: `rotate(${currentBearing}deg)` }}
        >
          {/* North needle tip */}
          <div className="absolute top-0 w-4 h-20 bg-gradient-to-t from-red-800 to-red-500 clip-needle shadow-lg flex items-center justify-center">
            <span className="text-[9px] font-bold text-white mb-6">N</span>
          </div>
          {/* South needle tip */}
          <div className="absolute bottom-0 w-4 h-20 bg-gradient-to-b from-stone-700 to-stone-400 clip-needle shadow-lg" />
          {/* Needle pivot */}
          <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-stone-900 z-10 shadow" />
        </div>

        {/* Alignment Glow Ring */}
        {isAligned && (
          <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-pulse pointer-events-none shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
        )}
      </div>

      {/* Degree & Cardinal Display */}
      <div className="text-center bg-stone-900/90 border border-stone-800 rounded-xl px-6 py-2.5 shadow-inner">
        <div className="text-[11px] text-stone-400 uppercase tracking-widest">Current Astrolabe Reading</div>
        <div className="text-2xl font-black font-mono text-amber-300 flex items-center justify-center gap-2 mt-0.5">
          <Navigation2 className="w-5 h-5 text-amber-400 transform rotate-45" />
          {Math.round(currentBearing)}° {bearingToCardinal(currentBearing)}
        </div>
        <div className="text-xs mt-1">
          {isAligned ? (
            <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Optical Prism Aligned!
            </span>
          ) : (
            <span className="text-stone-400">
              Offset from Target: <strong className="text-amber-400 font-mono">{Math.round(diff)}°</strong>
            </span>
          )}
        </div>
      </div>

      {/* Fine Adjustment Controls */}
      <div className="w-full space-y-3">
        <input
          type="range"
          min="0"
          max="359"
          value={currentBearing}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg appearance-none"
        />

        <div className="flex justify-between gap-1.5">
          <button
            type="button"
            onClick={() => handleStep(-10)}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded border border-stone-700 cursor-pointer active:scale-95"
          >
            -10°
          </button>
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded border border-stone-700 cursor-pointer active:scale-95"
          >
            -1°
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded border border-stone-700 cursor-pointer active:scale-95"
          >
            +1°
          </button>
          <button
            type="button"
            onClick={() => handleStep(10)}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded border border-stone-700 cursor-pointer active:scale-95"
          >
            +10°
          </button>
        </div>
      </div>

      {/* Lock in bearing button */}
      <div className="w-full space-y-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={isSuccess}
          className={`w-full py-3 rounded-xl font-bold text-stone-950 flex items-center justify-center gap-2 text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
            isAligned
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300'
              : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          {isSuccess ? 'ALIGNMENT LOCKED!' : isAligned ? 'LOCK IN SIGHTING' : 'TEST BEARING ALIGNMENT'}
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
