// Poses blend into one another; the ball has its own velocity and bounce.
export function createCorgiBehavior({canvas,dog,head,legs,eyes,ears,tail,tongue,ball,shadow,ballShadow}){
 let clock=0,last=null,state='sniff',until=2.3,seed=73,blinkAt=1.8,blinkStart=-10,near=false;
 let vx=0,vy=0,vz=0;
 const pointer={x:0,y:0},look={x:0,y:0};
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
 const names={sniff:'闻闻小球',watch:'在看你',play:'准备出脚',chase:'追球中',rest:'歇一小会',ready:'蓄力中',happy:'接住啦',pat:'舒服得眯眼'};
 const label=document.querySelector('#pet-mood');
 function enter(next,duration){state=next;until=clock+duration;canvas.dataset.petState=state;if(label)label.textContent=names[next];}
 enter('sniff',2.3);
 function move(event){if(event.pointerType==='touch')return;const b=canvas.getBoundingClientRect();pointer.x=Math.max(-1,Math.min(1,(event.clientX-b.left-b.width/2)/(b.width*.75)));pointer.y=Math.max(-1,Math.min(1,(event.clientY-b.top-b.height/2)/(b.height*.75)));const close=event.clientX>b.left-120&&event.clientX<b.right+120&&event.clientY>b.top-120&&event.clientY<b.bottom+80;if(close&&!near&&['sniff','rest','play'].includes(state))enter('watch',2.4);near=close;}
 const leave=()=>{near=false;pointer.x=pointer.y=0};window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);
 const blend=(a,b,k)=>a+(b-a)*k;
 function launch(){ball.position.set(.57,.29,.42);vx=1.35;vy=2.1;vz=.12;enter('chase',1.65)}
 return {kick(){enter('ready',.34)},pat(){enter('pat',2.8)},update(time,moving){
  const dt=last===null?1/30:Math.min(.05,Math.max(0,time-last));last=time;if(!moving)return;clock+=dt;const k=1-Math.exp(-dt*8);
  if(clock>=until){
   if(state==='ready')launch();
   else if(state==='chase')enter('happy',1.2);
   else if(state==='play'){enter('ready',.42)}
   else if(state==='happy'||state==='pat')enter(near?'watch':'rest',1.3+random()*1.4);
   else if(state==='watch')enter('play',.7);
   else if(state==='sniff')enter('play',.8);
   else enter(random()>.45?'sniff':'play',1.5+random()*1.5);
  }
  // A floor impact damps the ball; perimeter rebounds keep it in the stage.
  if(state==='ready'){ball.position.x=blend(ball.position.x,.57,k);vx=0;vy=0;}
  const prevX=ball.position.x;vy-=5.8*dt;ball.position.x+=vx*dt;ball.position.y+=vy*dt;ball.position.z+=vz*dt;
  if(ball.position.y<.235){ball.position.y=.235;vy=Math.abs(vy)>.24?-vy*.5:0;vx*=Math.exp(-dt*2.8);vz*=Math.exp(-dt*3);}
  if(ball.position.x>1.3){ball.position.x=1.3;vx=-Math.abs(vx)*.7}if(ball.position.x<.4){ball.position.x=.4;vx=Math.abs(vx)*.55}
  ball.position.z=Math.max(.28,Math.min(.66,ball.position.z));ball.rotation.z-=(ball.position.x-prevX)/.235;ball.rotation.x+=vz*dt/.235;
  const chasing=state==='chase',happy=state==='happy',pat=state==='pat',sniff=state==='sniff',ready=state==='ready',watch=state==='watch';
  look.x=blend(look.x,near?pointer.x:Math.sin(clock*.5)*.35,k);look.y=blend(look.y,near?pointer.y:0,k);
  const targetX=chasing?ball.position.x-.95:ready?-.05:sniff?-.2:pat?-.4:-.42;
  dog.position.x=blend(dog.position.x,targetX,k*(chasing?1.4:.6));
  const hop=happy?Math.max(0,Math.sin((until-clock)*7))*.11:chasing?Math.abs(Math.sin(clock*13))*.035:0;
  dog.position.y=blend(dog.position.y,hop-(ready?.055:0),k*1.4);
  dog.rotation.y=blend(dog.rotation.y,chasing?.45:watch?look.x*.35:-.14,k*.65);
  dog.rotation.z=blend(dog.rotation.z,happy?Math.sin(clock*11)*.055:0,k);
  dog.scale.y=blend(dog.scale.y,ready?.9:1+Math.sin(clock*2.3)*.012,k);
  head.rotation.x=blend(head.rotation.x,sniff?.32+Math.sin(clock*6)*.055:pat?-.16:look.y*.17,k);
  head.rotation.y=blend(head.rotation.y,chasing?.32:look.x*.5,k);
  head.rotation.z=blend(head.rotation.z,pat?-.18:watch?Math.sin(clock*.7)*.16:happy?Math.sin(clock*7)*.1:Math.sin(clock*.8)*.025,k);
  head.position.y=blend(head.position.y,sniff?.88:ready?.92:.98,k);
  legs.forEach((leg,i)=>{const gait=chasing?Math.sin(clock*13+(i===0||i===3?0:Math.PI))*.45:0;const paw=ready&&i===3?-.75:pat&&i===3?-.18:0;leg.rotation.x=blend(leg.rotation.x,gait+paw,k);});
  const wag=pat||happy?18:near?13:7;tail.rotation.z=Math.sin(clock*wag)*(pat||happy?.65:.25);tail.rotation.x=Math.sin(clock*wag+.7)*.1;
  ears[0].rotation.z=blend(ears[0].rotation.z,pat?.48:.2+(watch?-.12:0)+Math.sin(clock*2.4)*.025,k);
  ears[1].rotation.z=blend(ears[1].rotation.z,pat?-.5:-.2+(sniff?.15:0)+Math.sin(clock*2.1+.9)*.035,k);
  if(clock>=blinkAt){blinkStart=clock;blinkAt=clock+2.1+random()*3.3;}
  const blink=Math.max(0,1-Math.abs(clock-blinkStart-.085)/.085);
  eyes.forEach(eye=>eye.scale.y=(eye.userData.openHeight??.071)*(pat?.25:1-blink*.92));
  tongue.scale.y=blend(tongue.scale.y,pat?.035:chasing||happy?.105:.065+Math.sin(clock*3)*.008,k);
  shadow.position.x=dog.position.x+.1;shadow.material.opacity=1-hop*2;
  ballShadow.position.x=ball.position.x;ballShadow.position.z=ball.position.z;ballShadow.material.opacity=Math.max(.06,.25-(ball.position.y-.235)*.28);ballShadow.scale.setScalar(1+(ball.position.y-.235)*.5);
 },dispose(){window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave)}};
}
