/* ============================================================
 * data.js — locations, characters, and chapter-by-chapter
 * character positions for The Hobbit and The Lord of the Rings.
 *
 * Position values are location ids. A trailing "?" means the
 * character's whereabouts are uncertain to the reader at that
 * point (rendered faded). A character absent from a chapter's
 * position map is hidden (not yet introduced, departed, or dead).
 *
 * Positions follow "reader knowledge": characters stand where
 * the reader last saw them, so parallel storylines (e.g. Book
 * III vs Book IV of The Two Towers) don't spoil each other.
 * ============================================================ */

const LOCATIONS = {
  greyhavens:   { x:  85, y: 300, name: "Grey Havens" },
  hobbiton:     { x: 185, y: 300, name: "Hobbiton", major: true, anchor: "middle", dx: 0, dy: -22 },
  shireeast:    { x: 218, y: 312, name: "Green Hill Country", minor: true, anchor: "end", dy: 12, dx: 4 },
  buckland:     { x: 242, y: 300, name: "Buckland", minor: true, anchor: "end", dy: -6 },
  oldforest:    { x: 254, y: 318, name: "Old Forest", minor: true, anchor: "end", dy: 8, dx: -3 },
  bombadil:     { x: 268, y: 308, name: "Bombadil's House", minor: true, dy: -7 },
  barrowdowns:  { x: 274, y: 326, name: "Barrow-downs", minor: true, dy: 4 },
  bree:         { x: 298, y: 298, name: "Bree", major: true },
  weathertop:   { x: 334, y: 292, name: "Weathertop" },
  trollshaws:   { x: 392, y: 278, name: "Trollshaws", minor: true, anchor: "end", dy: -5 },
  ford:         { x: 418, y: 283, name: "Ford of Bruinen", minor: true, anchor: "end", dy: 11, dx: 8 },
  rivendell:    { x: 440, y: 276, name: "Rivendell", major: true, dy: -6 },
  highpass:     { x: 468, y: 268, name: "High Pass", minor: true, dy: -9, dx: -8 },
  goblintown:   { x: 474, y: 284, name: "Goblin-town", minor: true, dy: 11, dx: -6 },
  eyrie:        { x: 494, y: 270, name: "Eagles' Eyrie", minor: true, dy: -2 },
  beorn:        { x: 518, y: 256, name: "Beorn's House" },
  mirkwood:     { x: 578, y: 296, name: "Mirkwood" },
  thranduil:    { x: 592, y: 203, name: "Elvenking's Halls" },
  dolguldur:    { x: 572, y: 358, name: "Dol Guldur" },
  esgaroth:     { x: 648, y: 196, name: "Esgaroth (Lake-town)" },
  dale:         { x: 650, y: 166, name: "Dale", minor: true },
  erebor:       { x: 644, y: 145, name: "Erebor", major: true },
  hollin:       { x: 428, y: 338, name: "Hollin (Eregion)", minor: true },
  moria:        { x: 458, y: 356, name: "Moria", major: true },
  lorien:       { x: 504, y: 386, name: "Lothlórien", major: true },
  anduin:       { x: 548, y: 428, name: "The Great River", minor: true },
  dunland:      { x: 402, y: 428, name: "Dunland", minor: true },
  isengard:     { x: 438, y: 464, name: "Isengard", major: true },
  fangorn:      { x: 497, y: 443, name: "Fangorn Forest" },
  fangornedge:  { x: 523, y: 460, name: "Eaves of Fangorn", minor: true, anchor: "end", dy: 10, dx: 4 },
  wold:         { x: 560, y: 452, name: "The Wold", minor: true, dy: -6 },
  rohan:        { x: 532, y: 492, name: "Plains of Rohan", minor: true },
  helmsdeep:    { x: 462, y: 505, name: "Helm's Deep" },
  edoras:       { x: 503, y: 513, name: "Edoras", major: true },
  dunharrow:    { x: 500, y: 535, name: "Dunharrow", minor: true },
  pathsofdead:  { x: 483, y: 548, name: "Paths of the Dead", minor: true },
  amonhen:      { x: 586, y: 468, name: "Amon Hen", anchor: "end", dy: -5 },
  emynmuil:     { x: 613, y: 470, name: "Emyn Muil", minor: true, dy: 12, dx: -2 },
  deadmarshes:  { x: 636, y: 492, name: "Dead Marshes" },
  morannon:     { x: 669, y: 506, name: "The Black Gate" },
  cormallen:    { x: 655, y: 528, name: "Field of Cormallen", minor: true },
  hennethannun: { x: 656, y: 543, name: "Henneth Annûn", minor: true },
  ithilien:     { x: 648, y: 560, name: "Ithilien" },
  crossroads:   { x: 653, y: 587, name: "The Cross-roads", minor: true },
  osgiliath:    { x: 634, y: 587, name: "Osgiliath", minor: true, dy: 11, dx: -4 },
  pelennor:     { x: 618, y: 581, name: "Pelennor Fields", minor: true, dy: -8, dx: -8 },
  minastirith:  { x: 606, y: 590, name: "Minas Tirith", major: true, anchor: "end", dy: 3, dx: -7 },
  minasmorgul:  { x: 674, y: 590, name: "Minas Morgul", dy: 13, dx: -10 },
  cirithungol:  { x: 688, y: 582, name: "Cirith Ungol", minor: true, dy: -7, dx: -2 },
  mordorplain:  { x: 722, y: 568, name: "Plateau of Gorgoroth", minor: true, dy: 12, dx: -6 },
  mountdoom:    { x: 733, y: 553, name: "Mount Doom", major: true, anchor: "end", dy: -4, dx: -8 },
  baraddur:     { x: 756, y: 546, name: "Barad-dûr", major: true, dy: -6 },
  pelargir:     { x: 612, y: 652, name: "Pelargir", minor: true },
};

