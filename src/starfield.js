import { makeLaboratory } from './laboratory.js';
import { makeOrrery } from './orrery.js';
import * as THREE from 'three';

// One full-viewport GPU scene, shared by every section of the page.
export function makeStarfield() {
 const canvas=document.createElement('canvas');canvas.id='starfield';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
 let renderer;
 try {renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'})} catch(error){canvas.remove();throw error}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1));
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,1,.1,80);camera.position.z=16;
 const orrery=makeOrrery(scene),laboratory=makeLaboratory(scene);
 const pointer=new THREE.Vector2(30,30),smooth=new THREE.Vector2(30,30);
 const uniforms={time:{value:0},pointer:{value:smooth},aspect:{value:1},scroll:{value:0},tint:{value:new THREE.Color(0xd8cf8a)}};
 const veil=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({depthWrite:false,depthTest:false,transparent:true,uniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv;uniform float time;uniform float scroll;uniform vec3 tint;
 void main(){vec2 p=vUv;float t=time*.035;float light=0.;
 for(int i=0;i<5;i++){float f=float(i);float curve=.56+sin(p.x*4.+t+f*.3+scroll*.15)*.23+sin(p.x*9.-t*.6+f)*.055;float d=abs(p.y-curve);light+=exp(-d*(34.+f*9.))*.09;}
 float fog=(sin(p.x*6.+p.y*4.+t)*.5+.5)*.04;
 vec3 color=mix(vec3(.17,.54,.38),tint,.22);gl_FragColor=vec4(color,(light+fog)*smoothstep(0.,.3,p.x));}` }));veil.renderOrder=-1;scene.add(veil);
 let seed=81;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
 const count=matchMedia('(max-width:600px)').matches?1100:2800,positions=[],phases=[];
 for(let i=0;i<count;i++){positions.push((random()-.5)*48,(random()-.5)*30,(random()-.5)*15);phases.push(random()*6.28)}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`
 attribute float phase;uniform float time;uniform vec2 pointer;uniform float scroll;varying float glow;varying float kind;
 void main(){vec3 p=position;p.y=mod(p.y+15.+scroll*.45+time*(.025+.025*sin(phase)),30.)-15.;p.x+=sin(time*.14+phase+p.y*.1)*.45;
 vec4 mv=modelViewMatrix*vec4(p,1.);vec4 clip=projectionMatrix*mv;vec2 delta=clip.xy/clip.w-pointer;float push=exp(-dot(delta,delta)*24.);mv.xy+=normalize(delta+vec2(.001))*push*.85;
 gl_Position=projectionMatrix*mv;gl_PointSize=clamp((24.+18.*sin(phase))/-mv.z,1.,5.);glow=.25+.65*pow(.5+.5*sin(time*.5+phase),2.);kind=step(5.9,phase);gl_PointSize+=kind*5.;}`,
 fragmentShader:`uniform vec3 tint;varying float glow;varying float kind;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float core=exp(-d*d*24.);float rays=exp(-abs(p.x)*40.)*exp(-abs(p.y)*8.)+exp(-abs(p.y)*40.)*exp(-abs(p.x)*8.);float a=(core*.65+kind*rays*.4)*glow*smoothstep(.5,.35,d);gl_FragColor=vec4(tint,a);}`});
 scene.add(new THREE.Points(geometry,material));
 const rings=new THREE.Group();scene.add(rings);
 for(let i=0;i<4;i++){const points=[];for(let j=0;j<=360;j++){const a=j/360*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*(7+i*.45),Math.sin(a)*(7+i*.45),0))}const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xd8cf8a,transparent:true,opacity:.075}));line.rotation.set(.5+i*.18,.3+i*.25,i*.2);rings.add(line)}rings.position.set(7,0,-5);
 const move=e=>{if(e.pointerType!=='touch')pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2)};
 const leave=()=>pointer.set(30,30);window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',leave);
 return {host:canvas,render(t,moving){const w=innerWidth,h=innerHeight,ratio=renderer.getPixelRatio();if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 if(moving){uniforms.time.value=t;uniforms.scroll.value=scrollY/innerHeight;smooth.lerp(pointer,.09);rings.rotation.z=t*.018;camera.position.x=Math.max(-1,Math.min(1,smooth.x))*.12}orrery.render(t,moving,camera);laboratory.render(t,moving,camera);renderer.render(scene,camera)},pulse(){laboratory.pulse()},mood(i){orrery.mood(i);laboratory.mood(i);uniforms.tint.value.set([0xd8cf8a,0xa5dfc4,0xf3bc7a][i])},dispose(){laboratory.dispose();window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',leave);scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});renderer.dispose();renderer.forceContextLoss();canvas.remove()}};
}
