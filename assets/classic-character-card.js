/* Add reference-style circular progress readout without replacing live stats. */
(function(){
 function init(){
 const hud=document.querySelector('#map .live-hud');if(!hud||hud.querySelector('.classic-hud-percent'))return;
 const badge=document.createElement('span');badge.className='classic-hud-percent';badge.setAttribute('aria-label','Dzīvības procenti');
 Object.assign(badge.style,{position:'absolute',right:'10px',top:'51px',zIndex:'6',width:'34px',height:'24px',textAlign:'center',font:'700 12px Georgia,serif',color:'#fff5c8',textShadow:'0 1px 2px #672b0c',pointerEvents:'none'});
 hud.appendChild(badge);
 const hp=document.getElementById('hudHp');
 function refresh(){if(!hp)return;const m=hp.textContent.match(/([\d\s.,]+)\s*\/\s*([\d\s.,]+)/);if(m){const a=Number(m[1].replace(/[\s,]/g,'')),b=Number(m[2].replace(/[\s,]/g,''));badge.textContent=b>0?Math.round(100*a/b)+'%':''}else badge.textContent='';}
 refresh();if(hp)new MutationObserver(refresh).observe(hp,{childList:true,subtree:true,characterData:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();