const CHARACTERS = {
  bilbo:    { name: "Bilbo",        init: "Bi", color: "#6d4c41" },
  frodo:    { name: "Frodo",        init: "Fr", color: "#3f7d3a" },
  sam:      { name: "Sam",          init: "Sa", color: "#c9932b" },
  merry:    { name: "Merry",        init: "Me", color: "#8e5db0" },
  pippin:   { name: "Pippin",       init: "Pi", color: "#d97b29" },
  gandalf:  { name: "Gandalf",      init: "Ga", color: "#8a8a8a" },
  aragorn:  { name: "Aragorn",      init: "Ar", color: "#40566b" },
  legolas:  { name: "Legolas",      init: "Le", color: "#2e8b74" },
  gimli:    { name: "Gimli",        init: "Gi", color: "#a0522d" },
  boromir:  { name: "Boromir",      init: "Bo", color: "#8c1c1c" },
  gollum:   { name: "Gollum",       init: "Go", color: "#5f7161" },
  saruman:  { name: "Saruman",      init: "Sr", color: "#ded9cc", dark: true },
  sauron:   { name: "Sauron",       init: "Sn", color: "#b3202a" },
  theoden:  { name: "Théoden", init: "Th", color: "#7a8f3c" },
  eowyn:    { name: "Éowyn",   init: "Éo", color: "#7d9bc0" },
  faramir:  { name: "Faramir",      init: "Fa", color: "#4a6741" },
  treebeard:{ name: "Treebeard",    init: "Tb", color: "#556b2f" },
  thorin:   { name: "Thorin & Co.", init: "Th", color: "#2f5d8a" },
  smaug:    { name: "Smaug",        init: "Sg", color: "#c23b22" },
};

function ch(title, pos) { return { title: title, pos: pos }; }

/* ---------------- The Hobbit ---------------- */

