import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A continuous architectural world. Scroll changes the camera, not a background image.
export function makeObservatory(){
 const host=document.querySelector('#hero-art'),canvas=host.querySelector('canvas');
 const parent=host.parentNode,next=host.nextSibling;
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 document.body.prepend(host);host.classList.add('immersive-world');
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x081b18);scene.fog=new THREE.FogExp2(0x081b18,.045);
 const camera=new THREE.PerspectiveCamera(48,1,.1,100);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.08);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xc5e9cc,0x122823,2));
 const key=new THREE.DirectionalLight(0xffe3ad,4);key.position.set(-3,6,5);scene.add(key);
 const green=new THREE.PointLight(0x65e8bb,55,24);green.position.set(4,2,2);scene.add(green);
 const root=new THREE.Group();scene.add(root);
 const metal=new THREE.MeshPhysicalMaterial({color:0xbcc99b,metalness:.94,roughness:.22,clearcoat:1,envMapIntensity:2,side:THREE.DoubleSide});
 const dark=new THREE.MeshStandardMaterial({color:0x183d32,metalness:.8,roughness:.35});
 const glow=new THREE.MeshBasicMaterial({color:0xbce8b0});
 // A broad, twisted ribbon; its changing silhouette is legible from every camera angle.
 const pos=[],uv=[],indices=[],segments=360,strips=12;
 for(let i=0;i<=segments;i++){
  const a=i/segments*Math.PI*2,r=2.65+.56*Math.cos(a*3);
  const center=new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,.75*Math.sin(a*3));
  const width=new THREE.Vector3(Math.cos(a)*Math.cos(a*1.5),Math.sin(a)*Math.cos(a*1.5),Math.sin(a*1.5));
  for(let j=0;j<=strips;j++){const v=j/strips-.5;const point=center.clone().addScaledVector(width,v*.95);pos.push(point.x,point.y,point.z);uv.push(i/segments,j/strips);if(i<segments&&j<strips){const k=i*(strips+1)+j;indices.push(k,k+strips+1,k+1,k+1,k+strips+1,k+strips+2)}}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const sculpture=new THREE.Group();sculpture.add(new THREE.Mesh(geometry,metal));sculpture.position.set(2,0,0);root.add(sculpture);
 // Thin luminous seams travel along the edges of the metallic surface.
 for(const edge of [0,strips]){const pts=[];for(let i=0;i<=segments;i++){const k=(i*(strips+1)+edge)*3;pts.push(new THREE.Vector3(pos[k],pos[k+1],pos[k+2]))}sculpture.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xe5edbb,transparent:true,opacity:.8})))}
 const pearl=new THREE.Mesh(new THREE.IcosahedronGeometry(.54,4),new THREE.MeshPhysicalMaterial({color:0x77cca4,metalness:.6,roughness:.12,clearcoat:1,emissive:0x1b5c41,emissiveIntensity:.5}));sculpture.add(pearl);
 // Repeated architectural ribs create real parallax and a distant vanishing point.
 const architecture=new THREE.Group();root.add(architecture);
 for(let i=0;i<17;i++){
  const rib=new THREE.Group();rib.position.z=-5-i*3.4;rib.rotation.z=i*.065;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(7.8,.12,6,8),dark);ring.rotation.z=Math.PI/8;rib.add(ring);
  const seam=new THREE.Mesh(new THREE.TorusGeometry(7.63,.014,4,8),glow);seam.rotation.z=Math.PI/8;rib.add(seam);architecture.add(rib);
 }
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x102c25,metalness:.85,roughness:.28}));floor.rotation.x=-Math.PI/2;floor.position.y=-4.4;scene.add(floor);
 const grid=new THREE.GridHelper(160,80,0x638572,0x244539);grid.position.y=-4.38;scene.add(grid);
 const shards=new THREE.InstancedMesh(new THREE.BoxGeometry(.055,.28,.025),metal,100);const matrix=new THREE.Object3D();let seed=51;const rnd=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
 for(let i=0;i<100;i++){const a=rnd()*Math.PI*2,r=3.8+rnd()*3.3;matrix.position.set(Math.cos(a)*r+2,Math.sin(a)*r,(rnd()-.5)*15);matrix.rotation.set(rnd()*3,rnd()*3,rnd()*3);matrix.scale.setScalar(.35+rnd());matrix.updateMatrix();shards.setMatrixAt(i,matrix.matrix)}root.add(shards);
 const particlePositions=[],phases=[];const count=innerWidth<700?1600:4200;
 for(let i=0;i<count;i++){const a=rnd()*Math.PI*2,r=3.2+rnd()*4;particlePositions.push(Math.cos(a)*r+2,Math.sin(a)*r,(rnd()-.5)*18);phases.push(rnd()*6.28)}
 const particlesGeo=new THREE.BufferGeometry();particlesGeo.setAttribute('position',new THREE.Float32BufferAttribute(particlePositions,3));particlesGeo.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));
 const pointer=new THREE.Vector2(),smooth=new THREE.Vector2();
 const uniforms={time:{value:0},pointer:{value:smooth},burst:{value:0},tint:{value:new THREE.Color(0xd7e9b4)}};
 const particlesMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms,vertexShader:`attribute float phase;uniform float time;uniform float burst;uniform vec2 pointer;varying float alpha;void main(){vec3 p=position;float a=time*.04+sin(phase)*.12;mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));p.xy=rot*p.xy;p.xy*=1.+burst*.22;p.y+=sin(time*.4+phase)*.16;vec4 mv=modelViewMatrix*vec4(p,1.);vec4 clip=projectionMatrix*mv;vec2 d=clip.xy/clip.w-pointer;mv.xy+=normalize(d+vec2(.001))*exp(-dot(d,d)*8.)*.9;gl_Position=projectionMatrix*mv;gl_PointSize=clamp(30./-mv.z,1.,4.);alpha=.4+.6*sin(phase+time*.4)*sin(phase+time*.4);}`,fragmentShader:`uniform vec3 tint;varying float alpha;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(tint,exp(-d*d*22.)*alpha*smoothstep(.5,.3,d));}`});scene.add(new THREE.Points(particlesGeo,particlesMat));
 // A tapered light ribbon follows the pointer through the foreground plane.
 const trailCount=48,trailPoints=Array.from({length:trailCount},()=>new THREE.Vector3()),trailPositions=new Float32Array(trailCount*6),trailColors=new Float32Array(trailCount*6),trailIndices=[];
 for(let i=0;i<trailCount;i++){const fade=1-i/trailCount;for(let j=0;j<2;j++){const k=i*6+j*3;trailColors[k]=.55*fade;trailColors[k+1]=fade;trailColors[k+2]=.72*fade}if(i<trailCount-1){const k=i*2;trailIndices.push(k,k+1,k+2,k+1,k+3,k+2)}}
 const trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(trailPositions,3).setUsage(THREE.DynamicDrawUsage));trailGeo.setAttribute('color',new THREE.BufferAttribute(trailColors,3));trailGeo.setIndex(trailIndices);
 const trail=new THREE.Mesh(trailGeo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));trail.frustumCulled=false;trail.visible=false;scene.add(trail);
 let burst=0,scroll=0,disposed=false,hasPointer=false;
 const targetPoint=new THREE.Vector3(),direction=new THREE.Vector3();
 const move=e=>{if(e.pointerType!=='touch'){hasPointer=true;pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2)}};
 const leave=()=>{hasPointer=false;pointer.set(0,0)};
 const pulse=e=>{if(e.target.closest('button,a,input,dialog,.article-grid'))return;burst=1;};
 window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',pulse);document.documentElement.addEventListener('pointerleave',leave);
 const journal=document.querySelector('#journal'),lab=document.querySelector('#playground');
 return {host,ready:true,render(t,moving){
  const w=innerWidth,h=innerHeight,ratio=renderer.getPixelRatio();if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  const target=Math.min(2.8,scrollY/Math.max(1,journal.offsetTop));
  scroll=moving?THREE.MathUtils.lerp(scroll,target,.08):target;
  if(moving){smooth.lerp(pointer,.035);burst*=.93;uniforms.time.value=t;uniforms.burst.value=burst;sculpture.rotation.set(.25+Math.sin(t*.12)*.18,t*.13+scroll*.8,-.35+scroll*.3);shards.rotation.z=t*.012;pearl.position.y=Math.sin(t*.7)*.2;}
  const mobile=w<700;
  camera.position.set(smooth.x*.5+scroll*1.5,mobile?1.2+scroll*.7:.4+smooth.y*.35+scroll*.7, mobile?14-scroll*1.8:11-scroll*1.6);
  camera.lookAt(1.1+scroll*.8,scroll*.35,-scroll*2);
  sculpture.position.set(mobile?.3:2.4, mobile?.9:0,-scroll*3);
  sculpture.visible=scrollY<lab.offsetTop-h*.5;
  architecture.rotation.z=scroll*.1;
  // Keep article text dominant, then reveal the architecture again beyond the laboratory.
  const inJournal=scrollY>journal.offsetTop-h*.3&&scrollY<lab.offsetTop-h*.4;
  host.classList.toggle('world-reading',inJournal);host.dataset.camera=scroll.toFixed(2);
  if(moving&&hasPointer){
   camera.updateMatrixWorld();targetPoint.set(pointer.x,pointer.y,.5).unproject(camera);direction.copy(targetPoint).sub(camera.position).normalize();targetPoint.copy(camera.position).addScaledVector(direction,5);
   if(!trail.visible)trailPoints.forEach(p=>p.copy(targetPoint));trail.visible=true;trailPoints[0].lerp(targetPoint,.4);
   for(let i=1;i<trailCount;i++)trailPoints[i].lerp(trailPoints[i-1],.3);
   for(let i=0;i<trailCount;i++){const p=trailPoints[i],width=.026*(1-i/trailCount);trailPositions.set([p.x,p.y-width,p.z,p.x,p.y+width,p.z],i*6)}trailGeo.attributes.position.needsUpdate=true;
  }else if(!moving||!hasPointer)trail.visible=false;
  renderer.render(scene,camera);
 },mood(i){metal.color.set([0xbcc99b,0x8ecdb5,0xd1aa73][i]);uniforms.tint.value.set([0xd7e9b4,0xa0edda,0xf0c393][i])},dispose(){if(disposed)return;disposed=true;window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',pulse);document.documentElement.removeEventListener('pointerleave',leave);scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()});env.dispose();renderer.dispose();host.classList.remove('immersive-world','world-reading');parent.insertBefore(host,next)}};
}
