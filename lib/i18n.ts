export const LOCALES = {
  en: 'English',
  no: 'Norsk',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
} as const

export type Locale = keyof typeof LOCALES

export type Messages = {
  nav: { games: string; leaderboard: string; myProfile: string; signOut: string; signIn: string }
  hero: { subtitle: string; browseGames: string; signInFree: string }
  home: {
    browseByCategory: string; playNow: string; howItWorks: string; footer: string
    step1Title: string; step1Desc: string
    step2Title: string; step2Desc: string
    step3Title: string; step3Desc: string
  }
  games: { title: string; bannerSubtitle: string; all: string; soon: string; comingSoon: string }
  leaderboard: { title: string; bannerSubtitle: string; sortedByElo: string; noPlayers: string }
  game: {
    startGame: string; globalLeaderboard: string; noRatings: string; youMightAlsoLike: string
    higherIsBetter: string; lowerIsBetter: string; players: string
    yourPlayers: string; addPlayerName: string; add: string; cancel: string
    needAtLeast: string; starting: string; startWith: string
    rulesBadge: string; quickStart: string; fullRules: string; showFullRules: string; hideFullRules: string
    abandoning: string; finishEarly: string; completeGame: string
    yourTurn: string; round: string; rounds: string; addRound: string
    gameOver: string; lowestWins: string; shootTheMoon: string; moonShot: string; rulesOption: string
    emailOptional: string; emailHint: string
  }
  profile: {
    yourRatings: string; yourPlayers: string; noPlayers: string; recentGames: string
    memberSince: string; addEmail: string; emailPlaceholder: string; save: string
    games: string; wins: string; elo: string; removeConfirm: string
  }
  category: { dice: string; card: string; darts: string; board: string; outdoor: string; party: string }
  login: { subtitle: string; terms: string; error: string }
  gameDesc: Record<string, string>
}

