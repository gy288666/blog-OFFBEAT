import * as THREE from 'three';

// The journal sits inside a tilted, particle-built astronomical instrument.
// It shares the background renderer, so this adds no WebGL contexts.
export function makeOrrery(scene){
 const root=new THREE.Group();scene.add(root);
 const orbit=new THREE.Group();orbit.rotation.set(1.08,-.16,-.12);root.add(orbit);
 const count=matchMedia('(max-width:600px)').matches?1100:3200;
 const vertices=[],seeds=[];let seed=214;
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
 for(let i=0;i<count;i++){const angle=random()*Math.PI*2,radius=6.5+random()*3.8;vertices.push(Math.cos(angle)*radius,Math.sin(angle)*radius,(random()-.5)*.32);seeds.push(random());}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('seed',new THREE.Float32BufferAttribute(seeds,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},tint:{value:new THREE.Color(0xf1d58d)}},vertexShader:`
 attribute float seed;uniform float time;varying float brightness;
 void main(){float a=time*(.025+seed*.025);mat2 spin=mat2(cos(a),-sin(a),sin(a),cos(a));vec3 p=position;p.xy=spin*p.xy;p.z+=sin(time*.3+seed*40.)*.12;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((16.+seed*42.)/-mv.z,1.,5.);brightness=.25+.75*pow(.5+.5*sin(seed*90.+time*.5),2.);}`,
 fragmentShader:`uniform vec3 tint;varying float brightness;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(tint,exp(-d*d*24.)*smoothstep(.5,.3,d)*brightness);}`});
 orbit.add(new THREE.Points(geometry,material));
 for(const radius of [6.3,6.45,8.4,10.35]){const points=[];for(let i=0;i<=360;i++){const a=i*Math.PI/180;points.push(new THREE.Vector3(Math.cos(a)*radius,Math.sin(a)*radius,0))}orbit.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xe5ce92,transparent:true,opacity:radius===8.4?.26:.12})));}
 const ticks=[];for(let i=0;i<120;i++){const a=i/120*Math.PI*2;for(const r of [10.45,i%5===0?10.8:10.58])ticks.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0))}
 orbit.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ticks),new THREE.LineBasicMaterial({color:0xe5ce92,transparent:true,opacity:.28})));
 const comets=[];for(let j=0;j<3;j++){const points=[],colors=[];for(let i=0;i<100;i++){const a=-i*.004,r=7.2+j*1.05;points.push(Math.cos(a)*r,Math.sin(a)*r,0);const fade=Math.pow(1-i/100,2);colors.push(fade,fade*.86,fade*.48)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const comet=new THREE.Points(g,new THREE.PointsMaterial({size:.055,vertexColors:true,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));orbit.add(comet);comets.push(comet)}
 const gem=new THREE.Mesh(new THREE.IcosahedronGeometry(.36,0),new THREE.MeshBasicMaterial({color:0xf4dfa3,wireframe:true,transparent:true,opacity:.65}));orbit.add(gem);gem.position.set(8.4,0,.15);
 const journal=document.querySelector('#journal');
 return {render(time,moving,camera){const rect=journal.getBoundingClientRect();root.visible=rect.bottom>0&&rect.top<innerHeight;if(!root.visible)return;
 const halfHeight=Math.tan(camera.fov*Math.PI/360)*(camera.position.z+2);
 root.position.set(0,(.5-(rect.top+rect.height*.56)/innerHeight)*2*halfHeight,-2);
 root.scale.setScalar(innerWidth<600?.58:1);
 if(moving){material.uniforms.time.value=time;comets.forEach((comet,i)=>comet.rotation.z=time*(.19+i*.04)+i*2.1);gem.rotation.set(time*.3,time*.2,0)}
 },mood(index){material.uniforms.tint.value.set([0xf1d58d,0xb5eed2,0xf0ab66][index])}};
}
