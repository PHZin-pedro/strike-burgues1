const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const net = require("net");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "data");
const DATA = path.join(DATA_DIR, "db.json");

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureDB() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const seedPath = path.join(DATA_DIR, "seed.json");
  // Inicializa com o cardápio Strike Burgue's se o banco ainda não existe.
  if (!fs.existsSync(DATA)) {
    const seed = fs.existsSync(seedPath)
      ? JSON.parse(fs.readFileSync(seedPath, "utf8"))
      : { settings: { name: "Strike Burgue's" }, products: [], stock: [], orders: [], movements: [] };
    fs.writeFileSync(DATA, JSON.stringify(seed, null, 2));
  } else {
    // Corrige bancos criados anteriormente vazios, sem apagar dados existentes.
    const current = JSON.parse(fs.readFileSync(DATA, "utf8"));
    if ((!current.products || current.products.length === 0) && (!current.stock || current.stock.length === 0) && fs.existsSync(seedPath)) {
      const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
      seed.orders = current.orders || [];
      seed.movements = current.movements || [];
      fs.writeFileSync(DATA, JSON.stringify(seed, null, 2));
    }
  }
}
ensureDB();
// Migração automática: remove itens artesanais que não existem no cardápio atual.
try {
  const db = readDB();
  db.products = (db.products || []).filter(p => !String(p.name || '').toLowerCase().includes('artesanal'));
  db.stock = (db.stock || []).filter(s => !String(s.name || '').toLowerCase().includes('artesanal'));
  for (const product of db.products) {
    product.ingredients = (product.ingredients || []).map(i => ({ ...i, name: /^pão artesanal$/i.test(i.name) ? 'Pão' : /^hambúrguer artesanal$/i.test(i.name) ? 'Hambúrguer' : i.name }));
  }
  writeDB(db);
} catch (e) { console.error('Migração inicial não concluída:', e.message); }