const en: Messages = {
  nav: { games: 'Games', leaderboard: 'Leaderboard', myProfile: 'My Profile', signOut: 'Sign out', signIn: 'Sign in' },
  hero: {
    subtitle: 'The social scoreboard for physical games. Track scores, compete with your group, and build your global rating.',
    browseGames: 'Browse Games',
    signInFree: 'Sign in free',
  },
  home: {
    browseByCategory: 'Browse by category', playNow: 'Play now', howItWorks: 'How it works',
    footer: 'Free forever · who-won.com',
    step1Title: 'Add your players', step1Desc: 'Sign in with Google, then add your friends as players — no accounts needed for them.',
    step2Title: 'Play with built-in scorecards', step2Desc: 'Built-in scorecards for every game — no more pen and paper.',
    step3Title: 'Track your rating', step3Desc: 'Earn Elo points per game. See how you compare locally and globally.',
  },
  games: { title: 'Games', bannerSubtitle: 'Choose a game and start tracking', all: 'All', soon: 'Soon', comingSoon: 'Coming soon' },
  leaderboard: { title: 'Global Leaderboard', bannerSubtitle: 'Ranked by Elo rating across all games', sortedByElo: 'Sorted by Elo rating', noPlayers: 'No players yet — be the first!' },
  game: {
    startGame: 'Start Game', globalLeaderboard: '🏆 Global Leaderboard', noRatings: 'No ratings yet — be the first!',
    youMightAlsoLike: 'You might also like', higherIsBetter: '⬆️ Higher is better', lowerIsBetter: '⬇️ Lower is better',
    players: 'players', yourPlayers: 'Your players', addPlayerName: 'Add player name...', add: 'Add', cancel: 'Cancel',
    needAtLeast: 'Need at least {n} players to start', starting: 'Starting...', startWith: 'Start ({n} players)',
    rulesBadge: '📋 Rules', quickStart: 'Quick start', fullRules: 'Full rules', showFullRules: 'Show full rules ▼', hideFullRules: 'Hide full rules ▲',
    abandoning: 'Abandon game? No ratings will change.', finishEarly: 'Finish Early', completeGame: 'Complete Game',
    yourTurn: 'your turn', round: 'Round', rounds: 'rounds', addRound: 'Add Round',
    gameOver: 'Game over! Someone reached {n} points.', lowestWins: 'Lowest score wins.',
    shootTheMoon: 'Shoot the moon?', moonShot: '{name} shot the moon — everyone else gets {pts} pts', rulesOption: 'Rules',
    emailOptional: 'Email (optional)', emailHint: 'So they can log in and claim their scores later',
  },
  profile: {
    yourRatings: 'Your Ratings', yourPlayers: 'Your Players', noPlayers: 'No saved players yet. They are saved automatically when you start a game.',
    recentGames: 'Recent Games', memberSince: 'Member since', addEmail: '+ Add email', emailPlaceholder: 'Email address',
    save: 'Save', games: 'games', wins: 'wins', elo: 'Elo', removeConfirm: 'Remove this player?',
  },
  category: { dice: 'Dice Games', card: 'Card Games', darts: 'Darts', board: 'Board Games', outdoor: 'Outdoor', party: 'Party Games' },
  login: { subtitle: 'Track scores, build your rating, and see who the real champion is.', terms: 'By signing in you agree to our terms of service. Always free.', error: 'Something went wrong. Please try again.' },
  gameDesc: {
    'maxi-yatzy': 'The classic dice game with 6 dice and expanded categories including House, Tower, and Maxi Yatzy bonus.',
    'yatzy': 'The original 5-dice version. Score in 15 categories and earn a 50-point bonus for 63+ in the upper section.',
    'darts-501': 'Start at 501, count down to exactly zero. Must finish on a double. First to zero wins.',
    'hearts': 'Avoid taking hearts and the Queen of Spades. Hearts 10pts, Ace 20pts, Queen of Spades 100pts, Jack of Diamonds −100pts. Lowest score wins.',
    'farkle': 'Roll dice, score points, and decide when to bank or risk it all. First to reach 10 000 points wins.',
    'darts-301': 'Like 501 but starting from 301. Shorter, faster games — must still finish on a double.',
    'darts-cricket': 'Close numbers 15–20 and the bullseye before your opponent. Score points on closed numbers your opponent hasn\'t closed yet.',
    'spades': 'Bid on tricks and score points for making your bid. Spades are always trump. First team to 500 wins.',
    'rummy': 'Form sets and runs to go out before your opponents. Lowest penalty score when someone reaches the limit wins.',
    'gin-rummy': 'Two-player rummy. Knock when your deadwood is 10 or less. Gin (0 deadwood) earns a 25-point bonus.',
    'canasta': 'Form melds and canastas of seven cards to score points. First team to 5000 wins.',
    'phase-10': 'Complete 10 specific phases in order. Lowest score after everyone finishes all phases wins.',
    'uno': 'Match cards by colour or number and race to go out. Lowest score when someone reaches 500 ends the game.',
    'cabo': 'Keep your hand total low, know your cards, and call Cabo at the right moment.',
    'cribbage': 'Score through pegging and hand-counting. First to peg to 121 wins.',
    'doppelkopf': 'German trick-taking game for 4. Secret teams, complex trumps — Re vs Kontra.',
    'skat': 'German 3-player bidding game. Declarer picks up the skat and names trump to win card points.',
    'catan': 'Build settlements, cities, and roads to reach 10 victory points first.',
    'ticket-to-ride': 'Claim railway routes across the map to complete destination tickets for bonus points.',
    'carcassonne': 'Place tiles to build a medieval landscape, scoring cities, roads, and monasteries.',
    'scrabble': 'Form words on the board using letter tiles. Premium squares multiply your score.',
    'backgammon': 'Race your 15 pieces around the board and bear them off before your opponent.',
    'sequence': 'Play cards to place chips and form sequences of five on the board.',
    'petanque': 'Throw boules closest to the jack to score. First team to 13 points wins.',
    'bowling': 'Track your bowling scores across 10 frames including strikes and spares.',
    'croquet': 'Hit balls through hoops in order using a mallet. First to complete all hoops wins.',
  },
}

