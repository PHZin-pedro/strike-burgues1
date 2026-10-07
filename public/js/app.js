let products = [];
let stock = [];
let orders = [];
let settings = {};
let movements = [];
let cart = [];

let category = 'Todos';

const $ = s => document.querySelector(s);

const money = n =>
  Number(n || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[c]));

const LOCAL_KEY = 'strike-burgues-app-v2';

const isGitHub = location.hostname.endsWith('github.io');

let apiAvailable = !isGitHub;


/* =========================================================
   CARDÁPIO INICIAL
========================================================= */

const seed = {
  settings: {
    name: "Strike Burgue's",
    printer: {
      mode: 'browser',
      host: '',
      port: 9100,
      bluetoothName: ''
    }
  },

  products: [
    {
      id: 1,
      name: 'X-Tudd da Praça',
      price: 10,
      category: 'Hambúrguer',
      active: true,
      ingredients: [
        { name: 'Pão', qty: 1 },
        { name: 'Hambúrguer', qty: 1 },
        { name: 'Tomate', qty: 1 },
        { name: 'Alface', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Ovo', qty: 1 }
      ]
    },

    {
      id: 2,
      name: 'X-Bacon',
      price: 15,
      category: 'Hambúrguer',
      active: true,
      ingredients: [
        { name: 'Pão', qty: 1 },
        { name: 'Hambúrguer', qty: 1 },
        { name: 'Tomate', qty: 1 },
        { name: 'Alface', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Ovo', qty: 1 },
        { name: 'Bacon', qty: 1 }
      ]
    },

    {
      id: 3,
      name: 'X-Calabresa',
      price: 15,
      category: 'Hambúrguer',
      active: true,
      ingredients: [
        { name: 'Pão', qty: 1 },
        { name: 'Hambúrguer', qty: 1 },
        { name: 'Tomate', qty: 1 },
        { name: 'Alface', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Ovo', qty: 1 },
        { name: 'Calabresa', qty: 1 }
      ]
    },

    {
      id: 4,
      name: 'X-Trio',
      price: 18,
      category: 'Hambúrguer',
      active: true,
      ingredients: [
        { name: 'Pão', qty: 1 },
        { name: 'Hambúrguer', qty: 1 },
        { name: 'Presunto', qty: 1 },
        { name: 'Muçarela', qty: 1 },
        { name: 'Milho', qty: 1 },
        { name: 'Tomate', qty: 1 },
        { name: 'Alface', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Ovo', qty: 1 },
        { name: 'Bacon', qty: 1 },
        { name: 'Calabresa', qty: 1 }
      ]
    },

    {
      id: 5,
      name: 'X-Strike',
      price: 22,
      category: 'Hambúrguer',
      active: true,
      ingredients: [
        { name: 'Pão', qty: 1 },
        { name: 'Hambúrguer', qty: 1 },
        { name: 'Presunto', qty: 1 },
        { name: 'Muçarela', qty: 1 },
        { name: 'Milho', qty: 1 },
        { name: 'Tomate', qty: 1 },
        { name: 'Alface', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Ovo', qty: 1 },
        { name: 'Bacon', qty: 1 },
        { name: 'Calabresa', qty: 1 }
      ]
    },

    {
      id: 6,
      name: 'Batata Pequena 200g',
      price: 10,
      category: 'Batata Frita',
      active: true,
      ingredients: [
        { name: 'Batata', qty: 1 },
        { name: 'Queijo', qty: 1 }
      ]
    },

    {
      id: 7,
      name: 'Batata Pequena Completa 200g',
      price: 15,
      category: 'Batata Frita',
      active: true,
      ingredients: [
        { name: 'Batata', qty: 1 },
        { name: 'Queijo', qty: 1 },
        { name: 'Bacon', qty: 1 },
        { name: 'Calabresa', qty: 1 }
      ]
    },

    {
      id: 8,
      name: 'Batata Grande 400g',
      price: 15,
      category: 'Batata Frita',
      active: true,
      ingredients: [
        { name: 'Batata', qty: 2 },
        { name: 'Queijo', qty: 1 }
      ]
    },

    {
      id: 9,
      name: 'Batata Grande Completa 400g',
      price: 20,
      category: 'Batata Frita',
      active: true,
      ingredients: [
        { name: 'Batata', qty: 2 },
        { name: 'Queijo', qty: 1 },
        { name: 'Bacon', qty: 1 },
        { name: 'Calabresa', qty: 1 }
      ]
    },

    {
      id: 10,
      name: 'Cachorro Quente Simples',
      price: 7.5,
      category: 'Cachorro Quente',
      active: true,
      ingredients: [
        { name: 'Pão hot dog', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Milho', qty: 1 },
        { name: 'Batata palha', qty: 1 },
        { name: 'Catupiry', qty: 1 }
      ]
    },

    {
      id: 11,
      name: 'Cachorro Quente da Praça',
      price: 12,
      category: 'Cachorro Quente',
      active: true,
      ingredients: [
        { name: 'Pão hot dog', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Milho', qty: 1 },
        { name: 'Batata palha', qty: 1 },
        { name: 'Catupiry', qty: 1 },
        { name: 'Bacon', qty: 1 },
        { name: 'Calabresa', qty: 1 }
      ]
    },

    {
      id: 12,
      name: 'Cachorro Quente Completão',
      price: 18,
      category: 'Cachorro Quente',
      active: true,
      ingredients: [
        { name: 'Pão hot dog', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Milho', qty: 1 },
        { name: 'Batata palha', qty: 1 },
        { name: 'Catupiry', qty: 1 },
        { name: 'Bacon', qty: 1 },
        { name: 'Calabresa', qty: 1 },
        { name: 'Queijo', qty: 1 }
      ]
    },

    {
      id: 13,
      name: 'Adicional Bacon',
      price: 3,
      category: 'Adicionais',
      active: true,
      ingredients: [
        { name: 'Bacon', qty: 1 }
      ]
    },

    {
      id: 14,
      name: 'Adicional Presunto',
      price: 3,
      category: 'Adicionais',
      active: true,
      ingredients: [
        { name: 'Presunto', qty: 1 }
      ]
    },

    {
      id: 15,
      name: 'Adicional Muçarela',
      price: 3,
      category: 'Adicionais',
      active: true,
      ingredients: [
        { name: 'Muçarela', qty: 1 }
      ]
    },

    {
      id: 16,
      name: 'Adicional Salsicha',
      price: 3,
      category: 'Adicionais',
      active: true,
      ingredients: [
        { name: 'Salsicha', qty: 1 }
      ]
    },

    {
      id: 17,
      name: 'Adicional Cheddar',
      price: 3,
      category: 'Adicionais',
      active: true,
      ingredients: [
        { name: 'Cheddar', qty: 1 }
      ]
    },

    {
      id: 18,
      name: 'Coca-Cola 220ml',
      price: 5,
      category: 'Bebidas',
      active: true,
      ingredients: [
        { name: 'Coca-Cola 220ml', qty: 1 }
      ]
    },

    {
      id: 19,
      name: 'Promoção Trio Bomba',
      price: 19.99,
      category: 'Promoções',
      active: true,
      ingredients: [
        { name: 'Coca-Cola 220ml', qty: 1 },
        { name: 'Batata', qty: 1 },
        { name: 'Pão', qty: 1 },
        { name: 'Hambúrguer', qty: 1 },
        { name: 'Tomate', qty: 1 },
        { name: 'Alface', qty: 1 },
        { name: 'Salsicha', qty: 1 },
        { name: 'Ovo', qty: 1 }
      ]
    }
  ],

  stock: [
    { id: 1, name: 'Pão', quantity: 100, unit: 'un' },
    { id: 2, name: 'Hambúrguer', quantity: 100, unit: 'un' },
    { id: 5, name: 'Pão hot dog', quantity: 100, unit: 'un' },
    { id: 6, name: 'Tomate', quantity: 100, unit: 'porção' },
    { id: 7, name: 'Alface', quantity: 100, unit: 'porção' },
    { id: 8, name: 'Salsicha', quantity: 100, unit: 'un' },
    { id: 9, name: 'Ovo', quantity: 100, unit: 'un' },
    { id: 10, name: 'Bacon', quantity: 100, unit: 'porção' },
    { id: 11, name: 'Calabresa', quantity: 100, unit: 'porção' },
    { id: 12, name: 'Presunto', quantity: 100, unit: 'porção' },
    { id: 13, name: 'Muçarela', quantity: 100, unit: 'porção' },
    { id: 14, name: 'Milho', quantity: 100, unit: 'porção' },
    { id: 15, name: 'Queijo', quantity: 100, unit: 'porção' },
    { id: 16, name: 'Batata', quantity: 200, unit: 'porção' },
    { id: 17, name: 'Batata palha', quantity: 100, unit: 'porção' },
    { id: 19, name: 'Catupiry', quantity: 100, unit: 'porção' },
    { id: 20, name: 'Cheddar', quantity: 100, unit: 'porção' },
    { id: 21, name: 'Coca-Cola 220ml', quantity: 100, unit: 'un' }
  ],

  orders: [],
  movements: []
};


/* =========================================================
   UTILITÁRIOS
========================================================= */

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function localData() {
  let d = localStorage.getItem(LOCAL_KEY);

  if (!d) {
    const initial = clone(seed);
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify(initial)
    );
    return initial;
  }

  try {
    return JSON.parse(d);
  } catch {
    localStorage.removeItem(LOCAL_KEY);

    const initial = clone(seed);

    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify(initial)
    );

    return initial;
  }
}

function saveLocal() {
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify({
      settings,
      products,
      stock,
      orders,
      movements
    })
  );
}

function setConnection(ok) {
  const el = $('#connection');

  if (!el) return;

  el.classList.toggle('offline', !ok);

  el.innerHTML =
    `<span></span> ${ok
      ? 'Online / salvo'
      : 'Modo local / salvo no aparelho'}`;
}


/* =========================================================
   API
========================================================= */

async function api(url, opt = {}) {
  if (!apiAvailable) {
    throw Error('O servidor não está conectado.');
  }

  let response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(opt.headers || {})
      },
      ...opt
    });
  } catch (e) {
    apiAvailable = false;
    setConnection(false);

    throw new Error(
      'Sem conexão com o servidor. Confira a internet e recarregue a página.'
    );
  }

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
      `Erro do servidor (${response.status}).`
    );
  }

  return data;
}