const HOBBIT_CHAPTERS = [
  ch("1. An Unexpected Party", { bilbo:"hobbiton", gandalf:"hobbiton", thorin:"hobbiton", smaug:"erebor" }),
  ch("2. Roast Mutton", { bilbo:"trollshaws", gandalf:"trollshaws", thorin:"trollshaws", smaug:"erebor" }),
  ch("3. A Short Rest", { bilbo:"rivendell", gandalf:"rivendell", thorin:"rivendell", smaug:"erebor" }),
  ch("4. Over Hill and Under Hill", { bilbo:"highpass", gandalf:"highpass", thorin:"highpass", smaug:"erebor" }),
  ch("5. Riddles in the Dark", { bilbo:"goblintown", gandalf:"goblintown", thorin:"goblintown", gollum:"goblintown", smaug:"erebor" }),
  ch("6. Out of the Frying-Pan into the Fire", { bilbo:"eyrie", gandalf:"eyrie", thorin:"eyrie", gollum:"goblintown?", smaug:"erebor" }),
  ch("7. Queer Lodgings", { bilbo:"beorn", gandalf:"beorn", thorin:"beorn", gollum:"goblintown?", smaug:"erebor" }),
  ch("8. Flies and Spiders", { bilbo:"mirkwood", thorin:"mirkwood", gandalf:"dolguldur?", gollum:"goblintown?", smaug:"erebor" }),
  ch("9. Barrels Out of Bond", { bilbo:"thranduil", thorin:"thranduil", gandalf:"dolguldur?", gollum:"goblintown?", smaug:"erebor" }),
  ch("10. A Warm Welcome", { bilbo:"esgaroth", thorin:"esgaroth", gandalf:"dolguldur?", gollum:"goblintown?", smaug:"erebor" }),
  ch("11. On the Doorstep", { bilbo:"erebor", thorin:"erebor", gandalf:"dolguldur?", gollum:"goblintown?", smaug:"erebor" }),
  ch("12. Inside Information", { bilbo:"erebor", thorin:"erebor", gandalf:"dolguldur?", gollum:"goblintown?", smaug:"erebor" }),
  ch("13. Not at Home", { bilbo:"erebor", thorin:"erebor", gandalf:"dolguldur?", gollum:"goblintown?", smaug:"esgaroth?" }),
  ch("14. Fire and Water", { bilbo:"erebor", thorin:"erebor", gandalf:"dolguldur?", gollum:"goblintown?", smaug:"esgaroth" }),
  ch("15. The Gathering of the Clouds", { bilbo:"erebor", thorin:"erebor", gandalf:"dale?", gollum:"goblintown?" }),
  ch("16. A Thief in the Night", { bilbo:"dale", thorin:"erebor", gandalf:"dale", gollum:"goblintown?" }),
  ch("17. The Clouds Burst", { bilbo:"dale", thorin:"dale", gandalf:"dale", gollum:"goblintown?" }),
  ch("18. The Return Journey", { bilbo:"erebor", thorin:"erebor", gandalf:"erebor", gollum:"goblintown?" }),
  ch("19. The Last Stage", { bilbo:"hobbiton", gandalf:"hobbiton", gollum:"goblintown?" }),
];

/* ---------------- The Fellowship of the Ring ---------------- */

// Constant background positions for most of Fellowship
const F1 = { bilbo:"rivendell", saruman:"isengard", sauron:"baraddur", gollum:"mirkwood" };

