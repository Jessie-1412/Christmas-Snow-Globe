import * as THREE from 'three/webgpu';
import { createRng } from './textures';

export function refineArcticScene(group: THREE.Group) {
  for (const child of [...group.children]) {
    if (child instanceof THREE.Mesh && (child.geometry.type === 'CircleGeometry' || (child.geometry.type === 'ConeGeometry' && child.position.z < -.9))) {
      group.remove(child); child.geometry.dispose();
    }
  }
  const snow = new THREE.MeshStandardMaterial({color: 0xf0f6fa, roughness:.92});
  group.traverse(child => {
    if (child instanceof THREE.Mesh && child.geometry.type === 'SphereGeometry' && child.parent !== group && child.scale.y > .015 && child.scale.y < .07) {
      child.scale.multiply(new THREE.Vector3(.83,.46,.83));
    }
  });
  const blueSnow = new THREE.MeshStandardMaterial({color: 0xc4d7df, roughness:.96});
  const timber = new THREE.MeshStandardMaterial({color: 0x67513c, roughness:.93});
  const amber = new THREE.MeshStandardMaterial({color: 0xffdca4, emissive:0xffbd70, emissiveIntensity:1.4, roughness:.5});
  const rng = createRng(213);
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x,y,z);
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  // Subdivided polar terrain replaces the original flat triangle fan.
  const vertices:number[]=[],indices:number[]=[];
  const rings=18, segments=96;
  for(let ring=0;ring<=rings;ring++) for(let j=0;j<=segments;j++){
    const r=ring/rings*1.395,a=j/segments*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r;
    const height=.048+.017*Math.sin(x*7+z*4)+.011*Math.cos(z*11-x*3)+.06*Math.exp(-((x+.7)**2+(z+.35)**2)*3);
    vertices.push(x,height,z);
    if(ring<rings&&j<segments){const k=ring*(segments+1)+j;indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
  }
  const terrain=new THREE.BufferGeometry();terrain.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));terrain.setIndex(indices);terrain.computeVertexNormals();
  add(terrain,snow,0,0,0);
  // Rounded, irregular alpine ridges with continuous snow caps, rather than stacked cones.
  for(const [x,z,r,h] of [[-.28,-1.04,.35,.63],[.25,-1.1,.39,.73],[.88,-.95,.26,.46]]){
    const v:number[]=[],ix:number[]=[];
    for(let level=0;level<=8;level++)for(let k=0;k<=32;k++){
      const t=level/8,a=k/32*Math.PI*2;
      const rr=r*(1-t)**.75*(1+.12*Math.sin(a*5)+.05*Math.cos(a*9));
      v.push(Math.cos(a)*rr+.04*t, h*t+.018*Math.sin(a*3)*Math.sin(t*Math.PI),Math.sin(a)*rr);
      if(level<8&&k<32){const q=level*33+k;ix.push(q,q+33,q+1,q+1,q+33,q+34);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();
    add(geo,blueSnow,x,.015,z);
  }
  // Snow pillows follow branches at multiple heights. Use low-resolution spheres, then static batch.
  for(const [x,z,h] of [[-.93,-.35,1.35],[-.72,-.89,.83],[.99,-.47,.83],[.97,.25,.55],[.05,-.93,.64]]){
    for(let level=0;level<5;level++){
      const y=h*(.18+level*.11),radius=h*.28*(1-level/8);
      for(let branch=0;branch<4;branch++){
        const a=branch/5*Math.PI*2+level*.6+ rng()*.15;
        const mesh=add(new THREE.SphereGeometry(1,10,6),snow,x+Math.cos(a)*radius*.58,.05+y,z+Math.sin(a)*radius*.58);
        mesh.scale.set(radius*.46,.011+h*.006,radius*.21);mesh.rotation.y=-a;
      }
    }
  }
  // Rear elevation: lit windows, trim, a timber cross brace and a sheltered log stack.
  for(const x of [-.02,.48]){
    add(new THREE.BoxGeometry(.21,.25,.035),timber,x,.49,-.605);
    add(new THREE.BoxGeometry(.17,.21,.012),amber,x,.49,-.628);
    add(new THREE.BoxGeometry(.014,.22,.018),timber,x,.49,-.639);
    add(new THREE.BoxGeometry(.18,.014,.018),timber,x,.49,-.639);
    add(new THREE.BoxGeometry(.25,.036,.09),snow,x,.64,-.625);
  }
  for(const angle of [-.48,.48]){const m=add(new THREE.BoxGeometry(.018,.62,.022),timber,-.227,.43,-.2);m.rotation.x=angle;}
  for(let row=0;row<3;row++)for(let j=0;j<4-row;j++){
    const log=add(new THREE.CylinderGeometry(.033,.036,.29,8),timber,.49+j*.065+row*.025,.15+row*.055,-.64);log.rotation.z=Math.PI/2;
  }
  // A modest trail anchors the animal on the snow rather than floating above the ground.
  for(let i=0;i<7;i++)for(const side of [-1,1]){
    const print=add(new THREE.SphereGeometry(1,8,5),blueSnow,-.58+i*.065+side*.022,.066,.82+i*.015+side*.03);print.scale.set(.014,.003,.022);
  }
}
