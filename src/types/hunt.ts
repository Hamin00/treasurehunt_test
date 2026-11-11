export interface GeoPoint {
  lat: number;
  lng: number;
}

export type PuzzleType = 
  | 'cipher_dial' 
  | 'compass_azimuth' 
  | 'riddle_keystone' 
  | 'symbol_lock';

export interface CheckpointReward {
  id: string;
  name: string;
  icon: string;
  lore: string;
}

export interface ClueCheckpoint {
  id: string;
  order: number;
  title: string;
  locationName: string;
  location: GeoPoint;
  unlockRadiusMeters: number;
  storyLore: string;
  clueRiddle: string;
  hintText: string;
  puzzle: {
    type: PuzzleType;
    question: string;
    answer: string;
    // For cipher dial
    cipherKey?: number;
    cipherEncoded?: string;
    // For compass alignment
    azimuthTarget?: number;
    azimuthTolerance?: number;
    // For symbol / combo lock
    symbols?: string[];
    // Explanation on victory
    solutionExplanation: string;
  };
  rewardItem: CheckpointReward;
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  difficulty: 'Apprentice' | 'Explorer' | 'Master Cartographer';
  estimatedDuration: string;
  startingPoint: GeoPoint;
  storyIntro: string;
  storyCompletion: string;
  checkpoints: ClueCheckpoint[];
  finalTreasure: {
    name: string;
    icon: string;
    description: string;
    valueGold: number;
  };
}

export interface UserProgress {
  questId: string;
  currentCheckpointIndex: number;
  solvedCheckpoints: string[];
  collectedItems: CheckpointReward[];
  distanceTraveledMeters: number;
  startTime: number;
  completedTime?: number;
  hintsUsed: number;
}

export interface ExplorerPosition {
  coords: GeoPoint;
  heading: number | null;
  accuracy: number;
  speed: number | null;
  isSimulated: boolean;
}
