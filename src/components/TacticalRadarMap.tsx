import { useRef } from 'react';
import { GeoPoint, ClueCheckpoint, ExplorerPosition } from '../types/hunt';
import { calculateDistanceMeters, calculateBearing, formatDistance, offsetCoordinates } from '../utils/geo';
import { Compass, Sparkles, Check, Lock, Eye, Layers } from 'lucide-react';

interface TacticalRadarMapProps {
  explorerPos: ExplorerPosition;
  checkpoints: ClueCheckpoint[];
  activeCheckpointIndex: number;
  solvedCheckpointIds: string[];
  onSelectCheckpoint: (cp: ClueCheckpoint) => void;
  onMapClick?: (coords: GeoPoint) => void;
  isSimulatedMovement: boolean;
}

export function TacticalRadarMap({
  explorerPos,
  checkpoints,
  activeCheckpointIndex,
  solvedCheckpointIds,
  onSelectCheckpoint,
  onMapClick,
  isSimulatedMovement,
}: TacticalRadarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCheckpoint = checkpoints[activeCheckpointIndex];

  // Radar scale: max radius in meters represented by the edge of the container (e.g., 250m)
  const MAX_RADAR_RADIUS_METERS = 260;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const clickX = e.clientX - rect.left - centerX;
    const clickY = e.clientY - rect.top - centerY;

    // Convert pixel offset into distance and bearing
    const distanceMeters = (Math.sqrt(clickX * clickX + clickY * clickY) / (rect.width / 2)) * MAX_RADAR_RADIUS_METERS;
    let angleRad = Math.atan2(clickX, -clickY); // 0 at top (North), clockwise
    let bearingDeg = (angleRad * 180) / Math.PI;
    if (bearingDeg < 0) bearingDeg += 360;

    const clickedCoords = offsetCoordinates(explorerPos.coords, distanceMeters, bearingDeg);
    onMapClick(clickedCoords);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border-2 border-amber-900/60 shadow-2xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center select-none cursor-crosshair"
    >
      {/* Background cartographic grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #f59e0b 1px, transparent 1px), linear-gradient(to right, #451a03 1px, transparent 1px), linear-gradient(to bottom, #451a03 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radar sweep light effect */}
      <div className="absolute w-[90%] h-[90%] rounded-full animate-radar pointer-events-none opacity-40">
        <div className="w-1/2 h-1/2 bg-gradient-to-br from-amber-500/20 to-transparent rounded-tl-full origin-bottom-right" />
      </div>

      {/* Concentric distance range rings */}
      {[25, 75, 150, 250].map((radiusMeters) => {
        const percent = (radiusMeters / MAX_RADAR_RADIUS_METERS) * 90;
        return (
          <div
            key={radiusMeters}
            className="absolute rounded-full border border-amber-500/20 pointer-events-none flex items-start justify-center"
            style={{ width: `${percent}%`, height: `${percent}%` }}
          >
            <span className="text-[9px] font-mono text-amber-500/60 -mt-2.5 bg-stone-950 px-1 rounded">
              {radiusMeters}m
            </span>
          </div>
        );
      })}

      {/* Cardinal Axis Lines */}
      <div className="absolute w-full h-px bg-amber-500/20 pointer-events-none" />
      <div className="absolute h-full w-px bg-amber-500/20 pointer-events-none" />

      {/* Cardinal Labels */}
      <span className="absolute top-2 text-xs font-bold font-mono text-amber-400">N (0°)</span>
      <span className="absolute right-3 text-xs font-bold font-mono text-amber-400">E (90°)</span>
      <span className="absolute bottom-2 text-xs font-bold font-mono text-amber-400">S (180°)</span>
      <span className="absolute left-3 text-xs font-bold font-mono text-amber-400">W (270°)</span>

      {/* Center: EXPLORER POSITION */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        {/* Animated Radar Pulse ring */}
        <div className="absolute w-16 h-16 rounded-full bg-amber-500/25 animate-pulse-ring pointer-events-none" />
        <div className="absolute w-28 h-28 rounded-full bg-amber-500/10 animate-ping pointer-events-none" />

        {/* Direction cone */}
        {explorerPos.heading !== null && (
          <div
            className="absolute w-24 h-24 pointer-events-none transition-transform duration-200"
            style={{ transform: `rotate(${explorerPos.heading}deg)` }}
          >
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[32px] border-b-amber-400/40 mx-auto -mt-4 filter blur-[1px]" />
          </div>
        )}

        {/* Explorer icon badge */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-2 border-stone-950 shadow-xl flex items-center justify-center text-stone-950 text-sm font-bold z-10">
          🧭
        </div>

        <div className="mt-1 px-2 py-0.5 rounded-full bg-stone-950/90 border border-amber-500/40 text-[9px] font-mono text-amber-300">
          {isSimulatedMovement ? 'Virtual Explorer' : 'Device GPS'}
        </div>
      </div>

      {/* CHECKPOINT MARKERS PLACED RELATIVE TO EXPLORER */}
      {checkpoints.map((cp, idx) => {
        const isSolved = solvedCheckpointIds.includes(cp.id);
        const isActive = idx === activeCheckpointIndex;
        const dist = calculateDistanceMeters(explorerPos.coords, cp.location);
        const bearing = calculateBearing(explorerPos.coords, cp.location);

        // Map distance to radial pixel percentage (clamped to 44% radius so pins don't overflow)
        const radialFraction = Math.min(0.44, (dist / MAX_RADAR_RADIUS_METERS) * 0.44);
        const angleRad = ((bearing - 90) * Math.PI) / 180; // 0 deg is North (-90 deg from 3 o'clock)
        const xOffset = Math.cos(angleRad) * radialFraction * 100;
        const yOffset = Math.sin(angleRad) * radialFraction * 100;

        return (
          <div
            key={cp.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCheckpoint(cp);
            }}
            className="absolute z-30 flex flex-col items-center cursor-pointer group transition-transform duration-300"
            style={{
              transform: `translate(${xOffset}%, ${yOffset}%)`,
            }}
          >
            {/* Geofence boundary circle if active */}
            {isActive && (
              <div className="absolute w-20 h-20 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-500/15 animate-pulse pointer-events-none -translate-y-2 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
            )}

            {/* Checkpoint pin badge */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-all transform group-hover:scale-115 ${
                isSolved
                  ? 'bg-emerald-600 border-emerald-300 text-white'
                  : isActive
                  ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-stone-950 text-stone-950 animate-bounce'
                  : 'bg-stone-800 border-stone-600 text-stone-400'
              }`}
            >
              {isSolved ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : isActive ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Label */}
            <div className="mt-1 px-2 py-0.5 rounded bg-stone-950/95 border border-amber-500/40 text-[10px] font-mono text-amber-200 whitespace-nowrap shadow-md">
              #{idx + 1} {formatDistance(dist)}
            </div>
          </div>
        );
      })}

      {/* Floating Mode Notice */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <span className="px-2.5 py-1 rounded-lg bg-stone-950/90 border border-amber-600/40 text-[10px] font-bold text-amber-300 uppercase tracking-wider backdrop-blur-md">
          Tactical GPS Radar
        </span>
      </div>

      {/* Bottom Map Helper Banner */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-xl bg-stone-950/90 border border-amber-700/40 backdrop-blur-md shadow-2xl flex items-center justify-between text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {isSimulatedMovement ? (
                <>
                  <strong className="text-amber-300">Virtual Walk:</strong> Click radar or use D-pad to step towards checkpoint.
                </>
              ) : (
                <>
                  <strong className="text-amber-300">Live Field GPS:</strong> Walk in real life to move toward the amber pin!
                </>
              )}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
            Max Scale: {MAX_RADAR_RADIUS_METERS}m
          </span>
        </div>
      </div>
    </div>
  );
}
