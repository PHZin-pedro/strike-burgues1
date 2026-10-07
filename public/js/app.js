let products=[],stock=[],orders=[],settings={},movements=[],cart=[];
let category='Todos';
const $=s=>document.querySelector(s);
const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const LOCAL_KEY='strike-burgues-app-final-20261007';
const isGitHub=location.hostname.endsWith('github.io');
let apiAvailable=!isGitHub;

const seed={
  settings:{name:"Strike Burgue's",printer:{mode:'browser'}},
  products:[
    {id:1,name:'X-Tudd da Praça',price:10,category:'Hambúrguer',active:true,ingredients:[{name:'Pão',qty:1},{name:'Hambúrguer',qty:1},{name:'Tomate',qty:1},{name:'Alface',qty:1},{name:'Salsicha',qty:1},{name:'Ovo',qty:1}]},
    {id:2,name:'X-Bacon',price:15,category:'Hambúrguer',active:true,ingredients:[{name:'Pão',qty:1},{name:'Hambúrguer',qty:1},{name:'Tomate',qty:1},{name:'Alface',qty:1},{name:'Salsicha',qty:1},{name:'Ovo',qty:1},{name:'Bacon',qty:1}]},
    {id:3,name:'X-Calabresa',price:15,category:'Hambúrguer',active:true,ingredients:[{name:'Pão',qty:1},{name:'Hambúrguer',qty:1},{name:'Tomate',qty:1},{name:'Alface',qty:1},{name:'Salsicha',qty:1},{name:'Ovo',qty:1},{name:'Calabresa',qty:1}]},
    {id:4,name:'X-Trio',price:18,category:'Hambúrguer',active:true,ingredients:[{name:'Pão',qty:1},{name:'Hambúrguer',qty:1},{name:'Presunto',qty:1},{name:'Muçarela',qty:1},{name:'Milho',qty:1},{name:'Tomate',qty:1},{name:'Alface',qty:1},{name:'Salsicha',qty:1},{name:'Ovo',qty:1},{name:'Bacon',qty:1},{name:'Calabresa',qty:1}]},
    {id:5,name:'X-Strike',price:22,category:'Hambúrguer',active:true,ingredients:[{name:'Pão',qty:1},{name:'Hambúrguer',qty:1},{name:'Presunto',qty:1},{name:'Muçarela',qty:1},{name:'Milho',qty:1},{name:'Tomate',qty:1},{name:'Alface',qty:1},{name:'Salsicha',qty:1},{name:'Ovo',qty:1},{name:'Bacon',qty:1},{name:'Calabresa',qty:1}]},
    {id:6,name:'Batata Pequena 200g',price:10,category:'Batata Frita',active:true,ingredients:[{name:'Batata',qty:1},{name:'Queijo',qty:1}]},
    {id:7,name:'Batata Pequena Completa 200g',price:15,category:'Batata Frita',active:true,ingredients:[{name:'Batata',qty:1},{name:'Queijo',qty:1},{name:'Bacon',qty:1},{name:'Calabresa',qty:1}]},
    {id:8,name:'Batata Grande 400g',price:15,category:'Batata Frita',active:true,ingredients:[{name:'Batata',qty:2},{name:'Queijo',qty:1}]},
    {id:9,name:'Batata Grande Completa 400g',price:20,category:'Batata Frita',active:true,ingredients:[{name:'Batata',qty:2},{name:'Queijo',qty:1},{name:'Bacon',qty:1},{name:'Calabresa',qty:1}]},
    {id:10,name:'Cachorro Quente Simples',price:7.5,category:'Cachorro Quente',active:true,ingredients:[{name:'Pão hot dog',qty:1},{name:'Salsicha',qty:1},{name:'Milho',qty:1},{name:'Batata palha',qty:1},{name:'Catupiry',qty:1}]},
    {id:11,name:'Cachorro Quente da Praça',price:12,category:'Cachorro Quente',active:true,ingredients:[{name:'Pão hot dog',qty:1},{name:'Salsicha',qty:1},{name:'Milho',qty:1},{name:'Batata palha',qty:1},{name:'Catupiry',qty:1},{name:'Bacon',qty:1},{name:'Calabresa',qty:1}]},
    {id:12,name:'Cachorro Quente Completão',price:18,category:'Cachorro Quente',active:true,ingredients:[{name:'Pão hot dog',qty:1},{name:'Salsicha',qty:1},{name:'Milho',qty:1},{name:'Batata palha',qty:1},{name:'Catupiry',qty:1},{name:'Bacon',qty:1},{name:'Calabresa',qty:1},{name:'Queijo',qty:1}]},
    {id:13,name:'Adicional Bacon',price:3,category:'Adicionais',active:true,ingredients:[{name:'Bacon',qty:1}]},{id:14,name:'Adicional Presunto',price:3,category:'Adicionais',active:true,ingredients:[{name:'Presunto',qty:1}]},{id:15,name:'Adicional Muçarela',price:3,category:'Adicionais',active:true,ingredients:[{name:'Muçarela',qty:1}]},{id:16,name:'Adicional Salsicha',price:3,category:'Adicionais',active:true,ingredients:[{name:'Salsicha',qty:1}]},{id:17,name:'Adicional Cheddar',price:3,category:'Adicionais',active:true,ingredients:[{name:'Cheddar',qty:1}]},{id:18,name:'Coca-Cola 220ml',price:5,category:'Bebidas',active:true,ingredients:[{name:'Coca-Cola 220ml',qty:1}]},{id:19,name:'Promoção Trio Bomba',price:19.99,category:'Promoções',active:true,ingredients:[{name:'Coca-Cola 220ml',qty:1},{name:'Batata',qty:1},{name:'Pão',qty:1},{name:'Hambúrguer',qty:1},{name:'Tomate',qty:1},{name:'Alface',qty:1},{name:'Salsicha',qty:1},{name:'Ovo',qty:1}]}
  ],
  stock:[
    {id:1,name:'Pão',quantity:100,unit:'un'},{id:2,name:'Hambúrguer',quantity:100,unit:'un'},{id:3,name:'Pão hot dog',quantity:100,unit:'un'},{id:4,name:'Tomate',quantity:100,unit:'porção'},{id:5,name:'Alface',quantity:100,unit:'porção'},{id:6,name:'Salsicha',quantity:100,unit:'un'},{id:7,name:'Ovo',quantity:100,unit:'un'},{id:8,name:'Bacon',quantity:100,unit:'porção'},{id:9,name:'Calabresa',quantity:100,unit:'porção'},{id:10,name:'Presunto',quantity:100,unit:'porção'},{id:11,name:'Muçarela',quantity:100,unit:'porção'},{id:12,name:'Milho',quantity:100,unit:'porção'},{id:13,name:'Queijo',quantity:100,unit:'porção'},{id:14,name:'Batata',quantity:200,unit:'porção'},{id:15,name:'Batata palha',quantity:100,unit:'porção'},{id:16,name:'Catupiry',quantity:100,unit:'porção'},{id:17,name:'Cheddar',quantity:100,unit:'porção'},{id:18,name:'Coca-Cola 220ml',quantity:100,unit:'un'}],orders:[],movements:[]
};

