// Leonida Legend — hand-in program for the gta6-trophy-guide-01 entry.
//
// The guide itself is the static web app in app/ (open app/index.html in a
// browser; it runs entirely from its own files). This program's only job is
// to package the entry the way the competition expects:
//
//   1. copy app/ and screenshots/ into the output directory
//      ($MAKEFUN_OUTPUT_DIR when set, otherwise /output), and
//   2. write dossier.json there with the vendored make.fun library, using
//      the same caps the scorer enforces, so what is handed in is byte for
//      byte what the scorer would build from the same files.
//
// vendor/makefun-frontend.ts is the kit's library and is used untouched.
// Run it with:  MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });

// The app is handed in exactly as it runs: every file under app/, nothing
// built or transformed on the way.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const screenshotsDir = join(repoRoot, 'screenshots');
if (existsSync(screenshotsDir)) {
  cpSync(screenshotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// Caps mirror the scorer's gate: at most 4 screenshots of at most 256 KiB,
// at most 993 entries and 48 MiB under app/, and the dossier's text section
// capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