/* =========================================================
   CARREGAMENTO
========================================================= */

function normalizeProduct(p, index) {
  return {
    id: Number(p.id),
    name: String(p.name || '').trim(),
    price: Number(p.price || 0),
    category: String(p.category || 'Outros'),
    active: p.active !== false,
    ingredients: Array.isArray(p.ingredients)
      ? p.ingredients.map(i => ({
          name: String(i.name || '').trim(),
          qty: Number(i.qty ?? i.quantity ?? 0)
        }))
      : []
  };
}

function serverProductsAreValid(list) {
  if (!Array.isArray(list)) return false;

  if (list.length < 19) return false;

  const names = list
    .map(p =>
      String(p.name || '')
        .trim()
        .toLowerCase()
    );

  const uniqueNames = new Set(names);

  if (uniqueNames.size < 10) return false;

  if (
    list.every(
      p =>
        String(p.name || '')
          .trim()
          .toLowerCase() ===
        'cachorro quente simples'
    )
  ) {
    return false;
  }

  return true;
}

async function load() {
  if (apiAvailable) {
    try {
      const result = await Promise.all([
        api('/api/products'),
        api('/api/stock'),
        api('/api/orders'),
        api('/api/settings'),
        api('/api/movements')
      ]);

      const serverProducts = Array.isArray(result[0])
        ? result[0].map(normalizeProduct)
        : [];

      /*
       * Se o servidor devolver os produtos errados,
       * não deixa o aplicativo inteiro ficar com
       * "Cachorro Quente Simples".
       */
      if (serverProductsAreValid(serverProducts)) {
        products = serverProducts;
      } else {
        console.warn(
          'Produtos recebidos do servidor parecem inválidos. Usando cardápio local.'
        );

        products = clone(seed.products);
      }

      stock = Array.isArray(result[1])
        ? result[1]
        : clone(seed.stock);

      orders = Array.isArray(result[2])
        ? result[2]
        : [];

      settings =
        result[3] ||
        clone(seed.settings);

      movements = Array.isArray(result[4])
        ? result[4]
        : [];

      setConnection(true);

    } catch (e) {
      console.error(
        'Falha ao carregar servidor:',
        e
      );

      loadLocal();
    }
  } else {
    loadLocal();
  }

  const brand = $('#brand');

  if (brand) {
    brand.textContent =
      (settings.name || "Strike")
        .toUpperCase()
        .replace(" BURGUE'S", '');
  }

  renderAll();
}

