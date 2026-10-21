import { makeObservatory } from './observatory.js';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TAU=Math.PI*2;
function renderer(canvas){const r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});r.setPixelRatio(Math.min(devicePixelRatio,1.6));r.setClearColor(0x000000,0);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.25;return r}
function size(r,camera){const rect=r.domElement.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const w=Math.round(rect.width),h=Math.round(rect.height);const pixel=r.getPixelRatio();if(r.domElement.width!==Math.floor(w*pixel)||r.domElement.height!==Math.floor(h*pixel)){r.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}
function environment(r,scene){const pmrem=new THREE.PMREMGenerator(r);const room=new RoomEnvironment();const target=pmrem.fromScene(room,.04);scene.environment=target.texture;room.dispose();pmrem.dispose();return target}
function lighting(scene){scene.add(new THREE.HemisphereLight(0xffe5ee,0x4b4260,2.2));const key=new THREE.DirectionalLight(0xffe7dc,4);key.position.set(-3,5,4);scene.add(key);const fill=new THREE.DirectionalLight(0xc9dbe7,2);fill.position.set(4,1,-2);scene.add(fill)}
function ring(radius,color,opacity,segments=180){const points=Array.from({length:segments+1},(_,i)=>new THREE.Vector3(Math.cos(i/segments*TAU)*radius,Math.sin(i/segments*TAU)*radius,0));return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity}))}
function disposeScene(scene){scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose()}}})}

function makeHero(){return makeObservatory()}

function makeThumb(canvas){
 const type=canvas.dataset.art,r=renderer(canvas),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,50);camera.position.set(0,0,7);lighting(scene);const env=environment(r,scene);const group=new THREE.Group();scene.add(group);
 if(type==='ribbon'){
  const mat=new THREE.MeshPhysicalMaterial({color:0xd8b7a0,metalness:.8,roughness:.22,iridescence:1,iridescenceThicknessRange:[120,380],clearcoat:1,envMapIntensity:1.8});const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(1.16,.3,140,22,2,3),mat);knot.rotation.set(.5,.2,.6);group.add(knot);group.position.set(.25,.2,0);group.scale.setScalar(.93);
  const orbit=ring(1.9,0xf2b3ca,.25);orbit.rotation.set(1.1,.2,-.4);group.add(orbit);
 }else if(type==='glass'){
  for(let i=0;i<4;i++){const mat=new THREE.MeshPhysicalMaterial({color:[0x98b8b0,0xc2d1bf,0x9dbbb8,0xe1d8ca][i],metalness:.55,roughness:.1,transparent:true,opacity:.36,clearcoat:1,envMapIntensity:1.3});const block=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.6,.13),mat);block.position.set((i-1.5)*.4,.25+(i%2)*.13,0);block.rotation.set(.2,-.55,-.18);group.add(block);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(block.geometry),new THREE.LineBasicMaterial({color:0xe0e7da,transparent:true,opacity:.4}));block.add(edges)}group.rotation.set(.1,.25,.1);group.position.set(.3,.25,0);
 }else{
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(.64,36,36),new THREE.MeshBasicMaterial({color:0xffddb0}));sphere.position.set(.65,.56,-1);group.add(sphere);
  for(let i=0;i<6;i++){const geo=new THREE.PlaneGeometry(10,1.6,65,1);const pos=geo.attributes.position;for(let v=0;v<pos.count;v++){if(pos.getY(v)>0){const x=pos.getX(v);pos.setY(v,.18+Math.sin(x*.9+i*.8)*.25+Math.cos(x*1.5+i)*.16)}else{pos.setY(v,-4)}}geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:[0xb58d72,0x9d7961,0x7c6858,0x655c4e,0x4a4a3f,0x343c34][i],side:THREE.DoubleSide}));mesh.position.set(0,-.28-i*.19,-.6+i*.13);group.add(mesh)}
 }
 return {host:canvas,render(t,moving){size(r,camera);if(moving){if(type==='ribbon'){group.rotation.y=t*.14;group.rotation.z=Math.sin(t*.2)*.08}else if(type==='glass'){group.rotation.y=.2+Math.sin(t*.3)*.2;group.position.y=.2+Math.sin(t*.5)*.08}else{group.position.y=Math.sin(t*.18)*.03}}r.render(scene,camera)},dispose(){disposeScene(scene);env.dispose();r.dispose();r.forceContextLoss()}};
}