function clone(o){return JSON.parse(JSON.stringify(o));}
function localData(){let d=localStorage.getItem(LOCAL_KEY);if(!d){localStorage.setItem(LOCAL_KEY,JSON.stringify(seed));return clone(seed)}return JSON.parse(d)}
function saveLocal(){localStorage.setItem(LOCAL_KEY,JSON.stringify({settings,products,stock,orders,movements}))}
function setConnection(ok){const el=$('#connection');if(!el)return;el.classList.toggle('offline',!ok);el.innerHTML=`<span></span> ${ok?'Online / salvo':'Modo local / salvo no aparelho'}`}
async function api(url,opt={}){
  if(!apiAvailable) throw Error('O servidor não está conectado.');
  let response;
  try {
    response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opt });
  } catch (e) {
    apiAvailable = false;
    setConnection(false);
    throw new Error('Sem conexão com o servidor. Confira a internet e recarregue a página.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Erro do servidor (${response.status}).`);
  return data;
}
const EXPECTED_PRODUCTS=['X-Tudd da Praça','X-Bacon','X-Calabresa','X-Trio','X-Strike','Batata Pequena 200g','Batata Pequena Completa 200g','Batata Grande 400g','Batata Grande Completa 400g','Cachorro Quente Simples','Cachorro Quente da Praça','Cachorro Quente Completão','Adicional Bacon','Adicional Presunto','Adicional Muçarela','Adicional Salsicha','Adicional Cheddar','Coca-Cola 220ml','Promoção Trio Bomba'];
function validProducts(list){
  if(!Array.isArray(list)||list.length!==EXPECTED_PRODUCTS.length)return false;
  const got=list.map(p=>String(p?.name||'').trim().toLowerCase());
  const expected=EXPECTED_PRODUCTS.map(x=>x.toLowerCase());
  if(!expected.every(x=>got.includes(x)))return false;
  return list.every(p=>Number.isFinite(Number(p.id))&&String(p.name||'').trim()&&Number.isFinite(Number(p.price)));
}
function validStock(list){return Array.isArray(list)&&list.length>=18&&list.every(x=>x&&Number.isFinite(Number(x.id))&&String(x.name||'').trim()&&Number.isFinite(Number(x.quantity)));}
function safeLocalData(){
  try{
    const d=localData();
    if(validProducts(d.products)&&validStock(d.stock)&&Array.isArray(d.orders))return d;
  }catch(e){}
  const fresh=clone(seed);
  localStorage.setItem(LOCAL_KEY,JSON.stringify(fresh));
  return fresh;
}
async function load(){
  const local=safeLocalData();
  settings=local.settings;products=local.products;stock=local.stock;orders=local.orders;movements=local.movements||[];
  if(apiAvailable){
    const results=await Promise.allSettled([api('/api/products'),api('/api/stock'),api('/api/orders'),api('/api/settings'),api('/api/movements')]);
    const [rp,rs,ro,rt,rm]=results;
    if(rp.status==='fulfilled'&&validProducts(rp.value))products=rp.value;
    if(rs.status==='fulfilled'&&validStock(rs.value))stock=rs.value;
    if(ro.status==='fulfilled'&&Array.isArray(ro.value))orders=ro.value;
    if(rt.status==='fulfilled'&&rt.value&&typeof rt.value==='object')settings=rt.value;
    if(rm.status==='fulfilled'&&Array.isArray(rm.value))movements=rm.value;
    const ok=rp.status==='fulfilled'||rs.status==='fulfilled';
    setConnection(ok);
  }else setConnection(false);
  $('#brand').textContent=(settings.name||"Strike").toUpperCase().replace(" BURGUE'S",'');
  renderAll();
}
function loadLocal(){const d=safeLocalData();settings=d.settings;products=d.products;stock=d.stock;orders=d.orders;movements=d.movements||[];setConnection(false)}
async function persist(url,opt,localFn){if(apiAvailable){try{return await api(url,opt)}catch(e){}}localFn();saveLocal();return true}
function renderAll(){renderCategories();renderProducts();renderCart();renderStock();renderOrders();renderProductAdmin();}
function renderCategories(){const cats=['Todos',...new Set(products.map(p=>p.category||'Outros'))];if(!cats.includes(category))category='Todos';$('#categoryTabs').innerHTML=cats.map(c=>`<button class="cat-tab ${category===c?'active':''}" onclick="setCategory('${esc(c)}')">${esc(c)}</button>`).join('')}
function setCategory(c){category=c;renderCategories();renderProducts()}
function stockForProduct(p){return (p.ingredients||[]).map(i=>{const s=stock.find(x=>x.name.toLowerCase()===String(i.name).toLowerCase());return s?Number(s.quantity)>=Number(i.qty||0):true}).every(Boolean)}
function renderProducts(){const list=products.filter(p=>category==='Todos'||p.category===category);$('#products').innerHTML=list.map(p=>`<button class="product ${stockForProduct(p)?'':'no-stock'}" onclick="add(${p.id})"><div class="tag">${esc(p.category||'Outros')}</div><div class="name">${esc(p.name)}</div><div class="desc">${(p.ingredients||[]).slice(0,4).map(i=>esc(i.name)).join(' • ')}</div><div class="price">${money(p.price)}</div></button>`).join('')||'<div class="empty">Nenhum produto nessa categoria.</div>'}
function add(id){const p=products.find(x=>x.id===id);if(!p)return;let i=cart.find(x=>x.productId===id);if(i)i.quantity++;else cart.push({productId:id,name:p.name,price:p.price,quantity:1});renderCart()}
function change(i,d){cart[i].quantity+=d;if(cart[i].quantity<=0)cart.splice(i,1);renderCart()}
function renderCart(){$('#cartItems').innerHTML=cart.length?cart.map((i,n)=>`<div class="cart-row"><div><b>${esc(i.name)}</b><div class="sub">${money(i.price)} cada</div></div><div class="qty"><button onclick="change(${n},-1)">−</button><b>${i.quantity}</b><button onclick="change(${n},1)">+</button></div><button class="remove" onclick="cart.splice(${n},1);renderCart()">×</button></div>`).join(''):'<div class="empty">Nenhum item no pedido ainda.</div>';$('#cartTotal').textContent=money(cart.reduce((s,i)=>s+i.price*i.quantity,0))}
$('#clearCart').onclick=()=>{cart=[];$('#orderNote').value='';renderCart()};
$('#sendOrder').onclick=async()=>{if(!cart.length)return toast('Adicione algum produto primeiro.',true);const note=$('#orderNote').value.trim();const payload={items:cart.map(i=>({...i,note})),note};try{let order;if(apiAvailable){order=await api('/api/orders',{method:'POST',body:JSON.stringify(payload)});orders.unshift(order);stock=await api('/api/stock');movements=await api('/api/movements')}else{order=localSale(payload)}cart=[];$('#orderNote').value='';renderAll();browserPrintOrder(order);toast(`Pedido #${order.id} salvo. Escolha a impressora na tela de impressão.`)}catch(e){toast(e.message||'Não foi possível salvar o pedido.',true)}};

function localSale(payload){const now=new Date().toISOString();const changes=[];for(const item of payload.items){const p=products.find(x=>x.id===item.productId);for(const ing of p.ingredients||[]){const s=stock.find(x=>x.name.toLowerCase()===ing.name.toLowerCase());const amount=(Number(ing.qty)||0)*item.quantity;if(s){if(s.quantity<amount)throw Error(`Estoque insuficiente: ${s.name}. Disponível: ${s.quantity}.`);changes.push({s,amount})}}}const order={id:orders.length?Math.max(...orders.map(o=>Number(o.id)||0))+1:1,items:payload.items,note:payload.note,total:Number(payload.items.reduce((a,i)=>a+i.price*i.quantity,0).toFixed(2)),status:'enviado',createdAt:now};orders.unshift(order);for(const c of changes){c.s.quantity=Number((c.s.quantity-c.amount).toFixed(2));movements.unshift({id:movements.length?Math.max(...movements.map(m=>Number(m.id)||0))+1:1,stockId:c.s.id,type:'saida',quantity:c.amount,createdAt:now,reason:`Pedido #${order.id}`})}saveLocal();return order}
function renderPrintSheet(o){
  const sheet=$('#printSheet');
  sheet.innerHTML=`<div class="print-receipt">
    <h2>${esc(settings.name||"Strike Burgue's")}</h2>
    <div class="print-order-no">PEDIDO #${esc(o.id)}</div>
    <div>${new Date(o.createdAt).toLocaleString('pt-BR')}</div>
    <div class="print-line"></div>
    ${o.items.map(i=>`<div>${i.quantity}x ${esc(i.name)} — ${money(i.price*i.quantity)}</div>`).join('')}
    ${o.note?`<div class="print-line"></div><div>OBS: ${esc(o.note)}</div>`:''}
    <div class="print-line"></div>
    <b class="print-total">TOTAL: ${money(o.total)}</b>
    <div class="print-line"></div>
    <div>Obrigado!</div>
  </div>`;
}
function browserPrintOrder(o){
  renderPrintSheet(o);
  document.body.classList.add('printing');
  setTimeout(()=>window.print(),50);
  const cleanup=()=>{document.body.classList.remove('printing');window.removeEventListener('afterprint',cleanup)};
  window.addEventListener('afterprint',cleanup);
}

function renderStock(){const low=stock.filter(s=>Number(s.quantity)<=5).length;$('#stockStats').innerHTML=`<div class="stat"><div class="label">Itens</div><div class="value">${stock.length}</div></div><div class="stat"><div class="label">Baixos</div><div class="value ${low?'low':''}">${low}</div></div><div class="stat"><div class="label">Produtos</div><div class="value">${products.length}</div></div><div class="stat"><div class="label">Vendas</div><div class="value">${orders.length}</div></div>`;$('#stockList').innerHTML=stock.map(s=>`<div class="stock-row"><div class="stock-main"><b>${esc(s.name)}</b><div class="muted">Unidade: ${esc(s.unit)}</div></div><div class="stock-actions"><button aria-label="Diminuir ${esc(s.name)}" onclick="adjustStock(${s.id},-1)">−</button><input class="stock-edit" aria-label="Quantidade de ${esc(s.name)}" id="stockQty${s.id}" type="number" min="0" step="1" value="${s.quantity}"><button aria-label="Aumentar ${esc(s.name)}" onclick="adjustStock(${s.id},1)">+</button><button class="primary" onclick="saveStockInput(${s.id})">Salvar</button><button class="secondary" onclick="addStockAmount(${s.id})">+ Entrada</button></div></div>`).join('')||'<div class="empty">Nenhum item de estoque.</div>';$('#movementList').innerHTML=movements.slice(0,8).map(m=>movementHTML(m)).join('')||'<div class="empty">Nenhuma movimentação.</div>'}
function movementHTML(m){const s=stock.find(x=>x.id===m.stockId);return `<div class="movement ${m.type==='entrada'?'in':'out'}"><div><b>${esc(s?.name||'Item')}</b><div class="muted">${new Date(m.createdAt).toLocaleString('pt-BR')} • ${esc(m.reason||'')}</div></div><div class="amount"><b>${m.type==='entrada'?'+':'−'}${m.quantity}</b></div></div>`}
async function adjustStock(id,d){const s=stock.find(x=>x.id===id);await updateStock(id,Math.max(0,Number(s.quantity)+d),'Ajuste rápido')}
async function addStockAmount(id){const s=stock.find(x=>x.id===id);const q=Number(prompt(`Quanto adicionar em ${s.name}?`,'1'));if(!Number.isFinite(q)||q<=0)return;await updateStock(id,Number(s.quantity)+q,'Entrada de estoque')}
async function setStock(id){const s=stock.find(x=>x.id===id);const q=Number(prompt(`Quantidade de ${s.name}:`,s.quantity));if(!Number.isFinite(q)||q<0)return toast('Quantidade inválida.',true);await updateStock(id,q,'Ajuste manual')}
async function saveStockInput(id){const el=$(`#stockQty${id}`);const q=Number(el.value);if(el.value.trim()===''||!Number.isFinite(q)||q<0)return toast('Digite uma quantidade válida.',true);await updateStock(id,q,'Quantidade definida manualmente')}
async function updateStock(id,q,reason){
  if(apiAvailable){
    try{
      await api(`/api/stock/${id}`,{method:'PATCH',body:JSON.stringify({quantity:q,reason})});
      stock=await api('/api/stock');
      try{movements=await api('/api/movements')}catch(e){console.warn('Movimentações não carregadas:',e)}
      renderAll();toast('Estoque atualizado.');return;
    }catch(e){toast(e.message||'Não foi possível atualizar o estoque.',true);return}
  }
  const s=stock.find(x=>x.id===id);
  if(!s)return toast('Item de estoque não encontrado.',true);
  const old=Number(s.quantity)||0;s.quantity=q;
  if(q!==old)movements.unshift({id:Date.now(),stockId:id,type:q>=old?'entrada':'saida',quantity:Math.abs(q-old),createdAt:new Date().toISOString(),reason});
  saveLocal();renderAll();toast('Estoque atualizado.');
}
$('#newStock').onclick=()=>openStockModal();
function openStockModal(){showModal(`<div class="modal-box"><div class="modal-head"><h2>Novo item de estoque</h2><button class="ghost" onclick="closeModal()">×</button></div><label>Nome<input id="mStockName" placeholder="Ex.: Bacon"></label><div class="two-col"><label>Quantidade<input id="mStockQty" type="number" value="0" min="0"></label><label>Unidade<input id="mStockUnit" value="un" placeholder="un, kg, porção"></label></div><div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancelar</button><button class="primary" onclick="createStock()">Adicionar</button></div></div>`)}
async function createStock(){const name=$('#mStockName').value.trim(),quantity=Number($('#mStockQty').value),unit=$('#mStockUnit').value.trim()||'un';if(!name)return toast('Digite o nome.',true);if(!Number.isFinite(quantity)||quantity<0)return toast('Quantidade inválida.',true);if(apiAvailable){try{await api('/api/stock',{method:'POST',body:JSON.stringify({name,quantity,unit})});stock=await api('/api/stock');movements=await api('/api/movements')}catch(e){toast(e.message,true);return}}else{const item={id:stock.length?Math.max(...stock.map(x=>x.id))+1:1,name,quantity,unit};stock.push(item);movements.unshift({id:Date.now(),stockId:item.id,type:'entrada',quantity,createdAt:new Date().toISOString(),reason:'Cadastro inicial'});saveLocal()}closeModal();renderAll();toast('Item adicionado ao estoque.')}
function showMovements(){showModal(`<div class="modal-box"><div class="modal-head"><h2>Movimentações</h2><button class="ghost" onclick="closeModal()">×</button></div>${movements.map(m=>movementHTML(m)).join('')||'<div class="empty">Nenhuma movimentação.</div>'}</div>`)}

function renderOrders(){const q=($('#historySearch')?.value||'').toLowerCase();const date=$('#historyDate')?.value||'';let list=orders.filter(o=>(!q||String(o.id).includes(q)||o.items.some(i=>i.name.toLowerCase().includes(q)))&&(!date||o.createdAt.slice(0,10)===date));const today=orders.filter(o=>o.createdAt.slice(0,10)===new Date().toISOString().slice(0,10));$('#salesStats').innerHTML=`<div class="stat"><div class="label">Hoje</div><div class="value">${today.length}</div></div><div class="stat"><div class="label">Faturamento hoje</div><div class="value">${money(today.reduce((a,o)=>a+o.total,0))}</div></div><div class="stat"><div class="label">Vendas totais</div><div class="value">${orders.length}</div></div><div class="stat"><div class="label">Faturamento total</div><div class="value">${money(orders.reduce((a,o)=>a+o.total,0))}</div></div>`;$('#ordersList').innerHTML=list.map(o=>`<div class="order-row"><div class="order-main"><b>Pedido #${o.id}</b> <span class="badge">${esc(o.status)}</span><div class="muted">${new Date(o.createdAt).toLocaleString('pt-BR')}</div><div class="order-items">${o.items.map(i=>`${i.quantity}x ${esc(i.name)}`).join(' • ')}${o.note?`<br>Obs: ${esc(o.note)}`:''}</div></div><div class="mini-actions"><div class="order-total">${money(o.total)}</div><button class="secondary" onclick="printOrder(${o.id})">🖨️</button></div></div>`).join('')||'<div class="empty">Nenhuma venda encontrada.</div>'}
$('#historySearch').oninput=renderOrders;$('#historyDate').onchange=renderOrders;function clearHistoryFilters(){$('#historySearch').value='';$('#historyDate').value='';renderOrders()}
function printOrder(id){const o=orders.find(x=>x.id===id);if(o)browserPrintOrder(o)}

function renderProductAdmin(){$('#productAdmin').innerHTML=products.map(p=>`<div class="product-admin-row"><div><b>${esc(p.name)}</b><div class="muted">${esc(p.category)} • ${money(p.price)} • baixa: ${(p.ingredients||[]).map(i=>`${esc(i.name)} x${i.qty}`).join(', ')||'nenhum'}</div></div><div class="mini-actions"><button class="secondary" onclick="editProduct(${p.id})">Editar</button><button class="danger" onclick="removeProduct(${p.id})">Excluir</button></div></div>`).join('')}
$('#newProduct').onclick=()=>openProductModal();
function ingredientRows(ings){return ings.map((i,n)=>`<div class="ingredient-row"><input class="ing-name" value="${esc(i.name)}" placeholder="Ingrediente"><input class="ing-qty" type="number" min="0" step="0.01" value="${i.qty}"><button class="danger" onclick="this.parentElement.remove()">×</button></div>`).join('')}
function openProductModal(p=null){showModal(`<div class="modal-box"><div class="modal-head"><div><div class="eyebrow">${p?'EDITAR':'NOVO'} PRODUTO</div><h2>${p?esc(p.name):'Adicionar produto'}</h2></div><button class="ghost" onclick="closeModal()">×</button></div><label>Nome<input id="mProdName" value="${p?esc(p.name):''}" placeholder="Ex.: X-Bacon"></label><div class="two-col"><label>Preço<input id="mProdPrice" type="number" min="0" step="0.01" value="${p?.price??''}"></label><label>Categoria<input id="mProdCat" value="${p?esc(p.category):'Hambúrguer'}" placeholder="Hambúrguer"></label></div><div class="card-title" style="margin-top:16px"><h2>Baixa automática no estoque</h2><button class="secondary" onclick="addIngredientRow()">＋ Ingrediente</button></div><p class="muted">O nome precisa ser igual ao item cadastrado no estoque.</p><div id="ingredientsEditor">${ingredientRows(p?.ingredients||[])}</div><div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancelar</button><button class="primary" onclick="saveProduct(${p?.id||'null'})">Salvar produto</button></div></div>`)}
function addIngredientRow(){const d=document.createElement('div');d.className='ingredient-row';d.innerHTML='<input class="ing-name" placeholder="Ingrediente"><input class="ing-qty" type="number" min="0" step="0.01" value="1"><button class="danger" onclick="this.parentElement.remove()">×</button>';$('#ingredientsEditor').appendChild(d)}
async function saveProduct(id){const name=$('#mProdName').value.trim(),price=Number($('#mProdPrice').value),category=$('#mProdCat').value.trim()||'Outros';const ingredients=[...document.querySelectorAll('#ingredientsEditor .ingredient-row')].map(r=>({name:r.querySelector('.ing-name').value.trim(),qty:Number(r.querySelector('.ing-qty').value)||0})).filter(x=>x.name&&x.qty>0);if(!name||!Number.isFinite(price))return toast('Preencha nome e preço.',true);const body={name,price,category,ingredients};if(apiAvailable){try{if(id)await api(`/api/products/${id}`,{method:'PUT',body:JSON.stringify(body)});else await api('/api/products',{method:'POST',body:JSON.stringify(body)});products=await api('/api/products')}catch(e){toast(e.message,true);return}}else{if(id)Object.assign(products.find(x=>x.id===id),body);else products.push({id:products.length?Math.max(...products.map(x=>x.id))+1:1,...body,active:true});saveLocal()}closeModal();renderAll();toast(id?'Produto atualizado.':'Produto adicionado.')}
function editProduct(id){openProductModal(products.find(p=>p.id===id))}
async function removeProduct(id){if(!confirm('Excluir este produto do cardápio?'))return;if(apiAvailable){try{await api(`/api/products/${id}`,{method:'DELETE'});products=await api('/api/products')}catch(e){toast(e.message,true);return}}else{const p=products.find(x=>x.id===id);p.active=false;products=products.filter(x=>x.active!==false);saveLocal()}renderAll();toast('Produto removido.')}

async function printOrderSmart(o){browserPrintOrder(o)}
function showModal(html){$('#modal').innerHTML=html;$('#modal').classList.remove('hidden')}
function closeModal(){$('#modal').classList.add('hidden');$('#modal').innerHTML=''}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
function toast(msg,error=false){const x=$('#toast');x.textContent=msg;x.className=error?'toast-error':'';x.style.display='block';clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.style.display='none',3000)}