function loadLocal() {
  const d = localData();

  settings = d.settings || clone(seed.settings);

  products =
    Array.isArray(d.products) &&
    d.products.length
      ? d.products
      : clone(seed.products);

  stock =
    Array.isArray(d.stock)
      ? d.stock
      : clone(seed.stock);

  orders =
    Array.isArray(d.orders)
      ? d.orders
      : [];

  movements =
    Array.isArray(d.movements)
      ? d.movements
      : [];

  setConnection(false);
}


/* =========================================================
   RENDER GERAL
========================================================= */

function renderAll() {
  renderCategories();
  renderProducts();
  renderCart();
  renderStock();
  renderOrders();
  renderProductAdmin();
}


/* =========================================================
   CATEGORIAS
========================================================= */

function renderCategories() {
  const cats = [
    'Todos',
    ...new Set(
      products
        .filter(p => p.active !== false)
        .map(p => p.category || 'Outros')
    )
  ];

  if (!cats.includes(category)) {
    category = 'Todos';
  }

  const el = $('#categoryTabs');

  if (!el) return;

  el.innerHTML = cats
    .map(c =>
      `<button
        class="cat-tab ${category === c ? 'active' : ''}"
        onclick="setCategory(${JSON.stringify(c)})"
      >
        ${esc(c)}
      </button>`
    )
    .join('');
}

function setCategory(c) {
  category = c;

  renderCategories();
  renderProducts();
}


/* =========================================================
   ESTOQUE DO PRODUTO
========================================================= */

function stockForProduct(p) {
  return (p.ingredients || [])
    .map(i => {
      const s = stock.find(
        x =>
          String(x.name)
            .trim()
            .toLowerCase() ===
          String(i.name)
            .trim()
            .toLowerCase()
      );

      if (!s) return true;

      return (
        Number(s.quantity) >=
        Number(i.qty || 0)
      );
    })
    .every(Boolean);
}


/* =========================================================
   PRODUTOS
========================================================= */

function renderProducts() {
  const container = $('#products');

  if (!container) return;

  const list = products.filter(
    p =>
      p.active !== false &&
      (
        category === 'Todos' ||
        p.category === category
      )
  );

  container.innerHTML =
    list.length
      ? list.map(p => {
          const id = Number(p.id);
          const available = stockForProduct(p);

          return `
            <button
              type="button"
              class="product ${available ? '' : 'no-stock'}"
              data-product-id="${id}"
              onclick="add(${id})"
            >
              <div class="tag">
                ${esc(p.category || 'Outros')}
              </div>

              <div class="name">
                ${esc(p.name)}
              </div>

              <div class="desc">
                ${(p.ingredients || [])
                  .slice(0, 4)
                  .map(i => esc(i.name))
                  .join(' • ')}
              </div>

              <div class="price">
                ${money(p.price)}
              </div>
            </button>
          `;
        }).join('')
      : `
        <div class="empty">
          Nenhum produto nessa categoria.
        </div>
      `;
}


/* =========================================================
   CARRINHO
========================================================= */

function add(id) {
  const productId = Number(id);

  const p = products.find(
    x => Number(x.id) === productId
  );

  if (!p) {
    console.error(
      'Produto não encontrado:',
      productId,
      products
    );

    toast(
      'Produto não encontrado.',
      true
    );

    return;
  }

  const existing = cart.find(
    x => Number(x.productId) === productId
  );

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      productId: productId,
      name: p.name,
      price: Number(p.price || 0),
      quantity: 1
    });
  }

  renderCart();
}

function change(index, delta) {
  if (!cart[index]) return;

  cart[index].quantity += delta;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  renderCart();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const container = $('#cartItems');

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty">
        Nenhum item no pedido ainda.
      </div>
    `;
  } else {
    container.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-row">
            <div>
              <b>${esc(item.name)}</b>
              <div class="sub">
                ${money(item.price)} cada
              </div>
            </div>

            <div class="qty">
              <button
                type="button"
                onclick="change(${index},-1)"
              >
                −
              </button>

              <b>${item.quantity}</b>

              <button
                type="button"
                onclick="change(${index},1)"
              >
                +
              </button>
            </div>

            <button
              type="button"
              class="remove"
              onclick="removeCartItem(${index})"
            >
              ×
            </button>
          </div>
        `
      )
      .join('');
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.quantity || 0),
    0
  );

  const totalEl = $('#cartTotal');

  if (totalEl) {
    totalEl.textContent = money(total);
  }
}


