const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DB_MODE = SUPABASE_URL && SUPABASE_KEY ? 'supabase' : 'local-fallback';

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function money(n) { return Number(Number(n || 0).toFixed(2)); }
function esc(s = '') { return String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function localSettings() { return { name: "Strike Burgue's" }; }
function sbUrl(table, query = '') { return `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`; }
async function sbFetch(table, { method='GET', query='', body, headers={} } = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase não configurado no servidor.');
  const res = await fetch(sbUrl(table, query), {
    method,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = data?.message || data?.hint || data?.details || data?.error || text || `Supabase ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
function q(params) { return new URLSearchParams(params).toString(); }

async function getStockRows() { return await sbFetch('stock_items', { query: q({ select:'*', order:'id.asc' }) }); }
async function getProductRows() { return await sbFetch('products', { query: q({ select:'*', active:'eq.true', order:'id.asc' }) }); }
async function getIngredientRows() { return await sbFetch('product_ingredients', { query: q({ select:'*', order:'id.asc' }) }); }
async function hydrateProducts(rows) {
  const [ings, stock] = await Promise.all([getIngredientRows(), getStockRows()]);
  const stockById = new Map(stock.map(s => [String(s.id), s]));
  const byProduct = new Map();
  for (const i of ings) {
    const arr = byProduct.get(String(i.product_id)) || [];
    const s = stockById.get(String(i.stock_item_id));
    arr.push({ name: s?.name || i.name || `Item ${i.stock_item_id}`, qty: Number(i.quantity ?? i.qty ?? 0) });
    byProduct.set(String(i.product_id), arr);
  }
  return rows.map(p => ({ id:Number(p.id), name:p.name, price:money(p.price), category:p.category || 'Outros', active:p.active !== false, ingredients:byProduct.get(String(p.id)) || [] }));
}
async function getOrders() {
  const [orders, items] = await Promise.all([
    sbFetch('orders', { query:q({select:'*',order:'id.desc'}) }),
    sbFetch('order_items', { query:q({select:'*',order:'id.asc'}) })
  ]);
  const byOrder = new Map();
  for (const it of items) {
    const arr = byOrder.get(String(it.order_id)) || [];
    arr.push({ productId:Number(it.product_id), name:it.product_name || it.name || '', price:money(it.price), quantity:Number(it.quantity || 1), note:String(it.note || '') });
    byOrder.set(String(it.order_id), arr);
  }
  return orders.map(o => ({ id:Number(o.id), items:byOrder.get(String(o.id)) || [], note:String(o.note || ''), total:money(o.total), status:o.status || 'enviado', createdAt:o.created_at || o.createdAt }));
}
async function getMovements() {
  const rows = await sbFetch('stock_movements', { query:q({select:'*',order:'id.desc',limit:'200'}) });
  return rows.map(m => ({ id:Number(m.id), stockId:Number(m.stock_item_id ?? m.stock_id), type:m.type, quantity:Number(m.quantity || 0), createdAt:m.created_at || m.createdAt, reason:m.reason || '' }));
}

app.get('/api/health', (req,res) => res.json({ ok:true, service:'strike-burgues', database:DB_MODE, time:new Date().toISOString() }));
app.get('/api/settings', (req,res) => res.json(localSettings()));
app.put('/api/settings', (req,res) => res.json(localSettings()));

app.get('/api/products', async (req,res) => { try { res.json(await hydrateProducts(await getProductRows())); } catch(e) { res.status(500).json({error:e.message}); } });
app.post('/api/products', async (req,res) => {
  try {
    const {name,price,category='Outros',ingredients=[]} = req.body;
    if (!String(name || '').trim()) return res.status(400).json({error:'Nome obrigatório.'});
    const created = await sbFetch('products', {method:'POST', query:q({select:'*'}), body:{name:String(name).trim(),price:money(price),category:String(category || 'Outros'),active:true}, headers:{Prefer:'return=representation'}});
    const p = created[0];
    await replaceIngredients(p.id, ingredients);
    res.status(201).json((await hydrateProducts([p]))[0]);
  } catch(e) { res.status(500).json({error:e.message}); }
});
async function replaceIngredients(productId, ingredients) {
  await sbFetch('product_ingredients', {method:'DELETE', query:q({product_id:`eq.${productId}`})});
  if (!Array.isArray(ingredients) || !ingredients.length) return;
  const stock = await getStockRows();
  const byName = new Map(stock.map(s => [String(s.name).trim().toLowerCase(), s]));
  const rows=[];
  for (const i of ingredients) {
    const s=byName.get(String(i.name || '').trim().toLowerCase());
    const qty=Number(i.qty);
    if (!s || !Number.isFinite(qty) || qty<=0) continue;
    rows.push({product_id:productId,stock_item_id:s.id,quantity:qty});
  }
  if (rows.length) await sbFetch('product_ingredients', {method:'POST', body:rows});
}
app.put('/api/products/:id', async (req,res) => {
  try {
    const id=Number(req.params.id); const patch={};
    if (req.body.name!==undefined) patch.name=String(req.body.name).trim();
    if (req.body.price!==undefined) patch.price=money(req.body.price);
    if (req.body.category!==undefined) patch.category=String(req.body.category || 'Outros');
    if (req.body.active!==undefined) patch.active=Boolean(req.body.active);
    const rows=await sbFetch('products',{method:'PATCH',query:q({id:`eq.${id}`,select:'*'}),body:patch,headers:{Prefer:'return=representation'}});
    if (!rows.length) return res.status(404).json({error:'Produto não encontrado.'});
    if (req.body.ingredients!==undefined) await replaceIngredients(id,req.body.ingredients);
    res.json((await hydrateProducts(rows))[0]);
  } catch(e){res.status(500).json({error:e.message});}
});
app.delete('/api/products/:id', async (req,res)=>{
  try { const id=Number(req.params.id); const rows=await sbFetch('products',{method:'PATCH',query:q({id:`eq.${id}`,select:'*'}),body:{active:false},headers:{Prefer:'return=representation'}}); if(!rows.length)return res.status(404).json({error:'Produto não encontrado.'}); res.json({ok:true}); }
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/stock', async (req,res)=>{try{res.json(await getStockRows())}catch(e){res.status(500).json({error:e.message})}});
app.post('/api/stock', async (req,res)=>{
  try { const {name,quantity=0,unit='un'}=req.body; if(!String(name||'').trim())return res.status(400).json({error:'Nome obrigatório.'});
    const rows=await sbFetch('stock_items',{method:'POST',query:q({select:'*'}),body:{name:String(name).trim(),quantity:Number(quantity)||0,unit:String(unit||'un')},headers:{Prefer:'return=representation'}});
    const item=rows[0]; if(Number(item.quantity)>0) await sbFetch('stock_movements',{method:'POST',body:{stock_item_id:item.id,type:'entrada',quantity:Number(item.quantity),reason:'Cadastro inicial'}});
    res.status(201).json(item);
  } catch(e){res.status(500).json({error:e.message})}
});
app.patch('/api/stock/:id', async (req,res)=>{
  try { const id=Number(req.params.id); const oldRows=await sbFetch('stock_items',{query:q({select:'*',id:`eq.${id}`})}); if(!oldRows.length)return res.status(404).json({error:'Item não encontrado.'});
    const old=Number(oldRows[0].quantity)||0, quantity=Number(req.body.quantity); if(!Number.isFinite(quantity)||quantity<0)return res.status(400).json({error:'Quantidade inválida.'});
    const rows=await sbFetch('stock_items',{method:'PATCH',query:q({id:`eq.${id}`,select:'*'}),body:{quantity},headers:{Prefer:'return=representation'}});
    if(quantity!==old) await sbFetch('stock_movements',{method:'POST',body:{stock_item_id:id,type:quantity>=old?'entrada':'saida',quantity:Math.abs(quantity-old),reason:req.body.reason||'Ajuste manual'}});
    res.json(rows[0]);
  } catch(e){res.status(500).json({error:e.message})}
});
app.get('/api/movements', async(req,res)=>{try{res.json(await getMovements())}catch(e){res.status(500).json({error:e.message})}});

app.get('/api/orders', async(req,res)=>{try{res.json(await getOrders())}catch(e){res.status(500).json({error:e.message})}});
app.post('/api/orders', async(req,res)=>{
  try {
    const items=Array.isArray(req.body.items)?req.body.items:[]; if(!items.length)return res.status(400).json({error:'Pedido vazio.'});
    const products=await hydrateProducts(await getProductRows()); const stock=await getStockRows();
    const normalized=[];
    for(const item of items){const p=products.find(x=>Number(x.id)===Number(item.productId));if(!p)return res.status(400).json({error:`Produto inválido: ${item.name||item.productId}`});const qty=Math.max(1,Number(item.quantity)||1);normalized.push({productId:p.id,name:p.name,price:p.price,quantity:qty,note:String(item.note||'')});}
    const required=new Map();
    for(const item of normalized){const p=products.find(x=>x.id===item.productId);for(const ing of p.ingredients||[]){const s=stock.find(x=>x.name.trim().toLowerCase()===String(ing.name).trim().toLowerCase());if(s){const amount=Math.max(0,Number(ing.qty)||0)*item.quantity;const cur=required.get(s.id)||{stock:s,amount:0};cur.amount+=amount;required.set(s.id,cur);}}}
    for(const c of required.values())if(Number(c.stock.quantity)<c.amount)return res.status(409).json({error:`Estoque insuficiente: ${c.stock.name}. Disponível: ${c.stock.quantity}; necessário: ${c.amount}.`});
    const total=money(normalized.reduce((sum,i)=>sum+i.price*i.quantity,0));
    const orderRows=await sbFetch('orders',{method:'POST',query:q({select:'*'}),body:{note:String(req.body.note||''),total,status:'enviado'},headers:{Prefer:'return=representation'}}); const order=orderRows[0];
    const orderItems=normalized.map(i=>({order_id:order.id,product_id:i.productId,product_name:i.name,price:i.price,quantity:i.quantity,note:i.note}));
    await sbFetch('order_items',{method:'POST',body:orderItems});
    for(const c of required.values()){
      const next=money(Number(c.stock.quantity)-c.amount);
      await sbFetch('stock_items',{method:'PATCH',query:q({id:`eq.${c.stock.id}`}),body:{quantity:next}});
      await sbFetch('stock_movements',{method:'POST',body:{stock_item_id:c.stock.id,type:'saida',quantity:c.amount,reason:`Pedido #${order.id}`} });
    }
    res.status(201).json({id:Number(order.id),items:normalized,note:String(order.note||''),total, status:order.status||'enviado',createdAt:order.created_at||new Date().toISOString()});
  } catch(e){res.status(500).json({error:e.message})}
});