function readDB() { return JSON.parse(fs.readFileSync(DATA, "utf8")); }
function writeDB(db) {
  const tmp = DATA + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, DATA);
}
function nextId(list) { return list.length ? Math.max(...list.map(x => Number(x.id) || 0)) + 1 : 1; }
function money(n) { return Number(Number(n || 0).toFixed(2)); }
function esc(s = "") { return String(s).replace(/[&<>\"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[c])); }

function escPosText(text) { return Buffer.from(String(text).replace(/\r/g, ""), "utf8"); }
function buildReceipt(order, settings) {
  const lines = [];
  const width = 32;
  const line = "-".repeat(width);
  lines.push("\x1b@");
  // ESC/POS printers vary by model; UTF-8 is used here because many modern network printers support it.
  // If a model prints accents incorrectly, its code page must be configured on the printer.
  lines.push("\x1b\x61\x01");
  lines.push((settings.name || "Lanchonete") + "\n");
  lines.push("\x1b\x61\x00");
  lines.push(line + "\n");
  lines.push(`PEDIDO #${order.id}\n`);
  lines.push(new Date(order.createdAt).toLocaleString("pt-BR") + "\n");
  lines.push(line + "\n");
  for (const item of order.items) {
    lines.push(`${item.quantity}x ${item.name}\n`);
    if (item.note) lines.push(`  Obs: ${item.note}\n`);
  }
  if (order.note) lines.push(`OBS: ${order.note}\n`);
  lines.push(line + "\n");
  lines.push(`TOTAL: R$ ${order.total.toFixed(2).replace(".", ",")}\n`);
  lines.push("\n\n");
  lines.push("\x1d\x56\x00");
  return Buffer.concat(lines.map(escPosText));
}
function printNetwork(order, settings) {
  return new Promise((resolve, reject) => {
    const host = settings?.printer?.host;
    const port = Number(settings?.printer?.port || 9100);
    if (!host) return reject(new Error("IP da impressora não configurado."));
    const socket = new net.Socket();
    let finished = false;
    const fail = e => { if (!finished) { finished = true; socket.destroy(); reject(e); } };
    socket.setTimeout(5000);
    socket.on("timeout", () => fail(new Error("Tempo esgotado ao conectar na impressora.")));
    socket.on("error", fail);
    socket.connect(port, host, () => {
      socket.write(buildReceipt(order, settings), () => {
        finished = true;
        socket.end();
        resolve({ ok: true });
      });
    });
  });
}

app.get("/api/health", (req, res) => res.json({ ok: true, service: "strike-burgues", time: new Date().toISOString() }));

// Restaura um backup JSON validado. Essa rota é usada pelo botão de restauração.
app.post("/api/backup", (req, res) => {
  const incoming = req.body || {};
  if (!Array.isArray(incoming.products) || !Array.isArray(incoming.stock) || !Array.isArray(incoming.orders)) {
    return res.status(400).json({ error: "Backup inválido: faltam produtos, estoque ou vendas." });
  }
  const current = readDB();
  const next = {
    settings: incoming.settings && typeof incoming.settings === "object" ? incoming.settings : current.settings,
    products: incoming.products,
    stock: incoming.stock,
    orders: incoming.orders,
    movements: Array.isArray(incoming.movements) ? incoming.movements : []
  };
  // IDs e campos básicos são normalizados para evitar dados malformados.
  next.products = next.products.map((p, i) => ({ ...p, id: Number(p.id) || i + 1, name: String(p.name || "Produto"), price: money(p.price), active: p.active !== false, ingredients: Array.isArray(p.ingredients) ? p.ingredients : [] }));
  next.stock = next.stock.map((item, i) => ({ ...item, id: Number(item.id) || i + 1, name: String(item.name || "Item"), quantity: Math.max(0, Number(item.quantity) || 0), unit: String(item.unit || "un") }));
  next.orders = next.orders.map((o, i) => ({ ...o, id: Number(o.id) || i + 1, items: Array.isArray(o.items) ? o.items : [], total: money(o.total), createdAt: o.createdAt || new Date().toISOString() }));
  next.movements = next.movements.map((m, i) => ({ ...m, id: Number(m.id) || i + 1 }));
  writeDB(next);
  res.json({ ok: true, products: next.products.length, stock: next.stock.length, orders: next.orders.length });
});

app.get("/api/settings", (req, res) => res.json(readDB().settings));
app.put("/api/settings", (req, res) => {
  const db = readDB();
  db.settings = {
    ...db.settings,
    ...req.body,
    printer: { ...(db.settings.printer || {}), ...(req.body.printer || {}) }
  };
  writeDB(db);
  res.json(db.settings);
});

app.get("/api/products", (req, res) => res.json(readDB().products.filter(p => p.active !== false)));
app.post("/api/products", (req, res) => {
  const db = readDB();
  const { name, price, category = "Outros", ingredients = [] } = req.body;
  if (!String(name || "").trim()) return res.status(400).json({ error: "Nome obrigatório." });
  const p = {
    id: nextId(db.products), name: String(name).trim(), price: money(price), category: String(category || "Outros"),
    active: true, ingredients: Array.isArray(ingredients) ? ingredients.map(i => ({ name: String(i.name), qty: Number(i.qty) || 0 })) : []
  };
  db.products.push(p); writeDB(db); res.status(201).json(p);
});
app.put("/api/products/:id", (req, res) => {
  const db = readDB(); const p = db.products.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({ error: "Produto não encontrado." });
  Object.assign(p, req.body);
  if (req.body.price !== undefined) p.price = money(req.body.price);
  if (req.body.ingredients !== undefined) p.ingredients = Array.isArray(req.body.ingredients) ? req.body.ingredients : [];
  if (req.body.name !== undefined) p.name = String(req.body.name).trim();
  writeDB(db); res.json(p);
});
app.delete("/api/products/:id", (req, res) => {
  const db = readDB(); const p = db.products.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({ error: "Produto não encontrado." });
  p.active = false; writeDB(db); res.json({ ok: true });
});

app.get("/api/stock", (req, res) => res.json(readDB().stock));
app.post("/api/stock", (req, res) => {
  const db = readDB();
  const { name, quantity = 0, unit = "un" } = req.body;
  if (!String(name || "").trim()) return res.status(400).json({ error: "Nome obrigatório." });
  const item = { id: nextId(db.stock), name: String(name).trim(), quantity: Number(quantity) || 0, unit: String(unit || "un") };
  db.stock.push(item);
  db.movements.push({ id: nextId(db.movements), stockId: item.id, type: "entrada", quantity: item.quantity, createdAt: new Date().toISOString(), reason: "Cadastro inicial" });
  writeDB(db); res.status(201).json(item);
});
app.patch("/api/stock/:id", (req, res) => {
  const db = readDB(); const item = db.stock.find(x => x.id == req.params.id);
  if (!item) return res.status(404).json({ error: "Item não encontrado." });
  const old = Number(item.quantity) || 0;
  const quantity = Number(req.body.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) return res.status(400).json({ error: "Quantidade inválida." });
  item.quantity = quantity;
  db.movements.push({
    id: nextId(db.movements), stockId: item.id, type: quantity >= old ? "entrada" : "saida",
    quantity: Math.abs(quantity - old), createdAt: new Date().toISOString(), reason: req.body.reason || "Ajuste manual"
  });
  writeDB(db); res.json(item);
});
app.get("/api/movements", (req, res) => res.json(readDB().movements.slice(-200).reverse()));

app.get("/api/orders", (req, res) => res.json(readDB().orders.slice().reverse()));
app.post("/api/orders", (req, res) => {
  const db = readDB();
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: "Adicione pelo menos um produto." });

  const normalized = [];
  for (const item of items) {
    const p = db.products.find(x => x.id == item.productId && x.active !== false);
    if (!p) return res.status(400).json({ error: `Produto inválido: ${item.name || item.productId}` });
    const qty = Math.max(1, Number(item.quantity) || 1);
    normalized.push({ productId: p.id, name: p.name, price: p.price, quantity: qty, note: String(item.note || "") });
  }

  const requiredByStock = new Map();
  for (const item of normalized) {
    const p = db.products.find(x => x.id === item.productId);
    for (const ing of (p.ingredients || [])) {
      const stockItem = db.stock.find(s => s.name.trim().toLowerCase() === String(ing.name).trim().toLowerCase());
      if (stockItem) {
        const amount = Math.max(0, Number(ing.qty || 0)) * item.quantity;
        const previous = requiredByStock.get(stockItem.id) || { stock: stockItem, amount: 0 };
        previous.amount += amount;
        requiredByStock.set(stockItem.id, previous);
      }
    }
  }
  const stockChanges = [...requiredByStock.values()];
  for (const change of stockChanges) {
    if (Number(change.stock.quantity) < change.amount) {
      return res.status(409).json({ error: `Estoque insuficiente: ${change.stock.name}. Disponível: ${change.stock.quantity}; necessário: ${change.amount}.` });
    }
  }

  const order = {
    id: nextId(db.orders), items: normalized,
    note: String(req.body.note || ""),
    total: money(normalized.reduce((s, i) => s + i.price * i.quantity, 0)),
    status: "enviado", createdAt: new Date().toISOString()
  };
  db.orders.push(order);
  for (const c of stockChanges) {
    c.stock.quantity = money(c.stock.quantity - c.amount);
    db.movements.push({ id: nextId(db.movements), stockId: c.stock.id, type: "saida", quantity: c.amount, createdAt: new Date().toISOString(), reason: `Pedido #${order.id}` });
  }
  writeDB(db); res.status(201).json(order);
});

app.post("/api/orders/:id/print", async (req, res) => {
  const db = readDB(); const order = db.orders.find(x => x.id == req.params.id);
  if (!order) return res.status(404).json({ error: "Pedido não encontrado." });
  try { res.json(await printNetwork(order, db.settings)); }
  catch (e) { res.status(502).json({ error: e.message, fallback: true }); }
});

app.post("/api/printer/test", async (req, res) => {
  const db = readDB();
  const fakeOrder = {
    id: "TEST",
    createdAt: new Date().toISOString(),
    items: [{ name: "Teste de impressora", quantity: 1, price: 0 }],
    note: "Se esta folha saiu, a conexão ESC/POS está funcionando.",
    total: 0
  };
  try {
    res.json(await printNetwork(fakeOrder, db.settings));
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get("/api/orders/:id/receipt", (req, res) => {
  const db = readDB(); const order = db.orders.find(x => x.id == req.params.id);
  if (!order) return res.status(404).send("Pedido não encontrado");
  res.type("html").send(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Pedido #${order.id}</title>
  <style>body{font-family:monospace;width:72mm;max-width:100%;margin:auto;font-size:18px;line-height:1.4}h2{text-align:center}.line{border-top:1px dashed #000;margin:10px 0}@media print{button{display:none}}</style>
  </head><body><h2>${esc(db.settings.name)}</h2><div>Pedido #${order.id}</div><div>${new Date(order.createdAt).toLocaleString("pt-BR")}</div><div class="line"></div>
  ${order.items.map(i => `<div>${i.quantity}x ${esc(i.name)} — R$ ${(i.price * i.quantity).toFixed(2)}${i.note ? `<br>Obs: ${esc(i.note)}` : ""}</div>`).join("")}
  ${order.note ? `<div class="line"></div><div>OBS: ${esc(order.note)}</div>` : ""}
  <div class="line"></div><b>TOTAL: R$ ${order.total.toFixed(2)}</b><br><br><button onclick="print()">Imprimir</button><script>setTimeout(()=>print(),300)</script></body></html>`);
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, HOST, () => {
  console.log(`Servidor ativo em http://${HOST}:${PORT}`);
  console.log(`No celular, use o IPv4 deste computador: http://IP-DO-PC:${PORT}`);
});