/* =========================================================
   LIMPAR CARRINHO
========================================================= */

$('#clearCart')?.addEventListener(
  'click',
  () => {
    cart = [];

    const note = $('#orderNote');

    if (note) {
      note.value = '';
    }

    renderCart();
  }
);


/* =========================================================
   ENVIAR PEDIDO
========================================================= */

$('#sendOrder')?.addEventListener(
  'click',
  async () => {
    if (!cart.length) {
      toast(
        'Adicione algum produto primeiro.',
        true
      );

      return;
    }

    const note =
      $('#orderNote')?.value.trim() || '';

    const payload = {
      items: cart.map(item => ({
        ...item,
        note
      })),
      note
    };

    try {
      let order;

      if (apiAvailable) {
        order = await api(
          '/api/orders',
          {
            method: 'POST',
            body: JSON.stringify(payload)
          }
        );

        orders.unshift(order);

        stock = await api('/api/stock');

        movements =
          await api('/api/movements');
      } else {
        order = localSale(payload);
      }

      cart = [];

      if ($('#orderNote')) {
        $('#orderNote').value = '';
      }

      renderAll();

      browserPrintOrder(order);

      toast(
        `Pedido #${order.id} salvo. Escolha a impressora na tela de impressão.`
      );

    } catch (e) {
      console.error(e);

      toast(
        e.message ||
        'Não foi possível salvar o pedido.',
        true
      );
    }
  }
);


/* =========================================================
   VENDA LOCAL
========================================================= */

function localSale(payload) {
  const now =
    new Date().toISOString();

  const changes = [];

  for (const item of payload.items) {
    const p = products.find(
      x =>
        Number(x.id) ===
        Number(item.productId)
    );

    if (!p) {
      throw Error(
        `Produto não encontrado: ${item.productId}`
      );
    }

    for (const ing of p.ingredients || []) {
      const s = stock.find(
        x =>
          x.name
            .toLowerCase()
            .trim() ===
          ing.name
            .toLowerCase()
            .trim()
      );

      const amount =
        Number(ing.qty || 0) *
        Number(item.quantity || 0);

      if (s) {
        if (
          Number(s.quantity) <
          amount
        ) {
          throw Error(
            `Estoque insuficiente: ${s.name}. Disponível: ${s.quantity}.`
          );
        }

        changes.push({
          s,
          amount
        });
      }
    }
  }

  const order = {
    id:
      orders.length
        ? Math.max(
            ...orders.map(
              o => Number(o.id) || 0
            )
          ) + 1
        : 1,

    items: payload.items,

    note: payload.note,

    total: Number(
      payload.items
        .reduce(
          (sum, item) =>
            sum +
            Number(item.price || 0) *
            Number(item.quantity || 0),
          0
        )
        .toFixed(2)
    ),

    status: 'enviado',

    createdAt: now
  };

  orders.unshift(order);

  for (const change of changes) {
    change.s.quantity =
      Number(
        (
          Number(change.s.quantity) -
          Number(change.amount)
        ).toFixed(2)
      );

    movements.unshift({
      id: Date.now(),
      stockId: change.s.id,
      type: 'saida',
      quantity: change.amount,
      createdAt: now,
      reason: `Pedido #${order.id}`
    });
  }

  saveLocal();

  return order;
}


/* =========================================================
   IMPRESSÃO
========================================================= */

function renderPrintSheet(o) {
  const sheet = $('#printSheet');

  if (!sheet) return;

  sheet.innerHTML = `
    <div class="print-receipt">

      <h2>
        ${esc(
          settings.name ||
          "Strike Burgue's"
        )}
      </h2>

      <div class="print-order-no">
        PEDIDO #${esc(o.id)}
      </div>

      <div>
        ${new Date(
          o.createdAt
        ).toLocaleString('pt-BR')}
      </div>

      <div class="print-line"></div>

      ${o.items
        .map(
          item => `
            <div>
              ${item.quantity}x
              ${esc(item.name)}
              —
              ${money(
                Number(item.price || 0) *
                Number(item.quantity || 0)
              )}
            </div>
          `
        )
        .join('')}

      ${
        o.note
          ? `
            <div class="print-line"></div>
            <div>
              OBS: ${esc(o.note)}
            </div>
          `
          : ''
      }

      <div class="print-line"></div>

      <b class="print-total">
        TOTAL: ${money(o.total)}
      </b>

      <div class="print-line"></div>

      <div>
        Obrigado!
      </div>

    </div>
  `;
}

function browserPrintOrder(o) {
  renderPrintSheet(o);

  document.body.classList.add(
    'printing'
  );

  setTimeout(
    () => window.print(),
    50
  );

  const cleanup = () => {
    document.body.classList.remove(
      'printing'
    );

    window.removeEventListener(
      'afterprint',
      cleanup
    );
  };

  window.addEventListener(
    'afterprint',
    cleanup
  );
}


/* =========================================================
   ESTOQUE
========================================================= */

