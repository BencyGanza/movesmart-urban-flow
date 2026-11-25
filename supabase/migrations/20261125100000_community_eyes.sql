-- Community Eyes: road reports shared between riders, with one vote per user per report.

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  report_type text not null check (report_type in ('Road damage','Accident','Flooding','Landslide','Blocked road','Dangerous weather','Other hazard')),
  description text not null check (char_length(description) between 3 and 280),
  map_x numeric not null check (map_x between -200 and 1200),
  map_y numeric not null check (map_y between -200 and 900),
  severity smallint not null check (severity between 1 and 3),
  photo text check (photo is null or (photo like 'data:image/%' and char_length(photo) < 400000)),
  confirms integer not null default 0,
  cleared integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.community_report_votes (
  report_id uuid not null references public.community_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  vote text not null check (vote in ('confirm','cleared')),
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

alter table public.community_reports enable row level security;
alter table public.community_report_votes enable row level security;

drop policy if exists "Anyone can read community reports" on public.community_reports;
create policy "Anyone can read community reports" on public.community_reports for select using (true);

drop policy if exists "Signed-in users can post reports" on public.community_reports;
create policy "Signed-in users can post reports" on public.community_reports for insert to authenticated
  with check (user_id = auth.uid() and confirms = 0 and cleared = 0);

drop policy if exists "Signed-in users can vote once" on public.community_report_votes;
create policy "Signed-in users can vote once" on public.community_report_votes for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can see their own votes" on public.community_report_votes;
create policy "Users can see their own votes" on public.community_report_votes for select to authenticated
  using (user_id = auth.uid());

grant select on public.community_reports to anon, authenticated;
grant insert on public.community_reports to authenticated;
grant select, insert on public.community_report_votes to authenticated;

-- Vote counts can only change through votes, never by editing the report.
create or replace function public.count_community_vote() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.vote = 'confirm' then
    update public.community_reports set confirms = confirms + 1 where id = new.report_id;
  else
    update public.community_reports set cleared = cleared + 1 where id = new.report_id;
  end if;
  return new;
end $$;
revoke all on function public.count_community_vote() from public;

drop trigger if exists on_community_vote on public.community_report_votes;
create trigger on_community_vote after insert on public.community_report_votes
  for each row execute function public.count_community_vote();
