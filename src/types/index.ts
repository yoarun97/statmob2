// Core domain types for Terrace.
// Extend these as data sources are confirmed and API shapes are known.

export interface Club {
  id: number;
  name: string;
  shortName: string;
  crest: string;
  founded: number;
  primaryColor: string;
  secondaryColor: string;
}

export interface Player {
  id: number;
  name: string;
  nationality: string;
  dateOfBirth: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';
  shirtNumber?: number;
  clubId: number;
}

export interface Season {
  id: number;
  year: string; // e.g. "2023/24"
  startDate: string;
  endDate: string;
  currentMatchday?: number;
  winner?: Club;
}

export interface Standing {
  position: number;
  club: Club;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string; // e.g. "WWDLW"
}

export interface Match {
  id: number;
  seasonId: number;
  matchday: number;
  utcDate: string;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED';
  homeTeam: Club;
  awayTeam: Club;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

export interface PlayerStats {
  playerId: number;
  seasonId: number;
  goals: number;
  assists: number;
  appearances: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  // Advanced stats (FBref/StatsBomb — may not always be available)
  xG?: number;
  xA?: number;
  progressivePasses?: number;
  progressiveCarries?: number;
}
