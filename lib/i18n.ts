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
  },
  category: { dice: 'Dice Games', card: 'Card Games', darts: 'Darts', board: 'Board Games', outdoor: 'Outdoor', party: 'Party Games' },
  login: { subtitle: 'Track scores, build your rating, and see who the real champion is.', terms: 'By signing in you agree to our terms of service. Always free.', error: 'Something went wrong. Please try again.' },
  gameDesc: {
    'maxi-yatzy': 'The classic dice game with 6 dice and expanded categories including House, Tower, and Maxi Yatzy bonus.',
    'yatzy': 'The original 5-dice version. Score in 15 categories and earn a 50-point bonus for 63+ in the upper section.',
    'darts-501': 'Start at 501, count down to exactly zero. Must finish on a double. First to zero wins.',
    'hearts': 'Avoid taking hearts and the Queen of Spades. Hearts 10pts, Ace 20pts, Queen of Spades 100pts, Jack of Diamonds −100pts. Lowest score wins.',
    'farkle': 'Roll dice, score points, and decide when to bank or risk it all. First to reach 10 000 points wins.',
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
  },
  category: { dice: 'Terningspill', card: 'Kortspill', darts: 'Darts', board: 'Brettspill', outdoor: 'Utendørs', party: 'Festspill' },
  login: { subtitle: 'Spor poeng, bygg ratingen din og se hvem som er den virkelige mesteren.', terms: 'Ved å logge inn godtar du våre vilkår. Alltid gratis.', error: 'Noe gikk galt. Prøv igjen.' },
  gameDesc: {
    'maxi-yatzy': 'Det klassiske terningspillet med 6 terninger og utvidede kategorier inkludert Hytte, Tårn og Maxi Yatzy-bonus.',
    'yatzy': 'Den originale 5-terningsversjonen. Poengscor i 15 kategorier og tjen 50 bonuspoeng for 63+ i øvre seksjon.',
    'darts-501': 'Start på 501 og tell ned til nøyaktig null. Må avslutte med dobling. Første til null vinner.',
    'hearts': 'Unngå å ta hjerter og Spardam. Hjerter 10 poeng, Hjerteress 20 poeng, Spardam 100 poeng, Ruterknekt −100 poeng. Lavest poeng vinner.',
    'farkle': 'Kast terninger, samle poeng og bestem når du banker eller risikerer alt. Første til 10 000 poeng vinner.',
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
  },
  category: { dice: 'Würfelspiele', card: 'Kartenspiele', darts: 'Darts', board: 'Brettspiele', outdoor: 'Outdoor', party: 'Partyspiele' },
  login: { subtitle: 'Verfolge Punkte, baue deine Wertung auf und sieh, wer der wahre Champion ist.', terms: 'Durch die Anmeldung stimmst du unseren Nutzungsbedingungen zu. Immer kostenlos.', error: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.' },
  gameDesc: {
    'maxi-yatzy': 'Das klassische Würfelspiel mit 6 Würfeln und erweiterten Kategorien wie Haus, Turm und Maxi-Yatzy-Bonus.',
    'yatzy': 'Die originale 5-Würfel-Version. Wertung in 15 Kategorien und 50 Bonuspunkte bei 63+ im oberen Bereich.',
    'darts-501': 'Starte bei 501 und zähle auf genau null herunter. Muss auf einem Doppel enden. Wer zuerst null erreicht, gewinnt.',
    'hearts': 'Vermeide Herzen und die Pik-Dame. Herz 10 Pkt., Herz-As 20 Pkt., Pik-Dame 100 Pkt., Karo-Bube −100 Pkt. Niedrigste Punktzahl gewinnt.',
    'farkle': 'Würfle, sammle Punkte und entscheide, wann du bankst oder alles riskierst. Wer zuerst 10 000 Punkte erreicht, gewinnt.',
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
  },
  category: { dice: 'Jeux de dés', card: 'Jeux de cartes', darts: 'Fléchettes', board: 'Jeux de plateau', outdoor: 'Plein air', party: 'Jeux de société' },
  login: { subtitle: 'Suivez les scores, construisez votre classement et voyez qui est le vrai champion.', terms: 'En vous connectant, vous acceptez nos conditions d\'utilisation. Toujours gratuit.', error: 'Quelque chose s\'est mal passé. Veuillez réessayer.' },
  gameDesc: {
    'maxi-yatzy': 'Le jeu de dés classique avec 6 dés et des catégories étendues : Maison, Tour et bonus Maxi Yatzy.',
    'yatzy': 'La version originale à 5 dés. Marquez dans 15 catégories et gagnez 50 points de bonus si la section supérieure atteint 63+.',
    'darts-501': 'Commencez à 501 et descendez à zéro exactement. Terminez sur un double. Le premier à zéro gagne.',
    'hearts': 'Évitez les cœurs et la Dame de pique. Cœurs 10 pts, As de cœur 20 pts, Dame de pique 100 pts, Valet de carreau −100 pts. Le score le plus bas gagne.',
    'farkle': 'Lancez les dés, marquez des points et décidez quand encaisser ou tout risquer. Le premier à 10 000 points gagne.',
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
  },
  category: { dice: 'Juegos de dados', card: 'Juegos de cartas', darts: 'Dardos', board: 'Juegos de mesa', outdoor: 'Exterior', party: 'Juegos de fiesta' },
  login: { subtitle: 'Sigue los puntos, construye tu clasificación y descubre quién es el verdadero campeón.', terms: 'Al iniciar sesión aceptas nuestros términos de servicio. Siempre gratis.', error: 'Algo salió mal. Por favor, inténtalo de nuevo.' },
  gameDesc: {
    'maxi-yatzy': 'El clásico juego de dados con 6 dados y categorías ampliadas: Casa, Torre y bono Maxi Yatzy.',
    'yatzy': 'La versión original con 5 dados. Puntúa en 15 categorías y gana 50 puntos de bonificación con 63+ en la sección superior.',
    'darts-501': 'Empieza en 501 y cuenta hasta llegar a cero exactamente. Debes terminar en un doble. El primero en llegar a cero gana.',
    'hearts': 'Evita los corazones y la Reina de picas. Corazones 10 pts, As de corazones 20 pts, Reina de picas 100 pts, Jota de diamantes −100 pts. Gana la puntuación más baja.',
    'farkle': 'Lanza los dados, acumula puntos y decide cuándo guardar o arriesgar todo. El primero en alcanzar 10 000 puntos gana.',
  },
}

export const MESSAGES: Record<Locale, Messages> = { en, no, de, fr, es }

export function getT(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES.en
}

export function tp(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
}
