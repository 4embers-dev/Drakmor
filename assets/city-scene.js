/* Non-destructive city navigation. All actions use existing game functions. */
(function(){
function invoke(name,...args){if(typeof window[name]==='function')window[name](...args)}
function build(){
 if(document.querySelector('.drakmor-city-menu'))return;
 const scene=document.querySelector('#map .illustrated-city');
 if(!scene)return;
 const title=document.createElement('div');title.className='drakmor-scene-title';title.textContent='DRAKMOR';scene.appendChild(title);
 const menu=document.createElement('nav');menu.className='drakmor-city-menu';menu.setAttribute('aria-label','Galvenā spēles izvēlne');
 const entries=[
 ['🏰','Pilsēta',()=>invoke('tab','map')],
 ['🎒','Inventārs',()=>invoke('tab','bag')],
 ['⚙️','Iespējas',()=>invoke('tab','attributes')],
 ['📋','Uzdevumi',()=>invoke('tab','quests')],
 ['🏆','Sasniegumi',()=>invoke('openLeaderboard')],
 ['🏅','TOP',()=>invoke('openLeaderboard')],
 ['🛡️','Ģilde',()=>invoke('openGuilds')],
 ['💬','Čats',()=>invoke('tab','chat')]
 ];
 for(const [icon,label,fn] of entries){const b=document.createElement('button');b.type='button';const i=document.createElement('span');i.className='city-menu-icon';i.textContent=icon;b.append(i,document.createTextNode(label));b.addEventListener('click',fn);menu.appendChild(b)}
 document.body.appendChild(menu);
 const places=document.querySelectorAll('#map .reference-ui button');
 const hunt=places[12];if(hunt){hunt.textContent='Medības 🐺';hunt.onclick=()=>invoke('openHuntingHall');hunt.style.setProperty('display','flex','important')}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();