const FOTR_CHAPTERS = [
  ch("I · 1. A Long-expected Party", { frodo:"hobbiton", sam:"hobbiton", merry:"hobbiton", pippin:"hobbiton", gandalf:"hobbiton", bilbo:"hobbiton" }),
  ch("I · 2. The Shadow of the Past", Object.assign({}, F1, { frodo:"hobbiton", sam:"hobbiton", merry:"buckland", pippin:"hobbiton", gandalf:"hobbiton" })),
  ch("I · 3. Three is Company", Object.assign({}, F1, { frodo:"shireeast", sam:"shireeast", pippin:"shireeast", merry:"buckland", gandalf:"hobbiton?" })),
  ch("I · 4. A Short Cut to Mushrooms", Object.assign({}, F1, { frodo:"shireeast", sam:"shireeast", pippin:"shireeast", merry:"buckland", gandalf:"hobbiton?" })),
  ch("I · 5. A Conspiracy Unmasked", Object.assign({}, F1, { frodo:"buckland", sam:"buckland", merry:"buckland", pippin:"buckland", gandalf:"hobbiton?" })),
  ch("I · 6. The Old Forest", Object.assign({}, F1, { frodo:"oldforest", sam:"oldforest", merry:"oldforest", pippin:"oldforest", gandalf:"hobbiton?" })),
  ch("I · 7. In the House of Tom Bombadil", Object.assign({}, F1, { frodo:"bombadil", sam:"bombadil", merry:"bombadil", pippin:"bombadil", gandalf:"hobbiton?" })),
  ch("I · 8. Fog on the Barrow-downs", Object.assign({}, F1, { frodo:"barrowdowns", sam:"barrowdowns", merry:"barrowdowns", pippin:"barrowdowns", gandalf:"hobbiton?" })),
  ch("I · 9. At the Sign of the Prancing Pony", Object.assign({}, F1, { frodo:"bree", sam:"bree", merry:"bree", pippin:"bree", aragorn:"bree", gandalf:"hobbiton?" })),
  ch("I · 10. Strider", Object.assign({}, F1, { frodo:"bree", sam:"bree", merry:"bree", pippin:"bree", aragorn:"bree", gandalf:"bree?" })),
  ch("I · 11. A Knife in the Dark", Object.assign({}, F1, { frodo:"weathertop", sam:"weathertop", merry:"weathertop", pippin:"weathertop", aragorn:"weathertop", gandalf:"weathertop?" })),
  ch("I · 12. Flight to the Ford", Object.assign({}, F1, { frodo:"ford", sam:"ford", merry:"ford", pippin:"ford", aragorn:"ford", gandalf:"rivendell?" })),
  ch("II · 1. Many Meetings", Object.assign({}, F1, { frodo:"rivendell", sam:"rivendell", merry:"rivendell", pippin:"rivendell", aragorn:"rivendell", gandalf:"rivendell" })),
  ch("II · 2. The Council of Elrond", Object.assign({}, F1, { gollum:"mirkwood?", frodo:"rivendell", sam:"rivendell", merry:"rivendell", pippin:"rivendell", aragorn:"rivendell", gandalf:"rivendell", boromir:"rivendell", legolas:"rivendell", gimli:"rivendell" })),
  ch("II · 3. The Ring Goes South", Object.assign({}, F1, { gollum:"mirkwood?", frodo:"hollin", sam:"hollin", merry:"hollin", pippin:"hollin", aragorn:"hollin", gandalf:"hollin", boromir:"hollin", legolas:"hollin", gimli:"hollin" })),
  ch("II · 4. A Journey in the Dark", Object.assign({}, F1, { gollum:"mirkwood?", frodo:"moria", sam:"moria", merry:"moria", pippin:"moria", aragorn:"moria", gandalf:"moria", boromir:"moria", legolas:"moria", gimli:"moria" })),
  ch("II · 5. The Bridge of Khazad-dûm", Object.assign({}, F1, { gollum:"moria?", frodo:"moria", sam:"moria", merry:"moria", pippin:"moria", aragorn:"moria", gandalf:"moria", boromir:"moria", legolas:"moria", gimli:"moria" })),
  ch("II · 6. Lothlórien", Object.assign({}, F1, { gollum:"moria?", frodo:"lorien", sam:"lorien", merry:"lorien", pippin:"lorien", aragorn:"lorien", boromir:"lorien", legolas:"lorien", gimli:"lorien" })),
  ch("II · 7. The Mirror of Galadriel", Object.assign({}, F1, { gollum:"lorien?", frodo:"lorien", sam:"lorien", merry:"lorien", pippin:"lorien", aragorn:"lorien", boromir:"lorien", legolas:"lorien", gimli:"lorien" })),
  ch("II · 8. Farewell to Lórien", Object.assign({}, F1, { gollum:"lorien?", frodo:"lorien", sam:"lorien", merry:"lorien", pippin:"lorien", aragorn:"lorien", boromir:"lorien", legolas:"lorien", gimli:"lorien" })),
  ch("II · 9. The Great River", Object.assign({}, F1, { gollum:"anduin", frodo:"anduin", sam:"anduin", merry:"anduin", pippin:"anduin", aragorn:"anduin", boromir:"anduin", legolas:"anduin", gimli:"anduin" })),
  ch("II · 10. The Breaking of the Fellowship", Object.assign({}, F1, { gollum:"amonhen?", frodo:"amonhen", sam:"amonhen", merry:"amonhen", pippin:"amonhen", aragorn:"amonhen", boromir:"amonhen", legolas:"amonhen", gimli:"amonhen" })),
];

