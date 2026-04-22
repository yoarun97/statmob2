export interface ClubColors {
  primary: string;   // jersey
  secondary: string; // shorts / socks
}

// EPL clubs, current and historical. primary = dominant kit color, secondary = shorts/socks.
const COLORS: Record<string, ClubColors> = {
  'Arsenal':               { primary: '#EF0107', secondary: '#063672' },
  'Aston Villa':           { primary: '#7B003A', secondary: '#95BFE5' },
  'Bournemouth':           { primary: '#DA291C', secondary: '#000000' },
  'Brentford':             { primary: '#D30033', secondary: '#FBB726' },
  'Brighton':              { primary: '#0057B8', secondary: '#FFCD00' },
  'Burnley':               { primary: '#6C1D45', secondary: '#99D6EA' },
  'Chelsea':               { primary: '#034694', secondary: '#034694' },
  'Crystal Palace':        { primary: '#1B458F', secondary: '#C4122E' },
  'Everton':               { primary: '#003399', secondary: '#003399' },
  'Fulham':                { primary: '#CC0000', secondary: '#000000' },
  'Ipswich':               { primary: '#3A64A3', secondary: '#3A64A3' },
  'Ipswich Town':          { primary: '#3A64A3', secondary: '#3A64A3' },
  'Leeds':                 { primary: '#FFCD00', secondary: '#1D428A' },
  'Leeds United':          { primary: '#FFCD00', secondary: '#1D428A' },
  'Leicester':             { primary: '#003090', secondary: '#FDBE11' },
  'Leicester City':        { primary: '#003090', secondary: '#FDBE11' },
  'Liverpool':             { primary: '#C8102E', secondary: '#C8102E' },
  'Luton':                 { primary: '#F78F1E', secondary: '#002868' },
  'Luton Town':            { primary: '#F78F1E', secondary: '#002868' },
  'Man City':              { primary: '#6CABDD', secondary: '#1C2C5B' },
  'Manchester City':       { primary: '#6CABDD', secondary: '#1C2C5B' },
  'Man Utd':               { primary: '#DA291C', secondary: '#1E1E1E' },
  'Manchester United':     { primary: '#DA291C', secondary: '#1E1E1E' },
  'Man United':            { primary: '#DA291C', secondary: '#1E1E1E' },
  'Middlesbrough':         { primary: '#E41B17', secondary: '#E41B17' },
  'Newcastle':             { primary: '#241F20', secondary: '#241F20' },
  'Newcastle United':      { primary: '#241F20', secondary: '#241F20' },
  'Nottm Forest':          { primary: '#DD0000', secondary: '#DD0000' },
  'Nottingham Forest':     { primary: '#DD0000', secondary: '#DD0000' },
  'QPR':                   { primary: '#005CAB', secondary: '#005CAB' },
  'Sheffield United':      { primary: '#EE2737', secondary: '#EE2737' },
  'Sheffield Utd':         { primary: '#EE2737', secondary: '#EE2737' },
  'Southampton':           { primary: '#D71920', secondary: '#D71920' },
  'Sunderland':            { primary: '#EB172B', secondary: '#1A1A1A' },
  'Swansea':               { primary: '#121212', secondary: '#121212' },
  'Swansea City':          { primary: '#121212', secondary: '#121212' },
  'Tottenham':             { primary: '#132257', secondary: '#132257' },
  'Tottenham Hotspur':     { primary: '#132257', secondary: '#132257' },
  'Spurs':                 { primary: '#132257', secondary: '#132257' },
  'Watford':               { primary: '#FBEE23', secondary: '#ED2127' },
  'West Brom':             { primary: '#122F67', secondary: '#122F67' },
  'West Bromwich Albion':  { primary: '#122F67', secondary: '#122F67' },
  'West Ham':              { primary: '#7A263A', secondary: '#1BB1E7' },
  'West Ham United':       { primary: '#7A263A', secondary: '#1BB1E7' },
  'Wigan':                 { primary: '#1F5BA8', secondary: '#1F5BA8' },
  'Wigan Athletic':        { primary: '#1F5BA8', secondary: '#1F5BA8' },
  'Wolves':                { primary: '#FDB913', secondary: '#231F20' },
  'Wolverhampton':         { primary: '#FDB913', secondary: '#231F20' },
  'Wolverhampton Wanderers': { primary: '#FDB913', secondary: '#231F20' },
  'Blackburn':             { primary: '#009EE0', secondary: '#ED1C24' },
  'Blackburn Rovers':      { primary: '#009EE0', secondary: '#ED1C24' },
  'Bolton':                { primary: '#263B7E', secondary: '#263B7E' },
  'Bolton Wanderers':      { primary: '#263B7E', secondary: '#263B7E' },
  'Derby':                 { primary: '#1A1A1A', secondary: '#1A1A1A' },
  'Derby County':          { primary: '#1A1A1A', secondary: '#1A1A1A' },
  'Hull':                  { primary: '#F5A12D', secondary: '#1A1A1A' },
  'Hull City':             { primary: '#F5A12D', secondary: '#1A1A1A' },
  'Norwich':               { primary: '#FFF200', secondary: '#00A651' },
  'Norwich City':          { primary: '#FFF200', secondary: '#00A651' },
  'Oldham':                { primary: '#003DA5', secondary: '#003DA5' },
  'Oldham Athletic':       { primary: '#003DA5', secondary: '#003DA5' },
  'Portsmouth':            { primary: '#0D3B6E', secondary: '#0D3B6E' },
  'Reading':               { primary: '#004494', secondary: '#004494' },
  'Stoke':                 { primary: '#E03A3E', secondary: '#E03A3E' },
  'Stoke City':            { primary: '#E03A3E', secondary: '#E03A3E' },
};

const FALLBACK: ClubColors = { primary: '#2a2a5a', secondary: '#1a1a3a' };

export function getClubColors(clubName: string): ClubColors {
  if (!clubName) return FALLBACK;

  // Exact match first
  if (COLORS[clubName]) return COLORS[clubName];

  // Case-insensitive partial match
  const lower = clubName.toLowerCase();
  const key = Object.keys(COLORS).find((k) => k.toLowerCase() === lower);
  if (key) return COLORS[key];

  // Fuzzy: does any key contain the club name or vice versa?
  const fuzzy = Object.keys(COLORS).find(
    (k) => k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())
  );
  return fuzzy ? COLORS[fuzzy] : FALLBACK;
}
