import { Quest, GeoPoint } from '../types/hunt';
import { DEFAULT_QUESTS } from '../data/defaultQuests';
import { generateLocalHunt } from '../utils/geo';
import { sound } from '../utils/audio';
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  PlusCircle,
  Locate,
  Trophy,
  X,
  ChevronRight,
} from 'lucide-react';

interface QuestSelectorModalProps {
  currentQuestId: string;
  customQuests: Quest[];
  userLocation: GeoPoint | null;
  onSelectQuest: (quest: Quest) => void;
  onOpenQuestBuilder: () => void;
  onClose: () => void;
}

export function QuestSelectorModal({
  currentQuestId,
  customQuests,
  userLocation,
  onSelectQuest,
  onOpenQuestBuilder,
  onClose,
}: QuestSelectorModalProps) {
  const allQuests = [...DEFAULT_QUESTS, ...customQuests];

  const handleCreateLocalQuest = () => {
    sound.playUnlockedChime();
    // Use userLocation if available, otherwise default to Greenwich
    const center = userLocation || { lat: 51.4769, lng: -0.0005 };
    const localQuest = generateLocalHunt(center, userLocation ? 'Your Current Location' : 'Greenwich Park');
    onSelectQuest(localQuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-stone-900 border-2 border-amber-800/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-200">
                Cartographer’s Expedition Archives
              </h3>
              <p className="text-xs text-stone-400">
                Choose an expedition or deploy a local trail
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Actions: Spawn at my GPS & Custom Builder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCreateLocalQuest}
              className="p-4 bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl text-left transition-all group cursor-pointer shadow-lg hover:shadow-amber-500/10 active:scale-95"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Locate className="w-4 h-4 text-emerald-400 animate-pulse" />
                Auto-Generate at Your GPS
              </div>
              <h4 className="text-sm font-bold text-amber-100 group-hover:text-amber-200">
                Instant Neighborhood Hunt
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                Generates a 4-stage treasure trail (80m–250m) directly around where you stand right now.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQuestBuilder();
              }}
              className="p-4 bg-stone-950/60 border-2 border-stone-800 hover:border-amber-600/50 rounded-2xl text-left transition-all group cursor-pointer shadow-lg active:scale-95"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                <PlusCircle className="w-4 h-4 text-amber-500" />
                Custom Quest Architect
              </div>
              <h4 className="text-sm font-bold text-stone-200 group-hover:text-amber-200">
                Design Your Own Hunt
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                Pick coordinates anywhere on Earth, write your own riddles, and configure custom locks!
              </p>
            </button>
          </div>

          {/* Curated Historical Expeditions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Curated World-Class Expeditions
            </h4>

            <div className="space-y-3">
              {allQuests.map((quest) => {
                const isCurrent = quest.id === currentQuestId;
                return (
                  <div
                    key={quest.id}
                    onClick={() => {
                      sound.playParchmentRustle();
                      onSelectQuest(quest);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                      isCurrent
                        ? 'bg-amber-950/30 border-amber-500/80 shadow-md'
                        : 'bg-stone-950/60 border-stone-800/80 hover:border-amber-700/50 hover:bg-stone-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="text-3xl p-2 bg-stone-900 rounded-xl border border-stone-800 shrink-0">
                        {quest.finalTreasure.icon}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-sm font-bold text-amber-200 group-hover:text-amber-300">
                            {quest.title}
                          </h5>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] uppercase">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-400 mt-0.5">
                          {quest.subtitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-stone-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            {quest.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {quest.estimatedDuration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            {quest.checkpoints.length} Checkpoints
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-center shrink-0">
                      <div className="p-2 rounded-xl bg-stone-800/80 group-hover:bg-amber-500 group-hover:text-stone-950 text-amber-400 transition-all flex items-center gap-1 text-xs font-semibold">
                        <span>Embark</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