/* ---------------- The Two Towers ---------------- */

const T1 = { bilbo:"rivendell", saruman:"isengard", sauron:"baraddur" };
// State of the western storyline while the reader is in Book IV
const F3 = Object.assign({}, T1, {
  aragorn:"helmsdeep", legolas:"helmsdeep", gimli:"helmsdeep", theoden:"helmsdeep",
  merry:"helmsdeep", gandalf:"rohan", pippin:"rohan", eowyn:"dunharrow", treebeard:"isengard",
});

const TT_CHAPTERS = [
  ch("III · 1. The Departure of Boromir", Object.assign({}, T1, { aragorn:"amonhen", legolas:"amonhen", gimli:"amonhen", boromir:"amonhen", merry:"wold", pippin:"wold", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 2. The Riders of Rohan", Object.assign({}, T1, { aragorn:"wold", legolas:"wold", gimli:"wold", merry:"fangornedge", pippin:"fangornedge", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 3. The Uruk-hai", Object.assign({}, T1, { aragorn:"wold", legolas:"wold", gimli:"wold", merry:"fangornedge", pippin:"fangornedge", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 4. Treebeard", Object.assign({}, T1, { aragorn:"fangornedge", legolas:"fangornedge", gimli:"fangornedge", merry:"fangorn", pippin:"fangorn", treebeard:"fangorn", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 5. The White Rider", Object.assign({}, T1, { aragorn:"fangorn", legolas:"fangorn", gimli:"fangorn", gandalf:"fangorn", merry:"fangorn", pippin:"fangorn", treebeard:"fangorn", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 6. The King of the Golden Hall", Object.assign({}, T1, { aragorn:"edoras", legolas:"edoras", gimli:"edoras", gandalf:"edoras", theoden:"edoras", eowyn:"edoras", merry:"fangorn", pippin:"fangorn", treebeard:"fangorn", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 7. Helm's Deep", Object.assign({}, T1, { aragorn:"helmsdeep", legolas:"helmsdeep", gimli:"helmsdeep", gandalf:"helmsdeep", theoden:"helmsdeep", eowyn:"dunharrow", merry:"fangorn", pippin:"fangorn", treebeard:"fangorn", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 8. The Road to Isengard", Object.assign({}, T1, { aragorn:"isengard", legolas:"isengard", gimli:"isengard", gandalf:"isengard", theoden:"isengard", eowyn:"dunharrow", merry:"isengard", pippin:"isengard", treebeard:"isengard", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 9. Flotsam and Jetsam", Object.assign({}, T1, { aragorn:"isengard", legolas:"isengard", gimli:"isengard", gandalf:"isengard", theoden:"isengard", eowyn:"dunharrow", merry:"isengard", pippin:"isengard", treebeard:"isengard", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 10. The Voice of Saruman", Object.assign({}, T1, { aragorn:"isengard", legolas:"isengard", gimli:"isengard", gandalf:"isengard", theoden:"isengard", eowyn:"dunharrow", merry:"isengard", pippin:"isengard", treebeard:"isengard", frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("III · 11. The Palantír", Object.assign({}, F3, { frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil?" })),
  ch("IV · 1. The Taming of Sméagol", Object.assign({}, F3, { frodo:"emynmuil", sam:"emynmuil", gollum:"emynmuil" })),
  ch("IV · 2. The Passage of the Marshes", Object.assign({}, F3, { frodo:"deadmarshes", sam:"deadmarshes", gollum:"deadmarshes" })),
  ch("IV · 3. The Black Gate is Closed", Object.assign({}, F3, { frodo:"morannon", sam:"morannon", gollum:"morannon" })),
  ch("IV · 4. Of Herbs and Stewed Rabbit", Object.assign({}, F3, { frodo:"ithilien", sam:"ithilien", gollum:"ithilien" })),
  ch("IV · 5. The Window on the West", Object.assign({}, F3, { frodo:"hennethannun", sam:"hennethannun", faramir:"hennethannun", gollum:"ithilien?" })),
  ch("IV · 6. The Forbidden Pool", Object.assign({}, F3, { frodo:"hennethannun", sam:"hennethannun", faramir:"hennethannun", gollum:"hennethannun" })),
  ch("IV · 7. Journey to the Cross-roads", Object.assign({}, F3, { frodo:"crossroads", sam:"crossroads", gollum:"crossroads", faramir:"hennethannun" })),
  ch("IV · 8. The Stairs of Cirith Ungol", Object.assign({}, F3, { frodo:"minasmorgul", sam:"minasmorgul", gollum:"minasmorgul", faramir:"hennethannun" })),
  ch("IV · 9. Shelob's Lair", Object.assign({}, F3, { frodo:"cirithungol", sam:"cirithungol", gollum:"cirithungol", faramir:"hennethannun" })),
  ch("IV · 10. The Choices of Master Samwise", Object.assign({}, F3, { frodo:"cirithungol", sam:"cirithungol", gollum:"cirithungol?", faramir:"hennethannun" })),
];

/* ---------------- The Return of the King ---------------- */

const R1 = { bilbo:"rivendell", sauron:"baraddur", treebeard:"isengard", frodo:"cirithungol", sam:"cirithungol" };
// State of the war storyline while the reader is in Book VI ch. 1-3
const F5 = Object.assign({}, R1, {
  aragorn:"morannon", gandalf:"morannon", legolas:"morannon", gimli:"morannon", pippin:"morannon",
  merry:"minastirith", eowyn:"minastirith", faramir:"minastirith",
});

const ROTK_CHAPTERS = [
  ch("V · 1. Minas Tirith", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"hennethannun", aragorn:"helmsdeep", legolas:"helmsdeep", gimli:"helmsdeep", theoden:"helmsdeep", merry:"helmsdeep", eowyn:"dunharrow" })),
  ch("V · 2. The Passing of the Grey Company", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"hennethannun", aragorn:"pathsofdead", legolas:"pathsofdead", gimli:"pathsofdead", theoden:"edoras", merry:"edoras", eowyn:"dunharrow" })),
  ch("V · 3. The Muster of Rohan", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"hennethannun", aragorn:"pathsofdead?", legolas:"pathsofdead?", gimli:"pathsofdead?", theoden:"dunharrow", merry:"dunharrow", eowyn:"dunharrow" })),
  ch("V · 4. The Siege of Gondor", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"minastirith", aragorn:"pathsofdead?", legolas:"pathsofdead?", gimli:"pathsofdead?", theoden:"dunharrow", merry:"dunharrow", eowyn:"dunharrow" })),
  ch("V · 5. The Ride of the Rohirrim", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"minastirith", aragorn:"pathsofdead?", legolas:"pathsofdead?", gimli:"pathsofdead?", theoden:"pelennor", merry:"pelennor", eowyn:"pelennor" })),
  ch("V · 6. The Battle of the Pelennor Fields", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"minastirith", aragorn:"pelennor", legolas:"pelennor", gimli:"pelennor", theoden:"pelennor", merry:"pelennor", eowyn:"pelennor" })),
  ch("V · 7. The Pyre of Denethor", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"minastirith", aragorn:"pelennor", legolas:"pelennor", gimli:"pelennor", merry:"pelennor", eowyn:"pelennor" })),
  ch("V · 8. The Houses of Healing", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"minastirith", aragorn:"minastirith", legolas:"minastirith", gimli:"minastirith", merry:"minastirith", eowyn:"minastirith" })),
  ch("V · 9. The Last Debate", Object.assign({}, R1, { saruman:"isengard", gandalf:"minastirith", pippin:"minastirith", faramir:"minastirith", aragorn:"minastirith", legolas:"minastirith", gimli:"minastirith", merry:"minastirith", eowyn:"minastirith" })),
  ch("V · 10. The Black Gate Opens", Object.assign({}, R1, { saruman:"isengard", gandalf:"morannon", pippin:"morannon", aragorn:"morannon", legolas:"morannon", gimli:"morannon", merry:"minastirith", eowyn:"minastirith", faramir:"minastirith" })),
  ch("VI · 1. The Tower of Cirith Ungol", Object.assign({}, F5, { saruman:"isengard", frodo:"cirithungol", sam:"cirithungol" })),
  ch("VI · 2. The Land of Shadow", Object.assign({}, F5, { saruman:"isengard", frodo:"mordorplain", sam:"mordorplain" })),
  ch("VI · 3. Mount Doom", Object.assign({}, F5, { saruman:"isengard", frodo:"mountdoom", sam:"mountdoom", gollum:"mountdoom" })),
  ch("VI · 4. The Field of Cormallen", { bilbo:"rivendell", treebeard:"isengard", saruman:"isengard", frodo:"cormallen", sam:"cormallen", gandalf:"cormallen", aragorn:"cormallen", legolas:"cormallen", gimli:"cormallen", pippin:"cormallen", merry:"minastirith", eowyn:"minastirith", faramir:"minastirith" }),
  ch("VI · 5. The Steward and the King", { bilbo:"rivendell", treebeard:"isengard", saruman:"isengard", frodo:"minastirith", sam:"minastirith", merry:"minastirith", pippin:"minastirith", gandalf:"minastirith", aragorn:"minastirith", legolas:"minastirith", gimli:"minastirith", eowyn:"minastirith", faramir:"minastirith" }),
  ch("VI · 6. Many Partings", { bilbo:"rivendell", treebeard:"isengard", saruman:"dunland", frodo:"edoras", sam:"edoras", merry:"edoras", pippin:"edoras", gandalf:"edoras", aragorn:"edoras", legolas:"edoras", gimli:"edoras", eowyn:"edoras", faramir:"edoras" }),
  ch("VI · 7. Homeward Bound", { bilbo:"rivendell", treebeard:"isengard", saruman:"dunland?", frodo:"bree", sam:"bree", merry:"bree", pippin:"bree", gandalf:"bree", aragorn:"minastirith", legolas:"fangorn", gimli:"fangorn", eowyn:"edoras", faramir:"minastirith" }),
  ch("VI · 8. The Scouring of the Shire", { bilbo:"rivendell", treebeard:"isengard", saruman:"hobbiton", frodo:"hobbiton", sam:"hobbiton", merry:"hobbiton", pippin:"hobbiton", gandalf:"bombadil", aragorn:"minastirith", legolas:"fangorn", gimli:"fangorn", eowyn:"edoras", faramir:"minastirith" }),
  ch("VI · 9. The Grey Havens", { bilbo:"greyhavens", treebeard:"isengard", frodo:"greyhavens", sam:"greyhavens", merry:"greyhavens", pippin:"greyhavens", gandalf:"greyhavens", aragorn:"minastirith", legolas:"fangorn", gimli:"fangorn", eowyn:"edoras", faramir:"minastirith" }),
];

const BOOKS = [
  {
    id: "hobbit",
    title: "The Hobbit",
    cast: ["bilbo", "gandalf", "thorin", "gollum", "smaug"],
    chapters: HOBBIT_CHAPTERS,
  },
  {
    id: "fotr",
    title: "The Fellowship of the Ring",
    cast: ["frodo", "sam", "merry", "pippin", "gandalf", "aragorn", "legolas", "gimli", "boromir", "bilbo", "gollum", "saruman", "sauron"],
    chapters: FOTR_CHAPTERS,
  },
  {
    id: "tt",
    title: "The Two Towers",
    cast: ["frodo", "sam", "merry", "pippin", "gandalf", "aragorn", "legolas", "gimli", "boromir", "gollum", "theoden", "eowyn", "faramir", "treebeard", "saruman", "sauron", "bilbo"],
    chapters: TT_CHAPTERS,
  },
  {
    id: "rotk",
    title: "The Return of the King",
    cast: ["frodo", "sam", "merry", "pippin", "gandalf", "aragorn", "legolas", "gimli", "gollum", "theoden", "eowyn", "faramir", "treebeard", "saruman", "sauron", "bilbo"],
    chapters: ROTK_CHAPTERS,
  },
];
