import type { GameCategory, GameMeta } from './types'

export const CATEGORIES: { id: GameCategory; label: string; icon: string }[] = [
  { id: 'dice',    label: 'Dice Games',    icon: '🎲' },
  { id: 'card',    label: 'Card Games',    icon: '🃏' },
  { id: 'darts',   label: 'Darts',         icon: '🎯' },
  { id: 'board',   label: 'Board Games',   icon: '♟️' },
  { id: 'outdoor', label: 'Outdoor',       icon: '🌿' },
  { id: 'party',   label: 'Party Games',   icon: '🎉' },
]

export const GAMES: GameMeta[] = [
  { id: 'maxi-yatzy', name: 'Maxi Yatzy',      name_alt: 'Yatzy Maxi',         category: 'dice',   description: 'The classic dice game with 6 dice and expanded categories including House, Tower, and Maxi Yatzy bonus.',                          min_players: 2, max_players: 8, higher_is_better: true,  active: true,  sort_order: 1,  icon: '🎲' },
  { id: 'yatzy',      name: 'Yatzy',            name_alt: 'Yahtzee',            category: 'dice',   description: 'The original 5-dice version. Score in 15 categories and earn a 50-point bonus for 63+ in the upper section.',                     min_players: 2, max_players: 8, higher_is_better: true,  active: true,  sort_order: 2,  icon: '🎲' },
  { id: 'darts-501',  name: 'Darts 501',        name_alt: 'Darts',              category: 'darts',  description: 'Start at 501, count down to exactly zero. Must finish on a double. First to zero wins.',                                         min_players: 2, max_players: 8, higher_is_better: false, active: true,  sort_order: 3,  icon: '🎯' },
  { id: 'hearts',     name: 'Hearts',           name_alt: 'Spardam',            category: 'card',   description: 'Avoid taking hearts and the Queen of Spades. Shoot the moon to give everyone else 26 points. Lowest score wins.',                 min_players: 3, max_players: 6, higher_is_better: false, active: true,  sort_order: 4,  icon: '♥️' },
  { id: 'farkle',     name: 'Farkle / 10 000',  name_alt: '10 000',             category: 'dice',   description: 'Roll dice, score points, and decide when to bank or risk it all. First to reach 10 000 points wins.',                            min_players: 2, max_players: 8, higher_is_better: true,  active: true,  sort_order: 5,  icon: '🎲' },
  { id: 'spades',     name: 'Spades',           name_alt: null,                 category: 'card',   description: 'Bid on tricks and score points for making your bid. Spades are always trump.',                                                    min_players: 4, max_players: 4, higher_is_better: true,  active: false, sort_order: 10, icon: '♠️' },
  { id: 'rummy',      name: 'Rummy',            name_alt: 'Remi',               category: 'card',   description: 'Form sets and runs to empty your hand before your opponents.',                                                                    min_players: 2, max_players: 6, higher_is_better: false, active: false, sort_order: 11, icon: '🃏' },
  { id: 'gin-rummy',  name: 'Gin Rummy',        name_alt: null,                 category: 'card',   description: 'Two-player rummy with knocking and gin bonuses.',                                                                                 min_players: 2, max_players: 2, higher_is_better: true,  active: false, sort_order: 12, icon: '🃏' },
  { id: 'canasta',    name: 'Canasta',          name_alt: null,                 category: 'card',   description: 'Form melds of seven cards to score points. First to 5000 wins.',                                                                  min_players: 2, max_players: 6, higher_is_better: true,  active: false, sort_order: 13, icon: '🃏' },
  { id: 'phase-10',   name: 'Phase 10',         name_alt: null,                 category: 'card',   description: 'Complete 10 phases of specific card combinations before your opponents.',                                                         min_players: 2, max_players: 6, higher_is_better: false, active: false, sort_order: 14, icon: '🃏' },
  { id: 'uno',        name: 'UNO',              name_alt: null,                 category: 'card',   description: 'Track penalty points across rounds — lowest score when someone reaches 500 wins.',                                                min_players: 2, max_players: 10, higher_is_better: false, active: false, sort_order: 15, icon: '🃏' },
  { id: 'cabo',       name: 'Cabo',             name_alt: null,                 category: 'card',   description: 'Know your cards, minimise your score, and call Cabo at the right time.',                                                          min_players: 2, max_players: 8, higher_is_better: false, active: false, sort_order: 16, icon: '🃏' },
  { id: 'cribbage',   name: 'Cribbage',         name_alt: null,                 category: 'card',   description: 'Score points through combinations and pegging in this classic two-player game.',                                                  min_players: 2, max_players: 4, higher_is_better: true,  active: false, sort_order: 17, icon: '🃏' },
  { id: 'doppelkopf', name: 'Doppelkopf',       name_alt: null,                 category: 'card',   description: 'Popular German trick-taking game for exactly 4 players with complex trump rules.',                                                min_players: 4, max_players: 4, higher_is_better: true,  active: false, sort_order: 18, icon: '🃏' },
  { id: 'skat',       name: 'Skat',             name_alt: null,                 category: 'card',   description: 'Competitive German card game with bidding and trump for exactly 3 players.',                                                      min_players: 3, max_players: 3, higher_is_better: true,  active: false, sort_order: 19, icon: '🃏' },
  { id: 'darts-cricket', name: 'Darts Cricket', name_alt: null,                 category: 'darts',  description: 'Close numbers 15–20 and the bullseye before your opponent.',                                                                     min_players: 2, max_players: 6, higher_is_better: true,  active: false, sort_order: 20, icon: '🎯' },
  { id: 'darts-301',  name: 'Darts 301',        name_alt: null,                 category: 'darts',  description: 'Like 501 but starting from 301. Must finish on a double.',                                                                       min_players: 2, max_players: 8, higher_is_better: false, active: false, sort_order: 21, icon: '🎯' },
  { id: 'catan',      name: 'Catan',            name_alt: 'Settlers of Catan',  category: 'board',  description: 'Build settlements, cities, and roads to reach 10 victory points first.',                                                          min_players: 3, max_players: 4, higher_is_better: true,  active: false, sort_order: 30, icon: '🏘️' },
  { id: 'ticket-to-ride', name: 'Ticket to Ride', name_alt: null,              category: 'board',  description: 'Claim railway routes across the map to complete destination tickets.',                                                             min_players: 2, max_players: 5, higher_is_better: true,  active: false, sort_order: 31, icon: '🚂' },
  { id: 'carcassonne', name: 'Carcassonne',     name_alt: null,                 category: 'board',  description: 'Build the medieval landscape tile by tile, scoring cities, roads, and monasteries.',                                              min_players: 2, max_players: 5, higher_is_better: true,  active: false, sort_order: 32, icon: '🏰' },
  { id: 'scrabble',   name: 'Scrabble',         name_alt: null,                 category: 'board',  description: 'Score points by placing words on the board, using high-value letters strategically.',                                             min_players: 2, max_players: 4, higher_is_better: true,  active: false, sort_order: 33, icon: '🔤' },
  { id: 'backgammon', name: 'Backgammon',       name_alt: null,                 category: 'board',  description: 'Race your pieces home and bear them off before your opponent.',                                                                   min_players: 2, max_players: 2, higher_is_better: true,  active: false, sort_order: 34, icon: '🎲' },
  { id: 'sequence',   name: 'Sequence',         name_alt: null,                 category: 'board',  description: 'Play cards to place chips on the board and form sequences of five.',                                                              min_players: 2, max_players: 12, higher_is_better: true,  active: false, sort_order: 35, icon: '🃏' },
  { id: 'petanque',   name: 'Pétanque / Boule', name_alt: 'Boule',              category: 'outdoor', description: 'Throw metal balls to get closest to the jack. Most points after agreed rounds wins.',                                           min_players: 2, max_players: 8, higher_is_better: true,  active: false, sort_order: 40, icon: '🎳' },
  { id: 'bowling',    name: 'Bowling',          name_alt: null,                 category: 'outdoor', description: 'Track your bowling scores including strikes, spares, and frames.',                                                               min_players: 1, max_players: 8, higher_is_better: true,  active: false, sort_order: 41, icon: '🎳' },
  { id: 'croquet',    name: 'Croquet',          name_alt: null,                 category: 'outdoor', description: 'Track points as players hit balls through hoops in the correct order.',                                                          min_players: 2, max_players: 6, higher_is_better: true,  active: false, sort_order: 42, icon: '🔨' },
]

export function getGame(id: string): GameMeta | undefined {
  return GAMES.find(g => g.id === id)
}

export function getGamesByCategory(category: GameCategory): GameMeta[] {
  return GAMES.filter(g => g.category === category).sort((a, b) => a.sort_order - b.sort_order)
}

export function getActiveGames(): GameMeta[] {
  return GAMES.filter(g => g.active).sort((a, b) => a.sort_order - b.sort_order)
}
