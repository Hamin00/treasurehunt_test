import { useState } from 'react';
import { Quest, ClueCheckpoint, PuzzleType, GeoPoint } from '../types/hunt';
import { sound } from '../utils/audio';
import {
  Plus,
  Trash2,
  Save,
  X,
  MapPin,
  Sparkles,
  HelpCircle,
  FileCode,
  Download,
  AlertCircle,
} from 'lucide-react';

interface CustomQuestBuilderProps {
  currentExplorerCoords: GeoPoint;
  onSaveQuest: (quest: Quest) => void;
  onClose: () => void;
}

export function CustomQuestBuilder({
  currentExplorerCoords,
  onSaveQuest,
  onClose,
}: CustomQuestBuilderProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [region, setRegion] = useState('');
  const [storyIntro, setStoryIntro] = useState('');
  const [treasureName, setTreasureName] = useState('The Cartographer’s Secret Relic');
  const [treasureIcon, setTreasureIcon] = useState('🏆');

  const [checkpoints, setCheckpoints] = useState<ClueCheckpoint[]>([
    {
      id: `custom_cp_${Date.now()}_1`,
      order: 1,
      title: 'First Landmark Checkpoint',
      locationName: 'North Gate Fountain',
      location: { ...currentExplorerCoords },
      unlockRadiusMeters: 25,
      storyLore: 'A bronze marker stands weathered by decades of storms.',
      clueRiddle: 'Stand before the ancient stones and whisper the guardian’s password.',
      hintText: 'Look for the carved initials on the foundation stone.',
      puzzle: {
        type: 'riddle_keystone',
        question: 'What is always in front of you, but can never be seen?',
        answer: 'FUTURE',
        solutionExplanation: 'The future always lies ahead of our journey.',
      },
      rewardItem: {
        id: `reward_1`,
        name: 'Brass Compass Pivot',
        icon: '🧭',
        lore: 'A finely turned pivot bearing.',
      },
    },
  ]);

  const [errorMsg, setErrorMsg] = useState('');

  const addCheckpoint = () => {
    sound.playDialTick();
    const newOrder = checkpoints.length + 1;
    // Offset slightly from previous checkpoint
    const last = checkpoints[checkpoints.length - 1];
    const newCp: ClueCheckpoint = {
      id: `custom_cp_${Date.now()}_${newOrder}`,
      order: newOrder,
      title: `Checkpoint ${newOrder}`,
      locationName: `Waypoint Location ${newOrder}`,
      location: {
        lat: Number((last.location.lat + 0.0008).toFixed(6)),
        lng: Number((last.location.lng + 0.0008).toFixed(6)),
      },
      unlockRadiusMeters: 25,
      storyLore: 'An ancient waypoint marking the traveler’s path.',
      clueRiddle: 'Travel to where the path divides into two.',
      hintText: 'Follow the cardinal compass direction on your radar.',
      puzzle: {
        type: 'cipher_dial',
        question: 'Decipher the encoded surveyor key (Shift -3).',
        cipherKey: 3,
        cipherEncoded: 'VHFUHW', // SECRET shifted +3
        answer: 'SECRET',
        solutionExplanation: 'Shift back by 3 letters to reveal SECRET.',
      },
      rewardItem: {
        id: `reward_${newOrder}`,
        name: `Rune Talisman #${newOrder}`,
        icon: '✨',
        lore: `An enchanted artifact uncovered at stage ${newOrder}.`,
      },
    };
    setCheckpoints([...checkpoints, newCp]);
  };

  const removeCheckpoint = (idx: number) => {
    if (checkpoints.length <= 1) {
      setErrorMsg('You must have at least one checkpoint in your quest!');
      return;
    }
    sound.playDialTick();
    const updated = checkpoints.filter((_, i) => i !== idx).map((cp, i) => ({
      ...cp,
      order: i + 1,
    }));
    setCheckpoints(updated);
    setErrorMsg('');
  };

  const updateCheckpointField = (idx: number, field: string, value: any) => {
    const updated = [...checkpoints];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[idx] = {
        ...updated[idx],
        [parent]: {
          ...(updated[idx] as any)[parent],
          [child]: value,
        },
      };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    setCheckpoints(updated);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a Quest Title!');
      return;
    }
    if (checkpoints.length === 0) {
      setErrorMsg('Add at least one checkpoint to your quest!');
      return;
    }

    sound.playSuccessChime();

    const newQuest: Quest = {
      id: `quest_custom_${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || 'A custom player-crafted GPS expedition',
      region: region.trim() || 'Custom Territory',
      difficulty: 'Explorer',
      estimatedDuration: '25 - 45 mins',
      startingPoint: checkpoints[0].location,
      storyIntro: storyIntro.trim() || 'Follow the trail of coordinates to unlock the hidden relics!',
      storyCompletion: 'You have conquered all custom checkpoints and claimed the final treasure!',
      checkpoints,
      finalTreasure: {
        name: treasureName.trim() || 'The Golden Crown of Discovery',
        icon: treasureIcon || '🏆',
        description: 'A custom reward chest forged by a master cartographer.',
        valueGold: 5000,
      },
    };

    onSaveQuest(newQuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-stone-900 border-2 border-amber-800/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-amber-900/40 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-amber-200">
              Quest Architect: Build Custom Treasure Trail
            </h3>
            <p className="text-xs text-stone-400">
              Configure GPS coordinates, custom clues, riddles, and rewards
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* General Quest Details */}
          <div className="space-y-4 p-4 bg-stone-950/70 border border-stone-800 rounded-2xl">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Expedition Dossier
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Quest Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Lost Relic of Hyde Park"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Region / Park Name</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Hyde Park, London"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Story Introduction</label>
              <textarea
                value={storyIntro}
                onChange={(e) => setStoryIntro(e.target.value)}
                placeholder="Narrate the backstory for the hunter embarking on this quest..."
                rows={2}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-amber-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Checkpoints Configuration List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Checkpoints & GPS Triggers ({checkpoints.length})
              </h4>

              <button
                type="button"
                onClick={addCheckpoint}
                className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Add Checkpoint
              </button>
            </div>

            {checkpoints.map((cp, idx) => (
              <div
                key={cp.id}
                className="p-4 bg-stone-950/80 border border-amber-900/30 rounded-2xl space-y-4 relative"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-amber-200">
                      Stage {idx + 1}: {cp.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCheckpoint(idx)}
                    className="p-1 text-stone-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                    title="Remove Checkpoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Stage Name</label>
                    <input
                      type="text"
                      value={cp.title}
                      onChange={(e) => updateCheckpointField(idx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">GPS Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={cp.location.lat}
                      onChange={(e) => updateCheckpointField(idx, 'location.lat', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">GPS Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={cp.location.lng}
                      onChange={(e) => updateCheckpointField(idx, 'location.lng', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-200 font-mono"
                    />
                  </div>
                </div>

                {/* Riddle & Puzzle Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Clue Riddle</label>
                    <textarea
                      value={cp.clueRiddle}
                      onChange={(e) => updateCheckpointField(idx, 'clueRiddle', e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Puzzle Type</label>
                    <select
                      value={cp.puzzle.type}
                      onChange={(e) => updateCheckpointField(idx, 'puzzle.type', e.target.value as PuzzleType)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-200"
                    >
                      <option value="riddle_keystone">Keystone Riddle Inscription</option>
                      <option value="cipher_dial">Rotational Cipher Dial</option>
                      <option value="compass_azimuth">Celestial Compass Alignment</option>
                      <option value="symbol_lock">4-Cylinder Tumbler Lock</option>
                    </select>

                    <div className="mt-2">
                      <label className="text-[10px] text-stone-400 block mb-1">Required Solution Answer</label>
                      <input
                        type="text"
                        value={cp.puzzle.answer}
                        onChange={(e) => updateCheckpointField(idx, 'puzzle.answer', e.target.value)}
                        placeholder="e.g. KEYWORD or 135"
                        className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-emerald-400 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-950 border-t border-amber-900/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-400 hover:text-stone-200 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save & Embark
          </button>
        </div>
      </div>
    </div>
  );
}