function makePet(){
 const canvas=document.querySelector('#pet-canvas'),r=renderer(canvas),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(26,1,.1,50);camera.position.set(2,1.75,5);camera.lookAt(.1,.82,0);lighting(scene);const env=environment(r,scene);r.toneMappingExposure=.86;
 const mat=(color,roughness=.7)=>new THREE.MeshStandardMaterial({color,roughness});const tan=mat(0xd89446),lightTan=mat(0xe8ad62),cream=mat(0xfff3dc),dark=mat(0x30222a,.25),pink=mat(0xe99e9e),pawMat=mat(0xf5e5cc);
 const dog=new THREE.Group();dog.position.set(-.42,0,0);dog.rotation.y=-.14;scene.add(dog);
 function ell(parent,material,pos,scale){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,20),material);mesh.position.set(...pos);mesh.scale.set(...scale);parent.add(mesh);return mesh}
 ell(dog,tan,[0,.53,-.13],[.42,.38,.65]);ell(dog,cream,[0,.49,.29],[.31,.33,.27]);
 const legs=[];for(const x of [-.27,.27])for(const z of [-.42,.31]){const leg=new THREE.Group();leg.position.set(x,.29,z);dog.add(leg);ell(leg,tan,[0,-.025,0],[.13,.21,.14]);ell(leg,pawMat,[0,-.15,.055],[.14,.095,.17]);legs.push(leg)}
 const head=new THREE.Group();head.position.set(0,.98,.42);dog.add(head);ell(head,lightTan,[0,0,0],[.48,.4,.36]);
 // The broad forehead, upright ears, white blaze and short paws establish the corgi silhouette.
 function ear(x,rotate){const ear=new THREE.Group();ear.position.set(x,.27,-.035);ear.rotation.z=rotate;head.add(ear);const shape=new THREE.Shape();shape.moveTo(-.19,0);shape.quadraticCurveTo(-.23,.2,-.06,.51);shape.quadraticCurveTo(.0,.58,.05,.47);shape.quadraticCurveTo(.18,.2,.17,0);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.04,curveSegments:16});const outer=new THREE.Mesh(g,tan);ear.add(outer);const inner=new THREE.Mesh(new THREE.ShapeGeometry(shape),pink);inner.scale.set(.64,.74,1);inner.position.set(0,.04,.151);ear.add(inner);return ear}const earL=ear(-.31,.2),earR=ear(.31,-.2);
 ell(head,cream,[0,.03,.319],[.085,.31,.045]);ell(head,cream,[-.15,-.17,.286],[.22,.17,.145]);ell(head,cream,[.15,-.17,.286],[.22,.17,.145]);ell(head,dark,[0,-.12,.432],[.105,.071,.065]);
 const eyes=[];for(const x of [-.235,.235]){ell(head,tan,[x,.015,.299],[.118,.11,.06]);const eye=ell(head,dark,[x,.01,.351],[.055,.071,.034]);eyes.push(eye);ell(head,cream,[x-.014,.034,.38],[.017,.022,.01]);ell(head,pink,[x*1.2,-.12,.314],[.055,.025,.022])}
 ell(head,dark,[0,-.255,.347],[.115,.068,.043]);const tongue=ell(head,pink,[0,-.302,.374],[.063,.078,.029]);
 const collar=new THREE.Mesh(new THREE.TorusGeometry(.31,.035,10,40),mat(0x99b9a9));collar.rotation.x=Math.PI/2;collar.position.set(0,.7,.28);dog.add(collar);const tag=ell(dog,mat(0xe7c780,.35),[0,.65,.55],[.052,.065,.02]);
 const tail=new THREE.Group();tail.position.set(0,.64,-.68);dog.add(tail);ell(tail,tan,[0,.07,-.02],[.14,.2,.14]);ell(tail,cream,[0,.18,-.02],[.11,.1,.11]);
 const ball=new THREE.Group();scene.add(ball);const ballSphere=new THREE.Mesh(new THREE.SphereGeometry(.235,32,24),mat(0xf7efe1,.45));ball.add(ballSphere);const ico=new THREE.IcosahedronGeometry(1,0);const vertices=ico.attributes.position;const seen=new Set();for(let i=0;i<vertices.count;i++){const v=new THREE.Vector3().fromBufferAttribute(vertices,i).normalize();const key=v.toArray().map(x=>x.toFixed(2)).join();if(seen.has(key))continue;seen.add(key);const patch=new THREE.Mesh(new THREE.CircleGeometry(.071,5),dark);patch.position.copy(v.multiplyScalar(.232));patch.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v.normalize());ball.add(patch)}ico.dispose();ball.position.set(1.05,.255,.44);
 const shadowTex=(()=>{const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(64,64,3,64,64,64);grad.addColorStop(0,'rgba(13,8,18,.5)');grad.addColorStop(1,'rgba(13,8,18,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.7),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(-.3,.01,0);scene.add(shadow);const ballShadow=new THREE.Mesh(new THREE.CircleGeometry(.3,32),new THREE.MeshBasicMaterial({color:0x1b1323,transparent:true,opacity:.2,depthWrite:false}));ballShadow.rotation.x=-Math.PI/2;ballShadow.position.set(1.05,.012,.44);scene.add(ballShadow);
 let kickStart=-99,lastTime=0;
 return {host:canvas,kick(){kickStart=lastTime},render(t,moving){size(r,camera);lastTime=t;if(moving){const phase=(t%5.5)/5.5;const kick=phase<.18?Math.sin(phase/.18*Math.PI):0;const excitement=Math.max(0,1-(t-kickStart)/2);dog.position.x=-.42+Math.sin(t*1.14)*.1;dog.position.y=Math.abs(Math.sin(t*2.28))*.012+excitement*Math.abs(Math.sin(t*9))*.06;head.rotation.z=Math.sin(t*.8)*.06+excitement*Math.sin(t*5)*.12;head.rotation.y=.08+Math.sin(t*.7)*.08;tail.rotation.z=Math.sin(t*(excitement?17:9))*.4;earL.rotation.z=.2+Math.sin(t*2)*.035;earR.rotation.z=-.2+Math.sin(t*2+.7)*.035;legs[3].rotation.x=-kick*.8-excitement*Math.max(0,Math.sin(t*9))*.6;legs[1].rotation.x=Math.sin(t*2.2)*.07;const blink=t%4.8>4.65?.12:1;eyes.forEach(eye=>eye.scale.y=.071*blink);tongue.scale.y=.078+Math.sin(t*2)*.007;ball.position.x=.8+Math.sin(phase*Math.PI)*.6;ball.position.y=.255+Math.sin(phase*Math.PI)*.13+excitement*Math.abs(Math.sin((t-kickStart)*5))*.45;ball.position.z=.45+Math.sin(phase*Math.PI)*.12;ball.rotation.z=-t*1.3-excitement*(t-kickStart)*4;ball.rotation.x=t*.5;ballShadow.position.x=ball.position.x;ballShadow.position.z=ball.position.z;ballShadow.material.opacity=.23-(ball.position.y-.255)*.2}r.render(scene,camera)},dispose(){disposeScene(scene);env.dispose();shadowTex.dispose();r.dispose()}};
}

export function startWorld({motion=true,onReady=()=>{},onError=()=>{}}={}){
 let active=motion,thumbs=[],disposed=false,frame=0,time=0,last=performance.now(),force=true,ready=false;
 const hero=makeHero();let pet;try{pet=makePet()}catch(error){hero.dispose();throw error}const visible=new Map();
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{visible.set(e.target,e.isIntersecting);force=true}),{rootMargin:'100px'});observer.observe(hero.host);observer.observe(pet.host);
 function addThumbnails(){document.querySelectorAll('[data-art]').forEach(canvas=>{try{const thumb=makeThumb(canvas);thumbs.push(thumb);observer.observe(canvas)}catch(error){console.warn('Thumbnail unavailable',error)}});force=true}
 function clearThumbnails(){for(const thumb of thumbs){observer.unobserve(thumb.host);visible.delete(thumb.host);thumb.dispose()}thumbs=[]}
 addThumbnails();
 function draw(now){if(disposed)return;frame=requestAnimationFrame(draw);const elapsed=Math.min((now-last)/1000,.06);last=now;if(document.hidden)return;if(active)time+=elapsed;if(!active&&!force&&ready)return;if(active&&!force&&now-(draw.previous||0)<32)return;draw.previous=now;try{for(const entity of [hero,...thumbs,pet])if(visible.get(entity.host)!==false){entity.render(time,active)}force=false;if(!ready&&hero.ready!==false){ready=true;onReady()}}catch(error){onError(error)}}
 frame=requestAnimationFrame(draw);
 const resize=()=>{force=true};window.addEventListener('resize',resize);document.addEventListener('visibilitychange',resize);
 const contextLost=e=>{e.preventDefault();queueMicrotask(()=>{if(!disposed)onError(new Error('WebGL context lost'))})};
 const canvases=[hero.host.querySelector('canvas'),pet.host];canvases.forEach(c=>c.addEventListener('webglcontextlost',contextLost));
 function dispose(){if(disposed)return;disposed=true;canvases.forEach(c=>c.removeEventListener('webglcontextlost',contextLost));cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',resize);clearThumbnails();hero.dispose();pet.dispose()}
 if(import.meta.hot)import.meta.hot.dispose(dispose);
 return {addThumbnails,clearThumbnails,setMotion(v){active=v;force=true},setMood(i){hero.mood(i);force=true},kick(){pet.kick();force=true},dispose};
}
