import { GeoPoint, ClueCheckpoint, ExplorerPosition } from '../types/hunt';
import { calculateDistanceMeters, calculateBearing, formatDistance, bearingToCardinal } from '../utils/geo';
import { sound } from '../utils/audio';
import { Navigation, Sparkles, Volume2, VolumeX, Footprints, ShieldAlert, Key } from 'lucide-react';
import { useState } from 'react';

interface CompassHUDProps {
  explorerPos: ExplorerPosition;
  activeCheckpoint: ClueCheckpoint | null;
  onOpenClueModal: () => void;
  isInsideGeofence: boolean;
  totalCheckpoints: number;
  currentCheckpointIndex: number;
}

export function CompassHUD({
  explorerPos,
  activeCheckpoint,
  onOpenClueModal,
  isInsideGeofence,
  totalCheckpoints,
  currentCheckpointIndex,
}: CompassHUDProps) {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  if (!activeCheckpoint) {
    return null;
  }

  const distance = calculateDistanceMeters(explorerPos.coords, activeCheckpoint.location);
  const bearing = calculateBearing(explorerPos.coords, activeCheckpoint.location);
  const relativeHeading = explorerPos.heading !== null ? (bearing - explorerPos.heading + 360) % 360 : bearing;

  const toggleSound = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
    if (!next) sound.playUnlockedChime();
  };

  // Proximity stage
  let proximityLabel = 'Far Distance';
  let proximityColor = 'bg-blue-500';
  let proximityWidth = '15%';

  if (distance < activeCheckpoint.unlockRadiusMeters) {
    proximityLabel = '🎯 INSIDE GEOFENCE';
    proximityColor = 'bg-emerald-400';
    proximityWidth = '100%';
  } else if (distance < 50) {
    proximityLabel = '🔥 Burning Hot';
    proximityColor = 'bg-amber-400';
    proximityWidth = '80%';
  } else if (distance < 120) {
    proximityLabel = '⚡ Warm Trail';
    proximityColor = 'bg-yellow-500';
    proximityWidth = '50%';
  } else {
    proximityLabel = '❄️ Cold';
    proximityColor = 'bg-sky-500';
    proximityWidth = '25%';
  }

  return (
    <div className="w-full bg-gradient-to-b from-stone-900/95 to-stone-950/95 border-2 border-amber-800/60 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Decorative filigree header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
            Stage {currentCheckpointIndex + 1} of {totalCheckpoints}: {activeCheckpoint.title}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleSound}
          className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-300 transition-all cursor-pointer"
          title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Grid: Compass Rose + Proximity Data */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center pt-4">
        {/* Left: The Golden Compass Rose */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center select-none">
            {/* Outer Brass Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-600/60 bg-stone-900 shadow-inner flex items-center justify-center">
              <div className="absolute inset-1.5 rounded-full border border-amber-400/20" />
              {/* Cardinal labels */}
              <span className="absolute top-1 text-[10px] font-bold text-amber-400">N</span>
              <span className="absolute right-2 text-[10px] font-bold text-amber-400">E</span>
              <span className="absolute bottom-1 text-[10px] font-bold text-amber-400">S</span>
              <span className="absolute left-2 text-[10px] font-bold text-amber-400">W</span>
            </div>

            {/* Target Bearing Needle pointing to the checkpoint */}
            <div
              className="relative w-28 h-28 flex items-center justify-center transition-transform duration-300"
              style={{ transform: `rotate(${relativeHeading}deg)` }}
            >
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[44px] border-b-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] -mt-12" />
            </div>

            {/* Center Pivot */}
            <div className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 border border-stone-900 shadow flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-xs font-mono font-bold text-amber-300">
              Bearing {Math.round(bearing)}° {bearingToCardinal(bearing)}
            </span>
          </div>
        </div>

        {/* Right: Distance & Geofence Status */}
        <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[11px] text-stone-400 uppercase tracking-widest">
              GPS Proximity Distance
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tracking-tight">
                {formatDistance(distance)}
              </span>
              <span className="text-xs text-stone-400">
                (Radius: {activeCheckpoint.unlockRadiusMeters}m)
              </span>
            </div>
          </div>

          {/* Proximity Heat Gauge */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Tracking Signal:</span>
              <span className="font-bold text-amber-300">{proximityLabel}</span>
            </div>
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${proximityColor}`}
                style={{ width: proximityWidth }}
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          {isInsideGeofence ? (
            <button
              type="button"
              onClick={onOpenClueModal}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 hover:from-emerald-400 hover:to-amber-300 text-stone-950 font-black rounded-2xl flex items-center justify-center gap-2 text-sm shadow-[0_0_25px_rgba(52,211,153,0.6)] animate-pulse transition-all cursor-pointer active:scale-95"
            >
              <Key className="w-4 h-4 text-stone-950" />
              LOCATION UNLOCKED! SOLVE PUZZLE
            </button>
          ) : (
            <div className="flex items-center justify-between p-3 bg-stone-950/60 rounded-xl border border-stone-800 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-amber-400" />
                <span>Walk {Math.round(Math.max(0, distance - activeCheckpoint.unlockRadiusMeters))}m closer to trigger puzzle.</span>
              </div>
              <button
                type="button"
                onClick={onOpenClueModal}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
              >
                Inspect Clue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
