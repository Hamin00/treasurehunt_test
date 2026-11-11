import { useState } from 'react';
import { GeoPoint, ClueCheckpoint } from '../types/hunt';
import { offsetCoordinates, calculateBearing } from '../utils/geo';
import { sound } from '../utils/audio';
import {
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Radio,
  Zap,
  RotateCcw,
  Footprints,
  LocateFixed,
} from 'lucide-react';

interface VirtualExplorerControlsProps {
  currentCoords: GeoPoint;
  activeCheckpoint: ClueCheckpoint | null;
  onUpdateCoords: (newCoords: GeoPoint, heading?: number) => void;
  isSimulated: boolean;
  onToggleSimulated: (sim: boolean) => void;
  onResetToQuestStart: () => void;
}

export function VirtualExplorerControls({
  currentCoords,
  activeCheckpoint,
  onUpdateCoords,
  isSimulated,
  onToggleSimulated,
  onResetToQuestStart,
}: VirtualExplorerControlsProps) {
  const [stepSizeMeters, setStepSizeMeters] = useState<number>(10);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const moveInDirection = (bearing: number) => {
    sound.playDialTick();
    const nextCoords = offsetCoordinates(currentCoords, stepSizeMeters, bearing);
    onUpdateCoords(nextCoords, bearing);
  };

  const walkDirectlyTowardsTarget = () => {
    if (!activeCheckpoint) return;
    sound.playDialTick();
    const targetBearing = calculateBearing(currentCoords, activeCheckpoint.location);
    const nextCoords = offsetCoordinates(currentCoords, stepSizeMeters * 1.5, targetBearing);
    onUpdateCoords(nextCoords, targetBearing);
  };

  const teleportToGeofence = () => {
    if (!activeCheckpoint) return;
    sound.playUnlockedChime();
    // Position within 10 meters of checkpoint (safely within the 25m geofence)
    const targetBearing = calculateBearing(currentCoords, activeCheckpoint.location);
    const closeCoords = offsetCoordinates(activeCheckpoint.location, 8, (targetBearing + 180) % 360);
    onUpdateCoords(closeCoords, targetBearing);
  };

  return (
    <div className="w-full bg-stone-900/95 border-2 border-amber-900/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Top Header & Mode Toggle */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <LocateFixed className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Movement & GPS Mode
          </span>
        </div>

        {/* Live GPS vs Virtual Mode switch */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => onToggleSimulated(false)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              !isSimulated
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Live GPS
          </button>
          <button
            type="button"
            onClick={() => onToggleSimulated(true)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              isSimulated
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" /> Virtual Walker
          </button>
        </div>
      </div>

      {isSimulated ? (
        <div className="pt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
            <span>Virtual Pace:</span>
            <div className="flex gap-1">
              {[
                { label: 'Walk (5m)', val: 5 },
                { label: 'Pace (10m)', val: 10 },
                { label: 'Jog (25m)', val: 25 },
              ].map((pace) => (
                <button
                  key={pace.val}
                  type="button"
                  onClick={() => setStepSizeMeters(pace.val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer border ${
                    stepSizeMeters === pace.val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {pace.label}
                </button>
              ))}
            </div>
          </div>

          {/* D-Pad & Quick Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            {/* D-Pad */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <button
                type="button"
                onClick={() => moveInDirection(0)}
                className="absolute top-0 p-2 bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-amber-300 rounded-lg border border-stone-700 shadow active:scale-90 transition-all cursor-pointer"
                title="Walk North (0°)"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveInDirection(270)}
                className="absolute left-0 p-2 bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-amber-300 rounded-lg border border-stone-700 shadow active:scale-90 transition-all cursor-pointer"
                title="Walk West (270°)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-full bg-stone-950 border border-stone-700 flex items-center justify-center text-[10px] text-amber-400 font-mono">
                {stepSizeMeters}m
              </div>
              <button
                type="button"
                onClick={() => moveInDirection(90)}
                className="absolute right-0 p-2 bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-amber-300 rounded-lg border border-stone-700 shadow active:scale-90 transition-all cursor-pointer"
                title="Walk East (90°)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveInDirection(180)}
                className="absolute bottom-0 p-2 bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-amber-300 rounded-lg border border-stone-700 shadow active:scale-90 transition-all cursor-pointer"
                title="Walk South (180°)"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex-1 w-full space-y-2">
              <button
                type="button"
                onClick={walkDirectlyTowardsTarget}
                className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-200 text-xs font-semibold rounded-xl border border-amber-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Step Toward Checkpoint (+{stepSizeMeters * 1.5}m)
              </button>

              <button
                type="button"
                onClick={teleportToGeofence}
                className="w-full py-2 px-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 active:scale-95 text-stone-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                Teleport Directly Inside Geofence (Test)
              </button>

              <button
                type="button"
                onClick={onResetToQuestStart}
                className="w-full py-1.5 text-stone-400 hover:text-stone-200 text-[11px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset to Expedition Start
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-3 text-xs text-stone-400 flex items-center justify-between">
          <span>Active Device GPS tracking enabled. Walk outdoors to navigate!</span>
          <button
            type="button"
            onClick={onResetToQuestStart}
            className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
          >
            Recentralize
          </button>
        </div>
      )}
    </div>
  );
}