const no: Messages = {
  nav: { games: 'Spill', leaderboard: 'Toppliste', myProfile: 'Min profil', signOut: 'Logg ut', signIn: 'Logg inn' },
  hero: {
    subtitle: 'Det sosiale poengtavlen for fysiske spill. Spor poeng, konkurrér med gruppen din og bygg din globale rating.',
    browseGames: 'Se alle spill',
    signInFree: 'Logg inn gratis',
  },
  home: {
    browseByCategory: 'Bla etter kategori', playNow: 'Spill nå', howItWorks: 'Slik fungerer det',
    footer: 'Alltid gratis · who-won.com',
    step1Title: 'Legg til spillere', step1Desc: 'Logg inn med Google, og legg til vennene dine som spillere — de trenger ikke egne kontoer.',
    step2Title: 'Spill med innebygde poengtavler', step2Desc: 'Innebygde poengtavler for hvert spill — ikke mer penn og papir.',
    step3Title: 'Følg ratingen din', step3Desc: 'Tjen Elo-poeng per spill. Se hvordan du rangerer lokalt og globalt.',
  },
  games: { title: 'Spill', bannerSubtitle: 'Velg et spill og begynn å spore', all: 'Alle', soon: 'Snart', comingSoon: 'Kommer snart' },
  leaderboard: { title: 'Global toppliste', bannerSubtitle: 'Rangert etter Elo-rating på tvers av alle spill', sortedByElo: 'Sortert etter Elo-rating', noPlayers: 'Ingen spillere ennå — vær den første!' },
  game: {
    startGame: 'Start spill', globalLeaderboard: '🏆 Global toppliste', noRatings: 'Ingen rangeringer ennå — vær den første!',
    youMightAlsoLike: 'Du liker kanskje også', higherIsBetter: '⬆️ Høyere er bedre', lowerIsBetter: '⬇️ Lavere er bedre',
    players: 'spillere', yourPlayers: 'Dine spillere', addPlayerName: 'Legg til spillernavn...', add: 'Legg til', cancel: 'Avbryt',
    needAtLeast: 'Trenger minst {n} spillere for å starte', starting: 'Starter...', startWith: 'Start ({n} spillere)',
    rulesBadge: '📋 Regler', quickStart: 'Hurtigstart', fullRules: 'Fullstendige regler', showFullRules: 'Vis alle regler ▼', hideFullRules: 'Skjul regler ▲',
    abandoning: 'Avslutt spillet? Ingen ratinger vil endres.', finishEarly: 'Avslutt tidlig', completeGame: 'Fullfør spill',
    yourTurn: 'din tur', round: 'Runde', rounds: 'runder', addRound: 'Legg til runde',
    gameOver: 'Spillet er over! Noen nådde {n} poeng.', lowestWins: 'Lavest poeng vinner.',
    shootTheMoon: 'Skyt månen?', moonShot: '{name} skøyt månen — alle andre får {pts} poeng', rulesOption: 'Regler',
    emailOptional: 'E-post (valgfritt)', emailHint: 'Slik kan de logge inn og hente poengene sine senere',
  },
  profile: {
    yourRatings: 'Dine rangeringer', yourPlayers: 'Dine spillere', noPlayers: 'Ingen lagrede spillere ennå. De lagres automatisk når du starter et spill.',
    recentGames: 'Nylige spill', memberSince: 'Medlem siden', addEmail: '+ Legg til e-post', emailPlaceholder: 'E-postadresse',
    save: 'Lagre', games: 'spill', wins: 'seire', elo: 'Elo', removeConfirm: 'Fjerne denne spilleren?',
  },
  category: { dice: 'Terningspill', card: 'Kortspill', darts: 'Darts', board: 'Brettspill', outdoor: 'Utendørs', party: 'Festspill' },
  login: { subtitle: 'Spor poeng, bygg ratingen din og se hvem som er den virkelige mesteren.', terms: 'Ved å logge inn godtar du våre vilkår. Alltid gratis.', error: 'Noe gikk galt. Prøv igjen.' },
  gameDesc: {
    'maxi-yatzy': 'Det klassiske terningspillet med 6 terninger og utvidede kategorier inkludert Hytte, Tårn og Maxi Yatzy-bonus.',
    'yatzy': 'Den originale 5-terningsversjonen. Poengscor i 15 kategorier og tjen 50 bonuspoeng for 63+ i øvre seksjon.',
    'darts-501': 'Start på 501 og tell ned til nøyaktig null. Må avslutte med dobling. Første til null vinner.',
    'hearts': 'Unngå å ta hjerter og Spardam. Hjerter 10 poeng, Hjerteress 20 poeng, Spardam 100 poeng, Ruterknekt −100 poeng. Lavest poeng vinner.',
    'farkle': 'Kast terninger, samle poeng og bestem når du banker eller risikerer alt. Første til 10 000 poeng vinner.',
    'darts-301': 'Som 501 men starter fra 301. Kortere og raskere spill — må fortsatt avslutte med dobling.',
    'darts-cricket': 'Lukk tallene 15–20 og blink før motstanderen. Poeng på lukkede tall motstanderen ennå ikke har lukket.',
    'spades': 'Bid på stikk og samle poeng for å nå budet ditt. Spar er alltid trumf. Første lag til 500 vinner.',
    'rummy': 'Form sett og rekker for å gå ut før motstanderne. Lavest straffpoeng når noen når grensen vinner.',
    'gin-rummy': 'To-spiller-rummy. Bank når ubrukte kort er 10 eller mindre. Gin (0 ubrukte) gir 25 bonuspoeng.',
    'canasta': 'Form melds og canastaer på syv kort for å samle poeng. Første lag til 5000 vinner.',
    'phase-10': 'Fullfør 10 spesifikke faser i rekkefølge. Lavest poeng etter at alle er ferdige vinner.',
    'uno': 'Match kort etter farge eller tall og vær først ut. Lavest poeng når noen når 500 avslutter spillet.',
    'cabo': 'Hold håndsummen lav, kjenn kortene dine, og ropa Cabo til rett tid.',
    'cribbage': 'Samle poeng gjennom pegging og håndtelling. Første til 121 vinner.',
    'doppelkopf': 'Tysk stikk-spill for 4. Hemmelige lag, kompliserte trumfer — Re mot Kontra.',
    'skat': 'Tysk budrunde-spill for 3 spillere. Deklaranten tar opp skaten og velger trumf.',
    'catan': 'Bygg bosetninger, byer og veier for å nå 10 seierspoeng først.',
    'ticket-to-ride': 'Krev jernbaneruter på kartet for å fullføre destinasjonskort og samle bonuspoeng.',
    'carcassonne': 'Legg fliser for å bygge et middelaldersk landskap og samle poeng på byer, veier og klostre.',
    'scrabble': 'Form ord på brettet med bokstavbrikker. Premiefelt multipliserer poengsummen din.',
    'backgammon': 'Før 15 brikker rundt brettet og bær dem av før motstanderen.',
    'sequence': 'Spill kort for å plassere brikker og form sekvenser på fem på brettet.',
    'petanque': 'Kast boules nærmest cochonneten for å score. Første lag til 13 poeng vinner.',
    'bowling': 'Spor bowlingpoengene dine over 10 frames inkludert strikes og spares.',
    'croquet': 'Slå baller gjennom ringer i rekkefølge med en kølle. Første til å fullføre alle ringer vinner.',
  },
}