function exportData(){const data={version:2,exportedAt:new Date().toISOString(),settings,products,stock,orders,movements};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`strike-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('Backup exportado.')}
const backupInput = $('#hiddenFile');
$('#exportBackup')?.addEventListener('click', exportData);
$('#importBackup')?.addEventListener('click', () => backupInput?.click());
backupInput?.addEventListener('change', e => {
  const f = e.target.files?.[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!Array.isArray(d.products) || !Array.isArray(d.stock) || !Array.isArray(d.orders)) throw new Error('Arquivo incompleto');
      if (!confirm('Restaurar este backup vai substituir os produtos, estoque e vendas atuais. Deseja continuar?')) return;
      if (apiAvailable) {
        api('/api/backup', { method: 'POST', body: JSON.stringify(d) }).then(async () => {
          const loaded = await Promise.allSettled([api('/api/products'), api('/api/stock'), api('/api/orders'), api('/api/settings'), api('/api/movements')]);
          if(loaded[0].status==='fulfilled'&&validProducts(loaded[0].value)) products=loaded[0].value;
          if(loaded[1].status==='fulfilled'&&validStock(loaded[1].value)) stock=loaded[1].value;
          if(loaded[2].status==='fulfilled') orders=loaded[2].value;
          if(loaded[3].status==='fulfilled') settings=loaded[3].value;
          if(loaded[4].status==='fulfilled') movements=loaded[4].value;
          $('#brand').textContent = (settings.name || 'Strike').toUpperCase().replace(" BURGUE'S", '');
          renderAll(); toast('Backup restaurado no servidor.');
        }).catch(err => toast(err.message || 'Não foi possível restaurar o backup.', true));
      } else {
        settings = d.settings || settings; products = d.products; stock = d.stock; orders = d.orders; movements = d.movements || [];
        saveLocal(); renderAll(); toast('Backup restaurado neste aparelho.');
      }
    } catch { toast('Arquivo de backup inválido.', true); }
    finally { backupInput.value = ''; }
  };
  r.readAsText(f);
});
function resetLocalData(){if(!confirm('Isso vai apagar os dados salvos neste navegador e voltar para o cardápio inicial. Continuar?'))return;localStorage.removeItem(LOCAL_KEY);location.reload()}

window.addEventListener('online',()=>{if(!apiAvailable){apiAvailable=!isGitHub;load()}});window.addEventListener('offline',()=>setConnection(false));
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.page).classList.add('active');if(b.dataset.page==='historico')renderOrders();if(b.dataset.page==='estoque')renderStock()});
window.addEventListener('error', function(e){console.error(e.error||e.message)});
load().catch(e => { console.error(e); toast('Não foi possível carregar os dados. Atualize a página.', true); });
