import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Original miniature geometry: no downloaded models, textures or licenses required. */
export function createSantaFlight() {
  const group = new THREE.Group(); group.name = 'Santa and two reindeer sleigh';
  const miniature = new THREE.Group(); miniature.scale.setScalar(.82); group.add(miniature);
  const mat = {
    red: new THREE.MeshStandardMaterial({color:0x9e2630,roughness:.62}),
    cream: new THREE.MeshStandardMaterial({color:0xfff5df,roughness:.88}),
    gold: new THREE.MeshStandardMaterial({color:0xcba467,metalness:.72,roughness:.29}),
    brown: new THREE.MeshStandardMaterial({color:0x805238,roughness:.88}),
    dark: new THREE.MeshStandardMaterial({color:0x342a25,roughness:.72}),
    skin: new THREE.MeshStandardMaterial({color:0xe9b18c,roughness:.82}),
    green: new THREE.MeshStandardMaterial({color:0x365a45,roughness:.8}),
  };
  function mesh(parent:THREE.Group,geo:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number) {
    const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m;
  }
  function ball(parent:THREE.Group,material:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number) {
    const m=mesh(parent,new THREE.SphereGeometry(1,16,10),material,x,y,z);m.scale.set(sx,sy,sz);return m;
  }
  function rod(parent:THREE.Group,material:THREE.Material,a:number[],b:number[],r:number) {
    const start=new THREE.Vector3(...a as [number,number,number]),end=new THREE.Vector3(...b as [number,number,number]);
    const d=end.clone().sub(start);const m=mesh(parent,new THREE.CylinderGeometry(r*.8,r,d.length(),7),material,...start.clone().add(end).multiplyScalar(.5).toArray() as [number,number,number]);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;
  }
  function curve(parent:THREE.Group,material:THREE.Material,points:number[][],r:number) {
    return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p as [number,number,number]))),24,r,6,false),material,0,0,0);
  }
  // Curved burgundy sleigh, upholstered seat and two curled brass runners.
  const sleigh=new THREE.Group();miniature.add(sleigh);
  const hull=mesh(sleigh,new THREE.BoxGeometry(.49,.10,.29,1,1,1),mat.red,-.30,.035,0);
  hull.rotation.z=.035;
  for(const side of [-1,1]) {
    const z=side*.155;
    curve(sleigh,mat.red,[[-.55,.08,z],[-.54,.24,z],[-.46,.21,z],[-.32,.13,z],[-.13,.12,z],[-.04,.20,z]],.037);
    curve(sleigh,mat.gold,[[-.59,-.075,z],[-.36,-.09,z],[-.10,-.08,z],[.01,-.025,z],[.015,.045,z],[-.04,.055,z]],.012);
    rod(sleigh,mat.gold,[-.46,-.07,z],[-.46,.035,z],.009);
    rod(sleigh,mat.gold,[-.16,-.07,z],[-.16,.035,z],.009);
    curve(sleigh,mat.gold,[[-.54,.245,z],[-.45,.225,z],[-.31,.16,z],[-.12,.15,z],[-.04,.21,z]],.006);
  }
  mesh(sleigh,new THREE.BoxGeometry(.27,.035,.23),mat.cream,-.30,.105,0);
  // Gift sack and ribbon-wrapped parcel at the back.
  ball(sleigh,mat.green,-.48,.25,0,.12,.16,.13);
  rod(sleigh,mat.gold,[-.50,.375,-.06],[-.48,.38,.06],.012);
  mesh(sleigh,new THREE.BoxGeometry(.12,.11,.12),mat.red,-.52,.15,.16);
  mesh(sleigh,new THREE.BoxGeometry(.125,.018,.125),mat.gold,-.52,.18,.16);
  mesh(sleigh,new THREE.BoxGeometry(.018,.115,.125),mat.gold,-.52,.15,.16);
  // Seated Santa faces the reindeer (+X). Fur trim, beard, belt, boots and floppy hat.
  const seatedSanta=new THREE.Group();sleigh.add(seatedSanta);
  ball(seatedSanta,mat.red,-.25,.25,0,.125,.155,.115);
  ball(seatedSanta,mat.dark,-.25,.185,0,.128,.026,.118);
  mesh(seatedSanta,new THREE.BoxGeometry(.014,.035,.042),mat.gold,-.125,.185,0);
  ball(seatedSanta,mat.skin,-.225,.425,0,.082,.088,.077);
  for(const side of [-1,1]) {
    ball(seatedSanta,mat.cream,-.16,.397,side*.036,.046,.067,.049);
    ball(seatedSanta,mat.dark,-.148,.45,side*.038,.006,.008,.006);
    rod(seatedSanta,mat.red,[-.28,.29,side*.09],[-.095,.275,side*.115],.037);
    ball(seatedSanta,mat.cream,-.09,.275,side*.115,.025,.028,.028);
    ball(seatedSanta,mat.red,-.15,.13,side*.061,.10,.045,.048);
    ball(seatedSanta,mat.dark,-.055,.10,side*.063,.06,.035,.04);
  }
  ball(seatedSanta,mat.skin,-.129,.423,0,.025,.023,.023);
  ball(seatedSanta,mat.cream,-.16,.373,0,.047,.057,.058);
  const hat=mesh(seatedSanta,new THREE.ConeGeometry(.088,.18,16),mat.red,-.237,.54,0);hat.rotation.z=.27;
  const brim=mesh(seatedSanta,new THREE.TorusGeometry(.078,.018,7,24),mat.cream,-.23,.475,0);brim.rotation.x=Math.PI/2;
  ball(seatedSanta,mat.cream,-.265,.63,0,.028,.028,.028);
  // A matched pair with sculpted muzzles, branching antlers and gold harnesses.
  const deer:THREE.Group[]=[];
  const joints:{upper:THREE.Group;lower:THREE.Group;phase:number}[]=[];
  const reins:{mesh:THREE.Mesh;base:Float32Array}[]=[];
  for(const side of [-1,1]) {
    const animal=new THREE.Group();animal.position.set(.34,.105,side*.135);miniature.add(animal);deer.push(animal);
    ball(animal,mat.brown,0,.075,0,.16,.075,.06);
    const neck=ball(animal,mat.brown,.12,.15,0,.055,.11,.05);neck.rotation.z=-.4;
    ball(animal,mat.brown,.17,.235,0,.068,.055,.046);
    ball(animal,mat.brown,.225,.218,0,.055,.032,.035);
    ball(animal,mat.dark,.271,.221,0,.015,.019,.023);
    ball(animal,mat.cream,.14,.123,0,.026,.055,.047);
    for(const flank of [-1,1]) {
      ball(animal,mat.dark,.196,.255,flank*.041,.006,.007,.004);
      const ear=ball(animal,mat.brown,.128,.285,flank*.064,.035,.012,.021);ear.rotation.z=-.4;
      const z=flank*.028;
      rod(animal,mat.brown,[.14,.267,z],[.105,.387,flank*.055],.009);
      rod(animal,mat.brown,[.105,.387,flank*.055],[.15,.44,flank*.07],.005);
      rod(animal,mat.brown,[.12,.33,flank*.045],[.18,.37,flank*.055],.005);
      rod(animal,mat.brown,[.11,.375,flank*.055],[.065,.41,flank*.07],.005);
      for(const front of [-1,1]) {
        const x=front*.10,foot=x+(front>0?.07:-.06);
        const upper=new THREE.Group();upper.position.set(x,.06,flank*.04);animal.add(upper);
        upper.name='Reindeer animated leg';
        const lower=new THREE.Group();lower.position.set(foot-x,-.095,flank*.01);upper.add(lower);
        rod(upper,mat.brown,[0,0,0],[foot-x,-.095,flank*.01],.014);
        rod(lower,mat.brown,[0,0,0],[-.045,-.055,0],.010);
        ball(lower,mat.dark,-.045,-.055,0,.022,.014,.016);
        joints.push({upper,lower,phase:(front+flank)*.9+side*.4});
      }
    }
    ball(animal,mat.cream,-.17,.10,0,.04,.018,.025);
    const harness=mesh(animal,new THREE.TorusGeometry(.064,.006,6,20),mat.gold,.025,.075,0);harness.rotation.y=Math.PI/2;harness.scale.y=1.17;
    for(const z of [-.05,.05])ball(animal,mat.gold,.03,.034,z,.011,.012,.011);
    const rein=curve(miniature,mat.dark,[[-.085,.275,side*.115],[.20,.18,side*.14],[.49,.29,side*.135]],.004);
    rein.name='Animated leather rein';
    miniature.remove(rein);const dynamic=new THREE.Group();miniature.add(dynamic);dynamic.add(rein);
    reins.push({mesh:rein,base:new Float32Array(rein.geometry.attributes.position.array)});
  }
  // Merge each moving part by material: no individual draw call for every tiny detail.
  function batch(part:THREE.Group) {
    part.updateMatrixWorld(true);
    const buckets=new Map<THREE.Material,THREE.BufferGeometry[]>();
    for(const child of [...part.children])if(child instanceof THREE.Mesh) {
      child.updateMatrix();const geometry=child.geometry.clone().applyMatrix4(child.matrix);
      const list=buckets.get(child.material as THREE.Material)||[];list.push(geometry);buckets.set(child.material as THREE.Material,list);
      part.remove(child);child.geometry.dispose();
    }
    for(const [material,geometries]of buckets) {
      const geometry=mergeGeometries(geometries,false)!;part.add(new THREE.Mesh(geometry,material));
      geometries.forEach(g=>g.dispose());
    }
  }
  batch(seatedSanta);batch(sleigh);deer.forEach(batch);joints.forEach(j=>{batch(j.upper);batch(j.lower);});batch(miniature);
  const animate=(elapsed:number,flying=1)=>{
    deer.forEach((animal,i)=>{animal.position.y=THREE.MathUtils.lerp(.01,.105,flying)+Math.sin(elapsed*3.8+i*.8)*.014*flying;animal.rotation.z=Math.sin(elapsed*3.8+i*.8)*.04*flying;});
    joints.forEach(j=>{j.upper.rotation.z=Math.sin(elapsed*7+j.phase)*.5*flying;j.lower.rotation.z=(.22+Math.sin(elapsed*7+j.phase-1)*.35)*flying;});
    reins.forEach(({mesh,base})=>{const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++){
      const u=THREE.MathUtils.clamp((base[i*3]+.085)/.575,0,1),w=Math.sin(Math.PI*u);
      const endpoint=-.095*(1-flying)+Math.sin(elapsed*3.8+(base[i*3+2]>0?.8:0))*.014*flying;
      p.setY(i,base[i*3+1]+Math.sin(elapsed*6+base[i*3]*14)*.012*w*(.2+.8*flying)+endpoint*u);
    }p.needsUpdate=true;});
  };
  const update=(_dt:number,elapsed:number)=>{
    const phase=elapsed*Math.PI*2/26 + .4;
    group.position.set(Math.sin(phase)*.49,2.57+Math.sin(phase*2)*.035,Math.cos(phase)*.46);
    group.rotation.set(0,Math.atan2(Math.sin(phase)*.46,Math.cos(phase)*.49),Math.cos(phase)*.035);
    animate(elapsed);
  };
  update(0,0);
  return {group,miniature,seatedSanta,animate,update};
}