const de: Messages = {
  nav: { games: 'Spiele', leaderboard: 'Bestenliste', myProfile: 'Mein Profil', signOut: 'Abmelden', signIn: 'Anmelden' },
  hero: {
    subtitle: 'Das soziale Spielbrett für Gesellschaftsspiele. Verfolge Punkte, konkurriere mit deiner Gruppe und baue deine globale Wertung auf.',
    browseGames: 'Spiele entdecken',
    signInFree: 'Kostenlos anmelden',
  },
  home: {
    browseByCategory: 'Nach Kategorie stöbern', playNow: 'Jetzt spielen', howItWorks: 'So funktioniert es',
    footer: 'Für immer kostenlos · who-won.com',
    step1Title: 'Spieler hinzufügen', step1Desc: 'Melde dich mit Google an, füge dann deine Freunde als Spieler hinzu — sie brauchen keine eigenen Konten.',
    step2Title: 'Mit integrierten Spielblättern spielen', step2Desc: 'Integrierte Spielblätter für jedes Spiel — kein Papier mehr.',
    step3Title: 'Deine Wertung verfolgen', step3Desc: 'Verdiene Elo-Punkte pro Spiel. Sieh, wie du lokal und global abschneidest.',
  },
  games: { title: 'Spiele', bannerSubtitle: 'Wähle ein Spiel und beginne zu tracken', all: 'Alle', soon: 'Bald', comingSoon: 'Demnächst' },
  leaderboard: { title: 'Globale Bestenliste', bannerSubtitle: 'Gerankt nach Elo-Wertung über alle Spiele', sortedByElo: 'Sortiert nach Elo-Wertung', noPlayers: 'Noch keine Spieler — sei der Erste!' },
  game: {
    startGame: 'Spiel starten', globalLeaderboard: '🏆 Globale Bestenliste', noRatings: 'Noch keine Wertungen — sei der Erste!',
    youMightAlsoLike: 'Das könnte dir auch gefallen', higherIsBetter: '⬆️ Höher ist besser', lowerIsBetter: '⬇️ Niedriger ist besser',
    players: 'Spieler', yourPlayers: 'Deine Spieler', addPlayerName: 'Spielernamen hinzufügen...', add: 'Hinzufügen', cancel: 'Abbrechen',
    needAtLeast: 'Mindestens {n} Spieler zum Starten erforderlich', starting: 'Starte...', startWith: 'Starten ({n} Spieler)',
    rulesBadge: '📋 Regeln', quickStart: 'Schnellstart', fullRules: 'Vollständige Regeln', showFullRules: 'Alle Regeln anzeigen ▼', hideFullRules: 'Regeln ausblenden ▲',
    abandoning: 'Spiel aufgeben? Keine Wertungen werden geändert.', finishEarly: 'Vorzeitig beenden', completeGame: 'Spiel abschließen',
    yourTurn: 'du bist dran', round: 'Runde', rounds: 'Runden', addRound: 'Runde hinzufügen',
    gameOver: 'Spiel vorbei! Jemand hat {n} Punkte erreicht.', lowestWins: 'Die niedrigste Punktzahl gewinnt.',
    shootTheMoon: 'Shoot the Moon?', moonShot: '{name} hat den Mond geschossen — alle anderen bekommen {pts} Punkte', rulesOption: 'Regeln',
    emailOptional: 'E-Mail (optional)', emailHint: 'Damit können sie sich anmelden und ihre Punkte später abrufen',
  },
  profile: {
    yourRatings: 'Deine Wertungen', yourPlayers: 'Deine Spieler', noPlayers: 'Noch keine gespeicherten Spieler. Sie werden automatisch beim Spielstart gespeichert.',
    recentGames: 'Letzte Spiele', memberSince: 'Mitglied seit', addEmail: '+ E-Mail hinzufügen', emailPlaceholder: 'E-Mail-Adresse',
    save: 'Speichern', games: 'Spiele', wins: 'Siege', elo: 'Elo', removeConfirm: 'Diesen Spieler entfernen?',
  },
  category: { dice: 'Würfelspiele', card: 'Kartenspiele', darts: 'Darts', board: 'Brettspiele', outdoor: 'Outdoor', party: 'Partyspiele' },
  login: { subtitle: 'Verfolge Punkte, baue deine Wertung auf und sieh, wer der wahre Champion ist.', terms: 'Durch die Anmeldung stimmst du unseren Nutzungsbedingungen zu. Immer kostenlos.', error: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.' },
  gameDesc: {
    'maxi-yatzy': 'Das klassische Würfelspiel mit 6 Würfeln und erweiterten Kategorien wie Haus, Turm und Maxi-Yatzy-Bonus.',
    'yatzy': 'Die originale 5-Würfel-Version. Wertung in 15 Kategorien und 50 Bonuspunkte bei 63+ im oberen Bereich.',
    'darts-501': 'Starte bei 501 und zähle auf genau null herunter. Muss auf einem Doppel enden. Wer zuerst null erreicht, gewinnt.',
    'hearts': 'Vermeide Herzen und die Pik-Dame. Herz 10 Pkt., Herz-As 20 Pkt., Pik-Dame 100 Pkt., Karo-Bube −100 Pkt. Niedrigste Punktzahl gewinnt.',
    'farkle': 'Würfle, sammle Punkte und entscheide, wann du bankst oder alles riskierst. Wer zuerst 10 000 Punkte erreicht, gewinnt.',
    'darts-301': 'Wie 501, aber Start bei 301. Kürzere, schnellere Spiele — muss trotzdem auf einem Doppel enden.',
    'darts-cricket': 'Schließe die Zahlen 15–20 und den Bullseye vor deinem Gegner. Punkte auf geschlossenen Zahlen, die der Gegner noch nicht geschlossen hat.',
    'spades': 'Biete auf Stiche und sammle Punkte für dein Gebot. Pik ist immer Trumpf. Erstes Team mit 500 gewinnt.',
    'rummy': 'Bilde Sätze und Folgen, um vor den Gegnern auszuspielen. Niedrigste Strafpunkte bei Spielende gewinnt.',
    'gin-rummy': 'Zwei-Spieler-Rummy. Klopfe bei Restpunkten ≤ 10. Gin (0 Restpunkte) gibt 25 Bonuspunkte.',
    'canasta': 'Bilde Meldungen und Canastas aus sieben Karten. Erstes Team mit 5000 Punkten gewinnt.',
    'phase-10': 'Schließe 10 spezifische Phasen der Reihe nach ab. Niedrigste Punktzahl gewinnt.',
    'uno': 'Lege Karten nach Farbe oder Zahl und sei der Erste ohne Karten. Niedrigste Punktzahl bei 500 gewinnt.',
    'cabo': 'Halte deine Handsumme niedrig, kenne deine Karten und rufe Cabo zur richtigen Zeit.',
    'cribbage': 'Sammle Punkte durch Pegging und Handzählung. Erster mit 121 Punkten gewinnt.',
    'doppelkopf': 'Deutsches Stichspiel für 4. Geheime Teams, komplexe Trümpfe — Re gegen Kontra.',
    'skat': 'Deutsches Bietspiel für 3 Spieler. Der Alleinspieler nimmt den Skat auf und wählt den Trumpf.',
    'catan': 'Baue Siedlungen, Städte und Straßen, um zuerst 10 Siegpunkte zu erreichen.',
    'ticket-to-ride': 'Beanspruche Eisenbahnstrecken auf der Karte, um Streckentickets zu erfüllen.',
    'carcassonne': 'Lege Plättchen für eine mittelalterliche Landschaft und sammle Punkte für Städte, Straßen und Klöster.',
    'scrabble': 'Bilde Wörter auf dem Spielfeld mit Buchstabensteinen. Premiumfelder multiplizieren die Punktzahl.',
    'backgammon': 'Führe 15 Steine um das Brett und trage sie ab, bevor dein Gegner es tut.',
    'sequence': 'Spiele Karten, platziere Chips und bilde Fünfer-Sequenzen auf dem Spielfeld.',
    'petanque': 'Wirf Boules am nächsten zur Zielkugel. Erstes Team mit 13 Punkten gewinnt.',
    'bowling': 'Verfolge deine Bowling-Punktzahlen über 10 Frames mit Strikes und Spares.',
    'croquet': 'Schlage Bälle mit einem Schläger in der richtigen Reihenfolge durch Tore.',
  },
}

const fr: Messages = {
  nav: { games: 'Jeux', leaderboard: 'Classement', myProfile: 'Mon profil', signOut: 'Se déconnecter', signIn: 'Se connecter' },
  hero: {
    subtitle: 'Le tableau de scores social pour les jeux physiques. Suivez les scores, affrontez votre groupe et construisez votre classement mondial.',
    browseGames: 'Voir les jeux',
    signInFree: "S'inscrire gratuitement",
  },
  home: {
    browseByCategory: 'Parcourir par catégorie', playNow: 'Jouer maintenant', howItWorks: 'Comment ça marche',
    footer: 'Gratuit pour toujours · who-won.com',
    step1Title: 'Ajouter vos joueurs', step1Desc: "Connectez-vous avec Google, puis ajoutez vos amis comme joueurs — pas de compte nécessaire pour eux.",
    step2Title: 'Jouer avec des fiches de score intégrées', step2Desc: 'Fiches de score intégrées pour chaque jeu — plus besoin de papier.',
    step3Title: 'Suivre votre classement', step3Desc: 'Gagnez des points Elo par partie. Voyez comment vous vous comparez localement et mondialement.',
  },
  games: { title: 'Jeux', bannerSubtitle: 'Choisissez un jeu et commencez à suivre', all: 'Tous', soon: 'Bientôt', comingSoon: 'Bientôt disponible' },
  leaderboard: { title: 'Classement mondial', bannerSubtitle: 'Classé par Elo sur tous les jeux', sortedByElo: 'Trié par classement Elo', noPlayers: 'Aucun joueur encore — soyez le premier !' },
  game: {
    startGame: 'Commencer', globalLeaderboard: '🏆 Classement mondial', noRatings: 'Pas encore de classements — soyez le premier !',
    youMightAlsoLike: 'Vous aimerez peut-être aussi', higherIsBetter: '⬆️ Plus haut c\'est mieux', lowerIsBetter: '⬇️ Plus bas c\'est mieux',
    players: 'joueurs', yourPlayers: 'Vos joueurs', addPlayerName: 'Ajouter un joueur...', add: 'Ajouter', cancel: 'Annuler',
    needAtLeast: 'Il faut au moins {n} joueurs pour commencer', starting: 'Démarrage...', startWith: 'Commencer ({n} joueurs)',
    rulesBadge: '📋 Règles', quickStart: 'Démarrage rapide', fullRules: 'Règles complètes', showFullRules: 'Voir toutes les règles ▼', hideFullRules: 'Masquer les règles ▲',
    abandoning: 'Abandonner la partie ? Aucun classement ne sera modifié.', finishEarly: 'Terminer tôt', completeGame: 'Terminer la partie',
    yourTurn: 'à vous', round: 'Manche', rounds: 'manches', addRound: 'Ajouter une manche',
    gameOver: 'Partie terminée ! Quelqu\'un a atteint {n} points.', lowestWins: 'Le score le plus bas gagne.',
    shootTheMoon: 'Shoot the Moon ?', moonShot: '{name} a tiré la lune — tous les autres reçoivent {pts} pts', rulesOption: 'Règles',
    emailOptional: 'E-mail (optionnel)', emailHint: 'Pour qu\'ils puissent se connecter et récupérer leurs scores plus tard',
  },
  profile: {
    yourRatings: 'Vos classements', yourPlayers: 'Vos joueurs', noPlayers: 'Aucun joueur enregistré. Ils sont sauvegardés automatiquement au démarrage d\'une partie.',
    recentGames: 'Parties récentes', memberSince: 'Membre depuis', addEmail: '+ Ajouter un e-mail', emailPlaceholder: 'Adresse e-mail',
    save: 'Enregistrer', games: 'parties', wins: 'victoires', elo: 'Elo', removeConfirm: 'Supprimer ce joueur ?',
  },
  category: { dice: 'Jeux de dés', card: 'Jeux de cartes', darts: 'Fléchettes', board: 'Jeux de plateau', outdoor: 'Plein air', party: 'Jeux de société' },
  login: { subtitle: 'Suivez les scores, construisez votre classement et voyez qui est le vrai champion.', terms: 'En vous connectant, vous acceptez nos conditions d\'utilisation. Toujours gratuit.', error: 'Quelque chose s\'est mal passé. Veuillez réessayer.' },
  gameDesc: {
    'maxi-yatzy': 'Le jeu de dés classique avec 6 dés et des catégories étendues : Maison, Tour et bonus Maxi Yatzy.',
    'yatzy': 'La version originale à 5 dés. Marquez dans 15 catégories et gagnez 50 points de bonus si la section supérieure atteint 63+.',
    'darts-501': 'Commencez à 501 et descendez à zéro exactement. Terminez sur un double. Le premier à zéro gagne.',
    'hearts': 'Évitez les cœurs et la Dame de pique. Cœurs 10 pts, As de cœur 20 pts, Dame de pique 100 pts, Valet de carreau −100 pts. Le score le plus bas gagne.',
    'farkle': 'Lancez les dés, marquez des points et décidez quand encaisser ou tout risquer. Le premier à 10 000 points gagne.',
    'darts-301': 'Comme le 501 mais en partant de 301. Parties plus courtes — doit terminer sur un double.',
    'darts-cricket': 'Fermez les numéros 15–20 et la cible avant votre adversaire. Marquez des points sur les numéros fermés.',
    'spades': 'Enchérissez sur les levées et marquez des points en réalisant votre enchère. Le Pique est toujours atout.',
    'rummy': 'Formez des combinaisons et des suites pour sortir avant vos adversaires. Le score le plus bas gagne.',
    'gin-rummy': 'Rummy à deux joueurs. Frappes quand tes cartes mortes totalisent 10 ou moins. Gin = 25 pts bonus.',
    'canasta': 'Formez des melds et des canastas de sept cartes. La première équipe à 5000 points gagne.',
    'phase-10': 'Complétez 10 phases spécifiques dans l\'ordre. Le score le plus bas après toutes les phases gagne.',
    'uno': 'Associez les cartes par couleur ou chiffre et soyez le premier à vider votre main.',
    'cabo': 'Gardez votre total bas, connaissez vos cartes et appelez Cabo au bon moment.',
    'cribbage': 'Marquez des points par pegging et comptage de main. Le premier à 121 gagne.',
    'doppelkopf': 'Jeu de plis allemand à 4. Équipes secrètes, atouts complexes — Re contre Kontra.',
    'skat': 'Jeu d\'enchères allemand à 3 joueurs. Le déclarant prend le skat et choisit l\'atout.',
    'catan': 'Construisez colonies, villes et routes pour atteindre 10 points de victoire en premier.',
    'ticket-to-ride': 'Revendiquez des liaisons ferroviaires pour compléter des billets destination.',
    'carcassonne': 'Posez des tuiles pour bâtir un paysage médiéval et marquer des points.',
    'scrabble': 'Formez des mots sur le plateau avec des tuiles-lettres. Les cases premium multiplient les scores.',
    'backgammon': 'Faites avancer vos 15 pièces autour du plateau et sortez-les avant votre adversaire.',
    'sequence': 'Jouez des cartes pour placer des jetons et formez des séquences de cinq.',
    'petanque': 'Lancez les boules le plus près du cochonnet. Première équipe à 13 points gagne.',
    'bowling': 'Suivez vos scores sur 10 carreaux avec strikes et spares.',
    'croquet': 'Frappez les balles dans les arceaux dans l\'ordre avec un maillet.',
  },
}

const es: Messages = {
  nav: { games: 'Juegos', leaderboard: 'Clasificación', myProfile: 'Mi perfil', signOut: 'Cerrar sesión', signIn: 'Iniciar sesión' },
  hero: {
    subtitle: 'El marcador social para juegos físicos. Sigue los puntos, compite con tu grupo y construye tu clasificación global.',
    browseGames: 'Ver juegos',
    signInFree: 'Regístrate gratis',
  },
  home: {
    browseByCategory: 'Explorar por categoría', playNow: 'Jugar ahora', howItWorks: 'Cómo funciona',
    footer: 'Gratis para siempre · who-won.com',
    step1Title: 'Añadir jugadores', step1Desc: 'Inicia sesión con Google, luego añade a tus amigos como jugadores — no necesitan cuentas propias.',
    step2Title: 'Jugar con hojas de puntuación', step2Desc: 'Hojas de puntuación integradas para cada juego — nada de papel.',
    step3Title: 'Seguir tu clasificación', step3Desc: 'Gana puntos Elo por partida. Compara tu posición local y global.',
  },
  games: { title: 'Juegos', bannerSubtitle: 'Elige un juego y empieza a registrar', all: 'Todos', soon: 'Próximamente', comingSoon: 'Próximamente' },
  leaderboard: { title: 'Clasificación global', bannerSubtitle: 'Clasificado por Elo en todos los juegos', sortedByElo: 'Ordenado por clasificación Elo', noPlayers: 'Sin jugadores aún — ¡sé el primero!' },
  game: {
    startGame: 'Iniciar juego', globalLeaderboard: '🏆 Clasificación global', noRatings: 'Sin clasificaciones aún — ¡sé el primero!',
    youMightAlsoLike: 'También te puede gustar', higherIsBetter: '⬆️ Más alto es mejor', lowerIsBetter: '⬇️ Más bajo es mejor',
    players: 'jugadores', yourPlayers: 'Tus jugadores', addPlayerName: 'Añadir nombre de jugador...', add: 'Añadir', cancel: 'Cancelar',
    needAtLeast: 'Se necesitan al menos {n} jugadores para empezar', starting: 'Iniciando...', startWith: 'Iniciar ({n} jugadores)',
    rulesBadge: '📋 Reglas', quickStart: 'Inicio rápido', fullRules: 'Reglas completas', showFullRules: 'Ver reglas completas ▼', hideFullRules: 'Ocultar reglas ▲',
    abandoning: '¿Abandonar partida? No se cambiarán clasificaciones.', finishEarly: 'Terminar antes', completeGame: 'Completar partida',
    yourTurn: 'tu turno', round: 'Ronda', rounds: 'rondas', addRound: 'Añadir ronda',
    gameOver: '¡Juego terminado! Alguien alcanzó {n} puntos.', lowestWins: 'La puntuación más baja gana.',
    shootTheMoon: '¿Shoot the Moon?', moonShot: '{name} disparó a la luna — todos los demás reciben {pts} pts', rulesOption: 'Reglas',
    emailOptional: 'Correo (opcional)', emailHint: 'Para que puedan iniciar sesión y reclamar sus puntos más tarde',
  },
  profile: {
    yourRatings: 'Tus clasificaciones', yourPlayers: 'Tus jugadores', noPlayers: 'Sin jugadores guardados. Se guardan automáticamente al iniciar una partida.',
    recentGames: 'Partidas recientes', memberSince: 'Miembro desde', addEmail: '+ Añadir correo', emailPlaceholder: 'Correo electrónico',
    save: 'Guardar', games: 'partidas', wins: 'victorias', elo: 'Elo', removeConfirm: '¿Eliminar este jugador?',
  },
  category: { dice: 'Juegos de dados', card: 'Juegos de cartas', darts: 'Dardos', board: 'Juegos de mesa', outdoor: 'Exterior', party: 'Juegos de fiesta' },
  login: { subtitle: 'Sigue los puntos, construye tu clasificación y descubre quién es el verdadero campeón.', terms: 'Al iniciar sesión aceptas nuestros términos de servicio. Siempre gratis.', error: 'Algo salió mal. Por favor, inténtalo de nuevo.' },
  gameDesc: {
    'maxi-yatzy': 'El clásico juego de dados con 6 dados y categorías ampliadas: Casa, Torre y bono Maxi Yatzy.',
    'yatzy': 'La versión original con 5 dados. Puntúa en 15 categorías y gana 50 puntos de bonificación con 63+ en la sección superior.',
    'darts-501': 'Empieza en 501 y cuenta hasta llegar a cero exactamente. Debes terminar en un doble. El primero en llegar a cero gana.',
    'hearts': 'Evita los corazones y la Reina de picas. Corazones 10 pts, As de corazones 20 pts, Reina de picas 100 pts, Jota de diamantes −100 pts. Gana la puntuación más baja.',
    'farkle': 'Lanza los dados, acumula puntos y decide cuándo guardar o arriesgar todo. El primero en alcanzar 10 000 puntos gana.',
    'darts-301': 'Como el 501 pero empezando desde 301. Partidas más cortas — debe terminar en un doble.',
    'darts-cricket': 'Cierra los números 15–20 y el bullseye antes que tu rival. Anota puntos en números que tu rival no ha cerrado.',
    'spades': 'Puja por bazas y anota puntos alcanzando tu puja. Picas son siempre triunfo. Primer equipo en 500 gana.',
    'rummy': 'Forma grupos y escaleras para salir antes que tus rivales. El marcador más bajo al final gana.',
    'gin-rummy': 'Rummy para 2. Toca cuando tus cartas sueltas sumen 10 o menos. Gin (0 sueltas) = 25 pts extra.',
    'canasta': 'Forma combinaciones y canastaas de siete cartas. El primer equipo en 5000 puntos gana.',
    'phase-10': 'Completa 10 fases específicas en orden. El marcador más bajo tras todas las fases gana.',
    'uno': 'Empareja cartas por color o número y vacía tu mano primero. El marcador más bajo al llegar a 500 gana.',
    'cabo': 'Mantén tu total bajo, conoce tus cartas y llama Cabo en el momento justo.',
    'cribbage': 'Anota puntos mediante pegging y conteo de mano. El primero en 121 gana.',
    'doppelkopf': 'Juego de bazas alemán para 4. Equipos secretos, triunfos complejos — Re contra Kontra.',
    'skat': 'Juego de pujas alemán para 3. El declarante coge el skat y elige el palo de triunfo.',
    'catan': 'Construye asentamientos, ciudades y caminos para llegar primero a 10 puntos de victoria.',
    'ticket-to-ride': 'Reclama rutas ferroviarias para completar tus billetes de destino y sumar puntos.',
    'carcassonne': 'Coloca fichas para construir un paisaje medieval y puntuar ciudades, caminos y monasterios.',
    'scrabble': 'Forma palabras en el tablero con fichas de letras. Las casillas premium multiplican tu puntuación.',
    'backgammon': 'Mueve tus 15 fichas alrededor del tablero y sácalas antes que tu rival.',
    'sequence': 'Juega cartas para colocar fichas y forma secuencias de cinco en el tablero.',
    'petanque': 'Lanza las bolas más cerca del boliche. El primer equipo en 13 puntos gana.',
    'bowling': 'Registra tus puntuaciones en 10 turnos incluyendo plenos y semiplenos.',
    'croquet': 'Golpea las bolas por los aros en orden con un mazo. El primero en completarlos gana.',
  },
}

export const MESSAGES: Record<Locale, Messages> = { en, no, de, fr, es }

export function getT(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES.en
}

export function tp(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
}
