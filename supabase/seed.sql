-- MoveSmart demo data for Kigali.
-- Run this AFTER the files in supabase/migrations (in date order), in the Supabase SQL editor.
-- Safe to run more than once.

insert into public.routes (name, start_point, end_point, start_latitude, start_longitude, end_latitude, end_longitude, distance_km, estimated_duration_minutes, base_fare, is_active)
select * from (values
  ('Nyabugogo – Kimironko', 'Nyabugogo Bus Park', 'Kimironko Market', -1.9395, 30.0445, -1.9496, 30.1260, 11.2, 35, 449, true),
  ('Remera – Downtown', 'Remera (Giporoso)', 'Downtown (City Centre)', -1.9585, 30.1120, -1.9441, 30.0619, 6.8, 22, 307, true),
  ('Kicukiro – Nyamirambo', 'Kicukiro Centre', 'Nyamirambo', -1.9740, 30.1030, -1.9780, 30.0420, 9.5, 30, 409, true),
  ('Nyabugogo – Kicukiro', 'Nyabugogo Bus Park', 'Kicukiro Centre', -1.9395, 30.0445, -1.9740, 30.1030, 10.4, 33, 430, true),
  ('Downtown – Kimihurura', 'Downtown (City Centre)', 'Kimihurura', -1.9441, 30.0619, -1.9530, 30.0890, 4.2, 15, 256, true)
) as v(name, sp, ep, sla, slo, ela, elo, d, m, f, a)
where not exists (select 1 from public.routes r where r.name = v.name);

insert into public.vehicles (license_plate, model, vehicle_type, capacity, current_latitude, current_longitude, is_active, last_location_update)
values
  ('RAD 512 B', 'Yutong ZK6729 (Kigali Bus Services)', 'bus', 30, -1.9401, 30.0460, true, now()),
  ('RAC 781 K', 'Coaster (Royal Express)', 'bus', 29, -1.9570, 30.1105, true, now()),
  ('RAE 230 A', 'Toyota Corolla', 'taxi', 4, -1.9445, 30.0610, true, now()),
  ('RAF 118 C', 'Toyota RAV4', 'taxi', 4, -1.9500, 30.0900, true, now()),
  ('RAD 904 M', 'Hyundai Elantra', 'taxi', 4, -1.9735, 30.1025, true, now()),
  ('RB 455 Z', 'TVS Apache 150 (moto)', 'motorbike', 1, -1.9490, 30.1240, true, now()),
  ('RB 812 Y', 'Bajaj Boxer (moto)', 'motorbike', 1, -1.9775, 30.0430, true, now()),
  ('RB 301 X', 'Honda CB125 (moto)', 'motorbike', 1, -1.9430, 30.0590, true, now())
on conflict (license_plate) do nothing;

-- Sample Community Eyes reports
insert into public.community_reports (user_id, report_type, description, map_x, map_y, severity, confirms, cleared, created_at)
select null, v.t, v.d, v.x, v.y, v.s, v.c, 0, now() - v.ago
from (values
  ('Flooding', 'Water across one lane after the last storm, passable slowly.', 300, 262, 2, 2, interval '40 minutes'),
  ('Road damage', 'Deep pothole cluster in the right lane.', 626, 572, 1, 4, interval '3 hours'),
  ('Blocked road', 'Truck broken down at the junction, traffic squeezing past.', 712, 262, 2, 0, interval '15 minutes')
) as v(t, d, x, y, s, c, ago)
where not exists (select 1 from public.community_reports);

-- Demo login: create it in the Supabase dashboard under
-- Authentication > Users > Add user, with email demo@movesmart.rw and
-- password MoveSmart@2026, and tick "Auto confirm user".
