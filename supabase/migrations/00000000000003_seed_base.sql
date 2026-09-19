-- =============================================
-- Etapa 3 — Datos semilla base (idempotente)
-- =============================================

-- Categorías iniciales de la carta
insert into categories (name, slug, sort_order) values
  ('Caldo de gallina', 'caldo-de-gallina', 1),
  ('Mostritos',        'mostritos',        2),
  ('Broaster',         'broaster',         3),
  ('Chocolate',        'chocolate',        4),
  ('Panqueques',       'panqueques',       5),
  ('Picarones',        'picarones',        6)
on conflict (slug) do nothing;

-- Configuración del negocio (fila única)
insert into business_settings (
  id, business_name, delivery_fee, open_time, close_time, is_open
) values (
  1, 'BLUX Sabor de Casa', 2.00, '17:30', '22:00', true
)
on conflict (id) do nothing;
