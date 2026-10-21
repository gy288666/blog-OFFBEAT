import * as THREE from 'three';

// A layered illustration in a live WebGL scene: orbiting fireflies, lens-like
// crystals and pointer-driven depth remain independent of the painted garden.
export function makeObservatory(){
 const host=document.querySelector('#hero-art'),canvas=host.querySelector('canvas');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x0b2421,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.z=10;
 const root=new THREE.Group();scene.add(root);
 let loaded=false,loadError=null,disposed=false;
 const texture=new THREE.TextureLoader().load('/images/observatory-garden.png',()=>{loaded=true},undefined,error=>{loadError=error||new Error('Garden image failed to load')});texture.colorSpace=THREE.SRGBColorSpace;
 const garden=new THREE.Mesh(new THREE.PlaneGeometry(6.6,7),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));garden.renderOrder=2;root.add(garden);
 const atmosphere=new THREE.Mesh(new THREE.PlaneGeometry(16,14),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},mood:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;uniform float mood;void main(){vec2 p=vUv-.5;float r=length(p*vec2(1.,.9));float fog=exp(-r*r*15.)*.33;float beams=pow(max(0.,sin(atan(p.y,p.x)*6.+time*.018)),6.)*.12*exp(-r*3.);vec3 color=mood<.5?vec3(.38,.52,.25):mood<1.5?vec3(.2,.52,.42):vec3(.55,.4,.15);gl_FragColor=vec4(color,fog+beams);}`}));atmosphere.position.z=-3;scene.add(atmosphere);
 const coordinates=[],phase=[];let seed=31;const rnd=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
 for(let i=0;i<420;i++){coordinates.push((rnd()-.5)*15,(rnd()-.5)*12,(rnd()-.5)*5);phase.push(rnd()*6.28)}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(coordinates,3));geometry.setAttribute('phase',new THREE.Float32BufferAttribute(phase,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:`attribute float phase;uniform float time;varying float glow;void main(){vec3 p=position;p.y+=sin(time*.16+phase)*.12;p.x+=cos(time*.13+phase)*.1;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(2.+sin(phase)*1.2)*clamp(10./-mv.z,.5,2.);glow=.35+.65*pow(sin(time*.35+phase)*.5+.5,2.);}`,fragmentShader:`varying float glow;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d)*glow;gl_FragColor=vec4(.95,.88,.53,a);}`});
 const fireflies=new THREE.Points(geometry,material);fireflies.renderOrder=3;scene.add(fireflies);
 const orbits=[];for(let i=0;i<3;i++){const pts=[];for(let j=0;j<=240;j++){const a=j/240*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*(3.7+i*.3),Math.sin(a)*(3.7+i*.3),0))}const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xd9d18c,transparent:true,opacity:i===0?.22:.1}));line.rotation.set(.35+i*.35,.25+i*.4,-.2+i*.2);line.position.z=-1;orbits.push(line);scene.add(line)}
 const gems=[];for(let i=0;i<4;i++){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.06+i*.02),new THREE.MeshBasicMaterial({color:i%2?0xe7db9f:0xb0cfb2,wireframe:true,transparent:true,opacity:.7}));gems.push(gem);scene.add(gem)}
 const pointer=new THREE.Vector2(),smooth=new THREE.Vector2();
 function move(e){const box=host.getBoundingClientRect();pointer.set((e.clientX-box.left)/box.width-.5,(e.clientY-box.top)/box.height-.5)}
 const leave=()=>pointer.set(0,0);host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
 return {host,get ready(){return loaded},render(t,moving){
  if(loadError)throw loadError;
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const w=Math.round(rect.width),h=Math.round(rect.height),ratio=renderer.getPixelRatio();
  if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  if(moving){smooth.lerp(pointer,.04);root.rotation.y=smooth.x*.12;root.rotation.x=smooth.y*.08;root.position.set(smooth.x*.16,Math.sin(t*.35)*.07,0);material.uniforms.time.value=t;atmosphere.material.uniforms.time.value=t;fireflies.rotation.z=t*.003;orbits.forEach((o,i)=>o.rotation.z=-.2+i*.2+Math.sin(t*.04+i)*.08)}
  gems.forEach((gem,i)=>{const a=(moving?t*.12:0)+i*1.6;gem.position.set(Math.cos(a)*3.9,Math.sin(a)*2.8,.4);gem.rotation.set(a,a*.6,a*.3)});
  renderer.render(scene,camera);
 },mood(i){atmosphere.material.uniforms.mood.value=i;garden.material.color.set([0xffffff,0xdcffe9,0xffeed2][i])},dispose(){if(disposed)return;disposed=true;host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});texture.dispose();renderer.dispose()}};
}
