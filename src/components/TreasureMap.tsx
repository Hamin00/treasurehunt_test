import { useState, useCallback, useEffect } from 'react';
import { Map, AdvancedMarker, useMap, MapMouseEvent } from '@vis.gl/react-google-maps';
import { GeoPoint, ClueCheckpoint, ExplorerPosition } from '../types/hunt';
import { Layers, Crosshair, Sparkles, Lock, Check, Eye } from 'lucide-react';

interface TreasureMapProps {
  explorerPos: ExplorerPosition;
  checkpoints: ClueCheckpoint[];
  activeCheckpointIndex: number;
  solvedCheckpointIds: string[];
  onSelectCheckpoint: (cp: ClueCheckpoint) => void;
  onMapClick?: (coords: GeoPoint) => void;
  isSimulatedMovement: boolean;
}

// Inner helper component to pan/center the map smoothly
function MapController({ center }: { center: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng]);
  return null;
}

export function TreasureMap({
  explorerPos,
  checkpoints,
  activeCheckpointIndex,
  solvedCheckpointIds,
  onSelectCheckpoint,
  onMapClick,
  isSimulatedMovement,
}: TreasureMapProps) {
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showPerimeters, setShowPerimeters] = useState(true);

  const activeCheckpoint = checkpoints[activeCheckpointIndex];

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!e.detail?.latLng || !onMapClick) return;
      onMapClick({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng,
      });
    },
    [onMapClick]
  );

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border-2 border-stone-800 shadow-2xl bg-stone-900">
      <Map
        defaultCenter={explorerPos.coords}
        defaultZoom={17}
        mapId="DEMO_MAP_ID"
        mapTypeId={mapTypeId}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        onClick={handleMapClick}
        disableDefaultUI={true}
        gestureHandling="greedy"
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <MapController center={explorerPos.coords} />

        {/* 1. EXPLORER ADVANCED MARKER */}
        <AdvancedMarker
          position={explorerPos.coords}
          title="Your Expedition Position"
          zIndex={100}
        >
          <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            {/* Animated Radar Pulse when approaching active target */}
            <div className="absolute w-14 h-14 rounded-full bg-amber-500/20 animate-pulse-ring pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full bg-amber-500/10 animate-ping pointer-events-none opacity-40" />

            {/* Directional Heading Cone if heading is available */}
            {explorerPos.heading !== null && (
              <div
                className="absolute w-28 h-28 pointer-events-none transition-transform duration-200"
                style={{ transform: `rotate(${explorerPos.heading}deg)` }}
              >
                <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[36px] border-b-amber-400/30 mx-auto -mt-4 filter blur-[1px]" />
              </div>
            )}

            {/* Core Explorer Badge */}
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-2 border-stone-950 shadow-xl flex items-center justify-center text-stone-950 font-black text-sm z-20">
              🧭
            </div>

            {/* Position Accuracy / Mode Label */}
            <div className="absolute top-10 whitespace-nowrap px-2 py-0.5 rounded-full bg-stone-950/90 border border-amber-500/40 text-[10px] font-mono text-amber-300 shadow-md">
              {isSimulatedMovement ? 'Virtual Explorer' : `GPS ±${Math.round(explorerPos.accuracy)}m`}
            </div>
          </div>
        </AdvancedMarker>

        {/* 2. CHECKPOINT ADVANCED MARKERS */}
        {checkpoints.map((cp, idx) => {
          const isSolved = solvedCheckpointIds.includes(cp.id);
          const isActive = idx === activeCheckpointIndex;
          const isLocked = !isSolved && !isActive;

          return (
            <AdvancedMarker
              key={cp.id}
              position={cp.location}
              title={`${cp.title} (${cp.locationName})`}
              zIndex={isActive ? 90 : 50}
              onClick={() => onSelectCheckpoint(cp)}
            >
              <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                {/* Geofence Perimeter visualization circle if active or toggled */}
                {showPerimeters && isActive && (
                  <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-500/15 pointer-events-none animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                )}

                {/* Marker Pin */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl border-2 transition-all duration-300 transform group-hover:scale-110 ${
                    isSolved
                      ? 'bg-emerald-600 border-emerald-300 text-white'
                      : isActive
                      ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-stone-950 text-stone-950 animate-bounce'
                      : 'bg-stone-800 border-stone-600 text-stone-400 opacity-80'
                  }`}
                >
                  {isSolved ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isActive ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>

                {/* Pin Stage Number badge */}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-900 border border-amber-500 text-[10px] font-bold text-amber-300 flex items-center justify-center">
                  {idx + 1}
                </span>

                {/* Pin Label on Hover or Active */}
                <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-stone-900/95 border border-amber-500/30 text-[11px] font-semibold text-amber-200 whitespace-nowrap shadow-lg">
                  {cp.title}
                </div>
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>

      {/* Floating Map Custom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {/* Toggle Map Satellite / Terrain / Roadmap */}
        <button
          type="button"
          onClick={() => {
            const cycle: ('roadmap' | 'satellite' | 'hybrid')[] = ['roadmap', 'satellite', 'hybrid'];
            const nextIdx = (cycle.indexOf(mapTypeId as any) + 1) % cycle.length;
            setMapTypeId(cycle[nextIdx]);
          }}
          className="p-2.5 bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-stone-700/80 rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md"
          title="Toggle Satellite / Roadmap"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline capitalize">{mapTypeId}</span>
        </button>

        {/* Toggle Geofence Perimeter Rings */}
        <button
          type="button"
          onClick={() => setShowPerimeters(!showPerimeters)}
          className={`p-2.5 rounded-xl border shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md ${
            showPerimeters
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
              : 'bg-stone-900/90 border-stone-700/80 text-stone-400'
          }`}
          title="Toggle 25m Geofence Rings"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">25m Rings</span>
        </button>
      </div>

      {/* Interactive Helper Banner at Bottom of Map */}
      <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto z-10 pointer-events-none">
        <div className="px-3.5 py-2 rounded-xl bg-stone-950/90 border border-amber-700/40 backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-xs text-stone-300">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span>
            {isSimulatedMovement ? (
              <>
                <strong className="text-amber-300">Virtual Walk Mode:</strong> Click anywhere on the map or use the D-pad to step your explorer.
              </>
            ) : (
              <>
                <strong className="text-amber-300">Live Field GPS:</strong> Walk in real life toward the amber checkpoint marker to trigger the clue!
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
