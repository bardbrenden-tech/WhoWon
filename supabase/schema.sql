-- who-won.com database schema
-- Run this in Supabase SQL Editor

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Guest players (sub-players under a user account)
create table guest_players (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  email text,
  avatar_color text default '#6366f1',
  created_at timestamptz default now()
);
alter table guest_players enable row level security;
create policy "Users can manage own guest players" on guest_players
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
create policy "Guest players visible to all authenticated users" on guest_players
  for select using (auth.role() = 'authenticated');

-- Games registry
create table games (
  id text primary key,
  name text not null,
  name_alt text,
  category text not null,
  description text,
  min_players int default 2,
  max_players int default 8,
  higher_is_better boolean default true,
  active boolean default false,
  sort_order int default 99,
  icon text default '🎮'
);

-- Seed V1 games
insert into games (id, name, name_alt, category, description, min_players, max_players, higher_is_better, active, sort_order, icon) values
  ('maxi-yatzy', 'Maxi Yatzy', 'Yatzy Maxi', 'dice', 'The classic dice game with 6 dice and expanded categories including House, Tower, and Maxi Yatzy bonus.', 2, 8, true, true, 1, '🎲'),
  ('yatzy', 'Yatzy', 'Yahtzee', 'dice', 'The original 5-dice version of Yatzy. Score in 15 categories, get a bonus for 63+ in the upper section.', 2, 8, true, true, 2, '🎲'),
  ('darts-501', 'Darts 501', 'Darts', 'darts', 'Start at 501, count down to exactly zero. Must finish on a double. First to zero wins.', 2, 8, false, true, 3, '🎯'),
  ('hearts', 'Hearts', 'Spardam', 'card', 'Avoid taking hearts and the Queen of Spades. Shoot the moon to give everyone else 26 points. Lowest score wins.', 3, 6, false, true, 4, '♥️'),
  ('farkle', 'Farkle / 10 000', '10 000', 'dice', 'Roll dice, score points, and decide when to bank or risk it all. First to 10 000 wins.', 2, 8, true, true, 5, '🎲');

-- Future games (coming soon)
insert into games (id, name, name_alt, category, description, min_players, max_players, higher_is_better, active, sort_order, icon) values
  ('spades', 'Spades', null, 'card', 'Bid on tricks and score points for making your bid.', 4, 4, true, false, 10, '♠️'),
  ('rummy', 'Rummy', 'Remi', 'card', 'Form sets and runs to empty your hand.', 2, 6, false, false, 11, '🃏'),
  ('gin-rummy', 'Gin Rummy', null, 'card', 'Two-player rummy with knocking and gin bonuses.', 2, 2, false, false, 12, '🃏'),
  ('canasta', 'Canasta', null, 'card', 'Form melds of seven cards to score points.', 2, 6, true, false, 13, '🃏'),
  ('phase-10', 'Phase 10', null, 'card', 'Complete 10 phases of specific card combinations.', 2, 6, false, false, 14, '🃏'),
  ('uno', 'UNO', null, 'card', 'Track penalty points — lowest score wins.', 2, 10, false, false, 15, '🃏'),
  ('cabo', 'Cabo', null, 'card', 'Know your cards, minimise your score, and call Cabo at the right time.', 2, 8, false, false, 16, '🃏'),
  ('cribbage', 'Cribbage', null, 'card', 'Score points through combinations and pegging in this classic two-player game.', 2, 4, true, false, 17, '🃏'),
  ('doppelkopf', 'Doppelkopf', null, 'card', 'Popular German trick-taking game for 4 players.', 4, 4, true, false, 18, '🃏'),
  ('skat', 'Skat', null, 'card', 'Competitive German card game with bidding and trump.', 3, 3, true, false, 19, '🃏'),
  ('darts-cricket', 'Darts Cricket', null, 'darts', 'Close numbers 15–20 and the bullseye before your opponent.', 2, 6, true, false, 20, '🎯'),
  ('darts-301', 'Darts 301', null, 'darts', 'Like 501 but starting from 301.', 2, 8, false, false, 21, '🎯'),
  ('catan', 'Catan', 'Settlers of Catan', 'board', 'Build settlements, cities, and roads to reach 10 victory points first.', 3, 4, true, false, 30, '🏘️'),
  ('ticket-to-ride', 'Ticket to Ride', null, 'board', 'Claim railway routes across the map to complete destination tickets.', 2, 5, true, false, 31, '🚂'),
  ('carcassonne', 'Carcassonne', null, 'board', 'Build the medieval landscape tile by tile, scoring cities, roads, and monasteries.', 2, 5, true, false, 32, '🏰'),
  ('scrabble', 'Scrabble', null, 'board', 'Score points by placing words on the board, using high-value letters strategically.', 2, 4, true, false, 33, '🔤'),
  ('backgammon', 'Backgammon', null, 'board', 'Race your pieces home and bear them off before your opponent.', 2, 2, true, false, 34, '🎲'),
  ('sequence', 'Sequence', null, 'board', 'Play cards to place chips on the board and form sequences of five.', 2, 12, true, false, 35, '🃏'),
  ('petanque', 'Pétanque / Boule', null, 'outdoor', 'Throw metal balls to get closest to the jack. Most points after agreed rounds wins.', 2, 8, true, false, 40, '🎳'),
  ('bowling', 'Bowling', null, 'outdoor', 'Track your bowling scores including strikes, spares, and frames.', 1, 8, true, false, 41, '🎳'),
  ('croquet', 'Croquet', null, 'outdoor', 'Track points as players hit balls through hoops in the correct order.', 2, 6, true, false, 42, '🔨');

