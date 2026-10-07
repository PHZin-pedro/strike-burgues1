-- STRIKE BURGUE'S - RESET SEGURO DO CARDAPIO E ESTOQUE
-- Mantem pedidos existentes. Reconstroi apenas produtos, ingredientes e itens de estoque.
-- Execute no Supabase SQL Editor.

begin;

-- 1) Remover qualquer ingrediente antigo e a referencia do item que nao deve existir.
delete from public.product_ingredients;
delete from public.stock_items where lower(trim(name)) = lower(trim('Molho especial'));

-- 2) Garantir os 18 itens corretos de estoque.
insert into public.stock_items (name, quantity, unit) values
('Pão', 100, 'un'),
('Hambúrguer', 100, 'un'),
('Pão hot dog', 100, 'un'),
('Tomate', 100, 'porção'),
('Alface', 100, 'porção'),
('Salsicha', 100, 'un'),
('Ovo', 100, 'un'),
('Bacon', 100, 'porção'),
('Calabresa', 100, 'porção'),
('Presunto', 100, 'porção'),
('Muçarela', 100, 'porção'),
('Milho', 100, 'porção'),
('Queijo', 100, 'porção'),
('Batata', 200, 'porção'),
('Batata palha', 100, 'porção'),
('Catupiry', 100, 'porção'),
('Cheddar', 100, 'porção'),
('Coca-Cola 220ml', 100, 'un')
on conflict (name) do nothing;

-- 3) Atualizar exatamente os 19 produtos pelos IDs do cardapio.
insert into public.products (id, name, price, category, active) values
(1,'X-Tudd da Praça',10,'Hambúrguer',true),
(2,'X-Bacon',15,'Hambúrguer',true),
(3,'X-Calabresa',15,'Hambúrguer',true),
(4,'X-Trio',18,'Hambúrguer',true),
(5,'X-Strike',22,'Hambúrguer',true),
(6,'Batata Pequena 200g',10,'Batata Frita',true),
(7,'Batata Pequena Completa 200g',15,'Batata Frita',true),
(8,'Batata Grande 400g',15,'Batata Frita',true),
(9,'Batata Grande Completa 400g',20,'Batata Frita',true),
(10,'Cachorro Quente Simples',7.50,'Cachorro Quente',true),
(11,'Cachorro Quente da Praça',12,'Cachorro Quente',true),
(12,'Cachorro Quente Completão',18,'Cachorro Quente',true),
(13,'Adicional Bacon',3,'Adicionais',true),
(14,'Adicional Presunto',3,'Adicionais',true),
(15,'Adicional Muçarela',3,'Adicionais',true),
(16,'Adicional Salsicha',3,'Adicionais',true),
(17,'Adicional Cheddar',3,'Adicionais',true),
(18,'Coca-Cola 220ml',5,'Bebidas',true),
(19,'Promoção Trio Bomba',19.99,'Promoções',true)
on conflict (id) do update set
  name=excluded.name, price=excluded.price, category=excluded.category, active=true;

update public.products set active=false where id not between 1 and 19;

-- 4) Recriar todas as baixas de estoque pelo nome do item.
insert into public.product_ingredients (product_id, stock_item_id, quantity)
select v.product_id, s.id, v.quantity
from (values
(1,'Pão',1),(1,'Hambúrguer',1),(1,'Tomate',1),(1,'Alface',1),(1,'Salsicha',1),(1,'Ovo',1),
(2,'Pão',1),(2,'Hambúrguer',1),(2,'Tomate',1),(2,'Alface',1),(2,'Salsicha',1),(2,'Ovo',1),(2,'Bacon',1),
(3,'Pão',1),(3,'Hambúrguer',1),(3,'Tomate',1),(3,'Alface',1),(3,'Salsicha',1),(3,'Ovo',1),(3,'Calabresa',1),
(4,'Pão',1),(4,'Hambúrguer',1),(4,'Presunto',1),(4,'Muçarela',1),(4,'Milho',1),(4,'Tomate',1),(4,'Alface',1),(4,'Salsicha',1),(4,'Ovo',1),(4,'Bacon',1),(4,'Calabresa',1),
(5,'Pão',1),(5,'Hambúrguer',1),(5,'Presunto',1),(5,'Muçarela',1),(5,'Milho',1),(5,'Tomate',1),(5,'Alface',1),(5,'Salsicha',1),(5,'Ovo',1),(5,'Bacon',1),(5,'Calabresa',1),
(6,'Batata',1),(6,'Queijo',1),
(7,'Batata',1),(7,'Queijo',1),(7,'Bacon',1),(7,'Calabresa',1),
(8,'Batata',2),(8,'Queijo',1),
(9,'Batata',2),(9,'Queijo',1),(9,'Bacon',1),(9,'Calabresa',1),
(10,'Pão hot dog',1),(10,'Salsicha',1),(10,'Milho',1),(10,'Batata palha',1),(10,'Catupiry',1),
(11,'Pão hot dog',1),(11,'Salsicha',1),(11,'Milho',1),(11,'Batata palha',1),(11,'Catupiry',1),(11,'Bacon',1),(11,'Calabresa',1),
(12,'Pão hot dog',1),(12,'Salsicha',1),(12,'Milho',1),(12,'Batata palha',1),(12,'Catupiry',1),(12,'Bacon',1),(12,'Calabresa',1),(12,'Queijo',1),
(13,'Bacon',1),(14,'Presunto',1),(15,'Muçarela',1),(16,'Salsicha',1),(17,'Cheddar',1),
(18,'Coca-Cola 220ml',1),
(19,'Coca-Cola 220ml',1),(19,'Batata',1),(19,'Pão',1),(19,'Hambúrguer',1),(19,'Tomate',1),(19,'Alface',1),(19,'Salsicha',1),(19,'Ovo',1)
) as v(product_id, stock_name, quantity)
join public.stock_items s on lower(trim(s.name)) = lower(trim(v.stock_name));

-- 5) Ajustar sequencias para nao colidir com IDs existentes.
select setval(pg_get_serial_sequence('public.products','id'), coalesce((select max(id) from public.products),1), true);
select setval(pg_get_serial_sequence('public.stock_items','id'), coalesce((select max(id) from public.stock_items),1), true);

commit;

-- CONFERENCIA FINAL
select count(*) as produtos_ativos from public.products where active=true;
select id,name,price,category,active from public.products order by id;
select count(*) as itens_estoque from public.stock_items;
select id,name,quantity,unit from public.stock_items order by id;
select count(*) as ingredientes from public.product_ingredients;
