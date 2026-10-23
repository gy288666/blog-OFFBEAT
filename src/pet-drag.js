import { stepPetPhysics } from './pet-physics.js';

export function setupPetDrag(pet){
 const stage=pet.querySelector('#pet-action');
 let gesture=null,blockClickUntil=0,positioned=false,xPosition=0,yPosition=0;
 let frame=0,last=0,body=null,bounces=0;
 const margin=8;
 const motionAllowed=()=>!document.body.classList.contains('still');
 function bounds(){const box=pet.getBoundingClientRect();return {left:margin,top:margin,right:Math.max(margin,innerWidth-box.width-margin),bottom:Math.max(margin,innerHeight-box.height-margin)}}
 function place(x,y){const b=bounds();xPosition=Math.max(b.left,Math.min(x,b.right));yPosition=Math.max(b.top,Math.min(y,b.bottom));pet.style.left=`${xPosition}px`;pet.style.top=`${yPosition}px`;}
 function stop(){cancelAnimationFrame(frame);frame=0;body=null;pet.dataset.flight='rest';}
 function anchor(){if(positioned)return;const box=pet.getBoundingClientRect();pet.dataset.positioned='true';xPosition=box.left;yPosition=box.top;pet.style.left=`${xPosition}px`;pet.style.top=`${yPosition}px`;positioned=true;}
 function clamp(){if(!positioned||pet.hidden)return;place(xPosition,yPosition);if(body){body.x=xPosition;body.y=yPosition}}
 function tick(now){
  frame=0;if(!body)return;
  if(pet.hidden||!motionAllowed()){stop();return}
  if(document.hidden){last=now;frame=requestAnimationFrame(tick);return}
  const result=stepPetPhysics(body,bounds(),Math.max(0,(now-last)/1000));last=now;
  xPosition=body.x;yPosition=body.y;pet.style.left=`${xPosition}px`;pet.style.top=`${yPosition}px`;
  bounces+=result.impacts;pet.dataset.bounces=String(bounces);
  if(result.sleeping){stop();return}frame=requestAnimationFrame(tick);
 }
 function launch(vx,vy){if(!motionAllowed())return;body={x:xPosition,y:yPosition,vx:Math.max(-2200,Math.min(2200,vx)),vy:Math.max(-2200,Math.min(2200,vy))};bounces=0;pet.dataset.bounces='0';pet.dataset.flight='flying';last=performance.now();frame=requestAnimationFrame(tick);}
 stage.addEventListener('pointerdown',event=>{if(event.button!==0||stage.disabled)return;stop();const box=pet.getBoundingClientRect();gesture={id:event.pointerId,x:event.clientX,y:event.clientY,left:box.left,top:box.top,dragged:false,samples:[{x:event.clientX,y:event.clientY,t:event.timeStamp}]};stage.setPointerCapture(event.pointerId);});
 stage.addEventListener('pointermove',event=>{if(!gesture||gesture.id!==event.pointerId)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;if(!gesture.dragged&&Math.hypot(dx,dy)<6)return;anchor();gesture.dragged=true;pet.classList.add('is-dragging');event.preventDefault();place(gesture.left+dx,gesture.top+dy);gesture.samples.push({x:event.clientX,y:event.clientY,t:event.timeStamp});gesture.samples=gesture.samples.filter(s=>event.timeStamp-s.t<=100);});
 function end(event){
  if(!gesture||event.pointerId!==gesture.id)return;
  const finished=gesture;gesture=null;pet.classList.remove('is-dragging');
  if(finished.dragged){
   blockClickUntil=performance.now()+450;clamp();
   // Holding still before release cancels momentum; cancellation never launches the pet.
   if(event.type==='pointerup'){
    const recent=finished.samples.filter(s=>event.timeStamp-s.t<=100),first=recent[0],end=recent.at(-1);
    const dt=first&&end?(end.t-first.t)/1000:0;
    const fresh=end&&event.timeStamp-end.t<80;
    launch(fresh&&dt>.008?(end.x-first.x)/dt:0,fresh&&dt>.008?(end.y-first.y)/dt:0);
   }
  }
  if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
 }
 stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);stage.addEventListener('lostpointercapture',end);
 stage.addEventListener('click',event=>{if(performance.now()<blockClickUntil&&event.detail!==0){event.preventDefault();event.stopImmediatePropagation();}},true);
 stage.addEventListener('dragstart',event=>event.preventDefault());
 stage.addEventListener('keydown',event=>{if(!event.altKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();stop();anchor();place(xPosition+(event.key==='ArrowRight'?24:event.key==='ArrowLeft'?-24:0),yPosition+(event.key==='ArrowDown'?24:event.key==='ArrowUp'?-24:0));});
 const visibility=()=>{last=performance.now()};document.addEventListener('visibilitychange',visibility);
 window.addEventListener('resize',clamp);const observer=new ResizeObserver(clamp);observer.observe(pet);
 // Freeze immediately when the global motion switch or collapse control changes.
 const stateObserver=new MutationObserver(()=>{if(pet.hidden||!motionAllowed())stop()});stateObserver.observe(pet,{attributes:true,attributeFilter:['hidden']});stateObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 if(import.meta.hot)import.meta.hot.dispose(()=>{stop();window.removeEventListener('resize',clamp);document.removeEventListener('visibilitychange',visibility);observer.disconnect();stateObserver.disconnect()});
}
