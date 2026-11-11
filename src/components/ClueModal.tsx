import { ClueCheckpoint } from '../types/hunt';
import { CipherDialPuzzle } from './puzzles/CipherDialPuzzle';
import { CompassAzimuthPuzzle } from './puzzles/CompassAzimuthPuzzle';
import { KeystoneRiddlePuzzle } from './puzzles/KeystoneRiddlePuzzle';
import { SymbolLockPuzzle } from './puzzles/SymbolLockPuzzle';
import { X, Lock, CheckCircle2, Sparkles, MapPin, Footprints } from 'lucide-react';

interface ClueModalProps {
  checkpoint: ClueCheckpoint;
  isInsideGeofence: boolean;
  distanceMeters: number;
  isSolved: boolean;
  onSolveCheckpoint: () => void;
  onUseHint: () => void;
  onClose: () => void;
}

export function ClueModal({
  checkpoint,
  isInsideGeofence,
  distanceMeters,
  isSolved,
  onSolveCheckpoint,
  onUseHint,
  onClose,
}: ClueModalProps) {
  const { puzzle, rewardItem } = checkpoint;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col bg-stone-900 border-2 border-amber-800/80 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 font-bold text-xs flex items-center justify-center font-mono">
              #{checkpoint.order}
            </span>
            <div>
              <h3 className="text-base font-bold text-amber-200">
                {checkpoint.title}
              </h3>
              <p className="text-[11px] text-stone-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" />
                {checkpoint.locationName}
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

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Historical Story Lore */}
          <div className="p-4 bg-stone-950/70 border border-amber-900/30 rounded-2xl">
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">
              Field Journal Lore
            </div>
            <p className="text-sm text-stone-300 italic leading-relaxed font-serif">
              &ldquo;{checkpoint.storyLore}&rdquo;
            </p>
          </div>

          {/* Clue Riddle */}
          <div className="p-4 bg-gradient-to-br from-amber-950/20 to-stone-900 border border-amber-700/40 rounded-2xl">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Cartographer’s Riddle
            </div>
            <p className="text-sm text-amber-100 font-medium leading-relaxed">
              {checkpoint.clueRiddle}
            </p>
          </div>

          {/* Status Alert: Solved vs Inside vs Locked */}
          {isSolved ? (
            <div className="p-6 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-300">
                  Checkpoint Cleared & Inscription Solved!
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                  {puzzle.solutionExplanation}
                </p>
              </div>

              {/* Reward Item Unlocked Card */}
              <div className="mt-4 p-3 bg-stone-900/90 border border-amber-500/40 rounded-xl flex items-center gap-3 text-left">
                <span className="text-3xl">{rewardItem.icon}</span>
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    Acquired Artifact: {rewardItem.name}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {rewardItem.lore}
                  </div>
                </div>
              </div>
            </div>
          ) : isInsideGeofence ? (
            <div className="space-y-4">
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  GPS Signal Verified: Inside {checkpoint.unlockRadiusMeters}m Geofence!
                </span>
                <span className="font-mono text-[11px]">±{Math.round(distanceMeters)}m from center</span>
              </div>

              {/* Dynamic Puzzle Dispatcher */}
              <div className="pt-2">
                {puzzle.type === 'cipher_dial' && (
                  <CipherDialPuzzle
                    encodedText={puzzle.cipherEncoded || 'CIPHER'}
                    cipherKey={puzzle.cipherKey || 3}
                    expectedAnswer={puzzle.answer}
                    onSolve={onSolveCheckpoint}
                  />
                )}

                {puzzle.type === 'compass_azimuth' && (
                  <CompassAzimuthPuzzle
                    targetBearing={puzzle.azimuthTarget || 135}
                    tolerance={puzzle.azimuthTolerance || 15}
                    onSolve={onSolveCheckpoint}
                  />
                )}

                {puzzle.type === 'riddle_keystone' && (
                  <KeystoneRiddlePuzzle
                    question={puzzle.question}
                    expectedAnswer={puzzle.answer}
                    hintText={checkpoint.hintText}
                    onSolve={onSolveCheckpoint}
                    onUseHint={onUseHint}
                  />
                )}

                {puzzle.type === 'symbol_lock' && (
                  <SymbolLockPuzzle
                    symbols={puzzle.symbols || ['⛰️', '💧', '💨', '🔥']}
                    expectedSequence={puzzle.answer}
                    onSolve={onSolveCheckpoint}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Outside Geofence Lock */
            <div className="p-6 bg-stone-950/90 border-2 border-dashed border-amber-900/60 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-800 border border-amber-700/40 text-amber-500 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-amber-300">
                  Mechanical Puzzle Latch is Locked
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  You are currently <strong className="text-amber-300 font-mono">{Math.round(distanceMeters)} meters</strong> away.
                  The ancient mechanism triggers automatically when you step within{' '}
                  <strong className="text-amber-300 font-mono">{checkpoint.unlockRadiusMeters} meters</strong> of the coordinates!
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-amber-400/80">
                <Footprints className="w-4 h-4" />
                <span>Follow the compass needle on your map to reach the site.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
