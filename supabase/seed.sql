-- Seed para desarrollo local (`supabase db reset`).
-- En producción/staging, los mismos datos base se aplican con la migración
-- 00000000000003_seed_base.sql (idempotente, `on conflict do nothing`).

insert into categories (name, slug, sort_order) values
  ('Caldo de gallina', 'caldo-de-gallina', 1),
  ('Mostritos',        'mostritos',        2),
  ('Broaster',         'broaster',         3),
  ('Chocolate',        'chocolate',        4),
  ('Panqueques',       'panqueques',       5),
  ('Picarones',        'picarones',        6)
on conflict (slug) do nothing;

insert into business_settings (
  id, business_name, delivery_fee, open_time, close_time, is_open
) values (
  1, 'BLUX Sabor de Casa', 2.00, '17:30', '22:00', true
)
on conflict (id) do nothing;

-- NOTA: el usuario admin de prueba se crea por API de Auth
-- (scripts/create-admin.ts) porque users.id referencia a auth.users.
