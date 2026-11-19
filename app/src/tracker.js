// Renders the checklist (grouped by grade), the per-grade and overall
// progress meters, and the detail panel that shows one trophy's full guide.

import { GRADE_ORDER, GRADE_LABELS, KIND_LABELS, ROADMAP_STAGES, isSpoilerSensitive } from './data.js';
import { trophyMatchesFilters } from './filters.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function isRevealed(trophy, progress) {
  // With the spoiler shield on, story (and other hidden) trophies stay
  // masked until the player has earned them.
  return !(progress.spoilerShield && isSpoilerSensitive(trophy) && !progress.earnedIds.has(trophy.id));
}

export function renderProgress(trophies, progress) {
  const total = trophies.length;
  const earned = progress.earnedIds.size;
  document.getElementById('progress-count').textContent = `${earned} of ${total} earned`;
  const percent = total === 0 ? 0 : Math.round((earned / total) * 100);
  document.getElementById('progress-percent').textContent = `${percent}%`;
  document.getElementById('progress-fill').style.width = `${percent}%`;

  const wrap = document.getElementById('grade-progress');
  wrap.replaceChildren();
  for (const grade of GRADE_ORDER) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => progress.earnedIds.has(t.id)).length;
    const cell = el('div', 'grade-cell');
    cell.append(el('span', `grade-badge grade-${grade}`, GRADE_LABELS[grade]));
    cell.append(el('span', 'grade-count', `${got}/${inGrade.length}`));
    const bar = el('div', 'mini-bar');
    const fill = el('div', `mini-fill fill-${grade}`);
    fill.style.width = inGrade.length === 0 ? '0%' : `${(got / inGrade.length) * 100}%`;
    bar.append(fill);
    cell.append(bar);
    wrap.append(cell);
  }
}