function renderStock() {
  const low =
    stock.filter(
      s => Number(s.quantity) <= 5
    ).length;

  const stats = $('#stockStats');

  if (stats) {
    stats.innerHTML = `
      <div class="stat">
        <div class="label">Itens</div>
        <div class="value">
          ${stock.length}
        </div>
      </div>

      <div class="stat">
        <div class="label">Baixos</div>
        <div class="value ${low ? 'low' : ''}">
          ${low}
        </div>
      </div>

      <div class="stat">
        <div class="label">Produtos</div>
        <div class="value">
          ${products.length}
        </div>
      </div>

      <div class="stat">
        <div class="label">Vendas</div>
        <div class="value">
          ${orders.length}
        </div>
      </div>
    `;
  }

  const list = $('#stockList');

  if (!list) return;

  list.innerHTML =
    stock.length
      ? stock
          .map(
            s => `
              <div class="stock-row">

                <div class="stock-main">
                  <b>${esc(s.name)}</b>

                  <div class="muted">
                    Unidade: ${esc(s.unit)}
                  </div>
                </div>

                <div class="stock-actions">

                  <button
                    aria-label="Diminuir ${esc(s.name)}"
                    onclick="adjustStock(${s.id},-1)"
                  >
                    −
                  </button>

                  <input
                    class="stock-edit"
                    aria-label="Quantidade de ${esc(s.name)}"
                    id="stockQty${s.id}"
                    type="number"
                    min="0"
                    step="1"
                    value="${s.quantity}"
                  >

                  <button
                    aria-label="Aumentar ${esc(s.name)}"
                    onclick="adjustStock(${s.id},1)"
                  >
                    +
                  </button>

                  <button
                    class="primary"
                    onclick="saveStockInput(${s.id})"
                  >
                    Salvar
                  </button>

                  <button
                    class="secondary"
                    onclick="addStockAmount(${s.id})"
                  >
                    + Entrada
                  </button>

                </div>

              </div>
            `
          )
          .join('')
      : `
          <div class="empty">
            Nenhum item de estoque.
          </div>
        `;

  const movementList =
    $('#movementList');

  if (movementList) {
    movementList.innerHTML =
      movements.length
        ? movements
            .slice(0, 8)
            .map(movementHTML)
            .join('')
        : `
            <div class="empty">
              Nenhuma movimentação.
            </div>
          `;
  }
}

function movementHTML(m) {
  const s =
    stock.find(
      x =>
        Number(x.id) ===
        Number(m.stockId)
    );

  return `
    <div class="movement ${
      m.type === 'entrada'
        ? 'in'
        : 'out'
    }">

      <div>
        <b>
          ${esc(s?.name || 'Item')}
        </b>

        <div class="muted">
          ${
            new Date(
              m.createdAt
            ).toLocaleString('pt-BR')
          }

          •
          ${esc(m.reason || '')}
        </div>
      </div>

      <div class="amount">
        <b>
          ${
            m.type === 'entrada'
              ? '+'
              : '−'
          }${m.quantity}
        </b>
      </div>

    </div>
  `;
}

async function adjustStock(id, delta) {
  const s = stock.find(
    x =>
      Number(x.id) ===
      Number(id)
  );

  if (!s) return;

  await updateStock(
    id,
    Math.max(
      0,
      Number(s.quantity) + delta
    ),
    'Ajuste rápido'
  );
}

async function addStockAmount(id) {
  const s = stock.find(
    x =>
      Number(x.id) ===
      Number(id)
  );

  if (!s) return;

  const q = Number(
    prompt(
      `Quanto adicionar em ${s.name}?`,
      '1'
    )
  );

  if (
    !Number.isFinite(q) ||
    q <= 0
  ) {
    return;
  }

  await updateStock(
    id,
    Number(s.quantity) + q,
    'Entrada de estoque'
  );
}

async function setStock(id) {
  const s = stock.find(
    x =>
      Number(x.id) ===
      Number(id)
  );

  if (!s) return;

  const q = Number(
    prompt(
      `Quantidade de ${s.name}:`,
      s.quantity
    )
  );

  if (
    !Number.isFinite(q) ||
    q < 0
  ) {
    return toast(
      'Quantidade inválida.',
      true
    );
  }

  await updateStock(
    id,
    q,
    'Ajuste manual'
  );
}

async function saveStockInput(id) {
  const el =
    $(`#stockQty${id}`);

  if (!el) return;

  const q =
    Number(el.value);

  if (
    el.value.trim() === '' ||
    !Number.isFinite(q) ||
    q < 0
  ) {
    return toast(
      'Digite uma quantidade válida.',
      true
    );
  }

  await updateStock(
    id,
    q,
    'Quantidade definida manualmente'
  );
}

