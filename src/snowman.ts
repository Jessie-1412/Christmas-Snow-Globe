import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** A lightweight, fully modeled miniature; no external asset download. */
export function createChristmasSnowman() {
  const group = new THREE.Group();
  group.name = 'Christmas snowman';
  group.position.set(-.57, .075, .66);
  group.rotation.y = -.18;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = 128;
  const ctx = textureCanvas.getContext('2d')!;
  const image = ctx.createImageData(128,128);
  for(let i=0;i<image.data.length;i+=4){const value=165+((i*173+Math.floor(i/512)*19)%79);image.data[i]=image.data[i+1]=image.data[i+2]=value;image.data[i+3]=255;}
  ctx.putImageData(image,0,0);
  const grain = new THREE.CanvasTexture(textureCanvas); grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(5,5);
  const snow = new THREE.MeshStandardMaterial({color:0xf4f7f5,roughness:.94,bumpMap:grain,bumpScale:.0015});
  const red = new THREE.MeshStandardMaterial({color:0x8d2335,roughness:.95,bumpMap:grain,bumpScale:.001});
  const green = new THREE.MeshStandardMaterial({color:0x42695c,roughness:.93,bumpMap:grain,bumpScale:.001});
  const coal = new THREE.MeshStandardMaterial({color:0x282d32,roughness:.57});
  const carrot = new THREE.MeshStandardMaterial({color:0xd98138,roughness:.82});
  const twig = new THREE.MeshStandardMaterial({color:0x664834,roughness:.94});
  function mesh(geo:THREE.BufferGeometry,mat:THREE.Material,x:number,y:number,z:number){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
  function ball(mat:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number){const m=mesh(new THREE.SphereGeometry(1,24,16),mat,x,y,z);m.scale.set(sx,sy,sz);return m;}
  ball(snow,0,.19,0,.205,.20,.19);
  ball(snow,0,.435,.008,.145,.145,.14);
  // A subtly asymmetric face, coal smile, and an actual tapered carrot.
  for(const side of [-1,1])ball(coal,side*.048,.466,.133,.012,.014,.009);
  const nose=mesh(new THREE.ConeGeometry(.022,.105,14),carrot,.004,.433,.173);nose.rotation.x=Math.PI/2;nose.rotation.z=-.07;
  for(let i=0;i<5;i++){const a=-.85+i*.425;ball(coal,Math.sin(a)*.06,.409-Math.cos(a)*.027,.135,.006,.006,.004);}
  for(const y of [.16,.225,.29])ball(coal,.005,y,.186,.012,.012,.008);
  const scarf=mesh(new THREE.TorusGeometry(.129,.026,10,40),green,0,.343,.011);scarf.rotation.x=Math.PI/2;
  const scarfTail=mesh(new THREE.CapsuleGeometry(.028,.14,4,10),green,.075,.249,.16);scarfTail.rotation.z=-.15;scarfTail.scale.z=.26;
  for(let i=0;i<5;i++)mesh(new THREE.CylinderGeometry(.0015,.0015,.032,5),green,.054+i*.010,.142,.164);
  // Ribbed wine-red knitted hat, pale cuff and soft pompom.
  ball(red,-.008,.58,-.003,.137,.115,.13);
  const cuff=mesh(new THREE.TorusGeometry(.127,.025,10,40),snow,0,.544,.008);cuff.rotation.x=Math.PI/2;
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;const rib=mesh(new THREE.CapsuleGeometry(.0035,.037,2,5),red,Math.cos(a)*.135,.555,.008+Math.sin(a)*.135);rib.rotation.z=Math.cos(a)*.12;}
  ball(snow,-.028,.694,-.009,.045,.046,.044);
  function branch(a:THREE.Vector3,b:THREE.Vector3,r:number){const delta=b.clone().sub(a);const m=mesh(new THREE.CylinderGeometry(r*.65,r,delta.length(),8),twig,...a.clone().add(b).multiplyScalar(.5).toArray() as [number,number,number]);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}
  for(const side of [-1,1]){
    const wrist=new THREE.Vector3(side*.32,.36+(side===1?.055:0),.01);
    branch(new THREE.Vector3(side*.15,.28,0),wrist,.012);
    branch(wrist,new THREE.Vector3(side*.36,wrist.y+.075,.013),.007);
    branch(wrist,new THREE.Vector3(side*.405,wrist.y+.015,.015),.007);
    branch(wrist,new THREE.Vector3(side*.365,wrist.y-.035,.02),.006);
  }
  // Batch the handcrafted details by material to keep the mobile draw cost modest.
  group.updateMatrixWorld(true);
  const buckets=new Map<THREE.Material,THREE.BufferGeometry[]>();
  for(const child of [...group.children])if(child instanceof THREE.Mesh){child.updateMatrix();const geo=child.geometry.clone().applyMatrix4(child.matrix);const list=buckets.get(child.material as THREE.Material)||[];list.push(geo);buckets.set(child.material as THREE.Material,list);group.remove(child);child.geometry.dispose();}
  for(const [material,geometries] of buckets){const geo=mergeGeometries(geometries,false)!;const m=new THREE.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;group.add(m);for(const item of geometries)item.dispose();}
  return {group,update:(_dt:number,elapsed:number)=>{group.rotation.y=-.18+Math.sin(elapsed*.55)*.015;}};
}
