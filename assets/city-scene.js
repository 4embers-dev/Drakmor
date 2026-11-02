/* Drakmor interactive city: uses existing game functions; no account/state changes. */
(function(){
 const invoke=(name,...args)=>{if(typeof window[name]==='function')return window[name](...args);};
 function init(){
 const scene=document.querySelector('#map .illustrated-city');if(!scene)return;
 document.querySelector('.drakmor-scene-title')?.remove();
 const menu=document.querySelector('.drakmor-city-menu');
 if(menu){scene.appendChild(menu);menu.style.position='absolute';menu.style.height='54%';
 const names=['Pilsēta','Inventārs','Iespējas','Uzdevumi','Sasniegumi','TOP','Ģilde','Čats'];
 const actions=[
 ()=>invoke('tab','map'),()=>invoke('tab','bag'),()=>invoke('tab','attributes'),
 ()=>invoke('tab','quests'),()=>invoke('openLeaderboard'),()=>invoke('openLeaderboard'),
 ()=>invoke('openGuilds'),()=>invoke('tab','chat')];
 [...menu.querySelectorAll('button')].forEach((b,i)=>{
 b.replaceChildren();b.setAttribute('aria-label',names[i]||'Izvēlne');b.title=names[i]||'';
 b.style.height='12.5%';b.onclick=null;
 const clone=b.cloneNode(true);b.replaceWith(clone);clone.addEventListener('click',actions[i]||actions[0]);
 });}
 scene.querySelectorAll('.drakmor-image-hit').forEach(b=>b.remove());
 const places=[
 ['Ģildes pils',28,3,15,9,()=>invoke('openGuilds')],
 ['Arēna',76,5,16,10,()=>invoke('openArena')],
 ['Spēļu zāle',17,29,17,11,()=>invoke('openHuntingHall')],
 ['Banka',38,26,14,11,()=>invoke('tab','bank')],
 ['Kalve',64,26,15,11,()=>invoke('tab','forge')],
 ['Veikals',83,26,15,11,()=>invoke('tab','shop')],
 ['Alķīmija',20,60,16,11,()=>invoke('openPlace','Alķīmija','Alķīmijas receptes vēl top. Dziru vari izmantot cīņās.','battle')],
 ['Uzdevumi',57,63,17,12,()=>invoke('tab','quests')],
 ['Medības',80,61,17,12,()=>invoke('openHuntingHall')]
 ];
 for(const [name,x,y,w,h,action] of places){
 const b=document.createElement('button');b.type='button';b.className='drakmor-image-hit';
 b.setAttribute('aria-label',name);b.title=name;
 Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
 b.addEventListener('click',action);scene.appendChild(b);
 }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();