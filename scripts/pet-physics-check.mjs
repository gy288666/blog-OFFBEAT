import assert from 'node:assert/strict';
import {stepPetPhysics} from '../src/pet-physics.js';
const bounds={left:8,top:8,right:1000,bottom:650};
for(const hz of [20,60,144]){
 const body={x:400,y:80,vx:1900,vy:-1100};let impacts=0,sleeping=false,peak=0;
 for(let i=0;i<hz*15;i++){
  const result=stepPetPhysics(body,bounds,1/hz);impacts+=result.impacts;
  assert.ok(body.x>=8&&body.x<=1000&&body.y>=8&&body.y<=650,'stays inside viewport');peak=Math.max(peak,body.y);
  if(result.sleeping){sleeping=true;break}
 }
 assert.ok(sleeping,`settles at ${hz} FPS`);assert.ok(impacts>=3&&impacts<20,'finite damped collisions');assert.equal(body.y,650);assert.equal(body.vx,0);assert.equal(body.vy,0);
}
const body={x:300,y:100,vx:0,vy:0};stepPetPhysics(body,bounds,.05);assert.ok(body.y>100&&body.vy>0,'gravity acts on a stationary release');
const wall={x:999,y:100,vx:1200,vy:0};stepPetPhysics(wall,bounds,.01);assert.ok(wall.vx<0&&Math.abs(wall.vx)<1200,'wall impact loses energy');
console.log('PASS: gravity, dissipative collisions, viewport containment, friction and sleep at 20/60/144 FPS.');
