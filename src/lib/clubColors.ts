import type { PlayerSeasonStat } from '@/types';

export interface ClubColors {
  primary: string;
  secondary: string;
}

const CLUB_COLORS: Record<string, ClubColors> = {
  'Arsenal':              { primary: '#EF0107', secondary: '#FFFFFF' },
  'Aston Villa':          { primary: '#670E36', secondary: '#95BFE5' },
  'Birmingham':           { primary: '#0000FF', secondary: '#FFFFFF' },
  'Blackburn':            { primary: '#009EE0', secondary: '#FFFFFF' },
  'Blackpool':            { primary: '#FF6600', secondary: '#FFFFFF' },
  'Bolton':               { primary: '#263B6D', secondary: '#FFFFFF' },
  'Bournemouth':          { primary: '#DA291C', secondary: '#000000' },
  'Bradford':             { primary: '#7B2D26', secondary: '#FFD700' },
  'Brentford':            { primary: '#E30613', secondary: '#FFB81C' },
  'Brighton':             { primary: '#0057B8', secondary: '#FFFFFF' },
  'Burnley':              { primary: '#6C1D45', secondary: '#99D6EA' },
  'Cardiff':              { primary: '#0070B5', secondary: '#CE1126' },
  'Charlton':             { primary: '#D4021D', secondary: '#FFFFFF' },
  'Chelsea':              { primary: '#034694', secondary: '#FFFFFF' },
  'Coventry':             { primary: '#87CEEB', secondary: '#FFFFFF' },
  'Crystal Palace':       { primary: '#1B458F', secondary: '#C4122E' },
  'Derby':                { primary: '#FFFFFF', secondary: '#000000' },
  'Everton':              { primary: '#003399', secondary: '#FFFFFF' },
  'Fulham':               { primary: '#FFFFFF', secondary: '#CC0000' },
  'Huddersfield':         { primary: '#0E63AD', secondary: '#FFFFFF' },
  'Hull':                 { primary: '#F5A623', secondary: '#000000' },
  'Ipswich':              { primary: '#0044AA', secondary: '#FFFFFF' },
  'Leeds':                { primary: '#FFFFFF', secondary: '#1D428A' },
  'Leicester':            { primary: '#003090', secondary: '#FDBE11' },
  'Liverpool':            { primary: '#C8102E', secondary: '#FFFFFF' },
  'Luton':                { primary: '#F78F1E', secondary: '#002D62' },
  'Manchester City':      { primary: '#6CABDD', secondary: '#FFFFFF' },
  'Manchester United':    { primary: '#DA291C', secondary: '#FFFFFF' },
  'Middlesbrough':        { primary: '#E11B22', secondary: '#FFFFFF' },
  'Newcastle':            { primary: '#241F20', secondary: '#FFFFFF' },
  'Norwich':              { primary: '#FFF200', secondary: '#00A650' },
  'Nottingham Forest':    { primary: '#DD0000', secondary: '#FFFFFF' },
  'Oldham':               { primary: '#0044AA', secondary: '#FFFFFF' },
  'Portsmouth':           { primary: '#001489', secondary: '#C8102E' },
  'QPR':                  { primary: '#1D5BA4', secondary: '#FFFFFF' },
  'Reading':              { primary: '#004494', secondary: '#FFFFFF' },
  'Sheffield United':     { primary: '#EE2737', secondary: '#FFFFFF' },
  'Sheffield Wednesday':  { primary: '#0066B2', secondary: '#FFFFFF' },
  'Southampton':          { primary: '#D71920', secondary: '#FFFFFF' },
  'Stoke':                { primary: '#E03A3E', secondary: '#1B449C' },
  'Sunderland':           { primary: '#EB172B', secondary: '#000000' },
  'Swansea':              { primary: '#FFFFFF', secondary: '#000000' },
  'Swindon':              { primary: '#E03A3E', secondary: '#FFFFFF' },
  'Tottenham':            { primary: '#132257', secondary: '#FFFFFF' },
  'Watford':              { primary: '#FBEE23', secondary: '#ED2127' },
  'West Brom':            { primary: '#122F67', secondary: '#FFFFFF' },
  'West Ham':             { primary: '#7A263A', secondary: '#1BB1E7' },
  'Wigan':                { primary: '#1D428A', secondary: '#FFFFFF' },
  'Wimbledon':            { primary: '#00008B', secondary: '#FFD700' },
  'Wolverhampton':        { primary: '#FDB913', secondary: '#231F20' },
  // Short-form aliases used in player data files
  'Man City':             { primary: '#6CABDD', secondary: '#FFFFFF' },
  'Man Utd':              { primary: '#DA291C', secondary: '#FFFFFF' },
  'Man United':           { primary: '#DA291C', secondary: '#FFFFFF' },
  'Nottm Forest':         { primary: '#DD0000', secondary: '#FFFFFF' },
  'Spurs':                { primary: '#132257', secondary: '#FFFFFF' },
  'Sheffield Utd':        { primary: '#EE2737', secondary: '#FFFFFF' },
  'West Bromwich Albion': { primary: '#122F67', secondary: '#FFFFFF' },
  'Ipswich Town':         { primary: '#0044AA', secondary: '#FFFFFF' },
  'Leicester City':       { primary: '#003090', secondary: '#FDBE11' },
  'Blackburn Rovers':     { primary: '#009EE0', secondary: '#FFFFFF' },
  'Bolton Wanderers':     { primary: '#263B6D', secondary: '#FFFFFF' },
  'Hull City':            { primary: '#F5A623', secondary: '#000000' },
  'Norwich City':         { primary: '#FFF200', secondary: '#00A650' },
  'Newcastle United':     { primary: '#241F20', secondary: '#FFFFFF' },
  'Luton Town':           { primary: '#F78F1E', secondary: '#002D62' },
  'Wolverhampton Wanderers': { primary: '#FDB913', secondary: '#231F20' },
  'Wolves':               { primary: '#FDB913', secondary: '#231F20' },
  'West Ham United':      { primary: '#7A263A', secondary: '#1BB1E7' },
  'Tottenham Hotspur':    { primary: '#132257', secondary: '#FFFFFF' },
  'Leeds United':         { primary: '#FFFFFF', secondary: '#1D428A' },
  'Stoke City':           { primary: '#E03A3E', secondary: '#1B449C' },
  'Derby County':         { primary: '#FFFFFF', secondary: '#000000' },
  'Swansea City':         { primary: '#FFFFFF', secondary: '#000000' },
};

const FALLBACK: ClubColors = { primary: '#3a3a6a', secondary: '#FFFFFF' };

export function getClubColors(name: string): ClubColors {
  if (!name) return FALLBACK;
  if (CLUB_COLORS[name]) return CLUB_COLORS[name];
  const lower = name.toLowerCase();
  const key = Object.keys(CLUB_COLORS).find((k) => k.toLowerCase() === lower);
  if (key) return CLUB_COLORS[key];
  return FALLBACK;
}

// Returns the club where the player scored the most career goals
export function getPrimaryClub(seasonStats: PlayerSeasonStat[]): string {
  if (!seasonStats.length) return '';
  const tally: Record<string, number> = {};
  for (const s of seasonStats) {
    tally[s.club] = (tally[s.club] ?? 0) + s.goals;
  }
  return Object.entries(tally).sort(([, a], [, b]) => b - a)[0][0];
}

// Darken a hex color by multiplying each channel by factor (0–1)
export function darken(hex: string, factor: number): string {
  const c = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(c.slice(0, 2), 16) * factor));
  const g = Math.max(0, Math.round(parseInt(c.slice(2, 4), 16) * factor));
  const b = Math.max(0, Math.round(parseInt(c.slice(4, 6), 16) * factor));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
