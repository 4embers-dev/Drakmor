// Drakmor v5 shop smoke tests — no real Supabase credentials or purchases.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const code=fs.readFileSync('assets/shop-v5.js','utf8');
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.className='';this.value='';this.disabled=false;this.style={};this.attributes={};this.classList={toggle(){}}}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes]}
 remove(){this.removed=true}
 setAttribute(k,v){this.attributes[k]=v}
 set textContent(v){this._text=String(v);this.children=[]}
 get textContent(){return [this._text||'',...this.children.map(x=>x.textContent||'')].join(' ')}
}
const document={createElement:tag=>new Element(tag)};
const window={};
vm.runInNewContext(code,{window,document,console,Number,Array,Object,Error,Promise});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function find(root,pred){if(pred(root))return root;for(const child of root.children||[]){const result=find(child,pred);if(result)return result}return null}
function findText(root,needle){return find(root,x=>x._text&&x._text.includes(needle))}
async function run(){
 const calls=[];let gold=100;let owned=[];let equipped=null;
 const db={rpc:async(name,args)=>{
  calls.push({name,args});
  if(name==='drakmor_shop_state')return {data:{gold,level:2,owned:[...owned],equipped}};
  if(name==='drakmor_shop_catalog')return {data:[{category:'Ieroči',name:'Koka zobens',level:1,bonus:1,price:50,icon:'⚔️',purchasable:true}]};
  if(name==='drakmor_buy_weapon'){
   if(owned.includes(args.weapon_name))return {data:{ok:false,message:'Jau nopirkts'}};
   if(gold<50)return {data:{ok:false,message:'Nepietiek zelta'}};
   gold-=50;owned.push(args.weapon_name);return {data:{ok:true}};
  }
  if(name==='drakmor_equip_weapon'){equipped=args.weapon_name;return {data:{ok:true}}}
  return {error:{message:'Unknown RPC'}};
 }};
 const mount=new Element('div');const app=window.DrakmorShopV5.create({mount,db});await tick();
 assert.ok(findText(mount,'Koka zobens'),'catalog item must appear');
 assert.ok(findText(mount,'100'),'wallet must show server gold');
 const item=find(mount,x=>x.className==='dm5-item'&&x.textContent.includes('Koka zobens'));assert.ok(item);item.onclick();
 const buy=find(mount,x=>x.className==='dm5-buy');assert.ok(buy&&!buy.disabled,'buy must be enabled');
 await buy.onclick();await tick();
 assert.equal(gold,50);assert.deepEqual(owned,['Koka zobens']);
 assert.ok(findText(mount,'50'),'wallet must refresh after purchase');
 const inventory=find(mount,x=>x.className==='dm5-feature'&&x.textContent.includes('Inventārs'));assert.ok(inventory);inventory.onclick();
 assert.ok(findText(mount,'Iegādāti ieroči: 1'),'inventory must use owned items');
 const inventoryItem=find(mount,x=>x.className==='dm5-item'&&x.textContent.includes('Koka zobens'));inventoryItem.onclick();
 const equip=find(mount,x=>x.className==='dm5-equip');assert.ok(equip&&!equip.disabled);await equip.onclick();await tick();
 assert.equal(equipped,'Koka zobens');
 assert.equal(calls.filter(x=>x.name==='drakmor_buy_weapon').length,1);
 app.destroy();assert.ok(mount.children[0].removed);
 console.log('PASS: catalog, server wallet, purchase, inventory, equip, cleanup');
}
run().catch(e=>{console.error(e);process.exitCode=1});
