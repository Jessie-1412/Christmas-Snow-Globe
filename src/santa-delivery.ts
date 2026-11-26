import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createSantaFlight } from './santa-flight.ts';

const clamp=THREE.MathUtils.clamp;
const ease=(a:number,b:number,t:number)=>{const u=clamp((t-a)/(b-a),0,1);return u*u*(3-2*u);};
// Five extra seconds are shared by the inbound and outbound flights.
export const DELIVERY_TIMING={departure:25,boyExit:35,pickup:38,home:41,nextArrival:158};

/** A self-contained story; all coordinates below are inside the existing city mount. */
export function createSantaDelivery(cabinScene:THREE.Group) {
  const group=new THREE.Group();group.name='Christmas doorstep delivery';
  const flight=createSantaFlight();group.add(flight.group);flight.miniature.scale.setScalar(.68);
  const materials={
    red:new THREE.MeshStandardMaterial({color:0xa42b35,roughness:.76}),
    white:new THREE.MeshStandardMaterial({color:0xfff4df,roughness:.88}),
    skin:new THREE.MeshStandardMaterial({color:0xe8b294,roughness:.82}),
    dark:new THREE.MeshStandardMaterial({color:0x352b29,roughness:.78}),
    gold:new THREE.MeshStandardMaterial({color:0xd5b16a,metalness:.52,roughness:.4}),
    blue:new THREE.MeshStandardMaterial({color:0x315b70,roughness:.92}),
    green:new THREE.MeshStandardMaterial({color:0x315c43,roughness:.82}),
  };
  const mesh=(p:THREE.Group,g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;};
  const ball=(p:THREE.Group,m:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const o=mesh(p,new THREE.SphereGeometry(1,16,10),m,x,y,z);o.scale.set(sx,sy,sz);return o;};
  const batch=(p:THREE.Group)=>{
    const buckets=new Map<THREE.Material,THREE.BufferGeometry[]>();
    for(const o of [...p.children])if(o instanceof THREE.Mesh){o.updateMatrix();const g=o.geometry.clone().applyMatrix4(o.matrix),m=o.material as THREE.Material;const a=buckets.get(m)||[];a.push(g);buckets.set(m,a);p.remove(o);o.geometry.dispose();}
    for(const [m,a]of buckets){p.add(new THREE.Mesh(mergeGeometries(a,false)!,m));a.forEach(g=>g.dispose());}
  };
  function person(child:boolean) {
    const root=new THREE.Group(),body=new THREE.Group();root.add(body);root.scale.setScalar(child?.51:.68);group.add(root);
    const coat=child?materials.blue:materials.red;
    ball(body,coat,0,.27,0,.112,.14,.085);
    ball(body,materials.skin,0,.43,.005,.076,.082,.068);
    for(const s of [-1,1])ball(body,materials.dark,s*.026,.449,.068,.006,.008,.004);
    ball(body,materials.skin,0,.423,.080,.017,.016,.018);
    if(child){
      ball(body,materials.dark,0,.486,-.008,.075,.037,.067);
      ball(body,materials.red,0,.503,0,.08,.05,.071);
      const rim=mesh(body,new THREE.TorusGeometry(.075,.013,7,22),materials.white,0,.48,0);rim.rotation.x=Math.PI/2;
      ball(body,materials.white,0,.555,0,.023,.023,.023);
      const scarf=mesh(body,new THREE.TorusGeometry(.074,.017,7,22),materials.red,0,.36,0);scarf.rotation.x=Math.PI/2;
      mesh(body,new THREE.BoxGeometry(.035,.10,.013),materials.red,.032,.31,.084);
      for(const y of [.23,.28])ball(body,materials.gold,0,y,.087,.008,.008,.005);
    }else{
      ball(body,materials.dark,0,.215,0,.115,.023,.088);
      mesh(body,new THREE.BoxGeometry(.034,.03,.012),materials.gold,0,.215,.09);
      for(const s of [-1,1])ball(body,materials.white,s*.032,.397,.060,.039,.057,.031);
      ball(body,materials.white,0,.373,.067,.042,.05,.028);
      const hat=mesh(body,new THREE.ConeGeometry(.083,.15,16),materials.red,-.012,.538,0);hat.rotation.z=.27;
      const rim=mesh(body,new THREE.TorusGeometry(.075,.017,7,24),materials.white,0,.478,0);rim.rotation.x=Math.PI/2;
      ball(body,materials.white,-.033,.611,0,.026,.026,.026);
      const collar=mesh(body,new THREE.TorusGeometry(.074,.012,7,22),materials.white,0,.36,0);collar.rotation.x=Math.PI/2;
    }
    const arms:THREE.Group[]=[],legs:THREE.Group[]=[];
    for(const s of [-1,1]){
      const arm=new THREE.Group();arm.position.set(s*.10,.33,0);body.add(arm);arms.push(arm);
      const sleeve=mesh(arm,new THREE.CapsuleGeometry(.029,.115,3,9),coat,0,-.073,0);
      sleeve.rotation.z=s*.07;
      ball(arm,materials.white,s*.01,-.145,0,.029,.018,.028);
      ball(arm,child?materials.skin:materials.red,s*.01,-.175,0,.027,.028,.026);
      const leg=new THREE.Group();leg.position.set(s*.05,.15,0);root.add(leg);legs.push(leg);
      mesh(leg,new THREE.CapsuleGeometry(.031,.088,3,9),child?materials.dark:materials.red,0,-.063,0);
      ball(leg,materials.dark,0,-.126,.018,.038,.026,.052);
      batch(arm);batch(leg);
    }
    batch(body);
    const pose=(time:number,walking:number,bend=0,carry=0,seated=0)=>{
      body.rotation.x=bend*.7;body.position.y=-bend*.028;
      arms.forEach((a,i)=>{a.rotation.x=THREE.MathUtils.lerp(Math.sin(time*9+i*Math.PI)*.42*walking,-1.0,carry);a.rotation.z=(i?1:-1)*carry*.13;});
      legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(time*9+i*Math.PI)*.38*walking-seated*1.25;});
    };
    return {root,body,arms,legs,pose};
  }
  const santa=person(false),boy=person(true);
  // Paper box, fitted lid, crossed satin ribbons, bow loops and a small gift tag.
  const gift=new THREE.Group();group.add(gift);gift.name='Wrapped Christmas gift box';
  mesh(gift,new THREE.BoxGeometry(.103,.084,.096),materials.green,0,.042,0);
  mesh(gift,new THREE.BoxGeometry(.109,.014,.102),materials.green,0,.085,0);
  mesh(gift,new THREE.BoxGeometry(.018,.091,.105),materials.red,0,.047,0);
  mesh(gift,new THREE.BoxGeometry(.111,.091,.016),materials.red,0,.047,0);
  for(const s of [-1,1]){const bow=mesh(gift,new THREE.TorusGeometry(.022,.005,6,16),materials.gold,s*.018,.103,0);bow.scale.set(1,.55,1);bow.rotation.x=-.6;bow.rotation.z=s*.45;}
  ball(gift,materials.gold,0,.102,0,.009,.009,.008);
  const tag=mesh(gift,new THREE.BoxGeometry(.024,.002,.015),materials.white,.031,.097,.025);tag.rotation.y=.3;
  batch(gift);

  // Only the entrance's internal solid wall is opened; roof, steps, trim and exterior stay in place.
  const cabin=cabinScene.children.find(o=>o instanceof THREE.Group&&Math.abs(o.position.x-.23)<.001&&Math.abs(o.position.z+.2)<.001) as THREE.Group;
  if(!cabin)throw new Error('Cabin door not found');
  const door=new THREE.Group();door.position.set(.23-.08,.12,-.2+.417);group.add(door);
  const pieces=[...cabin.children].filter(o=>o instanceof THREE.Mesh) as THREE.Mesh[];
  const solid=pieces.find(o=>o.geometry.type==='BoxGeometry'&&Math.abs((o.geometry as THREE.BoxGeometry).parameters.width-.89)<.001)!;
  const wood=solid.material as THREE.Material;
  cabin.remove(solid);solid.geometry.dispose();
  mesh(cabin,new THREE.BoxGeometry(.365,.63,.76),wood,-.2625,.34,0);
  mesh(cabin,new THREE.BoxGeometry(.295,.63,.76),wood,.2975,.34,0);
  mesh(cabin,new THREE.BoxGeometry(.23,.185,.76),wood,.035,.5625,0);
  mesh(cabin,new THREE.BoxGeometry(.23,.02,.76),wood,.035,.035,0);
  mesh(cabin,new THREE.BoxGeometry(.23,.43,.015),materials.dark,.035,.245,-.30);
  for(const o of pieces){
    const {x,y,z}=o.position;
    if(Math.abs(z-.384)<.001&&x>-.08&&x<.15){
      const material=o.material as THREE.Material;cabin.remove(o);o.geometry.dispose();
      mesh(cabin,new THREE.BoxGeometry(.009,.18,.011),material,x,.56,z);continue;
    }
    const leaf=o.geometry.type==='BoxGeometry'&&Math.abs(x-.035)<.001&&Math.abs(z-.417)<.001;
    const knob=Math.abs(x-.105)<.001&&Math.abs(z-.439)<.001;
    const wreath=z>=.437&&z<=.472&&x>=-.02&&x<=.09&&y>.38&&y<.51;
    // The original dark door frame is a solid panel; retain its border around the moving leaf.
    if(o.geometry.type==='BoxGeometry'&&Math.abs(x-.035)<.001&&Math.abs(z-.395)<.001){
      const material=o.material as THREE.Material;cabin.remove(o);o.geometry.dispose();
      for(const s of [-1,1])mesh(cabin,new THREE.BoxGeometry(.02,.44,.025),material,.035+s*.105,.235,.395);
      mesh(cabin,new THREE.BoxGeometry(.23,.02,.025),material,.035,.445,.395);
      mesh(cabin,new THREE.BoxGeometry(.23,.02,.025),material,.035,.025,.395);
    }else if(leaf||knob||wreath){cabin.remove(o);o.position.sub(new THREE.Vector3(-.08,0,.417));door.add(o);}
  }
  batch(door);
  let floorAt=(x:number,z:number)=>.07;
  const prepareGround=(scene:THREE.Group)=>{
    scene.updateMatrixWorld(true);const inverse=scene.matrixWorld.clone().invert();
    const surfaces:THREE.Mesh[]=[],material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
    scene.traverse(o=>{if(!(o instanceof THREE.Mesh))return;
      const geometry=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));geometry.computeBoundingBox();
      if(geometry.boundingBox!.max.y<.36&&geometry.boundingBox!.min.y>-.1)surfaces.push(new THREE.Mesh(geometry,material));else geometry.dispose();
    });
    const ray=new THREE.Raycaster(),cache=new Map<string,number>();
    floorAt=(x,z)=>{const key=`${Math.round(x*200)},${Math.round(z*200)}`;const cached=cache.get(key);if(cached!==undefined)return cached;
      ray.set(new THREE.Vector3(x,.37,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObjects(surfaces,false)[0]?.point.y??.07;cache.set(key,h);return h;
    };
  };
  const fadeMaterials=new Set<THREE.MeshStandardMaterial>();
  flight.group.traverse(o=>{if(o instanceof THREE.Mesh){const m=o.material as THREE.MeshStandardMaterial;m.transparent=true;fadeMaterials.add(m);}});
  const land=new THREE.Vector3(.24,.14,1.12),stand=new THREE.Vector3(-.08,0,.91),doorstep=new THREE.Vector3(.265,0,.53);
  // Coordinates in city-mount space: the upper sky is ~1.8 above this miniature's floor.
  const arrival=new THREE.CatmullRomCurve3([new THREE.Vector3(-.58,1.57,-.56),new THREE.Vector3(.20,1.50,.30),new THREE.Vector3(.30,1.00,1.13),land]);
  const departure=new THREE.CatmullRomCurve3([land,new THREE.Vector3(.30,1.00,1.13),new THREE.Vector3(.24,1.50,.34),new THREE.Vector3(-.48,1.67,-.57)]);
  let state={time:0,cycle:0,stage:'arrival',gift:'carried',boyVisible:false,santaVisible:false,flightVisible:false,opacity:0};
  const update=(_dt:number,elapsed:number)=>{
    const clock=((elapsed%DELIVERY_TIMING.nextArrival)+DELIVERY_TIMING.nextArrival)%DELIVERY_TIMING.nextArrival;
    const t=clock<7.5?clock/1.5:clock<18?clock-2.5:clock<25?15.5+(clock-18)*4.5/7:clock-5;
    const flying=t<4.8||t>=15.5&&t<20;
    flight.group.visible=t<20;flight.seatedSanta.visible=t<5.2||t>=15.0;
    let opacity=1;
    if(t<5){const u=ease(0,5,t);flight.group.position.copy(arrival.getPoint(u));
      flight.group.rotation.set(0,-.9*(1-ease(2.5,5,t)),(1-ease(3,5,t))*.08);
      opacity=ease(0,1.8,t);flight.group.scale.setScalar(THREE.MathUtils.lerp(.28,1,ease(0,4,t)));
    }else if(t<15.5){flight.group.position.copy(land);flight.group.rotation.set(0,0,0);flight.group.scale.setScalar(1);}
    else{const u=ease(15.5,20,t);flight.group.position.copy(departure.getPoint(u));
      flight.group.rotation.set(0,1.9*ease(16.5,19,t),Math.sin(u*Math.PI)*.09);
      flight.group.scale.setScalar(THREE.MathUtils.lerp(1,.25,ease(16,20,t)));opacity=1-ease(18,20,t);
    }
    if(t>=20)opacity=0;
    fadeMaterials.forEach(m=>{m.opacity=opacity;m.depthWrite=opacity>.98;});
    flight.animate(t,flying?ease(0,1,t)*(1-ease(4,5,t))+ease(15.5,16.2,t):0);
    const outbound=t>=5.2&&t<8.4,returning=t>=11.5&&t<14.8;
    santa.root.visible=t>=5.0&&t<15.2;
    const travel=outbound?ease(5.2,8.4,t):returning?1-ease(11.5,14.8,t):t<5.2?0:t<11.5?1:0;
    santa.root.position.copy(stand).lerp(doorstep,travel);
    // Steps use the existing rendered treads; no terrain or stair changes.
    santa.root.position.y=floorAt(santa.root.position.x,santa.root.position.z)+.004;
    santa.root.rotation.y=outbound?Math.atan2(doorstep.x-stand.x,doorstep.z-stand.z):returning?Math.atan2(stand.x-doorstep.x,stand.z-doorstep.z):Math.PI;
    const crouch=ease(8.4,9.2,t)*(1-ease(10.0,10.8,t));
    const carrying=t<9.8;
    santa.pose(t,outbound||returning?1:0,crouch,carrying?1:crouch*.6);
    // Smoothly climb off/on the seat, keeping the standing and seated figures from overlapping.
    if(t<5.4){santa.root.position.y+=.08*(1-ease(5,5.4,t));}
    if(t>=14.8)santa.root.position.y+=.08*ease(14.8,15.2,t);
    flight.seatedSanta.visible=t<5.0||t>=15.2;
    boy.root.visible=t>=30&&t<36;
    const pickupBend=ease(32,32.7,t)*(1-ease(33.0,33.6,t));
    const fromHouse=new THREE.Vector3(.265,0,.15);
    const boyU=t<33?ease(30,32,t):1-ease(33.6,36,t);
    boy.root.position.copy(fromHouse).lerp(new THREE.Vector3(.265,0,.31),boyU);
    boy.root.position.y=floorAt(boy.root.position.x,boy.root.position.z)+.003;
    boy.root.rotation.y=t<33.6?0:Math.PI;
    boy.pose(t,(t<32||t>=33.6)&&boy.root.visible?1:0,pickupBend,t>=33?1:pickupBend*.7);
    door.rotation.y=-1.35*ease(29.5,30.4,t)*(1-ease(35.7,36.6,t));
    gift.visible=t>=5&&t<36;
    gift.scale.setScalar(1);
    if(t<9.8){
      // Keep the wrapped box in Santa's mittens, then lower it onto the porch.
      const held=new THREE.Vector3(0,.20,.23).applyMatrix4(santa.root.matrix.clone().compose(santa.root.position,santa.root.quaternion,santa.root.scale));
      const target=new THREE.Vector3(doorstep.x,floorAt(doorstep.x,doorstep.z-.14)+.007,doorstep.z-.14);
      gift.position.copy(held).lerp(target,ease(8.5,9.8,t));gift.rotation.y=santa.root.rotation.y;
    }else if(t<33){gift.position.set(doorstep.x,floorAt(doorstep.x,doorstep.z-.14)+.007,doorstep.z-.14);gift.rotation.y=.18;}
    else{
      const held=new THREE.Vector3(0,.18,.15).applyMatrix4(new THREE.Matrix4().compose(boy.root.position,boy.root.quaternion,boy.root.scale));
      const target=new THREE.Vector3(doorstep.x,floorAt(doorstep.x,doorstep.z-.14)+.007,doorstep.z-.14);
      gift.position.copy(target).lerp(held,ease(33,33.6,t));gift.rotation.y=boy.root.rotation.y;
    }
    state={time:clock,cycle:Math.floor(elapsed/DELIVERY_TIMING.nextArrival),stage:t<5?'arrival':t<8.4?'Santa walks to door':t<10.8?'placing gift':t<15.5?'Santa returns to sleigh':t<20?'departure':t<30?'waiting for boy':t<33?'boy comes out':t<36?'boy takes gift home':'waiting for next delivery',gift:t<5?'on sleigh':t<9.8?'carried by Santa':t<33?'on doorstep':t<36?'carried by boy':'inside house',boyVisible:boy.root.visible,santaVisible:santa.root.visible,flightVisible:flight.group.visible,opacity};
  };
  update(0,0);
  return {group,door,flight,prepareGround,groundAt:(x:number,z:number)=>floorAt(x,z),update,getState:()=>({...state,santa:santa.root.position.toArray(),boy:boy.root.position.toArray(),giftPosition:gift.position.toArray(),flight:flight.group.position.toArray(),doorAngle:door.rotation.y})};
}
