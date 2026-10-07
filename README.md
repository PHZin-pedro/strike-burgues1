# Strike Burgue's — versão Supabase

Sistema simples para o atendente usar no celular.

## O que esta versão usa
- Node.js + Express
- HTML/CSS/JavaScript puro
- Supabase PostgreSQL para produtos, estoque e vendas
- Impressão pelo diálogo de impressão do navegador do celular
- Sem React, TypeScript, SQLite ou Python

## Variáveis no Render
No serviço do Render, em **Environment**, mantenha:

```text
SUPABASE_URL=https://vzrgkrmlhdvprnesvrrp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=chave_secreta_do_supabase
```

A chave `SUPABASE_SERVICE_ROLE_KEY` é privada e nunca deve ir para o GitHub.

## Deploy
O Render pode usar:

```text
Build Command: npm install
Start Command: npm start
```

Depois de salvar as variáveis, faça **Manual Deploy → Deploy latest commit**.

## Banco
A estrutura do Supabase precisa conter estas tabelas, criadas pelo SQL que foi executado no projeto:

- `products`
- `stock_items`
- `product_ingredients`
- `orders`
- `order_items`
- `stock_movements`

O servidor usa o `service_role` apenas no backend do Render.

## Como funciona
1. O celular abre o endereço do Render.
2. O cardápio vem do Supabase.
3. O atendente monta o pedido.
4. Ao enviar, o servidor grava a venda e baixa os ingredientes do estoque.
5. O celular abre a impressão do navegador para escolher a impressora térmica.
6. Produtos e estoque podem ser alterados pelo próprio sistema.

## Impressora térmica pelo celular
A impressão desta versão é **pelo navegador**, conforme solicitado. No Android, se a impressora aparecer como impressora do sistema/serviço de impressão, ela pode ser escolhida na tela de impressão.

Impressoras Bluetooth térmicas que não aparecem como impressora do Android podem exigir um aplicativo/ponte do fabricante; o navegador puro não consegue garantir conexão Bluetooth clássica.
