const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const DB_MODE =
  SUPABASE_URL && SUPABASE_KEY
    ? 'supabase'
    : 'local-fallback';

app.use(cors());

app.use(
  express.json({
    limit: '2mb'
  })
);

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

function money(value) {
  return Number(
    Number(value || 0).toFixed(2)
  );
}

function esc(value = '') {
  return String(value).replace(
    /[&<>"]/g,
    function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    }
  );
}

function localSettings() {
  return {
    name: "Strike Burgue's",
    printer: {
      mode: 'browser'
    }
  };
}

function supabaseUrl(table, query = '') {
  return (
    `${SUPABASE_URL}/rest/v1/${table}` +
    (query ? `?${query}` : '')
  );
}

async function supabaseFetch(
  table,
  {
    method = 'GET',
    query = '',
    body,
    headers = {}
  } = {}
) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Supabase não configurado no servidor.'
    );
  }

  const response = await fetch(
    supabaseUrl(table, query),
    {
      method,

      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...headers
      },

      body:
        body === undefined
          ? undefined
          : JSON.stringify(body)
    }
  );

  const text = await response.text();

  let data = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.hint ||
      data?.details ||
      data?.error ||
      text ||
      `Supabase ${response.status}`;

    throw new Error(message);
  }

  return data;
}

function query(params) {
  return new URLSearchParams(params).toString();
}

/* =========================
   ESTOQUE
========================= */

async function getStockRows() {
  return await supabaseFetch(
    'stock_items',
    {
      query: query({
        select: '*',
        order: 'id.asc'
      })
    }
  );
}

/* =========================
   PRODUTOS
========================= */

async function getProductRows() {
  return await supabaseFetch(
    'products',
    {
      query: query({
        select: '*',
        active: 'eq.true',
        order: 'id.asc'
      })
    }
  );
}

async function getIngredientRows() {
  return await supabaseFetch(
    'product_ingredients',
    {
      query: query({
        select: '*',
        order: 'id.asc'
      })
    }
  );
}

async function hydrateProducts(rows) {
  const [
    ingredients,
    stock
  ] = await Promise.all([
    getIngredientRows(),
    getStockRows()
  ]);

  const stockById = new Map();

  for (const item of stock) {
    stockById.set(
      String(item.id),
      item
    );
  }

  const byProduct = new Map();

  for (const ingredient of ingredients) {
    const productId =
      String(ingredient.product_id);

    const list =
      byProduct.get(productId) || [];

    const stockItem =
      stockById.get(
        String(ingredient.stock_item_id)
      );

    list.push({
      name:
        stockItem?.name ||
        `Item ${ingredient.stock_item_id}`,

      qty: Number(
        ingredient.quantity || 0
      )
    });

    byProduct.set(
      productId,
      list
    );
  }

  return rows.map(function (product) {
    return {
      id: Number(product.id),

      name: product.name,

      price: money(product.price),

      category:
        product.category || 'Outros',

      active:
        product.active !== false,

      ingredients:
        byProduct.get(
          String(product.id)
        ) || []
    };
  });
}

/* =========================
   PEDIDOS
========================= */

async function getOrders() {
  const [
    orders,
    items
  ] = await Promise.all([
    supabaseFetch(
      'orders',
      {
        query: query({
          select: '*',
          order: 'id.desc'
        })
      }
    ),

    supabaseFetch(
      'order_items',
      {
        query: query({
          select: '*',
          order: 'id.asc'
        })
      }
    )
  ]);

  const byOrder = new Map();

  for (const item of items) {
    const orderId =
      String(item.order_id);

    const list =
      byOrder.get(orderId) || [];

    list.push({
      productId:
        Number(item.product_id),

      name:
        item.product_name || '',

      price:
        money(item.unit_price),

      quantity:
        Number(item.quantity || 1)
    });

    byOrder.set(
      orderId,
      list
    );
  }

  return orders.map(function (order) {
    return {
      id: Number(order.id),

      items:
        byOrder.get(
          String(order.id)
        ) || [],

      note:
        String(order.note || ''),

      total:
        money(order.total),

      createdAt:
        order.created_at
    };
  });
}

