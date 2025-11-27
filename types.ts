export interface Player {
  id: string;
  name: string;
  rating: number; // DUPR-style rating (2.000 - 8.000)
  wins: number;
  losses: number;
  matchesPlayed: number;
  avatarUrl?: string;
}

export interface Match {
  id: string;
  tournamentId?: string;
  player1Id: string;
  player2Id: string; // Or team IDs for doubles
  partner1Id?: string; // NEW: For doubles
  partner2Id?: string; // NEW: For doubles
  score1: number;
  score2: number;
  date: string;
  winnerId: string; // Primary player ID of winning team
  summary?: string; // AI generated summary
  
  // Tournament specific fields
  round?: number; // 1-based round number
  matchIndex?: number; // Index within the round
  nextMatchId?: string; // ID of the match the winner advances to
}

export interface TournamentTeam {
  id: string;
  name: string; // "John & Jane"
  player1Id: string;
  player2Id: string;
  combinedRating: number;
}

export interface TournamentSettings {
  matchFormat: 'game_11' | 'game_15' | 'best_of_3';
  winByTwo: boolean;
  timeLimitMinutes?: number; // 0 or undefined means no limit
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  status: 'setup' | 'active' | 'completed';
  format: 'singles' | 'doubles';
  settings?: TournamentSettings; // NEW: Configuration options
  participants: string[]; // Player IDs (all individuals)
  teams?: TournamentTeam[]; // Defined teams for doubles
  matches: Match[]; // Flat list of tournament matches
  totalRounds: number;
  championId?: string; // In doubles, this is the ID of the 'captain' (player1 of winning team)
}

export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  TOURNAMENTS = 'TOURNAMENTS',
  PLAYERS = 'PLAYERS',
  PLAYER_PROFILE = 'PLAYER_PROFILE',
  MATCH_ENTRY = 'MATCH_ENTRY',
  AI_REF = 'AI_REF',
  PLAYER_REGISTRATION = 'PLAYER_REGISTRATION'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}

export type AvatarTheme = 'pickle' | 'ocean' | 'sunset' | 'berry';
export type AvatarPattern = 'dots' | 'lines' | 'checkers';

export type UserRole = 'ADMIN' | 'PLAYER';

export interface UserSession {
  role: UserRole;
  playerId?: string; // If role is PLAYER
  name: string;
}