function buildTrophyRow(trophy, ctx) {
  const revealed = isRevealed(trophy, ctx.progress);
  const earned = ctx.progress.earnedIds.has(trophy.id);
  const row = el('article', `trophy-row${earned ? ' earned' : ''}${ctx.selectedId === trophy.id ? ' selected' : ''}`);
  row.dataset.trophyId = String(trophy.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'earned-box';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${revealed ? trophy.name : 'hidden trophy'} as earned`);
  box.addEventListener('change', () => ctx.onToggleEarned(trophy.id, box.checked));
  row.append(box);

  const main = el('div', 'trophy-main');
  const titleLine = el('div', 'trophy-title-line');
  titleLine.append(el('h3', 'trophy-name', revealed ? trophy.name : '???'));
  titleLine.append(el('span', `grade-badge grade-${trophy.grade}`, GRADE_LABELS[trophy.grade]));
  if (trophy.missable) titleLine.append(el('span', 'missable-flag', '⚠ MISSABLE'));
  if (trophy.hidden) titleLine.append(el('span', 'hidden-flag', 'Hidden trophy'));
  main.append(titleLine);
  const desc = el('p', `trophy-desc${revealed ? '' : ' blurred'}`, revealed ? trophy.description : 'Hidden until earned.');
  main.append(desc);
  const meta = el('p', 'trophy-meta');
  const bits = [KIND_LABELS[trophy.kind] ?? trophy.kind, `Roadmap stage ${trophy.roadmap_stage}`];
  if (trophy.target) bits.push(`Target: ${trophy.target.toLocaleString('en-US')}`);
  meta.textContent = bits.join(' · ');
  main.append(meta);
  row.append(main);

  const open = el('button', 'guide-button', 'Guide ▸');
  open.type = 'button';
  open.addEventListener('click', () => ctx.onSelect(trophy.id));
  row.append(open);
  row.addEventListener('click', (event) => {
    if (event.target !== box && event.target !== open) ctx.onSelect(trophy.id);
  });
  return row;
}

export function renderChecklist(trophies, ctx) {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  let shown = 0;
  for (const grade of GRADE_ORDER) {
    const inGrade = trophies.filter(
      (t) => t.grade === grade && trophyMatchesFilters(t, ctx.filters, ctx.progress.earnedIds),
    );
    if (inGrade.length === 0) continue;
    shown += inGrade.length;
    const section = el('section', 'grade-section');
    const heading = el('h2', 'grade-heading');
    heading.append(el('span', `grade-badge grade-${grade}`, GRADE_LABELS[grade]));
    heading.append(el('span', 'grade-heading-count', `${inGrade.length} shown`));
    section.append(heading);
    for (const trophy of inGrade) section.append(buildTrophyRow(trophy, ctx));
    list.append(section);
  }
  if (shown === 0) {
    const empty = el('div', 'empty-state');
    if (ctx.filters.kind === 'online') {
      empty.append(el('h2', '', 'No online trophies'));
      empty.append(
        el('p', '', 'The official PlayStation 5 list contains no online trophies — every one of the 55 can be ' +
          'earned in single player. Trophies that mention "your partner" mean the other protagonist riding with ' +
          'you, not a co-op partner online.'),
      );
    } else {
      empty.append(el('h2', '', 'Nothing matches those filters'));
      empty.append(el('p', '', 'Try a different kind, grade or search term — or untick "Hide earned".'));
    }
    list.append(empty);
  }
  document.getElementById('filter-status').textContent =
    `Showing ${shown} of ${trophies.length} trophies` +
    (ctx.filters.kind === 'missable' ? ' — every trophy that can be missed, flagged from its official description.' : '');
  return shown;
}

export function renderDetailPanel(trophy, ctx) {
  const panel = document.getElementById('detail-panel');
  panel.replaceChildren();
  if (!trophy) {
    const empty = el('div', 'detail-empty');
    empty.append(el('h2', '', 'Pick a trophy'));
    empty.append(el('p', '', 'Select any trophy in the checklist to read its full guide here: what the official description asks for, how to earn it, whether it can be missed, and the sources the guidance is built from.'));
    empty.append(el('p', '', 'New to the run? Open the Roadmap tab — it orders all 55 trophies into six stages, from the story campaign to 100% completion and the platinum.'));
    panel.append(empty);
    return;
  }
  const revealed = isRevealed(trophy, ctx.progress);
  const earned = ctx.progress.earnedIds.has(trophy.id);

  const head = el('div', 'detail-head');
  head.append(el('span', `grade-badge grade-${trophy.grade}`, GRADE_LABELS[trophy.grade]));
  if (trophy.missable) head.append(el('span', 'missable-flag', '⚠ MISSABLE'));
  if (trophy.hidden) head.append(el('span', 'hidden-flag', 'Hidden trophy'));
  panel.append(head);

  panel.append(el('h2', 'detail-name', revealed ? trophy.name : '???'));
  panel.append(el('p', 'detail-official-label', 'Official description'));
  panel.append(el('p', `detail-desc${revealed ? '' : ' blurred'}`, revealed ? trophy.description : 'Hidden until earned.'));

  if (trophy.missable) {
    const warn = el('div', 'missable-note');
    warn.append(el('strong', '', 'Can be missed. '));
    warn.append(document.createTextNode(trophy.missable_note ?? 'Flagged from its official description.'));
    panel.append(warn);
  }

  panel.append(el('h3', 'detail-subhead', 'How to earn it'));
  panel.append(el('p', `detail-guide${revealed ? '' : ' blurred'}`, revealed ? trophy.guide : 'Earn this trophy to reveal its guide, or turn off the Spoiler shield.'));

  const facts = el('dl', 'detail-facts');
  const addFact = (term, value) => {
    facts.append(el('dt', '', term), el('dd', '', value));
  };
  addFact('Kind', KIND_LABELS[trophy.kind] ?? trophy.kind);
  const stage = ROADMAP_STAGES.find((s) => s.n === trophy.roadmap_stage);
  addFact('Roadmap', stage ? `Stage ${stage.n} — ${stage.title}` : `Stage ${trophy.roadmap_stage}`);
  if (trophy.target) addFact('Target', trophy.target.toLocaleString('en-US'));
  panel.append(facts);

  panel.append(el('h3', 'detail-subhead', 'Sources'));
  const sourceList = el('ul', 'source-list');
  for (const source of trophy.sources ?? []) {
    const item = el('li');
    const link = el('a', '', source.label);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    item.append(link);
    sourceList.append(item);
  }
  panel.append(sourceList);
  panel.append(el('p', 'source-note', 'Names, descriptions and grades follow the official list; strategy is summarised from the guides above, in our own words.'));

  const label = el('label', 'detail-earned');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.addEventListener('change', () => ctx.onToggleEarned(trophy.id, box.checked));
  label.append(box, document.createTextNode(' I have earned this trophy'));
  panel.append(label);
}
