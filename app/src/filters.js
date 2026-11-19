// The checklist filter state and the matching rule every view shares.
// Kind chips: all / story / missable / collectibles / activities / online /
// misc. "missable" is a flag on the trophy, the others are its kind.

export const KIND_CHIPS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online', 'misc'];

export function createFilterState() {
  return { kind: 'all', grade: 'all', query: '', hideEarned: false };
}

export function trophyMatchesFilters(trophy, filters, earnedIds) {
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.hideEarned && earnedIds.has(trophy.id)) return false;
  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

export function countForKindChip(trophies, chip) {
  if (chip === 'all') return trophies.length;
  if (chip === 'missable') return trophies.filter((t) => t.missable).length;
  return trophies.filter((t) => t.kind === chip).length;
}