async function updateStock(
  id,
  quantity,
  reason
) {
  if (apiAvailable) {
    try {
      await api(
        `/api/stock/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            quantity,
            reason
          })
        }
      );

      stock =
        await api('/api/stock');

      movements =
        await api('/api/movements');

    } catch (e) {
      toast(
        e.message,
        true
      );

      return;
    }
  } else {
    const s = stock.find(
      x =>
        Number(x.id) ===
        Number(id)
    );

    if (!s) return;

    const old =
      Number(s.quantity);

    s.quantity =
      Number(quantity);

    movements.unshift({
      id: Date.now(),
      stockId: s.id,
      type:
        quantity >= old
          ? 'entrada'
          : 'saida',
      quantity:
        Math.abs(quantity - old),
      createdAt:
        new Date().toISOString(),
      reason
    });

    saveLocal();
  }

  renderAll();

  toast(
    'Estoque atualizado.'
  );
}


/* =========================================================
   NOVO ITEM ESTOQUE
========================================================= */

$('#newStock')?.addEventListener(
  'click',
  openStockModal
);

function openStockModal() {
  showModal(`
    <div class="modal-box">

      <div class="modal-head">
        <h2>Novo item de estoque</h2>

        <button
          class="ghost"
          onclick="closeModal()"
        >
          ×
        </button>
      </div>

      <label>
        Nome
        <input
          id="mStockName"
          placeholder="Ex.: Bacon"
        >
      </label>

      <div class="two-col">

        <label>
          Quantidade
          <input
            id="mStockQty"
            type="number"
            value="0"
            min="0"
          >
        </label>

        <label>
          Unidade
          <input
            id="mStockUnit"
            value="un"
            placeholder="un, kg, porção"
          >
        </label>

      </div>

      <div class="modal-actions">

        <button
          class="secondary"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          class="primary"
          onclick="createStock()"
        >
          Adicionar
        </button>

      </div>

    </div>
  `);
}

async function createStock() {
  const name =
    $('#mStockName')
      ?.value.trim();

  const quantity =
    Number(
      $('#mStockQty')?.value
    );

  const unit =
    $('#mStockUnit')
      ?.value.trim() || 'un';

  if (!name) {
    return toast(
      'Digite o nome.',
      true
    );
  }

  if (
    !Number.isFinite(quantity) ||
    quantity < 0
  ) {
    return toast(
      'Quantidade inválida.',
      true
    );
  }

  if (apiAvailable) {
    try {
      await api(
        '/api/stock',
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            quantity,
            unit
          })
        }
      );

      stock =
        await api('/api/stock');

      movements =
        await api('/api/movements');

    } catch (e) {
      toast(
        e.message,
        true
      );

      return;
    }
  } else {
    const item = {
      id:
        stock.length
          ? Math.max(
              ...stock.map(
                x => Number(x.id)
              )
            ) + 1
          : 1,

      name,
      quantity,
      unit
    };

    stock.push(item);

    movements.unshift({
      id: Date.now(),
      stockId: item.id,
      type: 'entrada',
      quantity,
      createdAt:
        new Date().toISOString(),
      reason: 'Cadastro inicial'
    });

    saveLocal();
  }

  closeModal();

  renderAll();

  toast(
    'Item adicionado ao estoque.'
  );
}

function showMovements() {
  showModal(`
    <div class="modal-box">

      <div class="modal-head">

        <h2>
          Movimentações
        </h2>

        <button
          class="ghost"
          onclick="closeModal()"
        >
          ×
        </button>

      </div>

      ${
        movements
          .map(movementHTML)
          .join('') ||
        `
          <div class="empty">
            Nenhuma movimentação.
          </div>
        `
      }

    </div>
  `);
}


/* =========================================================
   HISTÓRICO
========================================================= */

function renderOrders() {
  const search =
    ($('#historySearch')?.value || '')
      .toLowerCase();

  const date =
    $('#historyDate')?.value || '';

  const list =
    orders.filter(order => {
      const matchesSearch =
        !search ||
        String(order.id)
          .includes(search) ||
        (order.items || []).some(
          item =>
            String(item.name || '')
              .toLowerCase()
              .includes(search)
        );

      const matchesDate =
        !date ||
        String(order.createdAt || '')
          .slice(0, 10) === date;

      return (
        matchesSearch &&
        matchesDate
      );
    });

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const todayOrders =
    orders.filter(
      o =>
        String(o.createdAt || '')
          .slice(0, 10) === today
    );

  const stats =
    $('#salesStats');

  if (stats) {
    stats.innerHTML = `
      <div class="stat">
        <div class="label">
          Hoje
        </div>
        <div class="value">
          ${todayOrders.length}
        </div>
      </div>

      <div class="stat">
        <div class="label">
          Faturamento hoje
        </div>
        <div class="value">
          ${money(
            todayOrders.reduce(
              (sum, o) =>
                sum +
                Number(o.total || 0),
              0
            )
          )}
        </div>
      </div>

      <div class="stat">
        <div class="label">
          Vendas totais
        </div>
        <div class="value">
          ${orders.length}
        </div>
      </div>

      <div class="stat">
        <div class="label">
          Faturamento total
        </div>
        <div class="value">
          ${money(
            orders.reduce(
              (sum, o) =>
                sum +
                Number(o.total || 0),
              0
            )
          )}
        </div>
      </div>
    `;
  }

  const ordersList =
    $('#ordersList');

  if (!ordersList) return;

  ordersList.innerHTML =
    list.length
      ? list
          .map(
            order => `
              <div class="order-row">

                <div class="order-main">

                  <b>
                    Pedido #${order.id}
                  </b>

                  <span class="badge">
                    ${esc(
                      order.status ||
                      'enviado'
                    )}
                  </span>

                  <div class="muted">
                    ${
                      new Date(
                        order.createdAt
                      ).toLocaleString(
                        'pt-BR'
                      )
                    }
                  </div>

                  <div class="order-items">
                    ${
                      (order.items || [])
                        .map(
                          item =>
                            `${item.quantity}x ${esc(item.name)}`
                        )
                        .join(' • ')
                    }

                    ${
                      order.note
                        ? `<br>Obs: ${esc(order.note)}`
                        : ''
                    }
                  </div>

                </div>

                <div class="mini-actions">

                  <div class="order-total">
                    ${money(order.total)}
                  </div>

                  <button
                    class="secondary"
                    onclick="printOrder(${order.id})"
                  >
                    🖨️
                  </button>

                </div>

              </div>
            `
          )
          .join('')
      : `
          <div class="empty">
            Nenhuma venda encontrada.
          </div>
        `;
}

$('#historySearch')?.addEventListener(
  'input',
  renderOrders
);

$('#historyDate')?.addEventListener(
  'change',
  renderOrders
);

function clearHistoryFilters() {
  if ($('#historySearch')) {
    $('#historySearch').value = '';
  }

  if ($('#historyDate')) {
    $('#historyDate').value = '';
  }

  renderOrders();
}

function printOrder(id) {
  const order =
    orders.find(
      x =>
        Number(x.id) ===
        Number(id)
    );

  if (order) {
    browserPrintOrder(order);
  }
}


/* =========================================================
   ADMINISTRAÇÃO DE PRODUTOS
========================================================= */

function renderProductAdmin() {
  const el =
    $('#productAdmin');

  if (!el) return;

  el.innerHTML =
    products
      .map(
        p => `
          <div class="product-admin-row">

            <div>

              <b>
                ${esc(p.name)}
              </b>

              <div class="muted">
                ${esc(p.category)}
                •
                ${money(p.price)}
                • baixa:
                ${
                  (p.ingredients || [])
                    .map(
                      i =>
                        `${esc(i.name)} x${i.qty}`
                    )
                    .join(', ') ||
                  'nenhum'
                }
              </div>

            </div>

            <div class="mini-actions">

              <button
                class="secondary"
                onclick="editProduct(${p.id})"
              >
                Editar
              </button>

              <button
                class="danger"
                onclick="removeProduct(${p.id})"
              >
                Excluir
              </button>

            </div>

          </div>
        `
      )
      .join('');
}

$('#newProduct')?.addEventListener(
  'click',
  () => openProductModal()
);

function ingredientRows(ingredients) {
  return ingredients
    .map(
      ingredient => `
        <div class="ingredient-row">

          <input
            class="ing-name"
            value="${esc(ingredient.name)}"
            placeholder="Ingrediente"
          >

          <input
            class="ing-qty"
            type="number"
            min="0"
            step="0.01"
            value="${ingredient.qty}"
          >

          <button
            class="danger"
            onclick="this.parentElement.remove()"
          >
            ×
          </button>

        </div>
      `
    )
    .join('');
}

function openProductModal(product = null) {
  showModal(`
    <div class="modal-box">

      <div class="modal-head">

        <div>

          <div class="eyebrow">
            ${product ? 'EDITAR' : 'NOVO'} PRODUTO
          </div>

          <h2>
            ${
              product
                ? esc(product.name)
                : 'Adicionar produto'
            }
          </h2>

        </div>

        <button
          class="ghost"
          onclick="closeModal()"
        >
          ×
        </button>

      </div>

      <label>
        Nome

        <input
          id="mProdName"
          value="${
            product
              ? esc(product.name)
              : ''
          }"
          placeholder="Ex.: X-Bacon"
        >
      </label>

      <div class="two-col">

        <label>
          Preço

          <input
            id="mProdPrice"
            type="number"
            min="0"
            step="0.01"
            value="${
              product?.price ?? ''
            }"
          >
        </label>

        <label>
          Categoria

          <input
            id="mProdCat"
            value="${
              product
                ? esc(product.category)
                : 'Hambúrguer'
            }"
            placeholder="Hambúrguer"
          >
        </label>

      </div>

      <div
        class="card-title"
        style="margin-top:16px"
      >

        <h2>
          Baixa automática no estoque
        </h2>

        <button
          class="secondary"
          onclick="addIngredientRow()"
        >
          ＋ Ingrediente
        </button>

      </div>

      <p class="muted">
        O nome precisa ser igual ao item
        cadastrado no estoque.
      </p>

      <div id="ingredientsEditor">
        ${
          ingredientRows(
            product?.ingredients || []
          )
        }
      </div>

      <div class="modal-actions">

        <button
          class="secondary"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          class="primary"
          onclick="saveProduct(${
            product?.id ?? 'null'
          })"
        >
          Salvar produto
        </button>

      </div>

    </div>
  `);
}

function addIngredientRow() {
  const d =
    document.createElement('div');

  d.className =
    'ingredient-row';

  d.innerHTML = `
    <input
      class="ing-name"
      placeholder="Ingrediente"
    >

    <input
      class="ing-qty"
      type="number"
      min="0"
      step="0.01"
      value="1"
    >

    <button
      class="danger"
      onclick="this.parentElement.remove()"
    >
      ×
    </button>
  `;

  $('#ingredientsEditor')
    ?.appendChild(d);
}

async function saveProduct(id) {
  const name =
    $('#mProdName')
      ?.value.trim();

  const price =
    Number(
      $('#mProdPrice')?.value
    );

  const productCategory =
    $('#mProdCat')
      ?.value.trim() ||
    'Outros';

  const ingredients = [
    ...document.querySelectorAll(
      '#ingredientsEditor .ingredient-row'
    )
  ]
    .map(row => ({
      name:
        row
          .querySelector('.ing-name')
          ?.value.trim() || '',

      qty:
        Number(
          row.querySelector(
            '.ing-qty'
          )?.value
        ) || 0
    }))
    .filter(
      item =>
        item.name &&
        item.qty > 0
    );

  if (
    !name ||
    !Number.isFinite(price)
  ) {
    return toast(
      'Preencha nome e preço.',
      true
    );
  }

  const body = {
    name,
    price,
    category: productCategory,
    ingredients
  };

  if (apiAvailable) {
    try {
      if (id) {
        await api(
          `/api/products/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );
      } else {
        await api(
          '/api/products',
          {
            method: 'POST',
            body: JSON.stringify(body)
          }
        );
      }

      products =
        await api('/api/products');

    } catch (e) {
      toast(
        e.message,
        true
      );

      return;
    }
  } else {
    if (id) {
      const product =
        products.find(
          x =>
            Number(x.id) ===
            Number(id)
        );

      if (product) {
        Object.assign(
          product,
          body
        );
      }
    } else {
      products.push({
        id:
          products.length
            ? Math.max(
                ...products.map(
                  x =>
                    Number(x.id)
                )
              ) + 1
            : 1,

        ...body,

        active: true
      });
    }

    saveLocal();
  }

  closeModal();

  renderAll();

  toast(
    id
      ? 'Produto atualizado.'
      : 'Produto adicionado.'
  );
}

