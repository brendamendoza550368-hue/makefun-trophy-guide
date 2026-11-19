// Renders the Roadmap view: the six stages to the platinum, each listing
// its trophies in checklist order with their earned state, missable flags
// and a button through to the full guide.

import { GRADE_LABELS, ROADMAP_STAGES } from './data.js';
import { isRevealed } from './tracker.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap(trophies, ctx) {
  const view = document.getElementById('roadmap-view');
  view.replaceChildren();

  const intro = el('div', 'roadmap-intro');
  intro.append(el('h2', '', 'The road to Vice Got a Price!'));
  intro.append(
    el('p', '', 'Six stages, in the order a platinum run should work through them. The order is built from the ' +
      'official descriptions: the story and its one-time moments first, then the strands, activities and ' +
      'collectibles the descriptions count out, and the money-and-mayhem cleanup last, because almost everything ' +
      'feeds the 100% completion that A Long Road demands.'),
  );
  view.append(intro);

  for (const stage of ROADMAP_STAGES) {
    const inStage = trophies.filter((t) => t.roadmap_stage === stage.n);
    if (inStage.length === 0) continue;
    const done = inStage.filter((t) => ctx.progress.earnedIds.has(t.id)).length;
    const section = el('section', 'roadmap-stage');
    const head = el('div', 'stage-head');
    head.append(el('span', 'stage-number', `Stage ${stage.n}`));
    head.append(el('h3', 'stage-title', stage.title));
    head.append(el('span', 'stage-count', `${done}/${inStage.length} earned`));
    section.append(head);
    section.append(el('p', 'stage-blurb', stage.blurb));

    const list = el('ul', 'stage-trophies');
    for (const trophy of inStage) {
      const revealed = isRevealed(trophy, ctx.progress);
      const item = el('li', `stage-trophy${ctx.progress.earnedIds.has(trophy.id) ? ' earned' : ''}`);
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = ctx.progress.earnedIds.has(trophy.id);
      box.setAttribute('aria-label', `Mark ${revealed ? trophy.name : 'hidden trophy'} as earned`);
      box.addEventListener('change', () => ctx.onToggleEarned(trophy.id, box.checked));
      item.append(box);
      item.append(el('span', 'stage-trophy-name', revealed ? trophy.name : '???'));
      item.append(el('span', `grade-badge grade-${trophy.grade}`, GRADE_LABELS[trophy.grade]));
      if (trophy.missable) item.append(el('span', 'missable-flag', '⚠ MISSABLE'));
      if (trophy.target) item.append(el('span', 'stage-target', `Target ${trophy.target.toLocaleString('en-US')}`));
      const open = el('button', 'guide-button', 'Guide ▸');
      open.type = 'button';
      open.addEventListener('click', () => ctx.onSelect(trophy.id));
      item.append(open);
      list.append(item);
    }
    section.append(list);
    view.append(section);
  }
}
