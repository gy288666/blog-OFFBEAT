export function setupGallery(grid,{moving}) {
 const previous=document.querySelector('#gallery-prev'),next=document.querySelector('#gallery-next'),position=document.querySelector('#gallery-position');
 let gesture=null,suppressUntil=0,hovered=false,inView=false;
 const interval=3000;
 let nextAdvance=performance.now()+interval;
 const defer=()=>{nextAdvance=performance.now()+interval};
 grid.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')hovered=true;defer()});
 grid.addEventListener('pointerleave',()=>{hovered=false;defer()});
 grid.addEventListener('pointerdown',defer);
 grid.addEventListener('pointerup',defer);
 grid.addEventListener('focusout',defer);
 grid.addEventListener('wheel',defer,{passive:true});
 const visibility=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;defer()},{threshold:.25});visibility.observe(grid);
 const timer=setInterval(()=>{
  const focused=grid.querySelector(':focus-visible')||grid.matches(':focus-visible');
  if(!moving()||document.hidden||!inView||hovered||gesture||focused||grid.querySelector('.flipped')||document.querySelector('dialog[open]')){defer();return;}
  if(performance.now()<nextAdvance)return;
  defer();
  if(grid.scrollWidth<=grid.clientWidth+4)return;
  if(grid.scrollLeft>=grid.scrollWidth-grid.clientWidth-4)grid.scrollTo({left:0,behavior:'smooth'});
  else step(1);
 },250);
 if(import.meta.hot)import.meta.hot.dispose(()=>{clearInterval(timer);visibility.disconnect();resize.disconnect()});
 const cards=()=>[...grid.querySelectorAll('.article-card')];
 const current=()=>{const list=cards();let index=0,distance=Infinity;list.forEach((card,i)=>{const d=Math.abs(card.offsetLeft+card.offsetWidth/2-grid.scrollLeft-grid.clientWidth/2);if(d<distance){index=i;distance=d}});return index};
 function update(){const list=cards();
  list.forEach(card=>{const distance=(card.offsetLeft+card.offsetWidth/2-grid.scrollLeft-grid.clientWidth/2)/(grid.clientWidth*.52);const n=Math.max(-1.5,Math.min(1.5,distance));
   card.style.setProperty('--orbit-y',`${-n*26}deg`);card.style.setProperty('--orbit-z',`${n*5}deg`);card.style.setProperty('--orbit-drop',`${Math.abs(n)*40}px`);card.style.setProperty('--orbit-scale',`${1-Math.min(Math.abs(n),1.5)*.12}`);card.style.setProperty('--orbit-light',`${1-Math.min(Math.abs(n),1.5)*.2}`);card.style.zIndex=String(10-Math.round(Math.abs(n)*4));card.classList.toggle('in-focus',Math.abs(n)<.35);
  });position.textContent=list.length?`${String(current()+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`:'0 / 0';previous.disabled=grid.scrollLeft<4;next.disabled=grid.scrollLeft>=grid.scrollWidth-grid.clientWidth-4;}
 function step(direction){defer();const list=cards(),index=Math.max(0,Math.min(list.length-1,current()+direction));list[index]&&grid.scrollTo({left:list[index].offsetLeft+list[index].offsetWidth/2-grid.clientWidth/2,behavior:moving()?'smooth':'instant'});}
 previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));grid.addEventListener('scroll',update,{passive:true});
 const resize=new ResizeObserver(update);resize.observe(grid);
 grid.addEventListener('keydown',event=>{if(event.target!==grid)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();step(event.key==='ArrowRight'?1:-1)}});
 grid.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('[data-save]'))return;gesture={id:event.pointerId,x:event.clientX,y:event.clientY,left:grid.scrollLeft,touch:event.pointerType==='touch',dragged:false};});
 grid.addEventListener('pointermove',event=>{
  if(!gesture||gesture.id!==event.pointerId)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){gesture.dragged=true;if(!gesture.touch){grid.classList.add('dragging');grid.setPointerCapture(event.pointerId)}}
  if(gesture.dragged&&!gesture.touch){event.preventDefault();grid.scrollLeft=gesture.left-dx;}
 });
 function end(event){if(!gesture||gesture.id!==event.pointerId)return;if(gesture.dragged)suppressUntil=performance.now()+450;gesture=null;grid.classList.remove('dragging');if(grid.hasPointerCapture(event.pointerId))grid.releasePointerCapture(event.pointerId);}
 grid.addEventListener('pointerup',end);grid.addEventListener('pointercancel',end);grid.addEventListener('lostpointercapture',end);
 grid.addEventListener('dragstart',event=>event.preventDefault());
 function flip(card){
  defer();const flipped=card.classList.toggle('flipped');
  card.classList.remove('tilting');card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');
  card.querySelector('.card-front').inert=flipped;card.querySelector('.card-back').inert=!flipped;
  card.querySelector(flipped?'.card-back [data-read]':'.card-front [data-flip]').focus({preventScroll:true});
 }
 grid.addEventListener('click',event=>{
  if(performance.now()<suppressUntil){event.preventDefault();event.stopPropagation();return;}
  if(event.target.closest('[data-save]'))return;
  const card=event.target.closest('.article-card');if(!card)return;
  if(card.classList.contains('flipped')&&event.target.closest('[data-read]'))return;
  event.preventDefault();event.stopPropagation();
  if(!card.classList.contains('flipped')||event.target.closest('[data-flip]'))flip(card);
 },true);
 return {refresh(){defer();gesture=null;grid.classList.remove('dragging');grid.scrollLeft=0;requestAnimationFrame(update)}};
}
