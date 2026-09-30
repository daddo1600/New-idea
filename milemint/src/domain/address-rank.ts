/** Words too common in addresses to tell results apart. */
const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'and', 'at', 'on', 'in']);

type Candidate = { title: string; subtitle: string };

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

/**
 * Best matches for what's been typed first: results containing more of the typed words
 * come first, so adding detail ("The Forge, London") narrows the list instead of letting
 * a nearby "London Road" win. The last word may still be half-typed, so it matches as a
 * prefix. Ties keep their original order. Duplicates are dropped.
 */
export function rankAddresses<T extends Candidate>(query: string, candidates: readonly T[]): T[] {
  const typed = words(query);
  const last = typed.length - 1;
  const wanted = typed.map((word, i) => ({ word, prefix: i === last })).filter(({ word }) => !STOP_WORDS.has(word));

  const seen = new Set<string>();
  const unique = candidates.filter((candidate) => {
    const key = `${candidate.title}\n${candidate.subtitle}`.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (wanted.length === 0) return unique;

  const score = (candidate: T) => {
    const have = words(`${candidate.title} ${candidate.subtitle}`);
    const titleWords = words(candidate.title);
    let points = 0;
    for (const { word, prefix } of wanted) {
      const match = (w: string) => (prefix ? w.startsWith(word) : w === word);
      if (have.some(match)) points += titleWords.some(match) ? 1.1 : 1; // a hit in the name counts a little more
    }
    return points;
  };
  return unique
    .map((candidate, index) => ({ candidate, index, points: score(candidate) }))
    .sort((a, b) => b.points - a.points || a.index - b.index)
    .map(({ candidate }) => candidate);
}
