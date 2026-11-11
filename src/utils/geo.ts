import { GeoPoint, Quest, ClueCheckpoint } from '../types/hunt';

/**
 * Calculates distance between two points on Earth in meters using the Haversine formula.
 */
export function calculateDistanceMeters(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Computes forward azimuth/bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 */
export function calculateBearing(from: GeoPoint, to: GeoPoint): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;

  return (brng + 360) % 360;
}

/**
 * Formats distance cleanly (e.g., "14 m" or "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Converts degree bearing into cardinal compass directions (N, NNE, NE...)
 */
export function bearingToCardinal(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

/**
 * Offset coordinates by distance (meters) and bearing (degrees)
 */
export function offsetCoordinates(origin: GeoPoint, distanceMeters: number, bearingDegrees: number): GeoPoint {
  const R = 6371000;
  const brng = (bearingDegrees * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lon1 = (origin.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceMeters / R) +
    Math.cos(lat1) * Math.sin(distanceMeters / R) * Math.cos(brng)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(distanceMeters / R) * Math.cos(lat1),
      Math.cos(distanceMeters / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lon2 * 180) / Math.PI,
  };
}

/**
 * Generates an instant, walkable treasure hunt localized directly around the user's current GPS!
 */
export function generateLocalHunt(center: GeoPoint, addressOrAreaName = 'Your Local Territory'): Quest {
  // Spreading checkpoints around 80m to 280m from the center at various compass bearings
  const checkpoints: ClueCheckpoint[] = [
    {
      id: 'local_cp_1',
      order: 1,
      title: 'The Whispering Perimeter',
      locationName: 'North-East Waypoint',
      location: offsetCoordinates(center, 90, 45), // 90m NE
      unlockRadiusMeters: 25,
      storyLore: 'An old brass surveyor marker is rumored to hold the first fragment of the cartographer’s cipher.',
      clueRiddle: 'Walk toward where the morning sun first touches the trees. When the distance dwindles to under twenty-five paces, the ancient dial awakens.',
      hintText: 'Keep walking North-East until your proximity radar turns gold.',
      puzzle: {
        type: 'cipher_dial',
        question: 'Decipher the encoded navigator’s passkey using the rotational rune ring (Shift +3).',
        cipherKey: 3,
        cipherEncoded: 'ORFXV', // LOCUS shifted by 3 -> L->O, O->R, C->F, U->X, S->V
        answer: 'LOCUS',
        solutionExplanation: 'Shift each letter backward by 3 runes: O -> L, R -> O, F -> C, X -> U, V -> S = LOCUS (The sacred coordinate).',
      },
      rewardItem: {
        id: 'item_brass_sextant',
        name: 'Brass Sextant Dial',
        icon: '🧭',
        lore: 'A calibrated antique brass ring used by ancient mariners to measure star altitudes.',
      },
    },
    {
      id: 'local_cp_2',
      order: 2,
      title: 'The Celestial Alignment',
      locationName: 'South-East Meridian Marker',
      location: offsetCoordinates(center, 160, 135), // 160m SE
      unlockRadiusMeters: 25,
      storyLore: 'The earth lines intersect here. Only by turning your gaze toward the solstice sun will the hidden latch trigger.',
      clueRiddle: 'Travel South-East into the open clearing. Match your compass needle to the cardinal degree inscribed upon the stone.',
      hintText: 'Align the astrolabe dial until it matches the required azimuth target.',
      puzzle: {
        type: 'compass_azimuth',
        question: 'Rotate the astrolabe ring until your bearing is aligned precisely with the Solstice Azimuth (135° SE).',
        azimuthTarget: 135,
        azimuthTolerance: 15,
        answer: '135',
        solutionExplanation: 'The 135° azimuth directly channels the solstice light through the focal prism.',
      },
      rewardItem: {
        id: 'item_sun_crystal',
        name: 'Gilded Sun Crystal',
        icon: '💎',
        lore: 'A cut prism that refracts light into true solar bearings.',
      },
    },
    {
      id: 'local_cp_3',
      order: 3,
      title: 'The Guardian Sphinx Riddle',
      locationName: 'South-West Shadow Stone',
      location: offsetCoordinates(center, 220, 225), // 220m SW
      unlockRadiusMeters: 25,
      storyLore: 'A silent keystone was placed here decades ago by the secretive Society of Wayfarers.',
      clueRiddle: 'Seek the quiet corner to the South-West. Solve the riddle carved into the memory of the ground.',
      hintText: 'Think of what moves through every city, forest, and ocean without legs or wings.',
      puzzle: {
        type: 'riddle_keystone',
        question: '“I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?”',
        answer: 'ECHO',
        solutionExplanation: 'An echo responds to your voice through the terrain.',
      },
      rewardItem: {
        id: 'item_keystone_seal',
        name: 'Rune Keystone Seal',
        icon: '🪨',
        lore: 'An etched volcanic keystone bearing the emblem of the Wayfarers Guild.',
      },
    },
    {
      id: 'local_cp_4',
      order: 4,
      title: 'The Vault of Glyphs',
      locationName: 'West Sanctuary Terminal',
      location: offsetCoordinates(center, 140, 290), // 140m WNW
      unlockRadiusMeters: 25,
      storyLore: 'The final lock standing between you and the cartographer’s buried chest.',
      clueRiddle: 'Head West to the terminus marker. Align the ancient elemental glyphs in proper cosmological order.',
      hintText: 'Match the four ancient elements from oldest to newest: Earth, Water, Wind, Fire.',
      puzzle: {
        type: 'symbol_lock',
        question: 'Set the four celestial runes in the correct elemental sequence.',
        symbols: ['⛰️', '💧', '💨', '🔥'],
        answer: '⛰️-💧-💨-🔥',
        solutionExplanation: 'Earth supports the Water, Water gives breath to Wind, and Wind feeds the Fire.',
      },
      rewardItem: {
        id: 'item_master_key',
        name: 'Golden Vault Key',
        icon: '🗝️',
        lore: 'A master key forged from meteoric iron and pure electrum.',
      },
    },
  ];

  return {
    id: 'quest_local_custom',
    title: `The Mystery of ${addressOrAreaName}`,
    subtitle: 'A bespoke field expedition tailored to your immediate surroundings',
    region: 'Your Current Neighborhood',
    difficulty: 'Explorer',
    estimatedDuration: '25 - 40 mins',
    startingPoint: center,
    storyIntro: `The Society of Wayfarers left a trail of hidden artifacts within walking distance of where you stand. Grab your compass, follow the GPS beacons, and unlock the four hidden seals!`,
    storyCompletion: `You have successfully traced every waypoint across your local surroundings, solved the ancient trials, and unearthed the legendary Wayfarer’s Cache!`,
    checkpoints,
    finalTreasure: {
      name: 'The Wayfarer’s Golden Cache',
      icon: '🏆',
      description: 'A legendary chest brimming with ancient gold sovereigns, rare maps of lost continents, and the Grandmaster Wayfarer Medal.',
      valueGold: 5000,
    },
  };
}
