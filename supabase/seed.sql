-- MoveSmart demo data for Rwanda.
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

-- Intercity bus routes from Kigali (demo fares, not official RURA tariffs)
insert into public.routes (name, start_point, end_point, start_latitude, start_longitude, end_latitude, end_longitude, distance_km, estimated_duration_minutes, base_fare, is_active)
select * from (values
  ('Kigali – Musanze', 'Nyabugogo Bus Park', 'Musanze bus park', -1.9395, 30.0445, -1.4996, 29.6344, 94, 130, 2550, true),
  ('Kigali – Huye', 'Nyabugogo Bus Park', 'Huye bus park', -1.9395, 30.0445, -2.5967, 29.7394, 113, 153, 3000, true),
  ('Kigali – Rubavu', 'Nyabugogo Bus Park', 'Rubavu bus park', -1.9395, 30.0445, -1.6944, 29.2564, 128, 172, 3400, true),
  ('Kigali – Rwamagana', 'Nyabugogo Bus Park', 'Rwamagana bus park', -1.9395, 30.0445, -1.9487, 30.4347, 58, 85, 1650, true),
  ('Kigali – Nyagatare', 'Nyabugogo Bus Park', 'Nyagatare bus park', -1.9395, 30.0445, -1.2938, 30.3275, 110, 150, 2950, true),
  ('Kigali – Rusizi', 'Nyabugogo Bus Park', 'Rusizi bus park', -1.9395, 30.0445, -2.4846, 28.9075, 196, 253, 5100, true)
) as v(name, sp, ep, sla, slo, ela, elo, d, m, f, a)
where not exists (select 1 from public.routes r where r.name = v.name);

-- Vehicles in towns outside Kigali
insert into public.vehicles (license_plate, model, vehicle_type, capacity, current_latitude, current_longitude, is_active, last_location_update)
values
  ('RAD 615 N', 'Coaster (Volcano Express)', 'bus', 29, -1.4990, 29.6350, true, now()),
  ('RB 221 M', 'TVS Apache 150 (moto)', 'motorbike', 1, -1.5010, 29.6320, true, now()),
  ('RAE 742 H', 'Toyota Corolla', 'taxi', 4, -2.5960, 29.7400, true, now()),
  ('RB 518 H', 'Bajaj Boxer (moto)', 'motorbike', 1, -2.5980, 29.7380, true, now()),
  ('RAC 309 H', 'Yutong ZK6729', 'bus', 30, -2.5950, 29.7410, true, now()),
  ('RB 633 G', 'Honda CB125 (moto)', 'motorbike', 1, -1.6950, 29.2570, true, now()),
  ('RAF 455 G', 'Toyota RAV4', 'taxi', 4, -1.6940, 29.2600, true, now()),
  ('RB 107 R', 'TVS Apache 150 (moto)', 'motorbike', 1, -1.9490, 30.4350, true, now()),
  ('RAD 870 E', 'Coaster (Horizon Express)', 'bus', 29, -1.2940, 30.3280, true, now()),
  ('RB 940 E', 'Bajaj Boxer (moto)', 'motorbike', 1, -1.2950, 30.3260, true, now()),
  ('RAE 118 W', 'Toyota Corolla', 'taxi', 4, -2.4840, 28.9080, true, now()),
  ('RB 377 W', 'Honda CB125 (moto)', 'motorbike', 1, -2.4850, 28.9070, true, now()),
  ('RB 590 S', 'TVS Apache 150 (moto)', 'motorbike', 1, -2.0840, 29.7570, true, now()),
  ('RAF 602 S', 'Toyota Corolla', 'taxi', 4, -2.0850, 29.7560, true, now())
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