-- Sessions (a game being played)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  game_id text references games(id) not null,
  created_by uuid references profiles(id) not null,
  status text default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz default now(),
  completed_at timestamptz
);
alter table sessions enable row level security;
create policy "Sessions viewable by everyone" on sessions for select using (true);
create policy "Authenticated users can create sessions" on sessions for insert with check (auth.uid() = created_by);
create policy "Session creator can update" on sessions for update using (auth.uid() = created_by);

-- Session participants
create table session_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  profile_id uuid references profiles(id),
  guest_player_id uuid references guest_players(id),
  display_name text not null,
  score_data jsonb default '{}',
  final_score int,
  rank int,
  elo_before int default 1000,
  elo_after int,
  constraint exactly_one_identity check (
    (profile_id is null) != (guest_player_id is null)
  )
);
alter table session_players enable row level security;
create policy "Session players viewable by everyone" on session_players for select using (true);
create policy "Session creator can manage players" on session_players
  for all using (
    auth.uid() = (select created_by from sessions where id = session_id)
  );

-- Elo ratings per player per game
create table ratings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  guest_player_id uuid references guest_players(id),
  game_id text references games(id) not null,
  rating int default 1000,
  games_played int default 0,
  wins int default 0,
  updated_at timestamptz default now(),
  constraint exactly_one_identity check (
    (profile_id is null) != (guest_player_id is null)
  ),
  unique nulls not distinct (profile_id, game_id),
  unique nulls not distinct (guest_player_id, game_id)
);
alter table ratings enable row level security;
create policy "Ratings viewable by everyone" on ratings for select using (true);
create policy "System can manage ratings" on ratings for all using (true);

-- User feedback
create table feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  game_id text references games(id),
  page_path text,
  category text check (category in ('bug', 'feature', 'design', 'rules', 'other')),
  message text not null,
  status text default 'new' check (status in ('new', 'reviewed', 'done')),
  created_at timestamptz default now()
);
alter table feedback enable row level security;
create policy "Anyone can submit feedback" on feedback for insert with check (true);
create policy "Only service role can read feedback" on feedback for select using (auth.role() = 'service_role');

-- ============================================================
-- TOURNAMENTS (run this migration block in Supabase SQL Editor)
-- ============================================================

create table tournaments (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  name text,
  created_by uuid references profiles(id) not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now()
);
alter table tournaments enable row level security;
create policy "Tournaments viewable by everyone" on tournaments for select using (true);
create policy "Auth users can create tournaments" on tournaments for insert with check (auth.uid() = created_by);
create policy "Creator can update tournament" on tournaments for update using (auth.uid() = created_by);

create table tournament_players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  profile_id uuid references profiles(id),
  guest_player_id uuid references guest_players(id),
  display_name text not null,
  seed int not null
);
alter table tournament_players enable row level security;
create policy "Tournament players viewable by everyone" on tournament_players for select using (true);
create policy "Auth users can insert tournament players" on tournament_players for insert with check (true);

create table tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade not null,
  round int not null,
  match_index int not null,
  player1_id uuid references tournament_players(id),
  player2_id uuid references tournament_players(id),
  winner_id uuid references tournament_players(id),
  score text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'bye')),
  created_at timestamptz not null default now()
);
alter table tournament_matches enable row level security;
create policy "Tournament matches viewable by everyone" on tournament_matches for select using (true);
create policy "Auth users can manage matches" on tournament_matches for all using (true);

-- ============================================================

-- ============================================================
-- Multi-game challenges
-- Run this migration if upgrading from single-tournament schema

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now()
);
alter table challenges enable row level security;
create policy "Challenges viewable by everyone" on challenges for select using (true);
create policy "Auth users create challenges" on challenges for insert to authenticated with check (auth.uid() = created_by);
create policy "Creator updates challenges" on challenges for update to authenticated using (auth.uid() = created_by);

create table if not exists challenge_players (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  display_name text not null,
  profile_id uuid references auth.users(id),
  guest_player_id uuid references guest_players(id)
);
alter table challenge_players enable row level security;
create policy "Challenge players viewable by everyone" on challenge_players for select using (true);
create policy "Auth users manage challenge players" on challenge_players for all to authenticated
  using (challenge_id in (select id from challenges where created_by = auth.uid()))
  with check (challenge_id in (select id from challenges where created_by = auth.uid()));

create table if not exists challenge_games (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  game_id text not null,
  order_index int not null default 0,
  tournament_id uuid references tournaments(id)
);
alter table challenge_games enable row level security;
create policy "Challenge games viewable by everyone" on challenge_games for select using (true);
create policy "Auth users manage challenge games" on challenge_games for all to authenticated
  using (challenge_id in (select id from challenges where created_by = auth.uid()))
  with check (challenge_id in (select id from challenges where created_by = auth.uid()));

-- Link tournament players back to the challenge player they represent
alter table tournament_players add column if not exists challenge_player_id uuid references challenge_players(id);

-- ============================================================

-- Game star ratings
create table game_ratings (
  profile_id uuid references profiles(id),
  game_id text references games(id),
  rating int check (rating between 1 and 5),
  created_at timestamptz default now(),
  primary key (profile_id, game_id)
);
alter table game_ratings enable row level security;
create policy "Game ratings viewable by everyone" on game_ratings for select using (true);
create policy "Authenticated users can rate games" on game_ratings
  for all using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
