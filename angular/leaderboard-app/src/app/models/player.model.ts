export interface PlayerWithStats {
  id: number;
  fullName?: string;
  firstName: string;
  lastName: string;
  team: string;
  gamesPlayed?: number;
  whip: number;
  ip: number;
  k: number;
  bb: number;
  h: number;
  hr: number;
  k9: number;
}

export interface PlayerProfileInfo {
  playerId: number;
  fullName: string;
  battingHand: string;
  throwingHand: string | number;
  height: string;
  weight: number | string;
  birthDate: string;
  imageUrl: string | null;
  draftPickNo: number | string;
  draftRound: number | string;
  givenNames: string;
  draftYear: number | string;
  firstYear: number | string;
}

export interface PitchingStatsByDate {
  date: string;
  whip: number;
  ip: number;
  k: number;
  bb: number;
  h: number;
  hr: number;
  k9: number;
}

export interface PitcherInfo {
  pitcherId: number;
  pitcherTeamName?: string;
  pitcherFirstName: string;
  pitcherLastName: string;
  pitcherHand?: number;
}

export interface PlayerInfo {
  playerId: number
  firstName: string;
  lastName: string;
}

export interface PitchingData {
  pitcherId: number;
  batterTeamName: string;
  isStrikeout: number;
  isWalk: number;
  isBb: number;
  isIbb: number;
  isSac: number | boolean;
  isHbp: number;
  isHomerun: number;
  isSingle: number;
  isDouble: number;
  isTriple: number;
  isBip: number;
  isSf: number | boolean;
  pitcherTeamName: string;
  date: string;
}

export interface PlayerBioData {
  playerId: number;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  battingHand?: string;
  throwingHand: string;
  height?: number;
  weight?: number;
  birthDate?: string;
  draftPickNo?: number;
  draftRound?: number;
  givenNames?: string;
  draftYear?: number;
  firstYear?: number;
}

