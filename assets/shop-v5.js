/* Drakmor shop v5 — isolated, server-authoritative shop module.
   No legacy v2 globals or CSS dependencies. */
(function(global){
'use strict';
const categories=[['Ieroči','⚔️'],['Bruņas','🛡️'],['Ķiveres','🪖'],['Vairogi','🛡️'],['Cimdi','🧤'],['Zābaki','🥾'],['Gredzeni','💍'],['Kuloni','📿'],['Artefakti','💎']];
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className='dm5-'+cls;if(txt!==undefined)n.textContent=txt;return n};
const gold=n=>Number(n||0).toLocaleString('lv-LV');
// Each weapon receives deterministic, individual vector artwork, without external fonts.
function weaponArt(item){
 const name=item?.name||'';
 const axe=/cirv|kapātāj/i.test(name),dagger=/dunc/i.test(name);
 const seed=[...name].reduce((v,c)=>v+c.charCodeAt(0),0);
 const colors=['#89d6ff','#ff9855','#c3a3ff','#e9e4bb','#9cf1cc','#f6d477'];
 const accent=colors[seed%colors.length],angle=(seed%31)-15;
 const blade=axe
 ? '<path d="M65 29 Q97 12 103 40 L96 73 Q82 53 64 62 Z" fill="url(#steel)" stroke="#d9edff" stroke-width="2"/><path d="M62 27 L49 113" stroke="#6a3b21" stroke-width="13" stroke-linecap="round"/>'
 : dagger
 ? '<path d="M76 19 L87 67 L76 86 L65 67 Z" fill="url(#steel)" stroke="#efffff" stroke-width="2"/><path d="M76 83 V123" stroke="#7e4225" stroke-width="11"/>'
 : '<path d="M76 10 L90 42 L83 100 L76 112 L69 100 L62 42 Z" fill="url(#steel)" stroke="#e6f7ff" stroke-width="2"/><path d="M76 104 V137" stroke="#6e351b" stroke-width="12"/>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 152 152"><defs><linearGradient id="steel"><stop stop-color="'+accent+'"/><stop offset=".45" stop-color="#f8ffff"/><stop offset=".72" stop-color="#688198"/><stop offset="1" stop-color="'+accent+'"/></linearGradient><radialGradient id="glow"><stop stop-color="'+accent+'" stop-opacity=".33"/><stop offset="1" stop-color="#0b080b" stop-opacity="0"/></radialGradient></defs><circle cx="76" cy="76" r="73" fill="url(#glow)"/><g transform="rotate('+angle+' 76 76)">'+blade+'<path d="M49 110 Q76 100 103 110" fill="none" stroke="#e6af48" stroke-width="9" stroke-linecap="round"/><circle cx="76" cy="112" r="5" fill="'+accent+'"/><circle cx="76" cy="138" r="6" fill="#e8bb57" stroke="#57320e" stroke-width="2"/></g><circle cx="24" cy="32" r="2" fill="'+accent+'"/><circle cx="123" cy="86" r="2" fill="'+accent+'"/></svg>';
 const img=el('img','weapon-image');img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);img.alt='';img.loading='lazy';return img;
}

