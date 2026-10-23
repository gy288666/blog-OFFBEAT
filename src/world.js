import { createCorgiBehavior } from './corgi-behavior.js';
import { makeStarfield } from './starfield.js';
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
 const canvas=document.querySelector('#pet-canvas'),r=renderer(canvas),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.1,50);
 camera.position.set(1.65,1.65,5.2);camera.lookAt(.15,.85,0);
 scene.add(new THREE.HemisphereLight(0xffecd0,0x274637,1.7));
 const key=new THREE.DirectionalLight(0xffe8c4,2.6);key.position.set(-3,5,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xd7f6e8,2.2);rim.position.set(3,3,-3);scene.add(rim);
 const env=environment(r,scene);r.toneMappingExposure=.85;
 const mat=(color,roughness=.7)=>new THREE.MeshStandardMaterial({color,roughness,envMapIntensity:.35});
 const tan=mat(0xb85919),lightTan=mat(0xd77c26),cream=mat(0xffe8bb),dark=mat(0x211c18,.25),pink=mat(0xce7770),pawMat=mat(0xf9dbab),forest=mat(0x145647),gold=mat(0xdca842,.32);
 const dog=new THREE.Group();dog.position.set(-.42,0,0);dog.rotation.y=-.14;scene.add(dog);
 function ell(parent,material,pos,scale){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),material);mesh.position.set(...pos);mesh.scale.set(...scale);parent.add(mesh);return mesh}
 // A low loaf-shaped body and large wedge ears keep the silhouette recognisably corgi.
 ell(dog,tan,[0,.49,-.18],[.51,.38,.72]);ell(dog,cream,[0,.45,.36],[.37,.32,.26]);
 const legs=[];for(const x of [-.33,.33])for(const z of [-.48,.34]){const leg=new THREE.Group();leg.position.set(x,.24,z);dog.add(leg);ell(leg,tan,[0,0,0],[.17,.19,.18]);ell(leg,pawMat,[0,-.12,.08],[.18,.11,.22]);legs.push(leg)}
 const head=new THREE.Group();head.position.set(0,.98,.42);dog.add(head);ell(head,lightTan,[0,0,0],[.59,.43,.4]);
 function ear(x,rotate){const ear=new THREE.Group();ear.position.set(x,.25,-.05);ear.rotation.z=rotate;head.add(ear);const shape=new THREE.Shape();shape.moveTo(-.23,0);shape.quadraticCurveTo(-.27,.12,-.12,.39);shape.quadraticCurveTo(-.08,.48,.0,.42);shape.quadraticCurveTo(.22,.23,.23,0);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.045,bevelThickness:.045,curveSegments:20});ear.add(new THREE.Mesh(g,tan));const inner=new THREE.Mesh(new THREE.ShapeGeometry(shape),pink);inner.scale.set(.65,.66,1);inner.position.set(0,.055,.171);ear.add(inner);return ear}
 const earL=ear(-.41,.2),earR=ear(.41,-.2);
 ell(head,cream,[0,.09,.36],[.105,.3,.065]);
 for(const x of [-1,1]){
  const cheek=ell(head,cream,[x*.3,-.18,.29],[.29,.22,.18]);cheek.rotation.z=x*.15;
  ell(head,cream,[x*.47,-.12,.14],[.16,.12,.13]);
  const brow=ell(head,cream,[x*.255,.16,.344],[.09,.035,.025]);brow.rotation.z=x*.16;
 }
 const eyes=[];for(const x of [-.255,.255]){const eye=ell(head,dark,[x,.045,.385],[.079,.095,.041]);eye.userData.openHeight=.095;eyes.push(eye);ell(eye,cream,[-.24,.36,.87],[.3,.27,.22]);ell(eye,cream,[.3,-.24,.91],[.12,.12,.12]);ell(head,pink,[x*1.43,-.12,.424],[.065,.028,.015])}
 ell(head,dark,[0,-.245,.42],[.13,.085,.035]);
 const tongue=ell(head,pink,[0,-.298,.456],[.07,.078,.023]);
 ell(head,cream,[-.115,-.16,.4],[.16,.11,.12]);ell(head,cream,[.115,-.16,.4],[.16,.11,.12]);
 const nose=ell(head,dark,[0,-.105,.514],[.108,.073,.06]);ell(nose,cream,[-.3,.37,.8],[.22,.12,.06]);
 // Tailored forest cape with an asymmetric fold, fastened by a small brass star.
 const capeShape=new THREE.Shape();capeShape.moveTo(-.32,.73);capeShape.bezierCurveTo(-.6,.65,-.6,.39,-.52,.32);capeShape.quadraticCurveTo(0,.2,.52,.32);capeShape.bezierCurveTo(.6,.39,.6,.65,.32,.73);capeShape.closePath();
 const cape=new THREE.Mesh(new THREE.ExtrudeGeometry(capeShape,{depth:.65,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,steps:1}),forest);cape.position.z=-.59;dog.add(cape);
 const collar=new THREE.Mesh(new THREE.TorusGeometry(.37,.065,12,48),forest);collar.rotation.x=Math.PI/2;collar.position.set(0,.7,.25);dog.add(collar);
 const star=new THREE.Shape();for(let i=0;i<10;i++){const angle=Math.PI/2+i*Math.PI/5,rad=i%2?.045:.095;const x=Math.cos(angle)*rad,y=Math.sin(angle)*rad;i?star.lineTo(x,y):star.moveTo(x,y)}star.closePath();
 const tag=new THREE.Mesh(new THREE.ExtrudeGeometry(star,{depth:.025,bevelEnabled:true,bevelSize:.01,bevelThickness:.01,bevelSegments:2}),gold);tag.position.set(.12,.59,.59);tag.rotation.z=-.16;dog.add(tag);
 const tail=new THREE.Group();tail.position.set(0,.62,-.83);dog.add(tail);ell(tail,tan,[0,.07,-.02],[.18,.2,.16]);ell(tail,cream,[0,.19,-.02],[.14,.11,.13]);
 const ball=new THREE.Group();scene.add(ball);const ballSphere=new THREE.Mesh(new THREE.SphereGeometry(.235,32,24),mat(0xf7efe1,.45));ball.add(ballSphere);const ico=new THREE.IcosahedronGeometry(1,0);const vertices=ico.attributes.position;const seen=new Set();for(let i=0;i<vertices.count;i++){const v=new THREE.Vector3().fromBufferAttribute(vertices,i).normalize();const key=v.toArray().map(x=>x.toFixed(2)).join();if(seen.has(key))continue;seen.add(key);const patch=new THREE.Mesh(new THREE.CircleGeometry(.071,5),dark);patch.position.copy(v.multiplyScalar(.232));patch.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v.normalize());ball.add(patch)}ico.dispose();ball.position.set(1.05,.255,.44);
 const shadowTex=(()=>{const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(64,64,3,64,64,64);grad.addColorStop(0,'rgba(13,8,18,.5)');grad.addColorStop(1,'rgba(13,8,18,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.7),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(-.3,.01,0);scene.add(shadow);const ballShadow=new THREE.Mesh(new THREE.CircleGeometry(.3,32),new THREE.MeshBasicMaterial({color:0x1b1323,transparent:true,opacity:.2,depthWrite:false}));ballShadow.rotation.x=-Math.PI/2;ballShadow.position.set(1.05,.012,.44);scene.add(ballShadow);
 const behavior=createCorgiBehavior({canvas,dog,head,legs,eyes,ears:[earL,earR],tail,tongue,ball,shadow,ballShadow});
 return {host:canvas,kick:behavior.kick,pat:behavior.pat,render(t,moving){size(r,camera);behavior.update(t,moving);r.render(scene,camera)},dispose(){behavior.dispose();disposeScene(scene);env.dispose();shadowTex.dispose();r.dispose();r.forceContextLoss()}};

}

export function startWorld({motion=true,onReady=()=>{},onError=()=>{}}={}){
 let active=motion,thumbs=[],disposed=false,frame=0,time=0,last=performance.now(),force=true,ready=false;
 const hero=makeHero();let pet;try{pet=makePet()}catch(error){hero.dispose();throw error}let background;try{background=makeStarfield()}catch(error){hero.dispose();pet.dispose();throw error}const visible=new Map();
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{visible.set(e.target,e.isIntersecting);force=true}),{rootMargin:'100px'});observer.observe(hero.host);observer.observe(pet.host);
 function addThumbnails(){document.querySelectorAll('[data-art]').forEach(canvas=>{try{const thumb=makeThumb(canvas);thumbs.push(thumb);observer.observe(canvas)}catch(error){console.warn('Thumbnail unavailable',error)}});force=true}
 function clearThumbnails(){for(const thumb of thumbs){observer.unobserve(thumb.host);visible.delete(thumb.host);thumb.dispose()}thumbs=[]}
 addThumbnails();
 function draw(now){if(disposed)return;frame=requestAnimationFrame(draw);const elapsed=Math.min((now-last)/1000,.06);last=now;if(document.hidden)return;if(active)time+=elapsed;if(!active&&!force&&ready)return;if(active&&!force&&now-(draw.previous||0)<32)return;draw.previous=now;try{for(const entity of [background,hero,...thumbs,pet])if(visible.get(entity.host)!==false){entity.render(time,active)}force=false;if(!ready&&hero.ready!==false){ready=true;onReady()}}catch(error){onError(error)}}
 frame=requestAnimationFrame(draw);
 const resize=()=>{force=true};window.addEventListener('resize',resize);window.addEventListener('scroll',resize,{passive:true});document.addEventListener('visibilitychange',resize);
 const contextLost=e=>{e.preventDefault();queueMicrotask(()=>{if(!disposed)onError(new Error('WebGL context lost'))})};
 const canvases=[background.host,hero.host.querySelector('canvas'),pet.host];canvases.forEach(c=>c.addEventListener('webglcontextlost',contextLost));
 function dispose(){if(disposed)return;disposed=true;canvases.forEach(c=>c.removeEventListener('webglcontextlost',contextLost));cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('scroll',resize);document.removeEventListener('visibilitychange',resize);clearThumbnails();hero.dispose();pet.dispose();background.dispose()}
 if(import.meta.hot)import.meta.hot.dispose(dispose);
 return {pulse(){background.pulse();force=true},addThumbnails,clearThumbnails,setMotion(v){active=v;force=true},setMood(i){hero.mood(i);background.mood(i);force=true},kick(){pet.kick();force=true},pat(){pet.pat();force=true},dispose};
}
