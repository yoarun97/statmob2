/**
 * Parses openfootball/england txt files into per-season JSON.
 * Handles three distinct formats across the EPL era (1992-2025).
 *
 * fmt1 (1992-2000, 1990s archive): "  Team1  X-X  Team2"
 * fmt2 (2000-2024):                "  [HH:MM]  Team  X-X [(HT)]  Team"
 * fmt3 (2024-25+):                 "  HH:MM  Home  v  Away  X-X [(HT)]"
 *
 * Both fmt1 and fmt2 have score in the middle; fmt3 has score at the end after `v`.
 * Detection per-season: if the file's matchday header uses `»`, it's fmt3.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'src/data/seasons/raw');
const PARSED_DIR = path.join(ROOT, 'src/data/seasons/parsed');
const ARCHIVE_DIR = path.join(RAW_DIR, 'archive/1990s');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParsedMatch {
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  matchday: number;
  played: boolean;
}

interface StandingRow {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

interface ParsedSeasonData {
  season: string;
  matches: ParsedMatch[];
  standings: StandingRow[];
  totalMatchdays: number;
  totalGoals: number;
  topScorer: { team: string; goals: number } | null;
}

// ---------------------------------------------------------------------------
// Normalise team names (strip " FC", " AFC" etc. for consistent keying)
// ---------------------------------------------------------------------------

function normalise(name: string): string {
  return name
    .replace(/\s+FC$/, '')
    .replace(/\s+AFC$/, '')
    .replace(/\s+United$/, ' Utd')
    .trim();
}

// ---------------------------------------------------------------------------
// Score regex patterns
// ---------------------------------------------------------------------------

// Middle-score: "2-1" or "2-1 (1-0)" anywhere in the line (fmt1 / fmt2)
const SCORE_MID_RE = /(\d+)-(\d+)(?:\s+\(\d+-\d+\))?/;

// End-score: at end of line after team names, "2-1 (1-0)" or just "2-1"
const SCORE_END_RE = /(\d+)-(\d+)(?:\s+\(\d+-\d+\))?\s*$/;

// fmt3 match line: contains " v " as separator (with score OR without for unplayed)
const FMT3_LINE_RE = /^\s+(?:\d{1,2}\.\d{2}\s+)?(.+?)\s+v\s+(.+?)(?:\s+(\d+)-(\d+)(?:\s+\(\d+-\d+\))?)?\s*$/;

// ---------------------------------------------------------------------------
// Parse a single txt file
// ---------------------------------------------------------------------------

function parseTxtFile(filePath: string, season: string): ParsedMatch[] {
  const text = fs.readFileSync(filePath, 'utf-8');
  const lines = text.split('\n');

  // Detect fmt3 by presence of `»` in file
  const isFmt3 = lines.some(l => l.startsWith('»'));

  const matches: ParsedMatch[] = [];
  let currentMatchday = 0;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Matchday header
    if (isFmt3) {
      const mdMatch = line.match(/^»\s+Matchday\s+(\d+)/);
      if (mdMatch) {
        currentMatchday = parseInt(mdMatch[1], 10);
        continue;
      }
    } else {
      const mdMatch = line.match(/^Matchday\s+(\d+)/);
      if (mdMatch) {
        currentMatchday = parseInt(mdMatch[1], 10);
        continue;
      }
    }

    // Skip headers, date lines, comments, empty lines
    if (!line || line.startsWith('=') || line.startsWith('#') || line.match(/^\[/) || line.match(/^\s+[A-Z][a-z]{2}\s+[A-Z][a-z]{2}\/\d+/)) {
      continue;
    }

    if (isFmt3) {
      // fmt3: "  [HH:MM]  HomeTeam  v  AwayTeam  X-X [(HT)]"
      // skip lines that are just date lines (no `v`)
      if (!line.includes(' v ')) continue;

      const m = line.match(/^\s+(?:\d{1,2}\.\d{2}\s+)?(.+?)\s+v\s+(.+?)(?:\s+(\d+)-(\d+)(?:\s+\(\d+-\d+\))?)?\s*$/);
      if (!m) continue;

      const home = normalise(m[1].trim());
      const away = normalise(m[2].trim());
      const played = m[3] !== undefined;

      if (played) {
        matches.push({
          home,
          away,
          homeGoals: parseInt(m[3], 10),
          awayGoals: parseInt(m[4], 10),
          matchday: currentMatchday,
          played: true,
        });
      }
      // Skip unplayed matches
    } else {
      // fmt1 / fmt2: score is in the middle
      // Lines that are just a time "  15.00" with no team info: skip
      if (line.match(/^\s+\d{1,2}:\d{2}\s*$/) || line.match(/^\s+\d{1,2}\.\d{2}\s*$/)) continue;

      // Strip leading time if present (fmt2: "  15.00  " or "  20.00  ")
      const stripped = line.replace(/^\s+\d{1,2}[:.]\d{2}\s+/, '  ');

      // Check for score-in-middle pattern
      const scoreIdx = stripped.search(/\s+\d+-\d+/);
      if (scoreIdx === -1) continue;

      // Text before score = home, text after score = away
      const beforeScore = stripped.slice(0, scoreIdx).trim();
      const afterScoreRaw = stripped.slice(scoreIdx).trim();

      // Extract score
      const scoreMatch = afterScoreRaw.match(/^(\d+)-(\d+)/);
      if (!scoreMatch) continue;

      const homeGoals = parseInt(scoreMatch[1], 10);
      const awayGoals = parseInt(scoreMatch[2], 10);

      // After score: strip optional "(HT)" then get team name
      const awayPart = afterScoreRaw
        .replace(/^\d+-\d+/, '')
        .replace(/^\s*\(\d+-\d+\)\s*/, '')
        .trim();

      if (!beforeScore || !awayPart) continue;

      matches.push({
        home: normalise(beforeScore),
        away: normalise(awayPart),
        homeGoals,
        awayGoals,
        matchday: currentMatchday,
        played: true,
      });
    }
  }

  return matches;
}

