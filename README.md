# Middle-earth Reading Tracker

An interactive map of Middle-earth that shows where the main characters are
based on how far you've read. Pick your book and chapter, click **Update map**,
and the character markers glide to their locations in the story.

## Use it

Open `index.html` in any modern browser — no server or build step needed.

- **Books**: The Hobbit, The Fellowship of the Ring, The Two Towers, The Return of the King.
- **Fullscreen** button for a full-screen map; scroll to zoom, drag to pan, double-click to reset.
- Your book/chapter is remembered between visits (localStorage).
- Share a position with a URL hash: `index.html#book=2&ch=11` (0-based book and chapter indexes).

## Design notes

- Positions follow **reader knowledge**: characters stand where the reader last
  saw them, so the parallel storylines in The Two Towers and The Return of the
  King don't spoil each other. Faded markers with a dashed ring mean the
  character's whereabouts are uncertain at that point in the story.
- Characters not yet introduced (or dead/departed) are hidden; their legend
  chip dims.
- The map is an original stylized SVG drawn in `js/map.js` — no copyrighted
  map artwork is used.

## Icon credits

Character marker glyphs are from [game-icons.net](https://game-icons.net),
licensed [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/):

- **Lorc**: hunting horn (Merry), crystal ball (Pippin), pointy hat (Gandalf),
  rune sword (Aragorn), battle axe (Gimli), frog (Gollum), wizard staff (Saruman),
  burning eye (Sauron), horse head (Théoden), white tower (Faramir),
  ent mouth (Treebeard), dragon head (Smaug)
- **Delapouite**: power ring (Frodo), watering can (Sam), bow arrow (Legolas),
  mighty horn (Boromir), smoking pipe (Bilbo)
- **Cathelineau**: swordwoman (Éowyn)
- **Kier Heyl**: dwarf king (Thorin & Co.)

Original SVGs are kept in `assets/icons/`; `js/icons.js` is generated from them.

## Files

- `index.html` — page shell and controls
- `css/style.css` — parchment styling
- `js/data.js` — locations, characters, and per-chapter character positions
- `js/map.js` — renders the hand-drawn-style SVG map
- `js/app.js` — UI wiring, marker animation, pan/zoom, fullscreen, persistence
