// Screen-space physics in CSS pixels / seconds. Substeps keep impacts stable at low FPS.
export function stepPetPhysics(body,bounds,elapsed){
 const steps=Math.max(1,Math.ceil(Math.min(elapsed,.05)*120)),dt=Math.min(elapsed,.05)/steps;
 let impacts=0;
 for(let i=0;i<steps;i++){
  body.vy+=1800*dt;
  body.vx*=Math.exp(-.16*dt);
  body.x+=body.vx*dt;body.y+=body.vy*dt;
  if(body.x<bounds.left){body.x=bounds.left;if(body.vx<0){body.vx*=-.62;impacts++}}
  if(body.x>bounds.right){body.x=bounds.right;if(body.vx>0){body.vx*=-.62;impacts++}}
  if(body.y<bounds.top){body.y=bounds.top;if(body.vy<0){body.vy*=-.5;impacts++}}
  if(body.y>=bounds.bottom){
   body.y=bounds.bottom;
   if(body.vy>85){body.vy*=-.56;body.vx*=.82;impacts++}else body.vy=0;
   if(body.vy===0){const drag=900*dt;body.vx=Math.sign(body.vx)*Math.max(0,Math.abs(body.vx)-drag)}
  }
 }
 if(body.y>=bounds.bottom-.1&&body.vy===0&&Math.abs(body.vx)<8){body.vx=0;return {sleeping:true,impacts}}
 return {sleeping:false,impacts};
}