// ---------------------------------------------------------------------------
// Compute standings from matches
// ---------------------------------------------------------------------------

function computeStandings(matches: ParsedMatch[]): StandingRow[] {
  const table = new Map<string, StandingRow>();

  function ensure(team: string) {
    if (!table.has(team)) {
      table.set(team, { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    }
    return table.get(team)!;
  }

  for (const m of matches) {
    if (!m.played) continue;
    const home = ensure(m.home);
    const away = ensure(m.away);

    home.played++;
    away.played++;
    home.gf += m.homeGoals;
    home.ga += m.awayGoals;
    away.gf += m.awayGoals;
    away.ga += m.homeGoals;

    if (m.homeGoals > m.awayGoals) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (m.homeGoals < m.awayGoals) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      home.points++;
      away.drawn++;
      away.points++;
    }
  }

  const rows = Array.from(table.values());
  for (const r of rows) r.gd = r.gf - r.ga;

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  return rows;
}

// ---------------------------------------------------------------------------
// Get all season paths
// ---------------------------------------------------------------------------

interface SeasonPath {
  season: string;
  file: string;
}

function getAllSeasonPaths(): SeasonPath[] {
  const seasons: SeasonPath[] = [];

  // 1990s archive
  const archiveDirs = fs.readdirSync(ARCHIVE_DIR).filter(d => /^\d{4}-\d{2}$/.test(d));
  for (const dir of archiveDirs) {
    const f = path.join(ARCHIVE_DIR, dir, '1-premierleague.txt');
    if (fs.existsSync(f)) seasons.push({ season: dir, file: f });
  }

  // 2000s+
  const modernDirs = fs.readdirSync(RAW_DIR).filter(d => /^\d{4}-\d{2}$/.test(d));
  for (const dir of modernDirs) {
    const f = path.join(RAW_DIR, dir, '1-premierleague.txt');
    if (fs.existsSync(f)) seasons.push({ season: dir, file: f });
  }

  // Sort chronologically
  seasons.sort((a, b) => a.season.localeCompare(b.season));
  return seasons;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface SeasonIndexEntry {
  season: string;
  champion: string;
  matches: number;
  goals: number;
}

function main() {
  if (!fs.existsSync(PARSED_DIR)) fs.mkdirSync(PARSED_DIR, { recursive: true });

  const paths = getAllSeasonPaths();
  // Only EPL seasons (1992-93 through 2024-25, skip 2025-26 if present)
  const eplSeasons = paths.filter(p => {
    const year = parseInt(p.season.slice(0, 4), 10);
    return year >= 1992 && year <= 2024;
  });

  const index: SeasonIndexEntry[] = [];
  let parsed = 0;
  let failed = 0;

  for (const { season, file } of eplSeasons) {
    try {
      const matches = parseTxtFile(file, season);
      const played = matches.filter(m => m.played);
      const standings = computeStandings(played);

      const totalGoals = played.reduce((sum, m) => sum + m.homeGoals + m.awayGoals, 0);
      const matchdays = new Set(matches.map(m => m.matchday));

      // Top scoring club by goals scored
      const topScorer = standings.length > 0
        ? { team: standings.reduce((a, b) => a.gf > b.gf ? a : b).team, goals: Math.max(...standings.map(s => s.gf)) }
        : null;

      const data: ParsedSeasonData = {
        season,
        matches: played,
        standings,
        totalMatchdays: matchdays.size,
        totalGoals,
        topScorer,
      };

      fs.writeFileSync(
        path.join(PARSED_DIR, `${season}.json`),
        JSON.stringify(data, null, 2)
      );

      const champion = standings[0]?.team ?? 'Unknown';
      index.push({ season, champion, matches: played.length, goals: totalGoals });

      console.log(`[OK] ${season} — ${played.length} matches, ${standings.length} teams, champion: ${champion}`);
      parsed++;
    } catch (err) {
      console.error(`[FAIL] ${season}: ${(err as Error).message}`);
      failed++;
    }
  }

  fs.writeFileSync(
    path.join(PARSED_DIR, 'index.json'),
    JSON.stringify(index, null, 2)
  );

  console.log(`\nDone: ${parsed} seasons parsed, ${failed} failed.`);
  console.log(`Output: ${PARSED_DIR}`);
}

main();