function editProduct(id) {
  const product =
    products.find(
      p =>
        Number(p.id) ===
        Number(id)
    );

  if (product) {
    openProductModal(product);
  }
}

async function removeProduct(id) {
  if (
    !confirm(
      'Excluir este produto do cardápio?'
    )
  ) {
    return;
  }

  if (apiAvailable) {
    try {
      await api(
        `/api/products/${id}`,
        {
          method: 'DELETE'
        }
      );

      products =
        await api('/api/products');

    } catch (e) {
      toast(
        e.message,
        true
      );

      return;
    }
  } else {
    const product =
      products.find(
        x =>
          Number(x.id) ===
          Number(id)
      );

    if (product) {
      product.active = false;
    }

    products =
      products.filter(
        x => x.active !== false
      );

    saveLocal();
  }

  renderAll();

  toast(
    'Produto removido.'
  );
}


/* =========================================================
   IMPRESSÃO
========================================================= */

async function printOrderSmart(order) {
  browserPrintOrder(order);
}


/* =========================================================
   MODAIS
========================================================= */

function showModal(html) {
  const modal = $('#modal');

  if (!modal) return;

  modal.innerHTML = html;

  modal.classList.remove(
    'hidden'
  );
}

function closeModal() {
  const modal = $('#modal');

  if (!modal) return;

  modal.classList.add(
    'hidden'
  );

  modal.innerHTML = '';
}