function create({mount,db,onClose,onInventory,catalog=[]}={}){
 if(!mount||!db)throw Error('Veikalam nepieciešams konteiners un datubāzes savienojums');
 let state=null,category='Ieroči',selected=null,query='',sort='level',page=0,busy=false,notice='',destroyed=false,view='catalog',loadVersion=0;
 const inventory=()=>{view=view==='inventory'?'catalog':'inventory';selected=null;render()};
 const close=typeof onClose==='function'?onClose:()=>{mount.replaceChildren()};
 const root=el('div','shop');mount.replaceChildren(root);
 let safeItems=[];const normalizeItems=items=>Array.isArray(items)?items.filter(x=>x&&x.category&&x.name&&Number.isFinite(Number(x.price))&&x.purchasable===true).map(x=>({...x,price:Number(x.price),level:Number(x.level),bonus:Number(x.bonus)})):[];
 const button=(label,fn,cls)=>{const b=el('button',cls,label);b.type='button';b.onclick=fn;return b};
 async function load(){
  const version=++loadVersion;
  try{const [status,items]=await Promise.all([db.rpc('drakmor_shop_state'),db.rpc('drakmor_shop_catalog')]);if(destroyed||version!==loadVersion)return;if(status.error)throw status.error;if(items.error)throw items.error;state=status.data;safeItems=normalizeItems(items.data);notice='';}
  catch(e){if(destroyed||version!==loadVersion)return;state=null;safeItems=[];notice='Neizdevās ielādēt veikala datus: '+(e?.message||'Savienojuma kļūda')+'. Pārbaudi, vai Supabase ir palaists shop_v5_catalog.sql.'}
  if(!destroyed)render();
 }
 function available(){return safeItems.filter(x=>x.category===category&&x.name.toLocaleLowerCase('lv').includes(query.toLocaleLowerCase('lv'))).sort((a,b)=>sort==='price'?a.price-b.price:sort==='priceDesc'?b.price-a.price:sort==='name'?a.name.localeCompare(b.name,'lv'):a.level-b.level)}
 function render(){
  if(destroyed)return;root.replaceChildren();
  const header=el('header','header');const smith=el('div','smith');smith.append(el('strong','','⚒ Kalējs Eldriks'),el('small','','Ieroči, bruņas un seni artefakti'));const title=el('div','title');title.append(el('h1','','Drakmor 5.0'),el('h2','','Mantu veikals'));const wallet=el('div','wallet','🪙 Tavs zelts: '+(state?gold(state.gold):'—'));header.append(smith,title,wallet,button('✕',close,'close'));root.append(header);
  const layout=el('div','layout');const nav=el('nav','categories');nav.append(el('h3','','Kategorijas'));categories.forEach(([name,icon])=>{const b=button(icon+' '+name,()=>{category=name;page=0;selected=null;render()},'category');b.classList.toggle('active',name===category);nav.append(b)});layout.append(nav);
  const middle=el('main','middle');const controls=el('div','controls');const search=el('input','search');search.placeholder='Meklēt mantu...';search.setAttribute('aria-label','Meklēt mantu');search.value=query;search.oninput=()=>{query=search.value;page=0;paint()};const order=el('select','order');[['level','Pēc līmeņa'],['price','Lētākās'],['priceDesc','Dārgākās'],['name','Pēc nosaukuma']].forEach(([v,t])=>{const o=el('option','',t);o.value=v;order.append(o)});order.value=sort;order.onchange=()=>{sort=order.value;page=0;paint()};controls.append(search,order);middle.append(controls);const cards=el('div','cards'),pager=el('div','pager');middle.append(cards,pager);layout.append(middle);
  const detail=el('aside','detail');layout.append(detail);root.append(layout);
  const footer=el('nav','footer');[['🎒 '+(view==='inventory'?'Atpakaļ uz veikalu':'Inventārs'),inventory,true],['🪙 Pārdošana',null,false],['⚒ Uzlabojumi',null,false],['🔮 Iedvēšana',null,false],['🛡 Komplektu bonusi',null,false],['👑 VIP veikals',null,false],['⌛ Rotējošs sortiments',null,false]].forEach(([name,fn,active])=>{const b=button(name,fn||(()=>{}),'feature');b.disabled=!active;if(!active)b.title='Šī funkcija vēl nav pieslēgta serverim';footer.append(b)});root.append(footer);
  if(notice)root.append(el('p','notice',notice));
  function paint(){if(view==='inventory'){paintInventory();return}const list=available();const total=Math.max(1,Math.ceil(list.length/10));page=Math.min(page,total-1);cards.replaceChildren();pager.replaceChildren();list.slice(page*10,page*10+10).forEach(item=>{const b=button('',()=>{selected=item;paint()},'item');b.classList.toggle('selected',selected?.name===item.name);b.append(el('small','','Līmenis: '+item.level),(()=>{const art=el('div','item-art');art.append(weaponArt(item));return art})(),el('strong','',item.name),el('span','','+'+item.bonus+' spēks'),el('b','',gold(item.price)+' 🪙'));cards.append(b)});if(!list.length)cards.append(el('p','','Šajā kategorijā pašlaik nav serverī apstiprinātu nopērkamu priekšmetu.'));const prev=button('❮',()=>{page--;paint()},'page');prev.disabled=page===0;const next=button('❯',()=>{page++;paint()},'page');next.disabled=page>=total-1;pager.append(prev,el('span','',String(page+1)+' / '+total),next);drawDetail()}
  function paintInventory(){
   cards.replaceChildren();pager.replaceChildren();detail.replaceChildren();
   const owned=Array.isArray(state?.owned)?state.owned:[];
   detail.append(el('h3','','Tavs inventārs'),el('p','','Iegādāti ieroči: '+owned.length),el('p','','Ekipēts: '+(state?.equipped||'Nav')));
   if(!state){cards.append(el('p','','Ielādē spēlētāja datus, lai redzētu inventāru.'));return}
   if(!owned.length){cards.append(el('p','','Inventārs ir tukšs. Iegādājies ieroci veikalā.'));return}
   owned.forEach(name=>{const item=safeItems.find(x=>x.name===name);const b=button('',()=>{selected=item||null;render()},'item');b.append((()=>{const art=el('div','item-art');art.append(weaponArt(item));return art})(),el('strong','',name),el('small','',state.equipped===name?'✓ Ekipēts':'Tavā inventārā'));cards.append(b)});
   if(selected&&owned.includes(selected.name)){detail.append(el('h2','',selected.name));const equip=button(state.equipped===selected.name?'✓ Ekipēts':'⚔ Ekipēt',()=>transact('drakmor_equip_weapon',selected),'equip');equip.disabled=busy||state.equipped===selected.name;detail.append(equip)}
  }
  function drawDetail(){detail.replaceChildren();detail.append(el('h3','','Izvēlētās mantas apraksts'));if(!selected){detail.append(el('p','','Izvēlies priekšmetu no kataloga.'));return}const item=selected,owned=Array.isArray(state?.owned)&&state.owned.includes(item.name);detail.append((()=>{const art=el('div','detail-art');art.append(weaponArt(item));return art})(),el('h2','',item.name),el('p','','Līmenis: '+item.level),el('p','','Spēks: +'+item.bonus),el('p','','Cena: '+gold(item.price)+' zelts'));const buy=button(owned?'✓ Jau iegādāts':'🛒 Pirkt',()=>transact('drakmor_buy_weapon',item),'buy');buy.disabled=busy||owned||!state||Number(state.gold)<Number(item.price)||Number(state.level)<Number(item.level);detail.append(buy);if(owned){const equip=button(state?.equipped===item.name?'✓ Ekipēts':'⚔ Ekipēt',()=>transact('drakmor_equip_weapon',item),'equip');equip.disabled=busy||state?.equipped===item.name;detail.append(equip)}}
  paint();
 }
 async function transact(rpc,item){
  if(busy||!state||!item?.purchasable)return;
  const isOwned=Array.isArray(state.owned)&&state.owned.includes(item.name);
  if(rpc==='drakmor_buy_weapon'&&(isOwned||Number(state.gold)<Number(item.price)||Number(state.level)<Number(item.level)))return;
  if(rpc==='drakmor_equip_weapon'&&(!isOwned||state.equipped===item.name))return;
  busy=true;render();
  try{const {data,error}=await db.rpc(rpc,{weapon_name:item.name});if(error)throw error;if(!data?.ok)throw Error(data?.message||'Darbība neizdevās');const res=await db.rpc('drakmor_shop_state');if(res.error)throw res.error;if(destroyed)return;state=res.data;notice='✓ Darbība veiksmīga!'}
  catch(e){notice='Kļūda: '+(e?.message||'Nezināma kļūda')}
  finally{busy=false;render()}
 }
 render();load();return {refresh:load,destroy(){destroyed=true;loadVersion++;root.remove()},getState(){return {category,selected:selected?.name,loaded:!!state}}};
}
global.DrakmorShopV5=Object.freeze({create,categories:categories.map(([name])=>name)});
})(window);