/* =========================
   MOVIMENTAÇÕES
========================= */

async function getMovements() {
  const rows =
    await supabaseFetch(
      'stock_movements',
      {
        query: query({
          select: '*',
          order: 'id.desc',
          limit: '200'
        })
      }
    );

  return rows.map(function (movement) {
    return {
      id:
        Number(movement.id),

      stockId:
        Number(movement.stock_item_id),

      type:
        movement.type,

      quantity:
        Number(movement.quantity || 0),

      createdAt:
        movement.created_at,

      reason:
        movement.reason || ''
    };
  });
}

/* =========================
   HEALTH
========================= */

app.get(
  '/api/health',
  function (req, res) {
    res.json({
      ok: true,
      service: 'strike-burgues',
      database: DB_MODE,
      time:
        new Date().toISOString()
    });
  }
);

/* =========================
   CONFIGURAÇÕES
========================= */

app.get(
  '/api/settings',
  function (req, res) {
    res.json(
      localSettings()
    );
  }
);

app.put(
  '/api/settings',
  function (req, res) {
    res.json(
      localSettings()
    );
  }
);

/* =========================
   PRODUTOS
========================= */

app.get(
  '/api/products',
  async function (req, res) {
    try {
      const products =
        await getProductRows();

      res.json(
        await hydrateProducts(
          products
        )
      );
    } catch (error) {
      console.error(
        'GET /api/products:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

app.post(
  '/api/products',
  async function (req, res) {
    try {
      const {
        name,
        price,
        category = 'Outros',
        ingredients = []
      } = req.body;

      if (!String(name || '').trim()) {
        return res.status(400).json({
          error:
            'Nome obrigatório.'
        });
      }

      const created =
        await supabaseFetch(
          'products',
          {
            method: 'POST',

            query: query({
              select: '*'
            }),

            body: {
              name:
                String(name).trim(),

              price:
                money(price),

              category:
                String(
                  category || 'Outros'
                ),

              active: true
            },

            headers: {
              Prefer:
                'return=representation'
            }
          }
        );

      const product =
        created[0];

      await replaceIngredients(
        product.id,
        ingredients
      );

      const hydrated =
        await hydrateProducts([
          product
        ]);

      res.status(201).json(
        hydrated[0]
      );
    } catch (error) {
      console.error(
        'POST /api/products:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

async function replaceIngredients(
  productId,
  ingredients
) {
  await supabaseFetch(
    'product_ingredients',
    {
      method: 'DELETE',

      query: query({
        product_id:
          `eq.${productId}`
      })
    }
  );

  if (
    !Array.isArray(ingredients) ||
    !ingredients.length
  ) {
    return;
  }

  const stock =
    await getStockRows();

  const stockByName =
    new Map();

  for (const item of stock) {
    stockByName.set(
      String(item.name)
        .trim()
        .toLowerCase(),
      item
    );
  }

  const rows = [];

  for (const ingredient of ingredients) {
    const stockItem =
      stockByName.get(
        String(
          ingredient.name || ''
        )
          .trim()
          .toLowerCase()
      );

    const quantity =
      Number(
        ingredient.qty
      );

    if (
      !stockItem ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      continue;
    }

    rows.push({
      product_id:
        productId,

      stock_item_id:
        stockItem.id,

      quantity
    });
  }

  if (rows.length) {
    await supabaseFetch(
      'product_ingredients',
      {
        method: 'POST',
        body: rows
      }
    );
  }
}

app.put(
  '/api/products/:id',
  async function (req, res) {
    try {
      const id =
        Number(req.params.id);

      const patch = {};

      if (
        req.body.name !== undefined
      ) {
        patch.name =
          String(
            req.body.name
          ).trim();
      }

      if (
        req.body.price !== undefined
      ) {
        patch.price =
          money(
            req.body.price
          );
      }

      if (
        req.body.category !== undefined
      ) {
        patch.category =
          String(
            req.body.category ||
              'Outros'
          );
      }

      if (
        req.body.active !== undefined
      ) {
        patch.active =
          Boolean(
            req.body.active
          );
      }

      const rows =
        await supabaseFetch(
          'products',
          {
            method: 'PATCH',

            query: query({
              id: `eq.${id}`,
              select: '*'
            }),

            body: patch,

            headers: {
              Prefer:
                'return=representation'
            }
          }
        );

      if (!rows.length) {
        return res.status(404).json({
          error:
            'Produto não encontrado.'
        });
      }

      if (
        req.body.ingredients !==
        undefined
      ) {
        await replaceIngredients(
          id,
          req.body.ingredients
        );
      }

      const hydrated =
        await hydrateProducts(
          rows
        );

      res.json(
        hydrated[0]
      );
    } catch (error) {
      console.error(
        'PUT /api/products/:id:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

app.delete(
  '/api/products/:id',
  async function (req, res) {
    try {
      const id =
        Number(req.params.id);

      const rows =
        await supabaseFetch(
          'products',
          {
            method: 'PATCH',

            query: query({
              id: `eq.${id}`,
              select: '*'
            }),

            body: {
              active: false
            },

            headers: {
              Prefer:
                'return=representation'
            }
          }
        );

      if (!rows.length) {
        return res.status(404).json({
          error:
            'Produto não encontrado.'
        });
      }

      res.json({
        ok: true
      });
    } catch (error) {
      console.error(
        'DELETE /api/products/:id:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

/* =========================
   ESTOQUE
========================= */

app.get(
  '/api/stock',
  async function (req, res) {
    try {
      res.json(
        await getStockRows()
      );
    } catch (error) {
      console.error(
        'GET /api/stock:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

app.post(
  '/api/stock',
  async function (req, res) {
    try {
      const {
        name,
        quantity = 0,
        unit = 'un'
      } = req.body;

      if (!String(name || '').trim()) {
        return res.status(400).json({
          error:
            'Nome obrigatório.'
        });
      }

      const rows =
        await supabaseFetch(
          'stock_items',
          {
            method: 'POST',

            query: query({
              select: '*'
            }),

            body: {
              name:
                String(name).trim(),

              quantity:
                Number(quantity) || 0,

              unit:
                String(unit || 'un')
            },

            headers: {
              Prefer:
                'return=representation'
            }
          }
        );

      const item =
        rows[0];

      if (
        Number(item.quantity) > 0
      ) {
        await supabaseFetch(
          'stock_movements',
          {
            method: 'POST',

            body: {
              stock_item_id:
                item.id,

              type:
                'entrada',

              quantity:
                Number(item.quantity),

              reason:
                'Cadastro inicial'
            }
          }
        );
      }

      res.status(201).json(
        item
      );
    } catch (error) {
      console.error(
        'POST /api/stock:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

app.patch(
  '/api/stock/:id',
  async function (req, res) {
    try {
      const id =
        Number(req.params.id);

      const quantity =
        Number(
          req.body.quantity
        );

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          error:
            'ID do estoque inválido.'
        });
      }

      if (
        !Number.isFinite(quantity) ||
        quantity < 0
      ) {
        return res.status(400).json({
          error:
            'Quantidade inválida.'
        });
      }

      const oldRows =
        await supabaseFetch(
          'stock_items',
          {
            query: query({
              select: '*',
              id: `eq.${id}`
            })
          }
        );

      if (!oldRows.length) {
        return res.status(404).json({
          error:
            'Item não encontrado.'
        });
      }

      const old =
        Number(
          oldRows[0].quantity
        ) || 0;

      const rows =
        await supabaseFetch(
          'stock_items',
          {
            method: 'PATCH',

            query: query({
              id: `eq.${id}`,
              select: '*'
            }),

            body: {
              quantity
            },

            headers: {
              Prefer:
                'return=representation'
            }
          }
        );

      if (quantity !== old) {
        await supabaseFetch(
          'stock_movements',
          {
            method: 'POST',

            body: {
              stock_item_id:
                id,

              type:
                quantity >= old
                  ? 'entrada'
                  : 'saida',

              quantity:
                Math.abs(
                  quantity - old
                ),

              reason:
                String(
                  req.body.reason ||
                    'Ajuste manual'
                )
            }
          }
        );
      }

      res.json(
        rows[0]
      );
    } catch (error) {
      console.error(
        'PATCH /api/stock/:id:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

/* =========================
   MOVIMENTAÇÕES
========================= */

app.get(
  '/api/movements',
  async function (req, res) {
    try {
      res.json(
        await getMovements()
      );
    } catch (error) {
      console.error(
        'GET /api/movements:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

/* =========================
   PEDIDOS
========================= */

app.get(
  '/api/orders',
  async function (req, res) {
    try {
      res.json(
        await getOrders()
      );
    } catch (error) {
      console.error(
        'GET /api/orders:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

app.post(
  '/api/orders',
  async function (req, res) {
    try {
      const items =
        Array.isArray(req.body.items)
          ? req.body.items
          : [];

      if (!items.length) {
        return res.status(400).json({
          error:
            'Pedido vazio.'
        });
      }

      const products =
        await hydrateProducts(
          await getProductRows()
        );

      const stock =
        await getStockRows();

      const normalized = [];

      for (const item of items) {
        const product =
          products.find(
            p =>
              Number(p.id) ===
              Number(item.productId)
          );

        if (!product) {
          return res.status(400).json({
            error:
              `Produto inválido: ${
                item.name ||
                item.productId
              }`
          });
        }

        const quantity =
          Math.max(
            1,
            Number(
              item.quantity
            ) || 1
          );

        normalized.push({
          productId:
            product.id,

          name:
            product.name,

          price:
            product.price,

          quantity
        });
      }

      const required =
        new Map();

      for (
        const item of normalized
      ) {
        const product =
          products.find(
            p =>
              p.id ===
              item.productId
          );

        for (
          const ingredient
          of product.ingredients || []
        ) {
          const stockItem =
            stock.find(
              s =>
                String(s.name)
                  .trim()
                  .toLowerCase() ===
                String(
                  ingredient.name
                )
                  .trim()
                  .toLowerCase()
            );

          if (!stockItem) {
            continue;
          }

          const amount =
            Math.max(
              0,
              Number(
                ingredient.qty
              ) || 0
            ) *
            item.quantity;

          const current =
            required.get(
              stockItem.id
            ) || {
              stock: stockItem,
              amount: 0
            };

          current.amount += amount;

          required.set(
            stockItem.id,
            current
          );
        }
      }

      for (
        const current
        of required.values()
      ) {
        if (
          Number(
            current.stock.quantity
          ) <
          current.amount
        ) {
          return res.status(409).json({
            error:
              `Estoque insuficiente: ${
                current.stock.name
              }. Disponível: ${
                current.stock.quantity
              }; necessário: ${
                current.amount
              }.`
          });
        }
      }

      const total =
        money(
          normalized.reduce(
            function (sum, item) {
              return (
                sum +
                item.price *
                  item.quantity
              );
            },
            0
          )
        );

      /*
        A tabela orders possui:
        id
        note
        total
        created_at
      */

      const orderRows =
        await supabaseFetch(
          'orders',
          {
            method: 'POST',

            query: query({
              select: '*'
            }),

            body: {
              note:
                String(
                  req.body.note || ''
                ),

              total
            },

            headers: {
              Prefer:
                'return=representation'
            }
          }
        );

      const order =
        orderRows[0];

      /*
        A tabela order_items usa
        unit_price.
      */

      const orderItems =
        normalized.map(
          function (item) {
            return {
              order_id:
                order.id,

              product_id:
                item.productId,

              product_name:
                item.name,

              quantity:
                item.quantity,

              unit_price:
                item.price
            };
          }
        );

      await supabaseFetch(
        'order_items',
        {
          method: 'POST',
          body: orderItems
        }
      );

      for (
        const current
        of required.values()
      ) {
        const next =
          money(
            Number(
              current.stock.quantity
            ) -
            current.amount
          );

        await supabaseFetch(
          'stock_items',
          {
            method: 'PATCH',

            query: query({
              id:
                `eq.${current.stock.id}`
            }),

            body: {
              quantity: next
            }
          }
        );

        await supabaseFetch(
          'stock_movements',
          {
            method: 'POST',

            body: {
              stock_item_id:
                current.stock.id,

              type:
                'saida',

              quantity:
                current.amount,

              reason:
                `Pedido #${order.id}`,

              order_id:
                order.id
            }
          }
        );
      }

      res.status(201).json({
        id:
          Number(order.id),

        items:
          normalized,

        note:
          String(
            order.note || ''
          ),

        total,

        createdAt:
          order.created_at
      });
    } catch (error) {
      console.error(
        'POST /api/orders:',
        error
      );

      res.status(500).json({
        error: error.message
      });
    }
  }
);

/* =========================
   IMPRESSÃO
========================= */

app.post(
  '/api/orders/:id/print',
  async function (req, res) {
    res.status(400).json({
      error:
        'Use a impressão do navegador no celular.'
    });
  }
);

app.post(
  '/api/printer/test',
  async function (req, res) {
    res.status(400).json({
      error:
        'A impressão atual é pelo navegador. Abra a tela de impressão e selecione a impressora térmica.'
    });
  }
);

app.get(
  '/api/orders/:id/receipt',
  async function (req, res) {
    try {
      const orders =
        await getOrders();

      const order =
        orders.find(
          item =>
            item.id ===
            Number(req.params.id)
        );

      if (!order) {
        return res
          .status(404)
          .send(
            'Pedido não encontrado'
          );
      }

      const itemsHtml =
        order.items
          .map(function (item) {
            return `
              <div>
                ${item.quantity}x
                ${esc(item.name)}
                —
                R$ ${(
                  item.price *
                  item.quantity
                )
                  .toFixed(2)
                  .replace('.', ',')}
              </div>
            `;
          })
          .join('');

      const html = `
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">

<title>
Pedido #${order.id}
</title>

<style>
body{
  font-family:monospace;
  width:72mm;
  max-width:100%;
  margin:auto;
  font-size:18px;
  line-height:1.4;
}

h2{
  text-align:center;
}

.line{
  border-top:1px dashed #000;
  margin:10px 0;
}

@media print{
  button{
    display:none;
  }
}
</style>
</head>

<body>

<h2>
${esc(localSettings().name)}
</h2>

<div>
Pedido #${order.id}
</div>

<div>
${new Date(
  order.createdAt
).toLocaleString('pt-BR')}
</div>

<div class="line"></div>

${itemsHtml}

${
  order.note
    ? `
      <div class="line"></div>
      <div>
        OBS:
        ${esc(order.note)}
      </div>
    `
    : ''
}

<div class="line"></div>

<b>
TOTAL:
R$ ${order.total
  .toFixed(2)
  .replace('.', ',')}
</b>

<br>
<br>

<button onclick="print()">
Imprimir
</button>

<script>
setTimeout(function(){
  print();
},300);
</script>

</body>
</html>
`;

      res
        .type('html')
        .send(html);
    } catch (error) {
      console.error(
        'GET /api/orders/:id/receipt:',
        error
      );

      res
        .status(500)
        .send(
          error.message
        );
    }
  }
);

/* =========================
   BACKUP
========================= */

app.post(
  '/api/backup',
  async function (req, res) {
    res.status(400).json({
      error:
        'Backup JSON não restaura diretamente no Supabase nesta versão. Use o banco do Supabase.'
    });
  }
);

/*
  IMPORTANTE:
  Esta rota fica por último.
  Assim ela não captura as rotas /api.
*/

app.get(
  '*',
  function (req, res) {
    res.sendFile(
      path.join(
        __dirname,
        'public',
        'index.html'
      )
    );
  }
);

app.listen(
  PORT,
  HOST,
  function () {
    console.log(
      `Strike Burgue's ativo em ${HOST}:${PORT} | banco: ${DB_MODE}`
    );
  }
);