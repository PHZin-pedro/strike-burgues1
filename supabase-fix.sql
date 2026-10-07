-- Garantir permissões para o backend que usa SUPABASE_SERVICE_ROLE_KEY.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Conferência rápida: execute e confirme que o cardápio tem 19 produtos.
select id, name, price, category, active
from public.products
order by id;

select id, name, quantity, unit
from public.stock_items
order by id;