// Mantido para compatibilidade; a impressão principal do sistema é pelo navegador do celular.
app.post('/api/orders/:id/print', async(req,res)=>res.status(400).json({error:'Use a impressão do navegador no celular.'}));
app.post('/api/printer/test', async(req,res)=>res.status(400).json({error:'A impressão atual é pelo navegador. Abra a tela de impressão e selecione a impressora térmica.'}));

app.get('/api/orders/:id/receipt', async(req,res)=>{
  try { const order=(await getOrders()).find(x=>x.id===Number(req.params.id)); if(!order)return res.status(404).send('Pedido não encontrado');
    const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Pedido #${order.id}</title><style>body{font-family:monospace;width:72mm;max-width:100%;margin:auto;font-size:18px;line-height:1.4}h2{text-align:center}.line{border-top:1px dashed #000;margin:10px 0}@media print{button{display:none}}</style></head><body><h2>${esc(localSettings().name)}</h2><div>Pedido #${order.id}</div><div>${new Date(order.createdAt).toLocaleString('pt-BR')}</div><div class="line"></div>${order.items.map(i=>`<div>${i.quantity}x ${esc(i.name)} — R$ ${(i.price*i.quantity).toFixed(2).replace('.',',')}</div>`).join('')}${order.note?`<div class="line"></div><div>OBS: ${esc(order.note)}</div>`:''}<div class="line"></div><b>TOTAL: R$ ${order.total.toFixed(2).replace('.',',')}</b><br><br><button onclick="print()">Imprimir</button><script>setTimeout(()=>print(),300)</script></body></html>`;
    res.type('html').send(html);
  } catch(e){res.status(500).send(e.message)}
});

app.post('/api/backup', async(req,res)=>res.status(400).json({error:'Backup JSON não restaura diretamente no Supabase nesta versão. Use o banco do Supabase.'}));

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,HOST,()=>console.log(`Strike Burgue's ativo em ${HOST}:${PORT} | banco: ${DB_MODE}`));
