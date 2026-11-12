// Lauras Videos und Beiträge – neueste zuerst.
// Neuer Eintrag: oben ergänzen. Pflicht sind title, url und poster.
//   type     'video' oder 'bild' (Bildbeitrag)
//   poster   Vorschaubild im Hochformat 3:4
//   video    optional: Link zur MP4 (eigener Ordner oder externer Hoster).
//            Ist er gesetzt, läuft das Video direkt auf der Seite; sonst öffnet
//            ein Klick den Beitrag in einem neuen Tab.
//   duration optional: Länge, z. B. '0:42'
//   topic    optional: verwaltung | wirtschaft | familien | zukunft | persoenlich | neuwahl
window.LM_VIDEOS = [
  {
    title: 'News aus Mering',
    type: 'video',
    url: 'https://www.instagram.com/lauramatthes/',
    video: 'assets/videos/beispiel.mp4',
    poster: 'assets/videos/beispiel.jpg',
    duration: '0:42',
  },
  {
    title: 'Meine Motivation: Warum ich politisch engagiert bin',
    type: 'bild',
    url: 'https://www.instagram.com/lauramatthes/p/DffFHDXiOIM/',
    poster: 'assets/beitraege/motivation.jpg',
    topic: 'persoenlich',
  },
  {
    title: 'Wärmeplanung – was heißt das für Mering?',
    type: 'video',
    url: 'https://www.instagram.com/lauramatthes/reel/DfSWZ1doUVD/',
    poster: 'assets/beitraege/waermeplanung.jpg',
    topic: 'zukunft',
  },
  {
    title: 'Gute Neuigkeiten bei den Kindergarten-Gebühren',
    type: 'video',
    url: 'https://www.instagram.com/lauramatthes/reel/DfKNydoI_YV/',
    poster: 'assets/beitraege/kiga-gebuehren.jpg',
    topic: 'familien',
  },
];

window.LM_PROFILE = 'https://www.instagram.com/lauramatthes/';
