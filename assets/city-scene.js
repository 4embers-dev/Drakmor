/* Clickable overlay on the supplied city artwork; reuses existing game actions. */
(function(){
 function call(fn,...args){if(typeof window[fn]==='function')window[fn](...args)}
 function init(){
 const scene=document.querySelector('#map .illustrated-city');if(!scene)return;
 document.querySelector('.drakmor-scene-title')?.remove();
 const menu=document.querySelector('.drakmor-city-menu');
 if(menu){menu.style.position='absolute';scene.appendChild(menu)}
 const names=['Pilsēta','Inventārs','Iespējas','Uzdevumi','Sasniegumi','TOP','Ģilde','Čats'];
 if(menu){[...menu.querySelectorAll('button')].forEach((b,i)=>{b.textContent='';b.setAttribute('aria-label',names[i]||'Izvēlne');b.title=names[i]||'';b.style.height='12.5%';});menu.style.height='54%';}
 const areas=[
 ['Medības',77,58,17,13,()=>call('openHuntingHall')],
 ['Pilsētas uzdevumi',53,60,19,13,()=>call('tab','quests')]
 ];
 for(const [name,x,y,w,h,action] of areas){const b=document.createElement('button');b.type='button';b.className='drakmor-image-hit';b.setAttribute('aria-label',name);b.title=name;Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});b.addEventListener('click',action);scene.appendChild(b)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();