[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/brendamendoza550368-hue/makefun-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/brendamendoza550368-hue/makefun-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Legend — GTA VI Trophy Guide & Tracker

A static, fully offline web app that walks you through every one of the 55 PlayStation 5 trophies in Grand Theft Auto VI. Each trophy is listed with its official name, description and grade, paired with an original guide written for this entry that cites its sources, so you can see where every tip comes from.

On top of the checklist, the app flags the trophies that can be missed in a single playthrough, lays out a six-stage roadmap that orders the whole list into a sensible path to the platinum, and lets you slice the list by kind (story, collectibles, activities, online, misc), by grade, or by free-text search. A spoiler shield hides the names and descriptions of story trophies until you have earned them, so you can track progress without ruining the plot. Your earned trophies are saved in the browser as you tick them off, and the full progress set can be exported to a file and imported back on another machine or browser.

Everything runs from plain files — no build step, no server-side code, no network calls — so the guide works just as well saved on a laptop at a cabin as it does hosted on a static site.

## Run it

Serve the `app/` folder with any static file server and open `index.html`, for example:

```sh
node serve.ts
```

or point your favourite static server (or a plain `file://` open) at `app/`.

To hand the entry in, run the packager from the repository root:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes the `dossier.json` the judges read, using the vendored library in `vendor/makefun-frontend.ts`.

## Layout

- `app/data/trophies.json` — the trophy dataset: all 55 trophies with their official name, description and grade, plus this entry's guide text, kind, missable flag, sources and roadmap stage for each one.
- `app/src/data.js` — loads and prepares the trophy data for the rest of the app.
- `app/src/storage.js` — persists earned-trophy progress in the browser and handles progress export and import.
- `app/src/filters.js` — the kind, grade and search filtering applied to the checklist.
- `app/src/tracker.js` — the checklist itself: trophy rows, earned toggles, the guide panel and the spoiler shield.
- `app/src/roadmap.js` — the six-stage roadmap view that orders the trophies into a route to the platinum.
