export type GameCategory = 'dice' | 'card' | 'board' | 'darts' | 'outdoor' | 'party' | 'sport' | 'puzzle'

export interface GameMeta {
  id: string
  name: string
  name_alt: string | null
  category: GameCategory
  description: string
  min_players: number
  max_players: number
  higher_is_better: boolean
  active: boolean
  sort_order: number
  icon: string
}

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
}

export interface GuestPlayer {
  id: string
  owner_id: string
  name: string
  avatar_color: string
  created_at: string
}

export type ParticipantType = 'user' | 'guest'

export interface SessionPlayer {
  id: string
  session_id: string
  profile_id: string | null
  guest_player_id: string | null
  display_name: string
  score_data: Record<string, unknown>
  final_score: number | null
  rank: number | null
  elo_before: number
  elo_after: number | null
}

export interface Session {
  id: string
  game_id: string
  created_by: string
  status: 'active' | 'completed' | 'abandoned'
  options: Record<string, unknown>
  created_at: string
  completed_at: string | null
  session_players?: SessionPlayer[]
  games?: GameMeta
}

export interface Rating {
  id: string
  profile_id: string | null
  guest_player_id: string | null
  game_id: string
  rating: number
  games_played: number
  wins: number
  updated_at: string
  profiles?: Profile
  guest_players?: GuestPlayer
}

export interface Tournament {
  id: string
  game_id: string
  name: string | null
  created_by: string
  status: 'active' | 'completed'
  created_at: string
}

export interface TournamentPlayer {
  id: string
  tournament_id: string
  profile_id: string | null
  guest_player_id: string | null
  display_name: string
  seed: number
  challenge_player_id?: string | null
}

export interface TournamentMatch {
  id: string
  tournament_id: string
  round: number
  match_index: number
  player1_id: string | null
  player2_id: string | null
  winner_id: string | null
  score: string | null
  status: 'pending' | 'completed' | 'bye'
  player1?: TournamentPlayer
  player2?: TournamentPlayer
  winner?: TournamentPlayer
}

export interface Challenge {
  id: string
  name: string
  created_by: string
  status: 'active' | 'completed'
  created_at: string
}

export interface ChallengePlayer {
  id: string
  challenge_id: string
  display_name: string
  profile_id: string | null
  guest_player_id: string | null
}

export interface ChallengeGame {
  id: string
  challenge_id: string
  game_id: string
  order_index: number
  tournament_id: string | null
}

export interface Standing {
  challengePlayerId: string
  displayName: string
  points: number
  placements: Record<string, number>
}

export interface Feedback {
  id: string
  profile_id: string | null
  game_id: string | null
  page_path: string | null
  category: 'bug' | 'feature' | 'design' | 'rules' | 'other'
  message: string
  status: 'new' | 'reviewed' | 'done'
  created_at: string
}

export interface GameRating {
  profile_id: string
  game_id: string
  rating: number
  created_at: string
}

export interface LeaderboardEntry {
  rank: number
  display_name: string
  rating: number
  games_played: number
  wins: number
  profile_id: string | null
  guest_player_id: string | null
}

export interface GameComponentProps {
  players: SessionPlayer[]
  options: Record<string, unknown>
  onScoreUpdate: (playerId: string, scoreData: Record<string, unknown>) => void
  onComplete: (results: Array<{ id: string; finalScore: number; rank: number }>) => void
  onAbandon: () => void
}