$('#modal')?.addEventListener(
  'click',
  e => {
    if (
      e.target.id === 'modal'
    ) {
      closeModal();
    }
  }
);


/* =========================================================
   TOAST
========================================================= */

function toast(
  message,
  error = false
) {
  const element = $('#toast');

  if (!element) return;

  element.textContent =
    message;

  element.className =
    error
      ? 'toast-error'
      : '';

  element.style.display =
    'block';

  clearTimeout(
    window.__toast
  );

  window.__toast =
    setTimeout(
      () => {
        element.style.display =
          'none';
      },
      3000
    );
}


/* =========================================================
   BACKUP
========================================================= */

function exportData() {
  const data = {
    version: 2,
    exportedAt:
      new Date().toISOString(),
    settings,
    products,
    stock,
    orders,
    movements
  };

  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          'application/json'
      }
    );

  const a =
    document.createElement('a');

  a.href =
    URL.createObjectURL(blob);

  a.download =
    `strike-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

  a.click();

  URL.revokeObjectURL(
    a.href
  );

  toast(
    'Backup exportado.'
  );
}

const backupInput =
  $('#hiddenFile');

$('#exportBackup')?.addEventListener(
  'click',
  exportData
);

$('#importBackup')?.addEventListener(
  'click',
  () =>
    backupInput?.click()
);

backupInput?.addEventListener(
  'change',
  event => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const data =
          JSON.parse(
            reader.result
          );

        if (
          !Array.isArray(
            data.products
          ) ||
          !Array.isArray(
            data.stock
          ) ||
          !Array.isArray(
            data.orders
          )
        ) {
          throw new Error(
            'Arquivo incompleto'
          );
        }

        if (
          !confirm(
            'Restaurar este backup vai substituir os produtos, estoque e vendas atuais. Deseja continuar?'
          )
        ) {
          return;
        }

        if (apiAvailable) {
          api(
            '/api/backup',
            {
              method: 'POST',
              body:
                JSON.stringify(data)
            }
          )
            .then(
              async () => {
                [
                  products,
                  stock,
                  orders,
                  settings,
                  movements
                ] =
                  await Promise.all([
                    api('/api/products'),
                    api('/api/stock'),
                    api('/api/orders'),
                    api('/api/settings'),
                    api('/api/movements')
                  ]);

                $('#brand').textContent =
                  (
                    settings.name ||
                    'Strike'
                  )
                    .toUpperCase()
                    .replace(
                      " BURGUE'S",
                      ''
                    );

                renderAll();

                toast(
                  'Backup restaurado no servidor.'
                );
              }
            )
            .catch(
              error =>
                toast(
                  error.message ||
                  'Não foi possível restaurar o backup.',
                  true
                )
            );
        } else {
          settings =
            data.settings ||
            settings;

          products =
            data.products;

          stock =
            data.stock;

          orders =
            data.orders;

          movements =
            data.movements || [];

          saveLocal();

          renderAll();

          toast(
            'Backup restaurado neste aparelho.'
          );
        }

      } catch {
        toast(
          'Arquivo de backup inválido.',
          true
        );
      } finally {
        backupInput.value = '';
      }
    };

    reader.readAsText(file);
  }
);


/* =========================================================
   RESET LOCAL
========================================================= */

function resetLocalData() {
  if (
    !confirm(
      'Isso vai apagar os dados salvos neste navegador e voltar para o cardápio inicial. Continuar?'
    )
  ) {
    return;
  }

  localStorage.removeItem(
    LOCAL_KEY
  );

  location.reload();
}


/* =========================================================
   CONEXÃO
========================================================= */

window.addEventListener(
  'online',
  () => {
    if (!apiAvailable) {
      apiAvailable =
        !isGitHub;

      load();
    }
  }
);

window.addEventListener(
  'offline',
  () => {
    setConnection(false);
  }
);


/* =========================================================
   NAVEGAÇÃO
========================================================= */

document
  .querySelectorAll('.nav')
  .forEach(button => {
    button.onclick = () => {

      document
        .querySelectorAll('.nav')
        .forEach(x =>
          x.classList.remove(
            'active'
          )
        );

      button.classList.add(
        'active'
      );

      document
        .querySelectorAll('.page')
        .forEach(x =>
          x.classList.remove(
            'active'
          )
        );

      const page =
        $('#' + button.dataset.page);

      if (page) {
        page.classList.add(
          'active'
        );
      }

      if (
        button.dataset.page ===
        'historico'
      ) {
        renderOrders();
      }

      if (
        button.dataset.page ===
        'estoque'
      ) {
        renderStock();
      }
    };
  });


/* =========================================================
   ERROS
========================================================= */

window.addEventListener(
  'error',
  event => {
    console.error(
      event.error ||
      event.message
    );

    try {
      toast(
        'O sistema encontrou um erro. Recarregue a página.',
        true
      );
    } catch (_) {}
  }
);


/* =========================================================
   INICIAR
========================================================= */

load().catch(error => {
  console.error(error);

  toast(
    'Não foi possível carregar os dados. Atualize a página.',
    true
  );
});