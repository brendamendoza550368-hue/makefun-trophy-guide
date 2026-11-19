// Leonida Legend — entry point. Wires the trophy data, the saved progress,
// the filters and the two views (checklist and roadmap) together. Everything
// runs locally: the only file fetched is the app's own data/trophies.json.

import { KIND_LABELS, loadTrophyData } from './src/data.js';
import { KIND_CHIPS, countForKindChip, createFilterState } from './src/filters.js';
import { buildExportFile, downloadTextFile, loadProgress, parseImportFile, saveProgress } from './src/storage.js';
import { renderChecklist, renderDetailPanel, renderProgress } from './src/tracker.js';
import { renderRoadmap } from './src/roadmap.js';

const { trophies } = await loadTrophyData();
const progress = loadProgress();
const filters = createFilterState();
let selectedId = null;
let currentView = 'checklist';

const ctx = {
  get progress() { return progress; },
  get filters() { return filters; },
  get selectedId() { return selectedId; },
  onToggleEarned(id, earned) {
    if (earned) progress.earnedIds.add(id);
    else progress.earnedIds.delete(id);
    saveProgress(progress);
    refresh();
  },
  onSelect(id) {
    selectedId = id;
    if (currentView !== 'checklist') switchView('checklist');
    refresh();
    document.getElementById('detail-panel').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
};

function refresh() {
  renderProgress(trophies, progress);
  renderChecklist(trophies, ctx);
  renderDetailPanel(trophies.find((t) => t.id === selectedId) ?? null, ctx);
  renderRoadmap(trophies, ctx);
}

function switchView(view) {
  currentView = view;
  document.getElementById('checklist-view').hidden = view !== 'checklist';
  document.querySelector('.controls').style.display = view === 'checklist' ? '' : 'none';
  document.getElementById('roadmap-view').hidden = view !== 'roadmap';
  document.getElementById('tab-checklist').classList.toggle('active', view === 'checklist');
  document.getElementById('tab-roadmap').classList.toggle('active', view === 'roadmap');
}

// Kind chips, built from the filter definitions so the counts always match
// the data (including the Missable flag count).
const chipRow = document.getElementById('kind-chips');
for (const chip of KIND_CHIPS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `chip${chip === 'all' ? ' active' : ''}`;
  button.dataset.kind = chip;
  const label = chip === 'all' ? 'All' : chip === 'missable' ? '⚠ Missable' : KIND_LABELS[chip];
  button.textContent = `${label} (${countForKindChip(trophies, chip)})`;
  button.addEventListener('click', () => {
    filters.kind = chip;
    for (const other of chipRow.children) other.classList.toggle('active', other === button);
    refresh();
  });
  chipRow.append(button);
}

document.getElementById('grade-filter').addEventListener('change', (event) => {
  filters.grade = event.target.value;
  refresh();
});
document.getElementById('search').addEventListener('input', (event) => {
  filters.query = event.target.value;
  refresh();
});
document.getElementById('hide-earned').addEventListener('change', (event) => {
  filters.hideEarned = event.target.checked;
  refresh();
});

const spoilerToggle = document.getElementById('spoiler-toggle');
spoilerToggle.checked = progress.spoilerShield;
spoilerToggle.addEventListener('change', () => {
  progress.spoilerShield = spoilerToggle.checked;
  saveProgress(progress);
  refresh();
});

document.getElementById('export').addEventListener('click', () => {
  downloadTextFile('gta6-trophy-progress.json', buildExportFile(progress));
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const ids = parseImportFile(await file.text(), trophies);
  if (ids === null) {
    document.getElementById('filter-status').textContent = 'That file did not contain usable trophy progress.';
    return;
  }
  progress.earnedIds = ids;
  saveProgress(progress);
  refresh();
  event.target.value = '';
});

document.getElementById('tab-checklist').addEventListener('click', () => switchView('checklist'));
document.getElementById('tab-roadmap').addEventListener('click', () => switchView('roadmap'));

// Support deep links for screenshots and sharing: ?view=roadmap,
// ?kind=missable, ?spoiler=1, ?trophy=17 (opens that guide), ?earned=2,3,8
// (pre-ticks a demo set without touching saved progress unless changed).
const params = new URLSearchParams(location.search);
if (params.has('earned')) {
  progress.earnedIds = new Set(
    params.get('earned').split(',').map(Number).filter((n) => trophies.some((t) => t.id === n)),
  );
}
if (params.get('spoiler') === '1') {
  progress.spoilerShield = true;
  spoilerToggle.checked = true;
}
if (params.has('kind')) {
  filters.kind = params.get('kind');
  for (const chip of chipRow.children) chip.classList.toggle('active', chip.dataset.kind === filters.kind);
}
if (params.has('trophy')) selectedId = Number(params.get('trophy'));
refresh();
if (params.get('view') === 'roadmap') switchView('roadmap');
