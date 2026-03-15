-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) primary key,
  display_name text not null,
  street_name text not null,
  geohash text not null,
  photo_url text,
  created_at timestamptz default now()
);

create index users_geohash_idx on public.users (geohash);

-- Posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  content text not null check (char_length(content) <= 500),
  geohash text not null,
  reply_count int default 0,
  created_at timestamptz default now()
);

create index posts_geohash_idx on public.posts (geohash);
create index posts_created_at_idx on public.posts (created_at desc);

-- Replies
create table public.replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz default now()
);

create index replies_post_id_idx on public.replies (post_id);

-- Invite tokens
create table public.invite_tokens (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.users(id),
  geohash text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- Auto-increment reply_count
create function increment_reply_count()
returns trigger language plpgsql as $$
begin
  update public.posts set reply_count = reply_count + 1 where id = new.post_id;
  return new;
end;
$$;

create trigger on_reply_insert
  after insert on public.replies
  for each row execute procedure increment_reply_count();

-- Trigger: auto-create public.users row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, display_name, street_name, geohash)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'neighbor'),
    '',
    coalesce(new.raw_user_meta_data->>'geohash', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.invite_tokens enable row level security;

-- Policies
create policy "read users" on public.users
  for select using (auth.role() = 'authenticated');

create policy "insert own user" on public.users
  for insert with check (auth.uid() = id);

create policy "read posts" on public.posts
  for select using (auth.role() = 'authenticated');

create policy "insert own posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "read replies" on public.replies
  for select using (auth.role() = 'authenticated');

create policy "insert own replies" on public.replies
  for insert with check (auth.uid() = user_id);

create policy "read invite tokens" on public.invite_tokens
  for select using (auth.role() = 'authenticated');

create policy "insert own invite tokens" on public.invite_tokens
  for insert with check (auth.role() = 'authenticated');

create policy "update invite tokens" on public.invite_tokens
  for update using (auth.role() = 'authenticated');
