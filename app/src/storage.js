// Persists the player's progress (earned trophy ids + the spoiler setting)
// in localStorage, and converts it to and from the export file format.
// Nothing here ever leaves the browser except the file the player downloads.

const STORAGE_KEY = 'leonida-legend-progress-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earnedIds: new Set(), spoilerShield: false };
    const parsed = JSON.parse(raw);
    return {
      earnedIds: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      spoilerShield: parsed.spoiler === true,
    };
  } catch {
    return { earnedIds: new Set(), spoilerShield: false };
  }
}

export function saveProgress(progress) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ earned: [...progress.earnedIds], spoiler: progress.spoilerShield }),
  );
}

// The export file: ids are stable across list revisions, so progress stays
// meaningful even if trophy names are re-worded later.
export function buildExportFile(progress) {
  return JSON.stringify(
    {
      game: 'Grand Theft Auto VI',
      platform: 'PlayStation 5',
      app: 'leonida-legend-trophy-tracker',
      version: 1,
      earned: [...progress.earnedIds].sort((a, b) => a - b),
    },
    null,
    2,
  );
}

// Accepts this app's export object, a bare array of trophy ids, or a bare
// array of trophy names (the format a plain checklist export would use).
// Returns a Set of ids, or null when the file holds nothing usable.
export function parseImportFile(text, trophies) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const list = Array.isArray(parsed) ? parsed : parsed?.earned;
  if (!Array.isArray(list)) return null;
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const byName = new Map(trophies.map((t) => [t.name, t]));
  const ids = new Set();
  for (const item of list) {
    if (typeof item === 'number' && byId.has(item)) ids.add(item);
    else if (typeof item === 'string' && byName.has(item)) ids.add(byName.get(item).id);
  }
  return ids.size > 0 || list.length === 0 ? ids : null;
}

export function downloadTextFile(filename, text) {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
