import * as THREE from 'three';

export function makeLaboratory(scene){
 const host=document.querySelector('#instrument-stage'),root=new THREE.Group();scene.add(root);
 const rotor=new THREE.Group();root.add(rotor);
 const uniforms={time:{value:0},energy:{value:0},tint:{value:new THREE.Color(0xdbc482)}};
 const core=new THREE.Mesh(new THREE.SphereGeometry(1.55,48,32),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:`varying vec3 n;varying vec3 p;void main(){n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);p=mv.xyz;gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying vec3 n;varying vec3 p;uniform float time;uniform float energy;uniform vec3 tint;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(-p))),2.);float bands=pow(.5+.5*sin(n.y*22.+n.x*8.+time*.4),14.);vec3 color=mix(vec3(.08,.23,.18),tint,rim*.85+bands*.15);gl_FragColor=vec4(color,.5+rim*.4+energy*.05);}`}));rotor.add(core);
 const cage=new THREE.Mesh(new THREE.IcosahedronGeometry(1.93,1),new THREE.MeshBasicMaterial({color:0xdcc58b,wireframe:true,transparent:true,opacity:.26}));rotor.add(cage);
 const gold=new THREE.ShaderMaterial({vertexShader:'varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec3 n;varying vec3 v;void main(){vec3 normal=normalize(n);vec3 light=normalize(vec3(-.5,.8,1.));float diffuse=max(dot(normal,light),0.);float spec=pow(max(dot(reflect(-light,normal),normalize(v)),0.),28.);gl_FragColor=vec4(vec3(.74,.53,.23)*(.35+diffuse*.8)+vec3(1.,.94,.7)*spec,1.);}'});
 const rings=[];
 for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5+i*.3,.012,6,180),new THREE.MeshBasicMaterial({color:i%2?0xf0daa2:0x7fbd9f,transparent:true,opacity:.8-i*.1}));ring.rotation.set(.5+i*.53,i*.45,i*.3);rotor.add(ring);rings.push(ring);
 const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.13+i*.025,0),gold);orb.position.set(2.5+i*.3,0,0);ring.add(orb);}
 const coords=[];for(let i=0;i<900;i++){const a=i*2.399963,r=4+Math.sin(i*8.3)*.4;coords.push(Math.cos(a)*r,Math.sin(a)*r,Math.sin(i*2.7)*.28)}
 const dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(coords,3)),new THREE.PointsMaterial({color:0xddcc92,size:.018,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));dust.rotation.x=.8;root.add(dust);
 let time=0,kick=-99,angle=0;const pointer=new THREE.Vector2(),smooth=new THREE.Vector2();
 function move(event){if(event.pointerType==='touch')return;const box=host.getBoundingClientRect();pointer.set((event.clientX-box.left)/box.width-.5,(event.clientY-box.top)/box.height-.5)}
 const leave=()=>pointer.set(0,0);host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
 return {pulse(){kick=time},mood(i){uniforms.tint.value.set([0xdbc482,0xa6e4ca,0xf0af71][i])},render(t,moving,camera){time=t;const rect=host.getBoundingClientRect();root.visible=rect.bottom>0&&rect.top<innerHeight;if(!root.visible)return;const halfHeight=Math.tan(camera.fov*Math.PI/360)*(camera.position.z+1);
 root.position.set(((rect.left+rect.width/2)/innerWidth-.5)*2*halfHeight*camera.aspect,(.5-(rect.top+rect.height/2)/innerHeight)*2*halfHeight,-1);root.scale.setScalar(rect.width/innerHeight*halfHeight/4.5);
 if(moving){smooth.lerp(pointer,.06);const boost=Math.max(0,1-(t-kick)/3);uniforms.time.value=t;uniforms.energy.value=boost;angle+=.004+boost*.025;rotor.rotation.set(smooth.y*.7,angle+smooth.x*.8,.15);rings.forEach((ring,i)=>{ring.rotation.z=t*(.08+i*.025)+i*.3+boost*Math.sin(t*2)*.12});dust.rotation.z=t*.025;core.scale.setScalar(1+boost*.09);}
 },dispose(){host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave)}};
}
