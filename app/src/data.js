// Loads the trophy data file and holds the roadmap stage definitions the
// roadmap view and the detail panel share.

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  misc: 'Free roam & feats',
};

// The roadmap: six stages, in the order a platinum run should work through
// them. Every trophy in data/trophies.json carries a roadmap_stage number
// that places it in exactly one of these stages.
export const ROADMAP_STAGES = [
  {
    n: 1,
    title: 'Story first — the campaign and its one-time moments',
    blurb:
      'Play the campaign from Gone Fishing to the final mission. The 12 story trophies are hidden on the console ' +
      'and unlock automatically as you finish chapters and named missions, so the real work of this stage is the ' +
      'flagged one-time moments: meditate when Chapter 1 offers it, make the unscheduled departure while the story ' +
      'has you at VCIA, and drive out through the showroom glass if a mission puts you in one. Keep a manual save ' +
      'before the final mission, and keep cheats off throughout.',
  },
  {
    n: 2,
    title: 'Strangers & strands',
    blurb:
      'Clear the character mission strands. Andy, Kenton, Billy, Randy and Tyrone each end in a final-mission ' +
      'trophy, and finishing 8 strands in total earns the silver Strangers & Freaks. Bret\u2019s unique-animal hunt ' +
      'lives in this stage too — it is a one-off encounter, so save before you take the shot.',
  },
  {
    n: 3,
    title: 'Activities & challenges',
    blurb:
      'Sample all 9 activity types once for Master of None, then complete them properly: 250 stunts, gold medals ' +
      'in all 42 Shooting Range challenges, a Top Fun drone-race win at all 14 locations, 20 different race wins, ' +
      'Cal\u2019s fishing challenge, one finished arcade game, a game of bowling, and 50 challenges overall.',
  },
  {
    n: 4,
    title: 'Collectibles & exploration',
    blurb:
      'Sweep the state of Leonida region by region: complete 3 Collectible Card sets, WAiNK It at 100 locations, ' +
      'meditate at the remaining spots, discover 100 vehicles, register 10 of them to the Scooter Bros app, and ' +
      'visit all 52 areas. These sweeps overlap heavily, so one good road trip advances most of them at once.',
  },
  {
    n: 5,
    title: 'Crime, money & free-roam feats',
    blurb:
      'The cleanup playground. Partner feats and wanted-level escapes, then the robberies: 5 bank vaults, an ' +
      'armored truck, a jewelry store without being detected, and one illegal operation robbed from each of the ' +
      '9 gangs. Finish with the money totals — $250,000 laundered in Marked Bills, $100,000 spent in shops, and ' +
      'all 8 garage properties bought.',
  },
  {
    n: 6,
    title: '100% completion & the platinum',
    blurb:
      'When everything else is done, close out A Long Road: use the in-game completion checklist to find the ' +
      'last few percent still owed. The moment the 54th trophy lands, Vice Got a Price! — the platinum — ' +
      'unlocks with it. Congratulations, Leonida Legend.',
  },
];

export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  const doc = await response.json();
  return { meta: doc, trophies: doc.trophies };
}

export function isSpoilerSensitive(trophy) {
  return trophy.kind === 'story' || trophy.hidden === true;
}
