import { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Quest, ClueCheckpoint, ExplorerPosition, UserProgress } from './types/hunt';
import { DEFAULT_QUESTS } from './data/defaultQuests';
import { calculateDistanceMeters } from './utils/geo';
import { sound } from './utils/audio';
import { TreasureMap } from './components/TreasureMap';
import { TacticalRadarMap } from './components/TacticalRadarMap';
import { CompassHUD } from './components/CompassHUD';
import { VirtualExplorerControls } from './components/VirtualExplorerControls';
import { ClueModal } from './components/ClueModal';
import { ExplorerSatchel } from './components/ExplorerSatchel';
import { FinalTreasureModal } from './components/FinalTreasureModal';
import { QuestSelectorModal } from './components/QuestSelectorModal';
import { CustomQuestBuilder } from './components/CustomQuestBuilder';
import {
  Compass,
  Briefcase,
  Layers,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  MapPin,
  CheckCircle2,
  Footprints,
  Info,
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function App() {
  // Quota banner listener per Google Maps Platform spec
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Active Quest State
  const [currentQuest, setCurrentQuest] = useState<Quest>(DEFAULT_QUESTS[0]);
  const [customQuests, setCustomQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem('geoquest_custom_quests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Progress for Current Quest
  const [progress, setProgress] = useState<UserProgress>(() => ({
    questId: DEFAULT_QUESTS[0].id,
    currentCheckpointIndex: 0,
    solvedCheckpoints: [],
    collectedItems: [],
    distanceTraveledMeters: 0,
    startTime: Date.now(),
    hintsUsed: 0,
  }));

  // Explorer Real-Time / Simulated Positioning
  const [isSimulatedMovement, setIsSimulatedMovement] = useState(true);
  const [realGpsAvailable, setRealGpsAvailable] = useState(false);
  const [userRealLocation, setUserRealLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [explorerPos, setExplorerPos] = useState<ExplorerPosition>({
    coords: { ...DEFAULT_QUESTS[0].startingPoint },
    heading: 45,
    accuracy: 10,
    speed: null,
    isSimulated: true,
  });

  // Modals state
  const [activeModalCheckpoint, setActiveModalCheckpoint] = useState<ClueCheckpoint | null>(null);
  const [showSatchel, setShowSatchel] = useState(false);
  const [showQuestSelector, setShowQuestSelector] = useState(false);
  const [showQuestBuilder, setShowQuestBuilder] = useState(false);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Active Checkpoint
  const activeCheckpointIndex = progress.currentCheckpointIndex;
  const activeCheckpoint = currentQuest.checkpoints[activeCheckpointIndex] || null;

  // Previous position ref for measuring distance traveled
  const lastPosRef = useRef(explorerPos.coords);

  // Check geofence proximity
  const distanceToActive = activeCheckpoint
    ? calculateDistanceMeters(explorerPos.coords, activeCheckpoint.location)
    : 9999;
  const isInsideGeofence = activeCheckpoint
    ? distanceToActive <= activeCheckpoint.unlockRadiusMeters
    : false;

  // Track geofence entry sound trigger
  const hasTriggeredGeofenceSoundRef = useRef<string | null>(null);

  useEffect(() => {
    if (isInsideGeofence && activeCheckpoint) {
      if (hasTriggeredGeofenceSoundRef.current !== activeCheckpoint.id) {
        hasTriggeredGeofenceSoundRef.current = activeCheckpoint.id;
        sound.playUnlockedChime();
        // Haptic feedback if supported
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate([100, 60, 150]);
          } catch {
            // ignore
          }
        }
      }
    }
  }, [isInsideGeofence, activeCheckpoint]);

  // Real GPS Geolocation Watcher
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setRealGpsAvailable(true);
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserRealLocation(coords);

        if (!isSimulatedMovement) {
          // Update distance traveled
          const d = calculateDistanceMeters(lastPosRef.current, coords);
          if (d > 1 && d < 500) {
            setProgress((prev) => ({
              ...prev,
              distanceTraveledMeters: prev.distanceTraveledMeters + d,
            }));
            lastPosRef.current = coords;
          }

          setExplorerPos({
            coords,
            heading: pos.coords.heading ?? null,
            accuracy: pos.coords.accuracy ?? 15,
            speed: pos.coords.speed ?? null,
            isSimulated: false,
          });
        }
      },
      (err) => {
        console.warn('Geolocation access issue:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isSimulatedMovement]);

  // Manual / Simulated coordinate updates
  const handleUpdateCoordinates = useCallback((newCoords: { lat: number; lng: number }, heading?: number) => {
    const d = calculateDistanceMeters(lastPosRef.current, newCoords);
    if (d > 0.5) {
      setProgress((prev) => ({
        ...prev,
        distanceTraveledMeters: prev.distanceTraveledMeters + d,
      }));
      lastPosRef.current = newCoords;
    }

    setExplorerPos((prev) => ({
      coords: newCoords,
      heading: heading !== undefined ? heading : prev.heading,
      accuracy: 5,
      speed: 1.4,
      isSimulated: true,
    }));
  }, []);

  // Handle switching quest
  const handleSelectQuest = (newQuest: Quest) => {
    setCurrentQuest(newQuest);
    setProgress({
      questId: newQuest.id,
      currentCheckpointIndex: 0,
      solvedCheckpoints: [],
      collectedItems: [],
      distanceTraveledMeters: 0,
      startTime: Date.now(),
      hintsUsed: 0,
    });
    setExplorerPos({
      coords: { ...newQuest.startingPoint },
      heading: 0,
      accuracy: 5,
      speed: null,
      isSimulated: true,
    });
    lastPosRef.current = newQuest.startingPoint;
    hasTriggeredGeofenceSoundRef.current = null;
    setShowFinalCelebration(false);
  };

  // Checkpoint solved callback
  const handleSolveCheckpoint = () => {
    if (!activeCheckpoint) return;

    const nextIndex = progress.currentCheckpointIndex + 1;
    const isQuestFinished = nextIndex >= currentQuest.checkpoints.length;

    setProgress((prev) => ({
      ...prev,
      currentCheckpointIndex: nextIndex,
      solvedCheckpoints: [...prev.solvedCheckpoints, activeCheckpoint.id],
      collectedItems: [...prev.collectedItems, activeCheckpoint.rewardItem],
      completedTime: isQuestFinished ? Date.now() : undefined,
    }));

    // Close clue modal
    setActiveModalCheckpoint(null);

    if (isQuestFinished) {
      setShowFinalCelebration(true);
    }
  };

  const handleUseHint = () => {
    setProgress((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
  };

  const handleSaveCustomQuest = (newQuest: Quest) => {
    const updated = [newQuest, ...customQuests];
    setCustomQuests(updated);
    try {
      localStorage.setItem('geoquest_custom_quests', JSON.stringify(updated));
    } catch {
      // ignore
    }
    handleSelectQuest(newQuest);
  };

  const handleResetToStart = () => {
    sound.playParchmentRustle();
    setExplorerPos({
      coords: { ...currentQuest.startingPoint },
      heading: 0,
      accuracy: 5,
      speed: null,
      isSimulated: isSimulatedMovement,
    });
    lastPosRef.current = currentQuest.startingPoint;
  };

  const toggleSoundMute = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
    if (!next) sound.playUnlockedChime();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30">
      {/* 1. Google Maps Quota Reached Banner (Mandatory per Section 8 Case A) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 2. App Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-stone-950/90 border-b border-amber-900/40 backdrop-blur-xl px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Quest Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center text-stone-950 font-black shrink-0">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-wide text-amber-300 uppercase font-serif">
                  GeoQuest
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  GPS Treasure Trail
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {currentQuest.title}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quest Selector button */}
            <button
              type="button"
              onClick={() => {
                sound.playParchmentRustle();
                setShowQuestSelector(true);
              }}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Expeditions</span>
            </button>

            {/* Satchel & Relics Inventory button */}
            <button
              type="button"
              onClick={() => {
                sound.playParchmentRustle();
                setShowSatchel(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-950/60 to-stone-900 hover:from-amber-900/60 text-amber-200 border border-amber-700/50 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow"
            >
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Satchel</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold">
                {progress.collectedItems.length}
              </span>
            </button>

            {/* Audio Mute toggle */}
            <button
              type="button"
              onClick={toggleSoundMute}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-all cursor-pointer"
              title={isMuted ? 'Unmute Sounds' : 'Mute Sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 7 Cols: Google Map or Tactical Radar Visualizer */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="w-full h-[380px] sm:h-[460px] lg:h-[580px]">
              {GOOGLE_MAPS_API_KEY ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <TreasureMap
                    explorerPos={explorerPos}
                    checkpoints={currentQuest.checkpoints}
                    activeCheckpointIndex={activeCheckpointIndex}
                    solvedCheckpointIds={progress.solvedCheckpoints}
                    onSelectCheckpoint={(cp) => setActiveModalCheckpoint(cp)}
                    onMapClick={(coords) => {
                      if (isSimulatedMovement) {
                        handleUpdateCoordinates(coords);
                      }
                    }}
                    isSimulatedMovement={isSimulatedMovement}
                  />
                </APIProvider>
              ) : (
                <TacticalRadarMap
                  explorerPos={explorerPos}
                  checkpoints={currentQuest.checkpoints}
                  activeCheckpointIndex={activeCheckpointIndex}
                  solvedCheckpointIds={progress.solvedCheckpoints}
                  onSelectCheckpoint={(cp) => setActiveModalCheckpoint(cp)}
                  onMapClick={(coords) => {
                    if (isSimulatedMovement) {
                      handleUpdateCoordinates(coords);
                    }
                  }}
                  isSimulatedMovement={isSimulatedMovement}
                />
              )}
            </div>

              {/* Waypoint Sequence Cards */}
              <div className="p-4 bg-stone-900/80 border border-amber-900/30 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Checkpoint Progress
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {progress.solvedCheckpoints.length} / {currentQuest.checkpoints.length} Cleared
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentQuest.checkpoints.map((cp, idx) => {
                    const isSolved = progress.solvedCheckpoints.includes(cp.id);
                    const isActive = idx === activeCheckpointIndex;
                    return (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => {
                          sound.playParchmentRustle();
                          setActiveModalCheckpoint(cp);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSolved
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                            : isActive
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-0.5">
                          <span>Stage {idx + 1}</span>
                          {isSolved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isActive ? (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          ) : (
                            <span>🔒</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold truncate">
                          {cp.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Compass HUD & Controls */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Antique Navigational Astrolabe & Bearing HUD */}
              <CompassHUD
                explorerPos={explorerPos}
                activeCheckpoint={activeCheckpoint}
                onOpenClueModal={() => {
                  sound.playParchmentRustle();
                  if (activeCheckpoint) setActiveModalCheckpoint(activeCheckpoint);
                }}
                isInsideGeofence={isInsideGeofence}
                totalCheckpoints={currentQuest.checkpoints.length}
                currentCheckpointIndex={activeCheckpointIndex}
              />

              {/* Virtual Walker / Live GPS Controller */}
              <VirtualExplorerControls
                currentCoords={explorerPos.coords}
                activeCheckpoint={activeCheckpoint}
                onUpdateCoords={handleUpdateCoordinates}
                isSimulated={isSimulatedMovement}
                onToggleSimulated={(sim) => {
                  sound.playDialTick();
                  setIsSimulatedMovement(sim);
                }}
                onResetToQuestStart={handleResetToStart}
              />

              {/* Story & Clue Quick View Card */}
              {activeCheckpoint && (
                <div className="p-5 bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-900/40 rounded-3xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                      Active Stage Objective
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveModalCheckpoint(activeCheckpoint)}
                      className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Open Full Inscription
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-amber-200">
                    {activeCheckpoint.title}
                  </h3>

                  <p className="text-xs text-amber-100/90 italic font-serif leading-relaxed bg-black/40 p-3 rounded-xl border border-stone-800">
                    &ldquo;{activeCheckpoint.clueRiddle}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {activeCheckpoint.locationName}
                    </span>
                    <span className="font-mono text-amber-300">
                      Goal: {activeCheckpoint.rewardItem.name} {activeCheckpoint.rewardItem.icon}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>

      {/* 4. Active Clue & Puzzle Modal */}
      {activeModalCheckpoint && (
        <ClueModal
          checkpoint={activeModalCheckpoint}
          isInsideGeofence={
            calculateDistanceMeters(explorerPos.coords, activeModalCheckpoint.location) <=
            activeModalCheckpoint.unlockRadiusMeters
          }
          distanceMeters={calculateDistanceMeters(explorerPos.coords, activeModalCheckpoint.location)}
          isSolved={progress.solvedCheckpoints.includes(activeModalCheckpoint.id)}
          onSolveCheckpoint={handleSolveCheckpoint}
          onUseHint={handleUseHint}
          onClose={() => setActiveModalCheckpoint(null)}
        />
      )}

      {/* 5. Explorer's Satchel Modal */}
      {showSatchel && (
        <ExplorerSatchel
          quest={currentQuest}
          collectedItems={progress.collectedItems}
          distanceTraveledMeters={progress.distanceTraveledMeters}
          startTime={progress.startTime}
          completedTime={progress.completedTime}
          solvedCheckpointIds={progress.solvedCheckpoints}
          hintsUsed={progress.hintsUsed}
          onClose={() => setShowSatchel(false)}
        />
      )}

      {/* 6. Quest Selector Modal */}
      {showQuestSelector && (
        <QuestSelectorModal
          currentQuestId={currentQuest.id}
          customQuests={customQuests}
          userLocation={userRealLocation}
          onSelectQuest={handleSelectQuest}
          onOpenQuestBuilder={() => setShowQuestBuilder(true)}
          onClose={() => setShowQuestSelector(false)}
        />
      )}

      {/* 7. Custom Quest Builder Modal */}
      {showQuestBuilder && (
        <CustomQuestBuilder
          currentExplorerCoords={explorerPos.coords}
          onSaveQuest={handleSaveCustomQuest}
          onClose={() => setShowQuestBuilder(false)}
        />
      )}

      {/* 8. Final Treasure Celebration Modal */}
      {showFinalCelebration && (
        <FinalTreasureModal
          quest={currentQuest}
          distanceMeters={progress.distanceTraveledMeters}
          durationMs={(progress.completedTime || Date.now()) - progress.startTime}
          hintsUsed={progress.hintsUsed}
          onRestart={() => handleSelectQuest(currentQuest)}
          onSelectAnotherQuest={() => {
            setShowFinalCelebration(false);
            setShowQuestSelector(true);
          }}
        />
      )}
    </div>
  );
}
