// Lauras Instagram-Beiträge – neueste zuerst.
// Neues Reel: oben einen Eintrag ergänzen. Pflicht sind title, url und poster.
//   type   'reel' (Video) oder 'post' (Bild/Karussell)
//   poster Vorschaubild im Hochformat 3:4, liegt in assets/reels/
//   video  optional: Link zur MP4 bei einem externen Hoster (z. B. Bunny, R2).
//          Ist er gesetzt, spielt die Seite das Video selbst ab; sonst öffnet sich Instagram.
//   topic  optional: verwaltung | wirtschaft | familien | zukunft | persoenlich | nachwahl
//   date   optional: 'JJJJ-MM-TT'
window.LM_REELS = [
  {
    title: 'Meine Motivation: Warum ich politisch engagiert bin',
    type: 'post',
    url: 'https://www.instagram.com/lauramatthes/p/DffFHDXiOIM/',
    poster: 'assets/reels/motivation.jpg',
    topic: 'persoenlich',
  },
  {
    title: 'Wärmeplanung – was heißt das für Mering?',
    type: 'reel',
    url: 'https://www.instagram.com/lauramatthes/reel/DfSWZ1doUVD/',
    poster: 'assets/reels/waermeplanung.jpg',
    topic: 'zukunft',
  },
  {
    title: 'Gute Neuigkeiten bei den Kindergarten-Gebühren',
    type: 'reel',
    url: 'https://www.instagram.com/lauramatthes/reel/DfKNydoI_YV/',
    poster: 'assets/reels/kiga-gebuehren.jpg',
    topic: 'familien',
  },
];

window.LM_PROFILE = 'https://www.instagram.com/lauramatthes/';
