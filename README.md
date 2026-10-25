# Ransomware Inc.

A Plague Inc.-style mobile browser strategy game. You run a ransomware crew inside a fictional company: get initial access, spread quietly, climb from USER to ADMIN to DOMAIN control, steal the crown jewels, then encrypt enough of the network before the blue team contains you.

**Educational by design.** Every mechanic is abstract: nothing in the game describes a real technique, tool or command. The lesson is on the defender's side. The SOC console shows what your actions look like to analysts, and the end screen explains which defense stopped you (or would have): MFA, least privilege, segmentation, EDR, patching, SOC monitoring and offline backups each break a different link of the chain.

## Play

- Pick a target (from "Garage Startup" to "Bank under DORA") and an initial access vector.
- Footholds spread on their own. Tap the yellow ◆ intel caches and spend intel in **EVOLVE** across four branches: Creds, Move, Evade, Impact.
- Access matters: servers, the directory and backups need ADMIN; holding the directory server gives DOMAIN control.
- Everything makes noise. Detection raises the alert level: triage, incident (password reset), containment (isolation and lockdowns). Tap **SOC** to read the alerts you generated, read and unread.
- *Data Vacuum* exfiltrates data; with a *Leak Site* and the full crown jewels you get **double extortion** even if they recover.
- Buy *Payload Builder* and hit **DETONATE** at the right moment. Then race the restore-from-backup bar.
- Share the result card, read the debrief and your playbook, try a harder target.

## Real-world labels (`js/labels.js`)

Every entry vector and upgrade has a flavour name and a broad tactic category. `js/labels.js` lists all of them with an empty `{ id, name }` slot. Fill any slot with the real-world label you want players to learn (a framework technique ID and name, a CWE, an OWASP category, ...) and it shows up automatically:

- on the initial-access cards,
- in the EVOLVE tree detail ("Real-world name"),
- in SOC console alerts about that upgrade,
- in the end-of-run playbook.

Empty slots are simply hidden, so you can fill them in gradually. No other code changes are needed.

## Features

- Vanilla JS, single page, no build step, no dependencies
- English and Ukrainian (auto-detected, switchable)
- Built for portrait phones (landscape works too)
- 5 targets, 7 entry vectors, 42 upgrades, 30 news events, SOC console, double extortion, access tiers
- NULL.FM: 20 minutes of procedurally generated darksynth composed live with the Web Audio API
- Shareable PNG result card, native share sheet, Telegram share link

## Configure

Edit `js/config.js`:

- `TELEGRAM_CHANNEL_URL`, `CHANNEL_NAME`, `CHANNEL_LOGO`: the channel promoted on the title and end screens. Empty URL hides the buttons.
- `GAME_URL`: the public URL printed on the share card and in share links.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Balance check

The engine has no DOM, so a bot can play thousands of runs headless:

```sh
node tools/sim.js 80     # win% (+double-extortion%) and average length per target x vector
```

`tools/og.html` is the source of `assets/og-image.jpg` (render it at 1200x630).

## Deploy to GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the site on every push to `main`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The game is then live at https://morronel.github.io/ransomware_inc/.

## Project layout

```
index.html            all screens
css/style.css         neon UI
js/config.js          Telegram link, URLs, tick speed
js/labels.js          real-world labels you fill in
js/i18n.js            EN/UA interface strings
js/data.js            targets, vectors, upgrade tree, events, SOC alerts (bilingual)
js/game.js            simulation engine (no DOM, runs in node)
js/map.js             canvas network map
js/audio.js           NULL.FM generative radio + sound effects
js/share.js           result card + sharing
js/ui.js              screens, HUD, input
tools/sim.js          headless balance bot
```
